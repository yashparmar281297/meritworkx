import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRate } from "@/lib/projectOptions";
import { PriceRangeDisplay } from "@/components/dashboard/PriceDisplay";

export default async function MyProjectsPage() {
  const supabase = await createClient();

 const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");

const { data: viewerProfile } = await supabase
  .from("profiles")
  .select("country")
  .eq("id", user.id)
  .single();

const viewerCountry = viewerProfile?.country ?? null;

  const { data: conversationsRaw } = await supabase
    .from("conversations")
    .select("id, project:projects(id, title, description, status, rate_type, budget_min, budget_max)")
    .eq("freelancer_id", user.id)
    .order("created_at", { ascending: false });

  const projects = (conversationsRaw ?? [])
    .map((c) => {
      const project = Array.isArray(c.project) ? c.project[0] : c.project;
      return project ? { conversationId: c.id, ...project } : null;
    })
    .filter(Boolean) as {
    conversationId: string;
    id: string;
    title: string;
    description: string;
    status: string;
    rate_type: string;
    budget_min: number;
    budget_max: number;
  }[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          My Projects
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Projects you&apos;ve been hired for.
        </p>
      </div>

      {projects.length === 0 ? (
        <div
          className="rounded-2xl border p-10 sm:p-16 text-center"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            No active projects yet. They&apos;ll appear here once a client hires you.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/freelancer/my-projects/${p.conversationId}`}
              className="group flex items-center gap-4 rounded-2xl border p-4 sm:p-5 transition hover:shadow-sm"
              style={{ background: "var(--paper)", borderColor: "var(--line)" }}
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                  {p.title}
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{
                    color: "var(--ink-soft)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.description}
                </p>
              </div>
              <PriceRangeDisplay
  rateType={p.rate_type}
  budgetMin={Number(p.budget_min)}
  budgetMax={Number(p.budget_max)}
  viewerCountry={viewerCountry}
  className="text-sm font-semibold shrink-0"
  style={{ color: "var(--ink)" }}
/>
              <ArrowRight
                size={16}
                className="shrink-0 transition group-hover:translate-x-1"
                style={{ color: "var(--yellow-deep)" }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}