import Link from "next/link";
import { Link as LinkIcon, FileText, ArrowRight } from "lucide-react";

type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  skills: string[];
  project_url: string | null;
  file_url: string | null;
  file_name: string | null;
};

export default function PortfolioCard({ project }: { project: PortfolioProject }) {
  return (
    <div
      className="group flex flex-col gap-3 rounded-2xl border p-5 transition hover:shadow-sm"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--ink)" }}>
        {project.title}
      </h3>

      <p
        className="text-sm"
        style={{
          color: "var(--ink-soft)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {project.description}
      </p>

      {project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: "var(--surface-yellow)", color: "var(--yellow-deep)" }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {project.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: "var(--surface)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <Link
        href={`/dashboard/freelancer/portfolio/${project.id}`}
        className="flex items-center justify-between pt-2 border-t"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex items-center gap-3">
          {project.project_url && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--ink-faint)" }}>
              <LinkIcon size={13} />
              Link
            </span>
          )}
          {project.file_url && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--ink-faint)" }}>
              <FileText size={13} />
              File
            </span>
          )}
        </div>
        <ArrowRight
          size={16}
          className="transition group-hover:translate-x-1"
          style={{ color: "var(--yellow-deep)" }}
        />
      </Link>
    </div>
  );
}