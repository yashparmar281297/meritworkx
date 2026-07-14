"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
}: {
  projectId: string;
  projectTitle: string;
  defaultAmount: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(defaultAmount || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clientFee = Math.round(amount * 0.05 * 100) / 100;
  const total = amount + clientFee;

  async function handlePay() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, amount }),
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
          Project amount (USD)
        </label>
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
        />
      </div>

      <div className="text-xs flex flex-col gap-1" style={{ color: "var(--ink-soft)" }}>
        <div className="flex justify-between">
          <span>Project value</span>
          <span>${amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Client fee (5%)</span>
          <span>${clientFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold" style={{ color: "var(--ink)" }}>
          <span>You pay</span>
          <span>${total.toFixed(2)}</span>
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
        disabled={loading || amount <= 0}
        className="w-full py-2.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--yellow)", color: "var(--ink)" }}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Processing..." : "Fund Escrow via Razorpay"}
      </button>
    </div>
  );
}
