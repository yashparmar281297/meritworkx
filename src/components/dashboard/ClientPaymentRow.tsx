import Link from "next/link";
import ReleasePaymentButton from "./ReleasePaymentButton";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  created: { bg: "var(--surface)", color: "var(--ink-faint)", label: "Pending" },
  held: { bg: "var(--surface-yellow)", color: "var(--yellow-deep)", label: "In Escrow" },
  released: { bg: "var(--good-soft)", color: "var(--good)", label: "Released" },
  refunded: { bg: "var(--bad-soft)", color: "var(--bad)", label: "Refunded" },
};

type Payment = {
  id: string;
  type: string;
  project_name: string | null;
  status: string;
  payment_date: string;
  project_value: number | null;
  client_fee: number | null;
  total_charged: number | null;
  amount: number;
  subscription_plan: string | null;
};

export default function ClientPaymentRow({ payment }: { payment: Payment }) {
  const isSubscription = payment.type === "subscription";
  const style = isSubscription
    ? { bg: "var(--good-soft)", color: "var(--good)", label: "Paid" }
    : STATUS_STYLES[payment.status] ?? STATUS_STYLES.created;
  const formattedDate = new Date(payment.payment_date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/dashboard/client/payments/${payment.id}`}
      className="grid grid-cols-2 sm:grid-cols-5 gap-y-2 gap-x-4 items-center rounded-2xl border px-4 sm:px-6 py-4 transition hover:shadow-sm"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div>
        <p className="text-[10px] uppercase tracking-wide sm:hidden mb-0.5" style={{ color: "var(--ink-faint)" }}>
          Date
        </p>
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          {formattedDate}
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide sm:hidden mb-0.5" style={{ color: "var(--ink-faint)" }}>
          {isSubscription ? "Plan" : "Project"}
        </p>
        <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
          {isSubscription ? `${payment.subscription_plan} subscription` : payment.project_name ?? "—"}
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide sm:hidden mb-0.5" style={{ color: "var(--ink-faint)" }}>
          Breakdown
        </p>
        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
          {isSubscription
            ? "Monthly subscription"
            : payment.project_value != null
            ? `$${Number(payment.project_value).toFixed(2)} + $${Number(payment.client_fee ?? 0).toFixed(2)} fee`
            : "—"}
        </p>
      </div>

      <div className="text-left sm:text-right">
        <p className="text-[10px] uppercase tracking-wide sm:hidden mb-0.5" style={{ color: "var(--ink-faint)" }}>
          You paid
        </p>
        <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          {isSubscription
            ? `₹${Number(payment.amount).toFixed(2)}`
            : `$${Number(payment.total_charged ?? payment.amount).toFixed(2)}`}
        </p>
      </div>

      <div className="flex sm:justify-end items-center gap-2">
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: style.bg, color: style.color }}
        >
          {style.label}
        </span>
        {!isSubscription && payment.status === "held" && <ReleasePaymentButton paymentId={payment.id} />}
      </div>
    </Link>
  );
}
