import { createClient } from "@/lib/supabase/server";
import PaymentRow from "@/components/dashboard/PaymentRow";

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

  const formatted = payments ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Payments
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          All your subscription and project payments, newest first.
        </p>
      </div>

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