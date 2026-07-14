"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

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

type PlanKey = "Pro" | "Elite";

type PlanOption = { key: PlanKey; price: string; features?: string[] };

const DEFAULT_PLANS: PlanOption[] = [
  { key: "Pro", price: "₹499/month" },
  { key: "Elite", price: "₹1,199/month" },
];

type SubscriptionSuccessResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

export default function SubscriptionCard({
  currentPlan,
  expiresAt,
  cancelRequested = false,
  plans = DEFAULT_PLANS,
}: {
  currentPlan: string | null;
  expiresAt: string | null;
  cancelRequested?: boolean;
  plans?: PlanOption[];
}) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
  const hasActivePlan = !!currentPlan && currentPlan !== "Starter" && !isExpired;

  async function handleCancel() {
    if (!confirm("Cancel your subscription? You'll keep your current plan until it expires, then it won't renew.")) {
      return;
    }
    setError("");
    setCancelling(true);

    const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not cancel subscription.");
      setCancelling(false);
      return;
    }

    router.refresh();
  }

  async function handleUpgrade(plan: PlanKey) {
    setError("");
    setLoadingPlan(plan);

    const res = await fetch("/api/subscriptions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not start subscription.");
      setLoadingPlan(null);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Could not load Razorpay checkout. Check your connection.");
      setLoadingPlan(null);
      return;
    }

    const rzp = new window.Razorpay({
      key: data.keyId,
      subscription_id: data.subscriptionId,
      name: "MeritWorkX",
      description: `${plan} plan subscription`,
      prefill: data.prefill,
      theme: { color: "#F5C518" },
      handler: async (response: unknown) => {
        const r = response as SubscriptionSuccessResponse;
        const verifyRes = await fetch("/api/subscriptions/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: r.razorpay_payment_id,
            razorpay_subscription_id: r.razorpay_subscription_id,
            razorpay_signature: r.razorpay_signature,
            plan,
          }),
        });
        if (verifyRes.ok) {
          router.refresh();
        } else {
          setError("Payment succeeded but saving the subscription failed. Contact support.");
        }
        setLoadingPlan(null);
      },
      modal: {
        ondismiss: () => setLoadingPlan(null),
      },
    });

    rzp.on("payment.failed", () => {
      setError("Payment failed. Please try again.");
      setLoadingPlan(null);
    });

    rzp.open();
  }

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div
      className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
          Subscription
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Current plan:{" "}
          <span className="font-semibold" style={{ color: "var(--ink)" }}>
            {currentPlan ?? "Starter (Free)"}
          </span>
        </p>
        {formattedExpiry && (
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            Subscription expires on{" "}
            <span className="font-semibold" style={{ color: "var(--ink)" }}>
              {formattedExpiry}
            </span>
          </p>
        )}
      </div>

      {hasActivePlan && (
        <div
          className="flex items-center justify-between gap-3 flex-wrap rounded-xl border p-3"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
            {cancelRequested
              ? `Auto-renewal cancelled — you'll keep ${currentPlan} access until ${formattedExpiry}.`
              : `Your ${currentPlan} plan renews on ${formattedExpiry}.`}
          </p>
          {!cancelRequested && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-80 disabled:opacity-60 whitespace-nowrap"
              style={{ background: "var(--bad-soft)", color: "var(--bad)" }}
            >
              {cancelling ? "Cancelling..." : "Cancel subscription"}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
          {error}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.key && !isExpired && !cancelRequested;
          return (
            <div
              key={p.key}
              className="rounded-xl border p-4 flex flex-col gap-3"
              style={{
                borderColor: isCurrent ? "var(--yellow)" : "var(--line)",
                background: isCurrent ? "var(--surface-yellow)" : "var(--surface)",
              }}
            >
              <div>
                <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                  {p.key}
                </h3>
                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                  {p.price}
                </p>
              </div>
              {p.features && p.features.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-1.5 text-xs"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      <Check size={12} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => handleUpgrade(p.key)}
                disabled={isCurrent || loadingPlan !== null}
                className="w-full py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
                style={{ background: isCurrent ? "var(--line)" : "var(--yellow)", color: "var(--ink)" }}
              >
                {loadingPlan === p.key && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCurrent ? (
                  <>
                    <Check size={14} /> Active
                  </>
                ) : loadingPlan === p.key ? (
                  "Processing..."
                ) : cancelRequested && currentPlan === p.key ? (
                  `Resubscribe to ${p.key}`
                ) : (
                  `Upgrade to ${p.key}`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
