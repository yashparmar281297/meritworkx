export default function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: { direction: "up" | "down" | "flat"; label: string } | null;
}) {
  const trendColor =
    trend?.direction === "up" ? "var(--good)" : trend?.direction === "down" ? "var(--bad)" : "var(--ink-faint)";
  const trendBg =
    trend?.direction === "up" ? "var(--good-soft)" : trend?.direction === "down" ? "var(--bad-soft)" : "var(--surface)";

  return (
    <div className="rounded-2xl border p-5" style={{ background: "var(--paper)", borderColor: "var(--line)" }}>
      <p className="text-xs font-medium mb-1" style={{ color: "var(--ink-faint)" }}>
        {label}
      </p>
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <p className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
          {value}
        </p>
        {trend && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: trendBg, color: trendColor }}
          >
            {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
