import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DURATION_OPTIONS, COMMITMENT_OPTIONS, labelFor, formatRate } from "@/lib/projectOptions";
import ProjectSidePanel from "@/components/dashboard/ProjectSidePanel";
import { PriceRangeDisplay } from "@/components/dashboard/PriceDisplay";

export default async function MyProjectDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");

const { data: viewerProfile } = await supabase
  .from("profiles")
  .select("country")
  .eq("id", user.id)
  .single();

const viewerCountry = viewerProfile?.country ?? null;

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      "id, freelancer_id, project:projects(id, title, description, duration, weekly_commitment, rate_type, budget_min, budget_max, skills), client:profiles!conversations_client_id_fkey(full_name)"
    )
    .eq("id", conversationId)
    .single();

  if (!conversation || conversation.freelancer_id !== user.id) notFound();

  const project = Array.isArray(conversation.project) ? conversation.project[0] : conversation.project;
  const client = Array.isArray(conversation.client) ? conversation.client[0] : conversation.client;
  if (!project) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, file_url, file_name, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const { data: timesheetEntries } = await supabase
    .from("timesheet_entries")
    .select("id, description, hours, file_url, file_name, entry_date, created_at, confidence_score, confidence_reason")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <Link
        href="/dashboard/freelancer/my-projects"
        className="text-sm font-medium inline-block transition hover:opacity-70"
        style={{ color: "var(--yellow-deep)" }}
      >
        ← Back to My Projects
      </Link>

      <div>
        <div
          className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>
              {project.title}
            </h1>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Client: {client?.full_name ?? "Client"}
            </p>
          </div>

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
                Duration
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
              Rate
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
                Skills
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
      </div>

      <ProjectSidePanel
        conversationId={conversationId}
        currentUserId={user.id}
        otherPersonName={client?.full_name ?? "Client"}
        initialMessages={messages ?? []}
        canSubmitTimesheet={true}
        timesheetEntries={timesheetEntries ?? []}
      />
    </div>
  );
}