import { createClient } from "@/lib/supabase/server";
import PaymentRow from "@/components/dashboard/PaymentRow";
import WithdrawModal from "@/components/dashboard/WithdrawModal";

const WITHDRAWAL_STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "var(--surface-yellow)", color: "var(--yellow-deep)", label: "Pending" },
  completed: { bg: "var(--good-soft)", color: "var(--good)", label: "Completed" },
  rejected: { bg: "var(--bad-soft)", color: "var(--bad)", label: "Rejected" },
};

export default async function FreelancerPaymentsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
if (!user) return null;

const { data: viewerProfile } = await supabase
  .from("profiles")
  .select("country")
  .eq("id", user.id)
  .single();

const viewerCountry = viewerProfile?.country ?? null;

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, type, status, payment_date, amount, subscription_plan, client_name, project_name, project_value, freelancer_fee"
    )
    .eq("freelancer_id", user.id)
    .order("payment_date", { ascending: false });

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("id, amount, status, created_at")
    .eq("freelancer_id", user.id)
    .order("created_at", { ascending: false });

  const formatted = payments ?? [];
  const withdrawalList = withdrawals ?? [];

  const totalEarned = formatted
    .filter((p) => p.type === "project" && p.status === "released")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalWithdrawn = withdrawalList
    .filter((w) => w.status !== "rejected")
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const availableBalance = totalEarned - totalWithdrawn;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Payments
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          All your subscription and project payments, newest first.
        </p>
      </div>

      <div
        className="rounded-2xl border p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <div className="flex gap-8 sm:gap-12">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--ink-faint)" }}>
              Total earned
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--ink)" }}>
              ${totalEarned.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--ink-faint)" }}>
              Available balance
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--ink)" }}>
              ${availableBalance.toFixed(2)}
            </p>
          </div>
        </div>
        <WithdrawModal availableBalance={availableBalance} />
      </div>

      {withdrawalList.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--ink)" }}>
            Withdrawal history
          </h2>
          <div className="flex flex-col gap-3">
            {withdrawalList.map((w) => {
              const style = WITHDRAWAL_STATUS_STYLE[w.status] ?? WITHDRAWAL_STATUS_STYLE.pending;
              return (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border px-4 sm:px-6 py-4"
                  style={{ background: "var(--paper)", borderColor: "var(--line)" }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                      ${Number(w.amount).toFixed(2)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                      {new Date(w.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {formatted.length === 0 ? (
        <div
          className="rounded-2xl border p-10 sm:p-16 text-center"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            No payments yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="hidden sm:grid grid-cols-5 gap-4 px-6 text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--ink-faint)" }}
          >
            <span>Date</span>
            <span>Client / Plan</span>
            <span>Breakdown</span>
            <span className="text-right">Payment</span>
            <span className="text-right">Status</span>
          </div>
          {formatted.map((p) => (
  <PaymentRow key={p.id} payment={p} viewerCountry={viewerCountry} />
))}
        </div>
      )}
    </div>
  );
}