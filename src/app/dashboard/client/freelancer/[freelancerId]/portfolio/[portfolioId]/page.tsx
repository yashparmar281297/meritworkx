import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

function getExtension(fileName: string |null) {
  if (!fileName) return "";
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export default async function ClientViewPortfolioDetailPage({
  params,
}: {
  params: Promise<{ freelancerId: string; portfolioId: string }>;
}) {
  const { freelancerId, portfolioId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("portfolio_projects")
    .select(
      "id, title, description, technologies, skills, project_url, file_url, file_name"
    )
    .eq("id", portfolioId)
    .eq("freelancer_id", freelancerId)
    .single();

  if (!project) notFound();

  const extension = getExtension(project.file_name);
  const isImage = IMAGE_EXTENSIONS.includes(extension);
  const isPdf = extension === "pdf";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6 min-w-0">
      <div>
        <Link
          href={`/dashboard/client/freelancer/${freelancerId}`}
          className="text-sm font-medium mb-4 inline-block transition hover:opacity-70"
          style={{ color: "var(--yellow-deep)" }}
        >
          ← Back to Profile
        </Link>

        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "var(--ink)" }}
        >
          {project.title}
        </h1>
      </div>

      <div
        className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6 min-w-0"
        style={{
          background: "var(--paper)",
          borderColor: "var(--line)",
        }}
      >
        {/* Description */}
        <div>
          <h2
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--ink)" }}
          >
            Description
          </h2>

          <p
            className="text-sm whitespace-pre-wrap"
            style={{ color: "var(--ink-soft)" }}
          >
            {project.description}
          </p>
        </div>

        {/* Technologies */}
        {project.technologies?.length > 0 && (
          <div>
            <h2
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--ink)" }}
            >
              Technology / Software Used
            </h2>

            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: "var(--surface-yellow)",
                    color: "var(--yellow-deep)",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {project.skills?.length > 0 && (
          <div>
            <h2
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--ink)" }}
            >
              Skills Required
            </h2>

            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill: string) => (
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

        {/* Project URL */}
        {project.project_url && (
          <div>
            <h2
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--ink)" }}
            >
              Project Link
            </h2>

            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition hover:bg-[var(--surface)]"
              style={{
                borderColor: "var(--line-strong)",
                color: "var(--ink)",
              }}
            >
              <ExternalLink size={14} />
              {project.project_url}
            </a>
          </div>
        )}

        {/* Attached File */}
        {project.file_url && (
          <div>
            <h2
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--ink)" }}
            >
              Attached File
            </h2>

            {/* Image Preview */}
            {isImage && (
              <div
                className="rounded-xl border overflow-hidden w-full min-w-0"
                style={{ borderColor: "var(--line)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.file_url}
                  alt={project.file_name ?? "Portfolio file"}
                  className="block w-full h-auto max-w-full object-contain"
                />
              </div>
            )}

            {/* PDF Preview */}
            {isPdf && (
              <div
                className="rounded-xl border overflow-hidden w-full min-w-0"
                style={{ borderColor: "var(--line)" }}
              >
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    project.file_url
                  )}&embedded=true`}
                  title={project.file_name ?? "Portfolio PDF"}
                  className="block w-full max-w-full"
                  style={{
                    height: "80vh",
                    border: "none",
                  }}
                />
              </div>
            )}

            {/* Other Files */}
            {!isImage && !isPdf && (
              <a
                href={project.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg border transition hover:bg-[var(--surface)]"
                style={{
                  borderColor: "var(--line)",
                  color: "var(--ink)",
                }}
              >
                <FileText
                  size={16}
                  style={{ color: "var(--ink-faint)" }}
                />
                {project.file_name ?? "Download File"}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}