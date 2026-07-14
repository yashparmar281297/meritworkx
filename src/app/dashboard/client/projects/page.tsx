import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProjectCard from "@/components/dashboard/ProjectCard";
import ProjectFilters from "@/components/dashboard/ProjectFilters";
import { PriceRangeDisplay } from "@/components/dashboard/PriceDisplay";



export default async function AllProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string }>;
}) {
  const { status, sort } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
if (!user) return null;

const { data: viewerProfile } = await supabase
  .from("profiles")
  .select("country")
  .eq("id", user.id)
  .single();

const viewerCountry = viewerProfile?.country ?? null;

  let query = supabase
    .from("projects")
    .select("id, title, description, budget_min, budget_max, rate_type, skills, status, proposals(count)")
    .eq("client_id", user.id);

  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("created_at", { ascending: sort === "oldest" });

  const { data: projects } = await query;

  const formatted = (projects ?? []).map((p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  budgetMin: Number(p.budget_min),
  budgetMax: Number(p.budget_max),
  rateType: p.rate_type,
  skills: p.skills ?? [],
  status: p.status,
  proposalCount: p.proposals?.[0]?.count ?? 0,
}));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
            Projects
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            Everything you&apos;ve posted, in one place.
          </p>
        </div>

        <Link
          href="/dashboard/client/projects/new"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition hover:opacity-90 shrink-0"
          style={{ background: "var(--yellow)", color: "var(--ink)" }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Project</span>
        </Link>
      </div>

      <ProjectFilters />

      {formatted.length === 0 ? (
        <div
          className="rounded-2xl border p-10 sm:p-16 text-center"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            No projects match this filter.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {formatted.map((project) => (
  <ProjectCard key={project.id} project={project} viewerCountry={viewerCountry} />
))}
        </div>
      )}
    </div>
  );
}