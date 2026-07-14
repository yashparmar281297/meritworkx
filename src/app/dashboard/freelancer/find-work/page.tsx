import { createClient } from "@/lib/supabase/server";
import JobCard from "@/components/dashboard/JobCard";

type RawJob = {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  rate_type: string;
  skills: string[] | null;
  status: string;
  client_id: string;
};

type ProposalCountRow = {
  project_id: string;
  proposal_count: number;
};

export default async function FindWorkPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
if (!user) return null;

const { data: viewerProfile } = await supabase
  .from("profiles")
  .select("country")
  .eq("id", user.id)
  .single();

const viewerCountry = viewerProfile?.country ?? null;

  const { data: jobs } = await supabase
    .from("projects")
    .select("id, title, description, budget_min, budget_max, rate_type, skills, status, client_id, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const { data: counts } = await supabase.rpc("open_project_proposal_counts");
  const countRows: ProposalCountRow[] = counts ?? [];
  const countMap = new Map<string, number>(countRows.map((c) => [c.project_id, c.proposal_count]));

  const rawJobs: RawJob[] = jobs ?? [];

  const formatted = await Promise.all(
    rawJobs.map(async (j) => {
      const { data: badge } = await supabase.rpc("get_verification_badge", { p_user_id: j.client_id });
      const badgeRow = Array.isArray(badge) ? badge[0] : badge;

      const proposalCount: number = countMap.get(j.id) ?? 0;

      return {
  id: j.id,
  title: j.title,
  description: j.description,
  budgetMin: Number(j.budget_min),
  budgetMax: Number(j.budget_max),
  rateType: j.rate_type,
  skills: j.skills ?? [],
  status: j.status,
  proposalCount,
  clientVerificationStatus: badgeRow?.status ?? "unverified",
  viewerCountry,
};
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Find Work
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Open projects, scored against your profile by AI.
        </p>
      </div>

      {formatted.length === 0 ? (
        <div
          className="rounded-2xl border p-10 sm:p-16 text-center"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            No open jobs right now. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {formatted.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}