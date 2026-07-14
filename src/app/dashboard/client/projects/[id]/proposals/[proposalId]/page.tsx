import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import FitGapCards from "@/components/dashboard/FitGapCards";
import { createClient } from "@/lib/supabase/server";
import { getOrComputeMatchScore, getOrComputeFitGapAnalysis } from "@/lib/ai";
import ScoreCircleDisplay from "@/components/dashboard/ScoreCircleDisplay";
import ProposalStatusSelect from "@/components/dashboard/ProposalStatusSelect";


export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const { id, proposalId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, client_id")
    .eq("id", id)
    .single();

  if (!project || project.client_id !== user.id) notFound();

  const { data: proposalRaw } = await supabase
  .from("proposals")
  .select("id, cover_letter, status, created_at, freelancer:profiles(id, full_name)")
  .eq("id", proposalId)
  .eq("project_id", id)
  .single();

  if (!proposalRaw) notFound();

  const freelancer = Array.isArray(proposalRaw.freelancer) ? proposalRaw.freelancer[0] : proposalRaw.freelancer;
  if (!freelancer) notFound();

  const { score } = await getOrComputeMatchScore(supabase, id, freelancer.id);
  const analysis = await getOrComputeFitGapAnalysis(supabase, id, freelancer.id);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <Link
        href={`/dashboard/client/projects/${id}`}
        className="text-sm font-medium inline-block transition hover:opacity-70"
        style={{ color: "var(--yellow-deep)" }}
      >
        ← Back to {project.title}
      </Link>

      <div
        className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
  <div className="flex items-center gap-4">
    <ScoreCircleDisplay score={score} size={56} />
    <div>
      <h1 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
        {freelancer.full_name}
      </h1>
      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
        AI Match Score: <span className="font-semibold">{score}%</span>
      </p>
    </div>
  </div>
  <ProposalStatusSelect proposalId={proposalRaw.id} initialStatus={proposalRaw.status} />
</div>

        <div>
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
            Proposal
          </h2>
          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--ink-soft)" }}>
            {proposalRaw.cover_letter || "No cover letter provided."}
          </p>
        </div>
      </div>

      <FitGapCards fit={analysis.fit} gap={analysis.gap} />
    </div>
  );
}