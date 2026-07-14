"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/projectOptions";

const statusColors: Record<string, { bg: string; color: string }> = {
  open: { bg: "var(--surface-yellow)", color: "var(--yellow-deep)" },
  in_progress: { bg: "#EFF6FF", color: "#1D4ED8" },
  completed: { bg: "var(--good-soft)", color: "var(--good)" },
  cancelled: { bg: "var(--bad-soft)", color: "var(--bad)" },
};

export default function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const style = statusColors[value] ?? statusColors.open;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-medium pl-3 pr-2 py-1 rounded-full transition"
        style={{ background: style.bg, color: style.color }}
      >
        {STATUS_OPTIONS.find((o) => o.value === value)?.label ?? "Open"}
        <ChevronDown
          size={12}
          className="transition"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-1.5 w-40 rounded-xl border shadow-lg overflow-hidden"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          {STATUS_OPTIONS.map((o) => {
            const selected = o.value === value;
            const optionStyle = statusColors[o.value];
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-left transition"
                style={{ background: selected ? "var(--surface)" : "transparent", color: "var(--ink)" }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = "var(--surface)";
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.background = "transparent";
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: optionStyle.color }}
                  />
                  {o.label}
                </span>
                {selected && <Check size={14} style={{ color: "var(--yellow-deep)" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}