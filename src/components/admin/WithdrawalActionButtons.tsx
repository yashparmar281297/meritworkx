"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";

export default function WithdrawalActionButtons({ withdrawalId }: { withdrawalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"completed" | "rejected" | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(status: "completed" | "rejected") {
    setError("");
    setLoading(status);
    const res = await fetch("/api/admin/withdrawals/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not update withdrawal");
      setLoading(null);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => updateStatus("completed")}
          disabled={loading !== null}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--good-soft)", color: "var(--good)" }}
        >
          {loading === "completed" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Mark sent
        </button>
        <button
          type="button"
          onClick={() => updateStatus("rejected")}
          disabled={loading !== null}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--bad-soft)", color: "var(--bad)" }}
        >
          {loading === "rejected" ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
          Reject
        </button>
      </div>
      {error && <p className="text-xs" style={{ color: "var(--bad)" }}>{error}</p>}
    </div>
  );
}
