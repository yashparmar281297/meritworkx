"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getCurrencyForCountry } from "@/lib/currency";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export default function EscrowFundingCard({
  projectId,
  projectTitle,
  defaultAmount,
  viewerCountry,
}: {
  projectId: string;
  projectTitle: string;
  defaultAmount: number;
  viewerCountry?: string | null;
}) {
  const router = useRouter();
  const [amountUsd, setAmountUsd] = useState(defaultAmount || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const { currency, symbol } = getCurrencyForCountry(viewerCountry);
  const isUsd = currency === "USD";
  const rate = isUsd ? 1 : exchangeRate;

  useEffect(() => {
    if (isUsd) return;
    let cancelled = false;
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => {
        const r = data?.rates?.[currency];
        if (!cancelled && r) setExchangeRate(r);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currency, isUsd]);

  // Displayed/edited in the client's local currency when known; converted to/from
  // USD (the canonical stored currency) using the live rate.
  const displayAmount = rate ? amountUsd * rate : amountUsd;
  const clientFeeUsd = Math.round(amountUsd * 0.05 * 100) / 100;
  const totalUsd = amountUsd + clientFeeUsd;
  const displayClientFee = rate ? clientFeeUsd * rate : clientFeeUsd;
  const displayTotal = rate ? totalUsd * rate : totalUsd;

  function handleAmountChange(localValue: number) {
    setAmountUsd(rate ? localValue / rate : localValue);
  }

  async function handlePay() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, amount: amountUsd }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not start payment.");
      setLoading(false);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Could not load Razorpay checkout. Check your connection.");
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      name: "MeritWorkX",
      description: `Escrow for ${projectTitle}`,
      prefill: data.prefill,
      theme: { color: "#F5C518" },
      handler: async (response: unknown) => {
        const r = response as RazorpaySuccessResponse;
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: r.razorpay_order_id,
            razorpay_payment_id: r.razorpay_payment_id,
            razorpay_signature: r.razorpay_signature,
            paymentRowId: data.paymentRowId,
          }),
        });
        if (verifyRes.ok) {
          router.refresh();
        } else {
          setError("Payment succeeded but verification failed. Contact support.");
        }
        setLoading(false);
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    });

    rzp.on("payment.failed", () => {
      setError("Payment failed. Please try again.");
      setLoading(false);
    });

    rzp.open();
  }

  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 flex flex-col gap-3"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
        {projectTitle}
      </h3>

      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ink-soft)" }}>
          Project amount {!isUsd && `(${currency})`}
        </label>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: "var(--ink-faint)" }}
          >
            {symbol}
          </span>
          <input
            type="number"
            min={1}
            value={Math.round(displayAmount * 100) / 100}
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
          />
        </div>
      </div>

      <div className="text-xs flex flex-col gap-1" style={{ color: "var(--ink-soft)" }}>
        <div className="flex justify-between">
          <span>Project value</span>
          <span>{symbol}{displayAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Client fee (5%)</span>
          <span>{symbol}{displayClientFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold" style={{ color: "var(--ink)" }}>
          <span>You pay</span>
          <span>{symbol}{displayTotal.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={loading || amountUsd <= 0}
        className="w-full py-2.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--yellow)", color: "var(--ink)" }}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Processing..." : "Make Payment"}
      </button>
    </div>
  );
}
