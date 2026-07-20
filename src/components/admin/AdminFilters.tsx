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

const PERIOD_OPTIONS = [
  { value: "this_month", label: "This month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "this_year", label: "This year" },
  { value: "last_year", label: "Last year" },
  { value: "last_5_years", label: "Last 5 years" },
  { value: "custom", label: "Custom range" },
];

const MONTH_OPTIONS = [
  { value: "", label: "Any month" },
  ...[
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ].map((label, i) => ({ value: String(i + 1), label })),
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: "", label: "Any year" },
  ...Array.from({ length: 8 }, (_, i) => currentYear - i).map((y) => ({ value: String(y), label: String(y) })),
];

export default function AdminFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(searchParams.get("city") ?? "");

  function setParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }

  const period = searchParams.get("period") ?? "this_year";
  const month = searchParams.get("month") ?? "";
  const year = searchParams.get("year") ?? "";
  const isCustom = period === "custom" && !year;

  function handlePeriodChange(value: string) {
    setParams({
      period: value,
      month: null,
      year: null,
      from: value === "custom" ? searchParams.get("from") : null,
      to: value === "custom" ? searchParams.get("to") : null,
    });
  }

  function handleMonthChange(value: string) {
    setParams({ month: value || null, year: value && !year ? String(currentYear) : year || null });
  }

  function handleYearChange(value: string) {
    setParams({ year: value || null, month: value ? month || null : null });
  }

  function handleCitySubmit(e: React.FormEvent) {
    e.preventDefault();
    setParams({ city });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Select value={period} onChange={handlePeriodChange} options={PERIOD_OPTIONS} placeholder="This year" />
        <Select value={month} onChange={handleMonthChange} options={MONTH_OPTIONS} placeholder="Any month" />
        <Select value={year} onChange={handleYearChange} options={YEAR_OPTIONS} placeholder="Any year" />
        {isCustom ? (
          <>
            <input
              type="date"
              value={searchParams.get("from") ?? ""}
              onChange={(e) => setParams({ from: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
            />
            <input
              type="date"
              value={searchParams.get("to") ?? ""}
              onChange={(e) => setParams({ to: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </>
        ) : (
          <Select
            value={searchParams.get("country") ?? ""}
            onChange={(v) => setParams({ country: v || null })}
            options={COUNTRY_OPTIONS}
            placeholder="All countries"
            searchable
          />
        )}
      </div>

      {isCustom && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-4" />
          <Select
            value={searchParams.get("country") ?? ""}
            onChange={(v) => setParams({ country: v || null })}
            options={COUNTRY_OPTIONS}
            placeholder="All countries"
            searchable
          />
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <Select value={searchParams.get("role") ?? ""} onChange={(v) => setParams({ role: v || null })} options={ROLE_OPTIONS} placeholder="All roles" />
        <form onSubmit={handleCitySubmit} className="relative sm:col-span-2">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-faint)" }} />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Filter table by city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
          />
        </form>
      </div>
    </div>
  );
}
