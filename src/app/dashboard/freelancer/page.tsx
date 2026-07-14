import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FreelancerKpiCards from "@/components/dashboard/FreelancerKpiCards";
import RecentProposals from "@/components/dashboard/RecentProposals";

export default async function FreelancerDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, country")
  .eq("id", user.id)
  .single();

  await supabase.rpc("refresh_freelancer_tokens", { p_freelancer_id: user.id });

  const { data: tokenProfile } = await supabase
    .from("profiles")
    .select("tokens")
    .eq("id", user.id)
    .single();

  const totalTokens = tokenProfile?.tokens ?? 0;

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, status, rate, created_at, project:projects(id, title, description, rate_type, budget_min, budget_max, status)")
    .eq("freelancer_id", user.id)
    .order("created_at", { ascending: false });

  const allProposals = (proposals ?? []).map((p) => ({
    ...p,
    project: Array.isArray(p.project) ? p.project[0] ?? null : p.project,
  }));

  const totalProposals = allProposals.length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const hiredProjects = allProposals
    .filter((p) => p.status === "accepted" && p.project)
    .map((p) => p.project!);

  const uniqueHiredProjects = Array.from(new Map(hiredProjects.map((p) => [p.id, p])).values());

  const runningProjects = uniqueHiredProjects.filter((p) => p.status === "in_progress");

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, payment_date, type")
    .eq("freelancer_id", user.id)
    .eq("type", "project");

  const clientPayments = payments ?? [];

  const totalRevenue = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const monthRevenue = clientPayments
    .filter((p) => {
      const paidOn = new Date(p.payment_date);
      return paidOn.getMonth() === currentMonth && paidOn.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const recentProposals = allProposals.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Here&apos;s how your freelance work is going.
        </p>
      </div>

      <FreelancerKpiCards
  totalProposals={totalProposals}
  totalRevenue={totalRevenue}
  monthRevenue={monthRevenue}
  projectsWorked={uniqueHiredProjects.length}
  projectsRunning={runningProjects.length}
  totalTokens={totalTokens}
  viewerCountry={profile?.country}
/>

      <RecentProposals proposals={recentProposals} viewerCountry={profile?.country} />
    </div>
  );
}