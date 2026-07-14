"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Select from "@/components/ui/Select";
import { STATUS_OPTIONS } from "@/lib/projectOptions";

const ALL_STATUS_OPTIONS = [{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export default function ProjectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/dashboard/client/projects?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={status}
        onChange={(v) => updateParam("status", v)}
        options={ALL_STATUS_OPTIONS}
        className="w-44"
      />
      <Select
        value={sort}
        onChange={(v) => updateParam("sort", v)}
        options={SORT_OPTIONS}
        className="w-44"
      />
    </div>
  );
}