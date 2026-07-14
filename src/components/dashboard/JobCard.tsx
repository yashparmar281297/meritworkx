import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { PriceRangeDisplay } from "./PriceDisplay";
import AIScoreCircle from "./AIScoreCircle";
import VerifiedBadge from "./VerifiedBadge";


type Job = {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  rateType: string;
  skills: string[];
  status: string;
  proposalCount: number;
  clientVerificationStatus?: string;
  viewerCountry?: string | null;
};
export default function JobCard({ job }: { job: Job }) {
  return (
    <div
  className="group flex flex-col gap-3 h-full rounded-2xl border p-5 transition hover:shadow-sm"
  style={{ background: "var(--paper)", borderColor: "var(--line)" }}
>
      <div className="flex items-start justify-between gap-3">
  <div className="min-w-0">
    <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--ink)" }}>
      {job.title}
    </h3>
    <VerifiedBadge status={job.clientVerificationStatus ?? "unverified"} />
  </div>
  <AIScoreCircle projectId={job.id} />
</div>

      <p
        className="text-sm"
        style={{
          color: "var(--ink-soft)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {job.description}
      </p>

      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: "var(--surface)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <Link
  href={`/dashboard/freelancer/find-work/${job.id}`}
  className="flex items-center justify-between pt-2 border-t mt-auto"
  style={{ borderColor: "var(--line)" }}
>
        <div className="flex items-center gap-4">
          <PriceRangeDisplay
  rateType={job.rateType}
  budgetMin={job.budgetMin}
  budgetMax={job.budgetMax}
  viewerCountry={job.viewerCountry}
  className="text-sm font-semibold"
  style={{ color: "var(--ink)" }}
/>
          <span className="flex items-center gap-1 text-sm" style={{ color: "var(--ink-faint)" }}>
            <Users size={14} />
            {job.proposalCount}
          </span>
        </div>
        <ArrowRight
          size={16}
          className="transition group-hover:translate-x-1"
          style={{ color: "var(--yellow-deep)" }}
        />
      </Link>
    </div>
  );
}