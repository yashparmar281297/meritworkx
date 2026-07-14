"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AIScoreCircle({ projectId, size = 44 }: { projectId: string; size?: number }) {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchScore() {
      try {
        const res = await fetch("/api/match-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) setScore(data.score);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchScore();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const stroke = Math.max(3, Math.round(size / 11));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score ?? 0;
  const offset = circumference * (1 - pct / 100);

  const color =
    score === null ? "var(--ink-faint)" : score >= 75 ? "var(--good)" : score >= 50 ? "var(--yellow-deep)" : "var(--bad)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title="AI Match Score">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        {!loading && !error && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {loading ? (
          <Loader2 size={14} className="animate-spin" style={{ color: "var(--ink-faint)" }} />
        ) : error ? (
          <span className="text-[10px]" style={{ color: "var(--ink-faint)" }}>
            --
          </span>
        ) : (
          <span className="text-xs font-bold" style={{ color }}>
            {score}%
          </span>
        )}
      </div>
    </div>
  );
}