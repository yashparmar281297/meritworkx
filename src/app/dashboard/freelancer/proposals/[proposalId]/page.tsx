import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import FitGapCards from "@/components/dashboard/FitGapCards";
import { createClient } from "@/lib/supabase/server";
import { getOrComputeMatchScore, getOrComputeFitGapAnalysis } from "@/lib/ai";
import { getPlanTier, planHasFitGapAnalysis } from "@/lib/planFeatures";
import { PROPOSAL_STATUS_STYLES } from "@/lib/projectOptions";
import { PriceRangeDisplay } from "@/components/dashboard/PriceDisplay";
import ScoreCircleDisplay from "@/components/dashboard/ScoreCircleDisplay";

export default async function FreelancerProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");

const { data: viewerProfile } = await supabase
  .from("profiles")
  .select("country")
  .eq("id", user.id)
  .single();

const viewerCountry = viewerProfile?.country ?? null;

  const { data: proposalRaw } = await supabase
    .from("proposals")
    .select("id, cover_letter, status, project:projects(id, title, description, rate_type, budget_min, budget_max, skills)")
    .eq("id", proposalId)
    .eq("freelancer_id", user.id)
    .single();

  if (!proposalRaw) notFound();

  const project = Array.isArray(proposalRaw.project) ? proposalRaw.project[0] : proposalRaw.project;
  if (!project) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("token_plan")
    .eq("id", user.id)
    .single();

  const tier = getPlanTier(profile?.token_plan ?? null);

  const { score } = await getOrComputeMatchScore(supabase, project.id, user.id);

  const analysis = planHasFitGapAnalysis(tier)
    ? await getOrComputeFitGapAnalysis(supabase, project.id, user.id)
    : null;

  const statusStyle = PROPOSAL_STATUS_STYLES[proposalRaw.status] ?? PROPOSAL_STATUS_STYLES.pending;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <Link
        href="/dashboard/freelancer/proposals"
        className="text-sm font-medium inline-block transition hover:opacity-70"
        style={{ color: "var(--yellow-deep)" }}
      >
        ← Back to Proposals
      </Link>

      <div
        className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <ScoreCircleDisplay score={score} size={56} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
                {project.title}
              </h1>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                AI Match Score: <span className="font-semibold">{score}%</span>
              </p>
            </div>
          </div>
          <span
            className="text-sm font-medium px-3 py-1.5 rounded-full"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {statusStyle.label}
          </span>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
            Project description
          </h2>
          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--ink-soft)" }}>
            {project.description}
          </p>
        </div>

        <div>
  <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
    Project budget
  </h2>
  <PriceRangeDisplay
    rateType={project.rate_type}
    budgetMin={Number(project.budget_min)}
    budgetMax={Number(project.budget_max)}
    viewerCountry={viewerCountry}
    className="text-sm font-semibold"
    style={{ color: "var(--ink)" }}
  />
</div>

        {project.skills?.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
              Skills required
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

        <div>
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
            Your proposal
          </h2>
          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--ink-soft)" }}>
            {proposalRaw.cover_letter || "No cover letter provided."}
          </p>
        </div>
      </div>

      {analysis && <FitGapCards fit={analysis.fit} gap={analysis.gap} />}
    </div>
  );
}