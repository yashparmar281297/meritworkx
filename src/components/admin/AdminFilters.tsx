"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Select from "@/components/ui/Select";
import { COUNTRIES } from "@/lib/currency";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "client", label: "Client" },
  { value: "freelancer", label: "Freelancer" },
];

const COUNTRY_OPTIONS = [
  { value: "", label: "All countries" },
  ...COUNTRIES.map((c) => ({ value: c.name, label: c.name })),
];

export default function AdminFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(searchParams.get("city") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }

  function handleCitySubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("city", city);
  }

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <Select
        value={searchParams.get("role") ?? ""}
        onChange={(v) => updateParam("role", v)}
        options={ROLE_OPTIONS}
        placeholder="All roles"
      />
      <Select
        value={searchParams.get("country") ?? ""}
        onChange={(v) => updateParam("country", v)}
        options={COUNTRY_OPTIONS}
        placeholder="All countries"
        searchable
      />
      <form onSubmit={handleCitySubmit} className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--ink-faint)" }}
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Filter by city..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
        />
      </form>
    </div>
  );
}
