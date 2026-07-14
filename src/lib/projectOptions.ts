export const RATE_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed rate" },
  { value: "range", label: "Rate range" },
] as const;


export const DURATION_OPTIONS = [
  { value: "less_than_1_month", label: "Less than 1 month" },
  { value: "1_to_2_months", label: "1 - 2 months" },
  { value: "2_to_3_months", label: "2 - 3 months" },
  { value: "3_to_6_months", label: "3 - 6 months" },
  { value: "more_than_6_months", label: "More than 6 months" },
] as const;

export const COMMITMENT_OPTIONS = [
  { value: "less_than_10", label: "Less than 10 hrs/week" },
  { value: "10_to_30", label: "10 - 30 hrs/week" },
  { value: "30_plus", label: "30+ hrs/week" },
  { value: "full_time", label: "Full-time (40+ hrs/week)" },
] as const;

export const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function labelFor(
  options: readonly { value: string; label: string }[],
  value: string | null
) {
  return options.find((o) => o.value === value)?.label ?? "Not specified";
}

export function formatRate(rateType: string, min: number, max: number) {
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;
  if (rateType === "range" && min !== max) {
    return `${fmt(min)} - ${fmt(max)}`;
  }
  return fmt(min);
}

export const PROPOSAL_STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "var(--surface-yellow)", color: "var(--yellow-deep)", label: "Pending" },
  shortlisted: { bg: "#EFF6FF", color: "#1D4ED8", label: "Shortlisted" },
  accepted: { bg: "var(--good-soft)", color: "var(--good)", label: "Accepted" },
  rejected: { bg: "var(--bad-soft)", color: "var(--bad)", label: "Rejected" },
};