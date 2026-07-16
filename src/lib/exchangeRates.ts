import { getCurrencyForCountry } from "@/lib/currency";

let cachedRates: Record<string, number> | null = null;
let cachedAt = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes — keeps rates fresh without hammering the API

export async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && now - cachedAt < CACHE_DURATION_MS) {
    return cachedRates;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = await res.json();
    if (data.result !== "success" || !data.rates) throw new Error("Unexpected rate response");

    const rates: Record<string, number> = data.rates;
    cachedRates = rates;
    cachedAt = now;
    return rates;
  } catch (err) {
    console.error("Exchange rate fetch failed:", err);
    return cachedRates ?? {};
  }
}

type Converted = { amount: number; currency: string; symbol: string; formatted: string };

// Converts a canonical USD amount into the given country's currency using the live rate.
// Falls back to USD if the country's currency or its rate isn't available.
export async function convertUsdToCountry(
  usdAmount: number,
  countryName: string | null | undefined
): Promise<Converted> {
  const { currency, symbol } = getCurrencyForCountry(countryName);

  if (currency === "USD") {
    return { amount: usdAmount, currency: "USD", symbol: "$", formatted: `$${usdAmount.toFixed(2)}` };
  }

  const rates = await getExchangeRates();
  const rate = rates[currency];
  if (!rate) {
    return { amount: usdAmount, currency: "USD", symbol: "$", formatted: `$${usdAmount.toFixed(2)}` };
  }

  const amount = usdAmount * rate;
  return { amount, currency, symbol, formatted: `${symbol}${amount.toFixed(2)}` };
}

// The platform's Razorpay account always settles in INR, regardless of who's involved.
export async function convertUsdToInr(usdAmount: number): Promise<Converted> {
  const rates = await getExchangeRates();
  const rate = rates.INR ?? 83;
  const amount = usdAmount * rate;
  return { amount, currency: "INR", symbol: "₹", formatted: `₹${amount.toFixed(2)}` };
}
