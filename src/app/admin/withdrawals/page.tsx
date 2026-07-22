import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { convertUsdToCountry } from "@/lib/exchangeRates";
import WithdrawalActionButtons from "@/components/admin/WithdrawalActionButtons";

export const metadata: Metadata = {
  title: "Withdrawal requests — Admin — MeritWorkX",
};

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "var(--surface-yellow)", color: "var(--yellow-deep)", label: "Pending" },
  completed: { bg: "var(--good-soft)", color: "var(--good)", label: "Sent" },
  rejected: { bg: "var(--bad-soft)", color: "var(--bad)", label: "Rejected" },
};

function PayoutDetails({
  method,
  details,
}: {
  method: string | null;
  details: Record<string, string> | null;
}) {
  if (!method || !details) {
    return <p style={{ color: "var(--bad)" }}>No payout details on file.</p>;
  }
  if (method === "bank_transfer") {
    return (
      <div className="flex flex-col gap-0.5">
        <span>Bank transfer</span>
        <span>Account holder: {details.account_holder ?? "—"}</span>
        <span>Account number: {details.account_number ?? "—"}</span>
        <span>IFSC: {details.ifsc ?? "—"}</span>
      </div>
    );
  }
  const label = method === "paypal" ? "PayPal" : "Wise";
  return (
    <div className="flex flex-col gap-0.5">
      <span>{label}</span>
      <span>Email: {details.email ?? "—"}</span>
    </div>
  );
}

export default async function AdminWithdrawalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.email !== process.env.ADMIN_EMAIL) notFound();

  const { data: withdrawalsRaw } = await supabase
    .from("withdrawals")
    .select(
      "id, amount, status, payout_method, payout_details, created_at, freelancer:profiles(full_name, email, country)"
    )
    .order("created_at", { ascending: false });

  const withdrawals = withdrawalsRaw ?? [];

  const rows = await Promise.all(
    withdrawals.map(async (w) => {
      const freelancer = Array.isArray(w.freelancer) ? w.freelancer[0] : w.freelancer;
      const converted = await convertUsdToCountry(Number(w.amount), freelancer?.country);
      return { ...w, freelancer, converted };
    })
  );

  const pending = rows.filter((r) => r.status === "pending");
  const resolved = rows.filter((r) => r.status !== "pending");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div>
        <Link
          href="/admin"
          className="flex items-center gap-1 text-sm font-medium mb-3 transition hover:opacity-70"
          style={{ color: "var(--yellow-deep)" }}
        >
          <ArrowLeft size={15} />
          Back to Admin
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Withdrawal requests
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          {pending.length} pending — mark a request as sent once you&apos;ve transferred the funds yourself.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {rows.length === 0 && (
          <div
            className="rounded-2xl border p-10 text-center"
            style={{ background: "var(--paper)", borderColor: "var(--line)" }}
          >
            <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
              No withdrawal requests yet.
            </p>
          </div>
        )}

        {[...pending, ...resolved].map((w) => {
          const style = STATUS_STYLE[w.status] ?? STATUS_STYLE.pending;
          return (
            <div
              key={w.id}
              className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              style={{ background: "var(--paper)", borderColor: "var(--line)" }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                    {w.freelancer?.full_name ?? "Unknown freelancer"}
                  </p>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                  {w.freelancer?.email ?? "—"}
                </p>
                <p className="text-lg font-bold mt-1" style={{ color: "var(--ink)" }}>
                  {w.converted.formatted}
                </p>
                <div className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                  <PayoutDetails
                    method={w.payout_method}
                    details={w.payout_details as Record<string, string> | null}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
                  Requested {new Date(w.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              {w.status === "pending" && <WithdrawalActionButtons withdrawalId={w.id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
