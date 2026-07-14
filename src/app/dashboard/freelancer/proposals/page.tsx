import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RecentProposals from "@/components/dashboard/RecentProposals";

export default async function ProposalsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");

const { data: viewerProfile } = await supabase
  .from("profiles")
  .select("country")
  .eq("id", user.id)
  .single();

const viewerCountry = viewerProfile?.country ?? null;

  const { data: proposalsRaw } = await supabase
    .from("proposals")
    .select("id, status, rate, cover_letter, created_at, project:projects(id, title, description, rate_type, budget_min, budget_max)")
    .eq("freelancer_id", user.id)
    .order("created_at", { ascending: false });

  const proposals = (proposalsRaw ?? []).map((p) => ({
    ...p,
    project: Array.isArray(p.project) ? p.project[0] ?? null : p.project,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Proposals
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Every proposal you&apos;ve sent, newest first.
        </p>
      </div>

      <RecentProposals proposals={proposals} linkPrefix="/dashboard/freelancer/proposals" viewerCountry={viewerCountry} />
    </div>
  );
}