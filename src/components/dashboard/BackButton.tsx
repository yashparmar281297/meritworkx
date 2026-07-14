"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm font-medium mb-6 transition hover:opacity-70"
      style={{ color: "var(--ink-soft)" }}
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}