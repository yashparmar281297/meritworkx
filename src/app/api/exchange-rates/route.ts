import { NextResponse } from "next/server";

let cachedRates: Record<string, number> | null = null;
let cachedAt = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes — keeps rates fresh without hammering the API

export async function GET() {
  const now = Date.now();

  if (cachedRates && now - cachedAt < CACHE_DURATION_MS) {
    return NextResponse.json({ base: "USD", rates: cachedRates, fetchedAt: cachedAt });
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = await res.json();

    if (data.result !== "success" || !data.rates) {
      throw new Error("Unexpected rate response");
    }

    cachedRates = data.rates;
    cachedAt = now;

    return NextResponse.json({ base: "USD", rates: cachedRates, fetchedAt: cachedAt });
  } catch (err) {
    console.error("Exchange rate fetch failed:", err);
    // Fall back to whatever we last had cached, even if stale, rather than breaking prices entirely
    if (cachedRates) {
      return NextResponse.json({ base: "USD", rates: cachedRates, fetchedAt: cachedAt, stale: true });
    }
    return NextResponse.json({ base: "USD", rates: {}, error: true }, { status: 200 });
  }
}