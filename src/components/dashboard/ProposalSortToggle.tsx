"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export default function ProposalSortToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "match";

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort === "match" ? "newest" : "match");
    router.push(`?${params.toString()}`);
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition hover:bg-[var(--surface)]"
      style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
    >
      <ArrowUpDown size={13} />
      Sort: {sort === "match" ? "Best Match" : "Newest First"}
    </button>
  );
}