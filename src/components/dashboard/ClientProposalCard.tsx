"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import ScoreCircleDisplay from "./ScoreCircleDisplay";
import VerifiedBadge from "./VerifiedBadge";

type Proposal = {
  id: string;
  cover_letter: string | null;
  freelancerName: string;
  freelancerId?: string;
  score: number;
  verificationStatus?: string;
  rank?: number | null;
  isBestMatch?: boolean;
};

export default function ClientProposalCard({
  projectId,
  proposal,
}: {
  projectId: string;
  proposal: Proposal;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() =>
        router.push(
          `/dashboard/client/projects/${projectId}/proposals/${proposal.id}`
        )
      }
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 sm:p-5 transition hover:shadow-sm"
      style={{
        background: "var(--paper)",
        borderColor: "var(--line)",
      }}
    >
      <ScoreCircleDisplay score={proposal.score} size={44} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {proposal.freelancerId ? (
            <Link
              href={`/dashboard/client/freelancer/${proposal.freelancerId}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-sm hover:underline"
              style={{ color: "var(--ink)" }}
            >
              {proposal.freelancerName}
            </Link>
          ) : (
            <h3
              className="font-semibold text-sm"
              style={{ color: "var(--ink)" }}
            >
              {proposal.freelancerName}
            </h3>
          )}

          <VerifiedBadge
            status={proposal.verificationStatus ?? "unverified"}
          />

          {proposal.isBestMatch && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{
                background: "var(--yellow)",
                color: "var(--ink)",
              }}
            >
              Best Match
            </span>
          )}

          {!proposal.isBestMatch && proposal.rank != null && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "var(--surface)",
                color: "var(--ink-faint)",
              }}
            >
              #{proposal.rank}
            </span>
          )}
        </div>

        <p
          className="text-xs mt-0.5"
          style={{
            color: "var(--ink-soft)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {proposal.cover_letter || "No cover letter provided."}
        </p>
      </div>

      <ArrowRight
        size={16}
        className="shrink-0 transition group-hover:translate-x-1"
        style={{ color: "var(--yellow-deep)" }}
      />
    </div>
  );
}