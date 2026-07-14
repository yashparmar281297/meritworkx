import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/dashboard/PrintButton";

const STATUS_LABEL: Record<string, string> = {
  created: "Pending",
  held: "In Escrow",
  released: "Released",
  refunded: "Refunded",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  created: { bg: "var(--surface)", color: "var(--ink-faint)" },
  held: { bg: "var(--surface-yellow)", color: "var(--yellow-deep)" },
  released: { bg: "var(--good-soft)", color: "var(--good)" },
  refunded: { bg: "var(--bad-soft)", color: "var(--bad)" },
};

export default async function ClientPaymentSlipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: payment } = await supabase
    .from("payments")
    .select(
      "id, type, status, payment_date, amount, subscription_plan, project_name, project_value, client_fee, total_charged, razorpay_payment_id, created_at"
    )
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (!payment) notFound();

  const isSubscription = payment.type === "subscription";
  const statusStyle = isSubscription
    ? { bg: "var(--good-soft)", color: "var(--good)" }
    : STATUS_STYLE[payment.status] ?? STATUS_STYLE.created;
  const formattedDate = new Date(payment.payment_date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <Link
        href="/dashboard/client/payments"
        className="text-sm font-medium inline-block transition hover:opacity-70"
        style={{ color: "var(--yellow-deep)" }}
      >
        ← Back to Payments
      </Link>

      <div
        className="rounded-2xl border p-6 sm:p-8 flex flex-col gap-6"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        id="payment-slip"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
              Payment Slip
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
              {formattedDate}
            </p>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {isSubscription ? "Paid" : STATUS_LABEL[payment.status] ?? payment.status}
          </span>
        </div>

        <div className="h-px" style={{ background: "var(--line)" }} />

        {isSubscription ? (
          <div className="flex flex-col gap-4">
            <Row label="Plan" value={`${payment.subscription_plan} subscription`} />
            <Row label="Amount charged" value={`₹${Number(payment.amount).toFixed(2)}`} bold />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Row label="Project" value={payment.project_name ?? "—"} />
            <div className="h-px" style={{ background: "var(--line)" }} />
            <Row label="Project value" value={`$${Number(payment.project_value ?? 0).toFixed(2)}`} />
            <Row label="Client fee (5%)" value={`+ $${Number(payment.client_fee ?? 0).toFixed(2)}`} />
            <div className="h-px" style={{ background: "var(--line)" }} />
            <Row label="Total charged" value={`$${Number(payment.total_charged ?? payment.amount).toFixed(2)}`} bold />
          </div>
        )}

        {payment.razorpay_payment_id && (
          <>
            <div className="h-px" style={{ background: "var(--line)" }} />
            <Row label="Payment reference" value={payment.razorpay_payment_id} small />
          </>
        )}
      </div>

      <PrintButton />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  small,
}: {
  label: string;
  value: string;
  bold?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm" style={{ color: "var(--ink-faint)" }}>
        {label}
      </span>
      <span
        className={small ? "text-xs" : bold ? "text-base font-bold" : "text-sm"}
        style={{ color: "var(--ink)" }}
      >
        {value}
      </span>
    </div>
  );
}
