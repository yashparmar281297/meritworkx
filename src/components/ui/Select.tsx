"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

type Option = { value: string; label: string };

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select",
  className = "",
  searchable = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  placeholder?: string;
  className?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const filteredOptions =
    searchable && query.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : options;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 pl-4 pr-3 py-2.5 rounded-xl border text-sm text-left transition hover:border-[var(--line-strong)]"
        style={{
          background: "var(--paper)",
          borderColor: open ? "var(--yellow)" : "var(--line)",
          color: selectedLabel ? "var(--ink)" : "var(--ink-faint)",
        }}
      >
        <span className="truncate">{selectedLabel ?? placeholder}</span>
        <ChevronDown
          size={16}
          className="shrink-0 transition"
          style={{ color: "var(--ink-faint)", transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl border shadow-lg overflow-hidden"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          {searchable && (
            <div className="relative border-b" style={{ borderColor: "var(--line)" }}>
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--ink-faint)" }}
              />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2.5 text-sm outline-none"
                style={{ background: "transparent", color: "var(--ink)" }}
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm" style={{ color: "var(--ink-faint)" }}>
                No matches.
              </p>
            ) : (
              filteredOptions.map((o) => {
                const selected = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left transition"
                    style={{
                      background: selected ? "var(--surface-yellow)" : "transparent",
                      color: selected ? "var(--yellow-deep)" : "var(--ink)",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) e.currentTarget.style.background = "var(--surface)";
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span className="truncate">{o.label}</span>
                    {selected && <Check size={14} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}