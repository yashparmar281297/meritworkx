import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PortfolioCard from "@/components/dashboard/PortfolioCard";

export default async function PortfolioPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select("id, title, description, technologies, skills, project_url, file_url, file_name")
    .eq("freelancer_id", user.id)
    .order("created_at", { ascending: false });

  const formatted = projects ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
            Portfolio
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            Showcase your best work to clients.
          </p>
        </div>

        <Link
          href="/dashboard/freelancer/portfolio/new"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition hover:opacity-90 shrink-0"
          style={{ background: "var(--yellow)", color: "var(--ink)" }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Project</span>
        </Link>
      </div>

      {formatted.length === 0 ? (
        <div
          className="rounded-2xl border p-10 sm:p-16 text-center"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            You haven&apos;t added any portfolio projects yet.
          </p>
          <Link
            href="/dashboard/freelancer/portfolio/new"
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full mt-4 transition hover:opacity-90"
            style={{ background: "var(--yellow)", color: "var(--ink)" }}
          >
            <Plus size={16} />
            Add your first project
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {formatted.map((project) => (
            <PortfolioCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}