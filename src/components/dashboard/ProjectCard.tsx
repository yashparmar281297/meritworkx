"use client";

import { useRouter } from "next/navigation";
import { Users, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRate } from "@/lib/projectOptions";
import StatusSelect from "./StatusSelect";
import { PriceRangeDisplay } from "./PriceDisplay";

type Project = {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  rateType: string;
  skills: string[];
  status: string;
  proposalCount: number;
};

export default function ProjectCard({ project, viewerCountry }: { project: Project; viewerCountry?: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleStatusChange(newStatus: string) {
    await supabase.from("projects").update({ status: newStatus }).eq("id", project.id);
    router.refresh();
  }

  return (
    <div
  className="group flex flex-col gap-3 h-full rounded-2xl border p-5 transition hover:shadow-sm"
  style={{ background: "var(--paper)", borderColor: "var(--line)" }}
>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--ink)" }}>
          {project.title}
        </h3>

        <StatusSelect value={project.status} onChange={handleStatusChange} />
      </div>

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

      <button
  onClick={() => router.push(`/dashboard/client/projects/${project.id}`)}
  className="flex items-center justify-between pt-2 border-t text-left mt-auto"
  style={{ borderColor: "var(--line)" }}
>
        <div className="flex items-center gap-4">
          <PriceRangeDisplay
  rateType={project.rateType}
  budgetMin={project.budgetMin}
  budgetMax={project.budgetMax}
  viewerCountry={viewerCountry}
  className="text-sm font-semibold"
  style={{ color: "var(--ink)" }}
/>
          <span className="flex items-center gap-1 text-sm" style={{ color: "var(--ink-faint)" }}>
            <Users size={14} />
            {project.proposalCount}
          </span>
        </div>
        <ArrowRight
          size={16}
          className="transition group-hover:translate-x-1"
          style={{ color: "var(--yellow-deep)" }}
        />
      </button>
    </div>
  );
}