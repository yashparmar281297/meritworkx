"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function FindWorkSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      router.push(`?${params.toString()}`);
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="relative flex-1 min-w-0">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2"
        style={{ color: "var(--ink-faint)" }}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, skill, or keyword..."
        className="w-full pl-10 pr-4 py-2.5 rounded-full border text-sm outline-none"
        style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
      />
    </div>
  );
}
