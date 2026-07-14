"use client";

import { Briefcase, Activity, DollarSign, CheckCircle2 } from "lucide-react";
import CurrencySymbolIcon from "./CurrencySymbolIcon";
import { useConvertedAmount } from "./PriceDisplay";
export default function KpiCards({
  totalProjects,
  runningProjects,
  totalSpend,
  completedProjects,
  viewerCountry,
}: {
  totalProjects: number;
  runningProjects: number;
  totalSpend: number;
  completedProjects: number;
  viewerCountry?: string | null;
}) {
  const totalSpendDisplay = useConvertedAmount(totalSpend, viewerCountry);

 const cards = [
  { label: "Total Projects", value: totalProjects, icon: Briefcase, isCurrency: false },
  { label: "Projects Running", value: runningProjects, icon: Activity, isCurrency: false },
  { label: "Total Spend", value: totalSpendDisplay, icon: DollarSign, isCurrency: true },
  { label: "Projects Completed", value: completedProjects, icon: CheckCircle2, isCurrency: false },
];

return (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {cards.map((c) => (
      <div key={c.label} className="rounded-2xl border p-5" style={{ background: "var(--paper)", borderColor: "var(--line)" }}>
        {c.isCurrency ? (
          <div className="mb-3">
            <CurrencySymbolIcon viewerCountry={viewerCountry} size={20} color="var(--yellow-deep)" />
          </div>
        ) : (
          <c.icon className="w-5 h-5 mb-3" style={{ color: "var(--yellow-deep)" }} />
        )}
        <div className="text-2xl font-bold" style={{ color: "var(--ink)" }}>{c.value}</div>
        <div className="text-sm mt-1" style={{ color: "var(--ink-faint)" }}>{c.label}</div>
      </div>
    ))}
  </div>
);
}