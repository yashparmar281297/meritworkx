import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DURATION_OPTIONS, COMMITMENT_OPTIONS, labelFor } from "@/lib/projectOptions";
import { PriceRangeDisplay } from "@/components/dashboard/PriceDisplay";
import { getPlanTier, planHasFitGapAnalysis } from "@/lib/planFeatures";
import AIScoreCircle from "@/components/dashboard/AIScoreCircle";
import FitGapTip from "@/components/dashboard/FitGapTip";
import ProposalComposer from "@/components/dashboard/ProposalComposer";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, description, duration, weekly_commitment, rate_type, budget_min, budget_max, skills, status")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: profile } = await supabase
  .from("profiles")
  .select("token_plan, has_used_free_proposal, country")
  .eq("id", user.id)
  .single();

  const tier = getPlanTier(profile?.token_plan ?? null);

  await supabase.rpc("refresh_freelancer_tokens", { p_freelancer_id: user.id });
  const { data: tokenProfile } = await supabase
    .from("profiles")
    .select("tokens")
    .eq("id", user.id)
    .single();

  const { data: existingProposal } = await supabase
    .from("proposals")
    .select("id")
    .eq("project_id", id)
    .eq("freelancer_id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <Link
        href="/dashboard/freelancer/find-work"
        className="text-sm font-medium inline-block transition hover:opacity-70"
        style={{ color: "var(--yellow-deep)" }}
      >
        ← Back to Find Work
      </Link>

      <div
        className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--ink)" }}>
            {project.title}
          </h1>
          <AIScoreCircle projectId={project.id} size={56} />
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
            Description
          </h2>
          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--ink-soft)" }}>
            {project.description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Project duration
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              {labelFor(DURATION_OPTIONS, project.duration)}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Weekly commitment
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              {labelFor(COMMITMENT_OPTIONS, project.weekly_commitment)}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
            Project rate
          </h2>
          <PriceRangeDisplay
  rateType={project.rate_type}
  budgetMin={Number(project.budget_min)}
  budgetMax={Number(project.budget_max)}
  viewerCountry={profile?.country}
  className="text-sm font-semibold"
  style={{ color: "var(--ink)" }}
/>
        </div>

        {project.skills?.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
              Skills and expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ background: "var(--surface)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {planHasFitGapAnalysis(tier) && !existingProposal && (
        <FitGapTip projectId={project.id} />
      )}

      <ProposalComposer
  projectId={project.id}
  tier={tier}
  tokens={tokenProfile?.tokens ?? 0}
  alreadyApplied={!!existingProposal}
  hasUsedFreeProposal={profile?.has_used_free_proposal ?? false}
/>
    </div>
  );
}