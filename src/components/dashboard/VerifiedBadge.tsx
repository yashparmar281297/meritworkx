import { BadgeCheck } from "lucide-react";

export default function VerifiedBadge({ status, size = 14 }: { status: string; size?: number }) {
  if (status !== "verified") return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0"
      style={{ background: "var(--good-soft)", color: "var(--good)" }}
      title="Verified"
    >
      <BadgeCheck size={size} />
      Verified
    </span>
  );
}