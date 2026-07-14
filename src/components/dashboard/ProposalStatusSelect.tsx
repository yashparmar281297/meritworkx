"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { PROPOSAL_STATUS_STYLES } from "@/lib/projectOptions";
import { createClient } from "@/lib/supabase/client";

const OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export default function ProposalStatusSelect({
  proposalId,
  initialStatus,
}: {
  proposalId: string;
  initialStatus: string;
}) {
  const supabase = createClient();
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const style = PROPOSAL_STATUS_STYLES[status] ?? PROPOSAL_STATUS_STYLES.pending;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleChange(newStatus: string) {
  setOpen(false);
  if (newStatus === status) return;

  setSaving(true);
  const { data, error } = await supabase
    .from("proposals")
    .update({ status: newStatus })
    .eq("id", proposalId)
    .select();

  if (!error && data && data.length > 0) {
    setStatus(newStatus);
  } else {
    alert("Could not update status. Please try again.");
  }
  setSaving(false);
}

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={saving}
        className="flex items-center gap-1.5 text-sm font-medium pl-4 pr-3 py-2 rounded-full transition disabled:opacity-60"
        style={{ background: style.bg, color: style.color }}
      >
        {saving ? "Updating..." : style.label}
        <ChevronDown size={14} className="transition" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-1.5 w-44 rounded-xl border shadow-lg overflow-hidden"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          {OPTIONS.map((o) => {
            const optionStyle = PROPOSAL_STATUS_STYLES[o.value] ?? PROPOSAL_STATUS_STYLES.pending;
            const selected = o.value === status;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => handleChange(o.value)}
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
                  <span className="w-2 h-2 rounded-full" style={{ background: optionStyle.color }} />
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