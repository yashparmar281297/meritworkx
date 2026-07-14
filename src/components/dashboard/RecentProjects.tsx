"use client";


import Link from "next/link";
import { formatRate } from "@/lib/projectOptions";

import { PriceRangeDisplay } from "./PriceDisplay";

type Project = {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  rateType: string;
  status: string;
  created_at: string;
};

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  open: { bg: "var(--surface-yellow)", color: "var(--yellow-deep)", label: "Open" },
  in_progress: { bg: "#EFF6FF", color: "#1D4ED8", label: "In Progress" },
  completed: { bg: "var(--good-soft)", color: "var(--good)", label: "Completed" },
  cancelled: { bg: "var(--bad-soft)", color: "var(--bad)", label: "Cancelled" },
};

export default function RecentProjects({ projects, viewerCountry }: { projects: Project[]; viewerCountry?: string | null }) {
  return (
    <div className="rounded-2xl border" style={{ background: "var(--paper)", borderColor: "var(--line)" }}>
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b" style={{ borderColor: "var(--line)" }}>
        <h2 className="font-semibold" style={{ color: "var(--ink)" }}>Latest Projects</h2>
        <Link href="/dashboard/client/projects" className="text-sm font-medium" style={{ color: "var(--yellow-deep)" }}>
          View all
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="px-6 py-10 text-sm text-center" style={{ color: "var(--ink-faint)" }}>
          You haven&apos;t posted any projects yet.
        </p>
      ) : (
        <div>
          {projects.map((p) => {
            const style = statusStyles[p.status] ?? statusStyles.open;
            return (
              <Link
                key={p.id}
                href={`/dashboard/client/projects/${p.id}`}
                className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b last:border-b-0 transition hover:bg-[var(--surface)]"
                style={{ borderColor: "var(--line)" }}
              >
                <div className="min-w-0">
                  <h3 className="font-medium text-sm truncate" style={{ color: "var(--ink)" }}>{p.title}</h3>
                  <p className="text-xs mt-1 truncate" style={{ color: "var(--ink-faint)" }}>{p.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <PriceRangeDisplay
  rateType={p.rateType}
  budgetMin={p.budgetMin}
  budgetMax={p.budgetMax}
  viewerCountry={viewerCountry}
  className="text-sm font-semibold"
  style={{ color: "var(--ink)" }}
/>
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: style.bg, color: style.color }}>
                    {style.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}