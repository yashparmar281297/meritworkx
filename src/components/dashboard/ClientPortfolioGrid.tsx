"use client";

import Link from "next/link";
import { Link as LinkIcon, FileText } from "lucide-react";

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  technologies: string[] | null;
  project_url: string | null;
  file_url: string | null;
  file_name: string | null;
};

export default function ClientPortfolioGrid({
  freelancerId,
  portfolio,
}: {
  freelancerId: string;
  portfolio: PortfolioItem[];
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {portfolio.map((p) => (
        <Link
          key={p.id}
          href={`/dashboard/client/freelancer/${freelancerId}/portfolio/${p.id}`}
          className="flex flex-col gap-2 rounded-2xl border p-4 transition hover:shadow-sm"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
            {p.title}
          </h3>
          <p
            className="text-xs"
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
          {p.technologies && p.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--surface-yellow)", color: "var(--yellow-deep)" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
          {(p.project_url || p.file_url) && (
            <div className="flex gap-3 pt-1">
              {p.project_url && (
                <a
                  href={p.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] font-medium transition hover:opacity-70"
                  style={{ color: "var(--yellow-deep)" }}
                >
                  <LinkIcon size={11} />
                  Link
                </a>
              )}
              {p.file_url && (
                <a
                  href={p.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] font-medium transition hover:opacity-70"
                  style={{ color: "var(--yellow-deep)" }}
                >
                  <FileText size={11} />
                  {p.file_name || "File"}
                </a>
              )}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}