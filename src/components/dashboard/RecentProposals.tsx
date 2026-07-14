import Link from "next/link";
import { formatRate, PROPOSAL_STATUS_STYLES } from "@/lib/projectOptions";
import { PriceRangeDisplay, PriceDisplayInline } from "./PriceDisplay";


type Proposal = {
  id: string;
  status: string;
  rate: number | null;
  project: {
    id: string;
    title: string;
    description: string;
    rate_type: string;
    budget_min: number;
    budget_max: number;
  } | null;
};

function rowContent(p: Proposal, style: { bg: string; color: string; label: string }, viewerCountry: string | null | undefined) {
  return (
    <>
      <div className="min-w-0">
        <h3 className="font-medium text-sm truncate" style={{ color: "var(--ink)" }}>{p.project!.title}</h3>
        <p className="text-xs mt-1 truncate" style={{ color: "var(--ink-faint)" }}>{p.project!.description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
  {p.rate ? (
    <PriceDisplayInline amount={p.rate} viewerCountry={viewerCountry} />
  ) : (
    <PriceRangeDisplay
      rateType={p.project!.rate_type}
      budgetMin={p.project!.budget_min}
      budgetMax={p.project!.budget_max}
      viewerCountry={viewerCountry}
    />
  )}
</span>
        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: style.bg, color: style.color }}>
          {style.label}
        </span>
      </div>
    </>
  );
}

export default function RecentProposals({
  proposals,
  linkPrefix,
  viewerCountry,
}: {
  proposals: Proposal[];
  linkPrefix?: string;
  viewerCountry?: string | null;
}) {
  return (
    <div className="rounded-2xl border" style={{ background: "var(--paper)", borderColor: "var(--line)" }}>
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b" style={{ borderColor: "var(--line)" }}>
        <h2 className="font-semibold" style={{ color: "var(--ink)" }}>Latest Proposals</h2>
        <Link href="/dashboard/freelancer/proposals" className="text-sm font-medium" style={{ color: "var(--yellow-deep)" }}>
          View all
        </Link>
      </div>

      {proposals.length === 0 ? (
        <p className="px-6 py-10 text-sm text-center" style={{ color: "var(--ink-faint)" }}>
          You haven&apos;t sent any proposals yet.
        </p>
      ) : (
        <div>
          {proposals.map((p) => {
            if (!p.project) return null;
            const style = PROPOSAL_STATUS_STYLES[p.status] ?? PROPOSAL_STATUS_STYLES.pending;
            const rowClass = "flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b last:border-b-0";
            const rowStyle = { borderColor: "var(--line)" };

            if (linkPrefix) {
  return (
    <Link key={p.id} href={`${linkPrefix}/${p.id}`} className={`${rowClass} transition hover:bg-[var(--surface)]`} style={rowStyle}>
      {rowContent(p, style, viewerCountry)}
    </Link>
  );
}

return (
  <div key={p.id} className={rowClass} style={rowStyle}>
    {rowContent(p, style, viewerCountry)}
  </div>
);
          })}
        </div>
      )}
    </div>
  );
}