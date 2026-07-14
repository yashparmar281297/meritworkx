import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EscrowFundingCard from "@/components/dashboard/EscrowFundingCard";
import ClientPaymentRow from "@/components/dashboard/ClientPaymentRow";

export default async function ClientPaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: projectsRaw } = await supabase
    .from("projects")
    .select("id, title, budget_min, budget_max")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const { data: conversations } = await supabase
    .from("conversations")
    .select("project_id")
    .eq("client_id", user.id);

  const hiredProjectIds = new Set((conversations ?? []).map((c) => c.project_id));

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, type, project_id, project_name, status, payment_date, project_value, client_fee, total_charged, amount, subscription_plan"
    )
    .eq("client_id", user.id)
    .order("payment_date", { ascending: false });

  const activeProjectIds = new Set(
    (payments ?? [])
      .filter((p) => p.status === "held")
      .map((p) => p.project_id)
  );

  const eligibleProjects = (projectsRaw ?? []).filter(
    (p) => hiredProjectIds.has(p.id) && !activeProjectIds.has(p.id)
  );

  const totalHeld = (payments ?? [])
    .filter((p) => p.type === "project" && p.status === "held")
    .reduce((sum, p) => sum + Number(p.total_charged ?? 0), 0);

  const totalReleased = (payments ?? [])
    .filter((p) => p.type === "project" && p.status === "released" && p.total_charged != null)
    .reduce((sum, p) => sum + Number(p.total_charged ?? 0), 0);

  // Subscription payments are charged in INR directly (no USD conversion), unlike
  // project escrow amounts which are stored in USD — keep them in a separate total
  // rather than mixing currencies into one sum.
  const totalSubscriptionsINR = (payments ?? [])
    .filter((p) => p.type === "subscription")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const totalSpent = totalHeld + totalReleased;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Payments
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Fund project escrow via Razorpay and track every payment, by project.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="In escrow (held)" value={totalHeld} />
        <SummaryCard label="Released to freelancers" value={totalReleased} />
        <SummaryCard label="Total project spend" value={totalSpent} />
      </div>

      {totalSubscriptionsINR > 0 && (
        <div
          className="rounded-2xl border p-5 flex items-center justify-between gap-3"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--ink-faint)" }}>
            Subscription spend
          </p>
          <p className="text-xl font-bold" style={{ color: "var(--ink)" }}>
            ₹{totalSubscriptionsINR.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {eligibleProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--ink)" }}>
            Fund a project
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {eligibleProjects.map((p) => (
              <EscrowFundingCard
                key={p.id}
                projectId={p.id}
                projectTitle={p.title}
                defaultAmount={Number(p.budget_max ?? p.budget_min ?? 0)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--ink)" }}>
          Payment history
        </h2>

        {!payments || payments.length === 0 ? (
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
            {payments.map((p) => (
              <ClientPaymentRow key={p.id} payment={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "var(--paper)", borderColor: "var(--line)" }}>
      <p className="text-xs font-medium mb-1" style={{ color: "var(--ink-faint)" }}>
        {label}
      </p>
      <p className="text-xl font-bold" style={{ color: "var(--ink)" }}>
        ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
