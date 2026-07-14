import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ClientPortfolioGrid from "@/components/dashboard/ClientPortfolioGrid";

export default async function ClientViewFreelancerPage({
  params,
}: {
  params: Promise<{ freelancerId: string }>;
}) {
  const { freelancerId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, avatar_url, skills")
    .eq("id", freelancerId)
    .single();

  if (!profile) notFound();

  const { data: portfolio } = await supabase
    .from("portfolio_projects")
    .select(
      "id, title, description, technologies, skills, project_url, file_url, file_name"
    )
    .eq("freelancer_id", freelancerId)
    .order("created_at", { ascending: false });

  const initials = (profile.full_name ?? "U")
    .split(" ")
    .filter(Boolean)
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <Link
        href="/dashboard/client/projects"
        className="text-sm font-medium inline-block transition hover:opacity-70"
        style={{ color: "var(--yellow-deep)" }}
      >
        ← Back
      </Link>

      <div
        className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6"
        style={{
          background: "var(--paper)",
          borderColor: "var(--line)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-lg overflow-hidden shrink-0"
            style={{
              background: "var(--yellow)",
              color: "var(--ink)",
            }}
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <h1
            className="text-xl font-bold"
            style={{ color: "var(--ink)" }}
          >
            {profile.full_name}
          </h1>
        </div>

        {profile.bio && (
          <div>
            <h2
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--ink)" }}
            >
              Bio
            </h2>

            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: "var(--ink-soft)" }}
            >
              {profile.bio}
            </p>
          </div>
        )}

        {profile.skills?.length > 0 && (
          <div>
            <h2
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--ink)" }}
            >
              Skills
            </h2>

            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: "var(--surface)",
                    color: "var(--ink-soft)",
                    border: "1px solid var(--line)",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--ink)" }}
        >
          <Briefcase size={18} />
          Portfolio
        </h2>

        {!portfolio || portfolio.length === 0 ? (
          <div
            className="rounded-2xl border p-10 text-center"
            style={{
              background: "var(--paper)",
              borderColor: "var(--line)",
            }}
          >
            <p
              className="text-sm"
              style={{ color: "var(--ink-faint)" }}
            >
              No portfolio projects added yet.
            </p>
          </div>
        ) : (
          <ClientPortfolioGrid freelancerId={freelancerId} portfolio={portfolio} />
        )}
      </div>
    </div>
  );
}