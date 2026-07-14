import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DURATION_OPTIONS, COMMITMENT_OPTIONS, labelFor, formatRate } from "@/lib/projectOptions";
import { getOrComputeMatchScore, getOrComputeProposalRankings } from "@/lib/ai";
import ClientProposalCard from "@/components/dashboard/ClientProposalCard";
import ProjectSidePanel from "@/components/dashboard/ProjectSidePanel";
import ProposalSortToggle from "@/components/dashboard/ProposalSortToggle";
import { PriceRangeDisplay } from "@/components/dashboard/PriceDisplay";


export default async function ClientProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { id } = await params;
  const { sort } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");

const { data: viewerProfile } = await supabase
  .from("profiles")
  .select("country")
  .eq("id", user.id)
  .single();

const viewerCountry = viewerProfile?.country ?? null;

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, description, duration, weekly_commitment, rate_type, budget_min, budget_max, skills, status, client_id")
    .eq("id", id)
    .single();

  if (!project || project.client_id !== user.id) notFound();

  const { data: proposalsRaw } = await supabase
    .from("proposals")
    .select("id, cover_letter, created_at, freelancer:profiles(id, full_name)")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const proposalsNormalized = (proposalsRaw ?? []).map((p) => ({
    ...p,
    freelancer: Array.isArray(p.freelancer) ? p.freelancer[0] ?? null : p.freelancer,
  }));

const proposalsWithScores = await Promise.all(
  proposalsNormalized.map(async (p) => {
    const freelancerId = p.freelancer?.id;
    let score = 0;
    let verificationStatus = "unverified";

    if (freelancerId) {
      const result = await getOrComputeMatchScore(supabase, id, freelancerId);
      score = result.score;
      const { data: badge } = await supabase.rpc("get_verification_badge", { p_user_id: freelancerId });
      const badgeRow = Array.isArray(badge) ? badge[0] : badge;
      verificationStatus = badgeRow?.status ?? "unverified";
    }

    return {
  id: p.id,
  cover_letter: p.cover_letter,
  freelancerName: p.freelancer?.full_name ?? "Unknown freelancer",
  freelancerId: p.freelancer?.id,
  score,
  verificationStatus,
};
  })
);

const rankingsMap = proposalsWithScores.length > 1 ? await getOrComputeProposalRankings(supabase, id) : {};

let proposals = proposalsWithScores.map((p) => ({
  ...p,
  rank: rankingsMap[p.id]?.rank ?? null,
  isBestMatch: rankingsMap[p.id]?.isBestMatch ?? false,
}));

if (sort === "newest") {
  proposals = [...proposalsNormalized]
    .map((raw) => proposals.find((p) => p.id === raw.id)!)
    .filter(Boolean);
} else {
  proposals = proposals.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
}



  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, freelancer:profiles!conversations_freelancer_id_fkey(full_name)")
    .eq("project_id", id)
    .maybeSingle();

  const hiredFreelancer = conversation
    ? Array.isArray(conversation.freelancer)
      ? conversation.freelancer[0]
      : conversation.freelancer
    : null;

  let messages: {
    id: string;
    sender_id: string;
    body: string;
    file_url: string | null;
    file_name: string | null;
    created_at: string;
  }[] = [];

  let timesheetEntries: {
    id: string;
    description: string;
    hours: number;
    file_url: string | null;
    file_name: string | null;
    entry_date: string;
    created_at: string;
    confidence_score: number | null;
    confidence_reason: string | null;
  }[] = [];

  if (conversation) {
    const { data: msgData } = await supabase
      .from("messages")
      .select("id, sender_id, body, file_url, file_name, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });
    messages = msgData ?? [];

    const { data: tsData } = await supabase
      .from("timesheet_entries")
      .select("id, description, hours, file_url, file_name, entry_date, created_at, confidence_score, confidence_reason")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false });
    timesheetEntries = tsData ?? [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <Link
        href="/dashboard/client/projects"
        className="text-sm font-medium inline-block transition hover:opacity-70"
        style={{ color: "var(--yellow-deep)" }}
      >
        ← Back to Projects
      </Link>

      <div
        className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--ink)" }}>
          {project.title}
        </h1>

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
  viewerCountry={viewerCountry}
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

      <div>
  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
    <h2 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
      Proposals ({proposals.length})
    </h2>
    {proposals.length > 1 && (
      <ProposalSortToggle />
    )}
  </div>

  {proposals.length === 0 ? (
    <div
      className="rounded-2xl border p-10 text-center"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
        No proposals yet.
      </p>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      {proposals.map((p) => (
        <ClientProposalCard key={p.id} projectId={id} proposal={p} />
      ))}
    </div>
  )}
</div>

      {conversation && (
        <ProjectSidePanel
          conversationId={conversation.id}
          currentUserId={user.id}
          otherPersonName={hiredFreelancer?.full_name ?? "Freelancer"}
          initialMessages={messages}
          canSubmitTimesheet={false}
          timesheetEntries={timesheetEntries}
        />
      )}
    </div>
  );
}