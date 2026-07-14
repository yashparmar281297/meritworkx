"use client";

import { Send, DollarSign, TrendingUp, Briefcase, Activity, Coins } from "lucide-react";
import { useConvertedAmount } from "./PriceDisplay";
import CurrencySymbolIcon from "./CurrencySymbolIcon";

export default function FreelancerKpiCards({
  totalProposals,
  totalRevenue,
  monthRevenue,
  projectsWorked,
  projectsRunning,
  totalTokens,
  viewerCountry,
}: {
  totalProposals: number;
  totalRevenue: number;
  monthRevenue: number;
  projectsWorked: number;
  projectsRunning: number;
  totalTokens: number;
  viewerCountry?: string | null;
}) {
  const totalRevenueDisplay = useConvertedAmount(totalRevenue, viewerCountry);
  const monthRevenueDisplay = useConvertedAmount(monthRevenue, viewerCountry);

  const cards = [
  { label: "Total Tokens", value: totalTokens, icon: Coins, isCurrency: false },
  { label: "Proposals Sent", value: totalProposals, icon: Send, isCurrency: false },
  { label: "Total Payment", value: totalRevenueDisplay, icon: DollarSign, isCurrency: true },
  { label: "Payment This Month", value: monthRevenueDisplay, icon: TrendingUp, isCurrency: true },
  { label: "Projects Worked", value: projectsWorked, icon: Briefcase, isCurrency: false },
  { label: "Projects Running", value: projectsRunning, icon: Activity, isCurrency: false },
];

return (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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