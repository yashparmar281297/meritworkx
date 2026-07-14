"use client";

import Link from "next/link";
import { useConvertedAmount, PriceDisplayInline } from "./PriceDisplay";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  created: { bg: "var(--surface)", color: "var(--ink-faint)", label: "Pending" },
  held: { bg: "var(--surface-yellow)", color: "var(--yellow-deep)", label: "In Escrow" },
  released: { bg: "var(--good-soft)", color: "var(--good)", label: "Released" },
  refunded: { bg: "var(--bad-soft)", color: "var(--bad)", label: "Refunded" },
};

type Payment = {
  id: string;
  type: "subscription" | "project";
  status: string;
  payment_date: string;
  amount: number;
  subscription_plan: string | null;
  client_name: string | null;
  project_name: string | null;
  project_value: number | null;
  freelancer_fee: number | null;
};

function ProjectAmount({ amount, viewerCountry }: { amount: number; viewerCountry?: string | null }) {
  const amountDisplay = useConvertedAmount(Number(amount), viewerCountry);
  return <>{amountDisplay}</>;
}

export default function PaymentRow({ payment, viewerCountry }: { payment: Payment; viewerCountry?: string | null }) {
  const isSubscription = payment.type === "subscription";
  const style = isSubscription
    ? { bg: "var(--good-soft)", color: "var(--good)", label: "Paid" }
    : STATUS_STYLES[payment.status] ?? STATUS_STYLES.created;

  const formattedDate = new Date(payment.payment_date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/dashboard/freelancer/payments/${payment.id}`}
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
          {isSubscription ? "Plan" : "Client"}
        </p>
        {isSubscription ? (
          <span
            className="inline-block text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: "var(--surface-yellow)", color: "var(--yellow-deep)" }}
          >
            {payment.subscription_plan}
          </span>
        ) : (
          <div>
            <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
              {payment.client_name}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--ink-faint)" }}>
              {payment.project_name ?? "—"}
            </p>
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide sm:hidden mb-0.5" style={{ color: "var(--ink-faint)" }}>
          Breakdown
        </p>
        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
          {isSubscription ? (
            "Monthly subscription"
          ) : payment.project_value != null ? (
            <>
              <PriceDisplayInline amount={payment.project_value} viewerCountry={viewerCountry} /> −{" "}
              <PriceDisplayInline amount={payment.freelancer_fee ?? 0} viewerCountry={viewerCountry} /> fee
            </>
          ) : (
            "—"
          )}
        </p>
      </div>

      <div className="text-left sm:text-right">
        <p className="text-[10px] uppercase tracking-wide sm:hidden mb-0.5" style={{ color: "var(--ink-faint)" }}>
          Payment
        </p>
        <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          {isSubscription ? (
            `₹${Number(payment.amount).toFixed(2)}`
          ) : (
            <ProjectAmount amount={payment.amount} viewerCountry={viewerCountry} />
          )}
        </p>
      </div>

      <div className="text-left sm:text-right">
        <p className="text-[10px] uppercase tracking-wide sm:hidden mb-0.5" style={{ color: "var(--ink-faint)" }}>
          Status
        </p>
        <span
          className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: style.bg, color: style.color }}
        >
          {style.label}
        </span>
      </div>
    </Link>
  );
}
