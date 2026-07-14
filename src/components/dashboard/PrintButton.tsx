"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 border transition hover:bg-[var(--surface)]"
      style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}
    >
      <Printer size={16} />
      Print / Save as PDF
    </button>
  );
}
