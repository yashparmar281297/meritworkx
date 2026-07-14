import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KpiCards from "@/components/dashboard/KpiCards";
import RecentProjects from "@/components/dashboard/RecentProjects";

export default async function ClientDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  

  const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, country")
  .eq("id", user.id)
  .single();

  const { data: projects } = await supabase
  .from("projects")
  .select("id, title, description, budget_min, budget_max, rate_type, status, created_at")
  .eq("client_id", user.id)
  .order("created_at", { ascending: false });

  const allProjects = projects ?? [];
  const totalProjects = allProjects.length;
  const runningProjects = allProjects.filter((p) => p.status === "in_progress").length;
  const completedProjects = allProjects.filter((p) => p.status === "completed").length;

  const { data: projectPayments } = await supabase
    .from("payments")
    .select("total_charged, amount, status")
    .eq("client_id", user.id)
    .eq("type", "project")
    .in("status", ["held", "released"]);

  const totalSpend = (projectPayments ?? []).reduce(
    (sum, p) => sum + Number(p.total_charged ?? p.amount ?? 0),
    0
  );

  const recentProjects = allProjects.slice(0, 3).map((p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  budgetMin: Number(p.budget_min),
  budgetMax: Number(p.budget_max),
  rateType: p.rate_type,
  status: p.status,
  created_at: p.created_at,
}));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Here&apos;s what&apos;s happening with your projects.
        </p>
      </div>

      <KpiCards
  totalProjects={totalProjects}
  runningProjects={runningProjects}
  totalSpend={totalSpend}
  completedProjects={completedProjects}
  viewerCountry={profile?.country}
/>

<RecentProjects projects={recentProjects} viewerCountry={profile?.country} />

      
    </div>
  );
}