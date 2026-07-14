"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReleasePaymentButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRelease(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Release this payment to the freelancer? This cannot be undone.")) return;

    setLoading(true);
    const res = await fetch("/api/payments/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });

    if (!res.ok) {
      alert("Could not release payment. Please try again.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleRelease}
      disabled={loading}
      className="text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-80 disabled:opacity-60 whitespace-nowrap"
      style={{ background: "var(--good-soft)", color: "var(--good)" }}
    >
      {loading ? "Releasing..." : "Approve & Release"}
    </button>
  );
}
