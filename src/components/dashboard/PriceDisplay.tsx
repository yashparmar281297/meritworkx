"use client";

import { useEffect, useState } from "react";
import { getCurrencyForCountry } from "@/lib/currency";

let ratesCache: Record<string, number> = {};
let ratesPromise: Promise<Record<string, number>> | null = null;
let ratesCachedAt = 0;
const CLIENT_CACHE_MS = 10 * 60 * 1000;

async function getRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (Object.keys(ratesCache).length > 0 && now - ratesCachedAt < CLIENT_CACHE_MS) {
    return ratesCache;
  }

  if (!ratesPromise) {
    ratesPromise = fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => {
        const rates: Record<string, number> = data.rates ?? {};
        ratesCache = rates;
        ratesCachedAt = Date.now();
        ratesPromise = null;
        return rates;
      })
      .catch(() => {
        ratesPromise = null;
        return {};
      });
  }
  return ratesPromise;
}
export default function PriceDisplay({
  usdAmount,
  viewerCountry,
  className,
  style,
}: {
  usdAmount: number;
  viewerCountry: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [displayText, setDisplayText] = useState(`$${usdAmount.toLocaleString("en-US")}`);

  useEffect(() => {
    let cancelled = false;

    async function convert() {
      const { currency, symbol } = getCurrencyForCountry(viewerCountry);

      if (currency === "USD") {
        if (!cancelled) setDisplayText(`$${usdAmount.toLocaleString("en-US")}`);
        return;
      }

      const rates = await getRates();
      const rate = rates[currency];

      if (!rate) {
        if (!cancelled) setDisplayText(`$${usdAmount.toLocaleString("en-US")}`);
        return;
      }

      const converted = usdAmount * rate;
      const formatted = converted.toLocaleString(undefined, { maximumFractionDigits: 0 });

      if (!cancelled) setDisplayText(`${symbol}${formatted} (~$${usdAmount.toLocaleString("en-US")})`);
    }

    convert();
    return () => {
      cancelled = true;
    };
  }, [usdAmount, viewerCountry]);

  return (
    <span className={className} style={style}>
      {displayText}
    </span>
  );
}

export function PriceRangeDisplay({
  rateType,
  budgetMin,
  budgetMax,
  viewerCountry,
  className,
  style,
}: {
  rateType: string;
  budgetMin: number;
  budgetMax: number;
  viewerCountry: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (rateType === "range" && budgetMin !== budgetMax) {
    return (
      <span className={className} style={style}>
        <PriceDisplay usdAmount={budgetMin} viewerCountry={viewerCountry} /> -{" "}
        <PriceDisplay usdAmount={budgetMax} viewerCountry={viewerCountry} />
      </span>
    );
  }
  return <PriceDisplay usdAmount={budgetMin} viewerCountry={viewerCountry} className={className} style={style} />;
}

export function PriceDisplayInline({
  amount,
  viewerCountry,
}: {
  amount: number;
  viewerCountry: string | null | undefined;
}) {
  return <PriceDisplay usdAmount={amount} viewerCountry={viewerCountry} />;
}


export function useConvertedAmount(usdAmount: number, viewerCountry: string | null | undefined) {
  const [text, setText] = useState(`$${usdAmount.toLocaleString("en-US")}`);

  useEffect(() => {
    let cancelled = false;

    async function convert() {
      const { currency, symbol } = getCurrencyForCountry(viewerCountry);

      if (currency === "USD") {
        if (!cancelled) setText(`$${usdAmount.toLocaleString("en-US")}`);
        return;
      }

      const rates = await getRates();
      const rate = rates[currency];

      if (!rate) {
        if (!cancelled) setText(`$${usdAmount.toLocaleString("en-US")}`);
        return;
      }

      const converted = usdAmount * rate;
      const formatted = converted.toLocaleString(undefined, { maximumFractionDigits: 0 });
      if (!cancelled) setText(`${symbol}${formatted}`);
    }

    convert();
    return () => {
      cancelled = true;
    };
  }, [usdAmount, viewerCountry]);

  return text;
}