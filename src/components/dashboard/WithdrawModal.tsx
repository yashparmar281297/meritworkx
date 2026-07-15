"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

export default function WithdrawModal({ availableBalance }: { availableBalance: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function close() {
    setOpen(false);
    setAmount("");
    setError("");
    setDone(false);
  }

  async function handleWithdraw() {
    setError("");
    const value = Number(amount);

    if (!value || value <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (value > availableBalance) {
      setError(`You can withdraw up to $${availableBalance.toFixed(2)}.`);
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/withdrawals/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: value }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not submit withdrawal request.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setDone(true);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={availableBalance <= 0}
        className="py-2.5 px-5 rounded-full font-semibold text-sm transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--yellow)", color: "var(--ink)" }}
      >
        Withdraw
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={close}
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-4"
            style={{ background: "var(--paper)", borderColor: "var(--line)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
                Withdraw funds
              </h2>
              <button type="button" onClick={close} aria-label="Close">
                <X size={18} style={{ color: "var(--ink-faint)" }} />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col gap-3 items-center text-center py-4">
                <p className="text-sm font-medium" style={{ color: "var(--good)" }}>
                  Withdrawal requested
                </p>
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  We&apos;ll send the funds to your saved payout details shortly.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="py-2 px-5 rounded-full text-sm font-semibold mt-2"
                  style={{ background: "var(--surface)", color: "var(--ink)" }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  Available balance: <strong style={{ color: "var(--ink)" }}>${availableBalance.toFixed(2)}</strong>
                </p>

                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
                    Amount to withdraw (USD)
                  </label>
                  <input
                    type="number"
                    min={0.01}
                    max={availableBalance}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Up to $${availableBalance.toFixed(2)}`}
                    className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
                    style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
                  />
                </div>

                {error && (
                  <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={submitting}
                  className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: "var(--yellow)", color: "var(--ink)" }}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Submitting..." : "Withdraw"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
