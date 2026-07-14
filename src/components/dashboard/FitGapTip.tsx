"use client";

import { useEffect, useState } from "react";
import FitGapCards from "./FitGapCards";

type Point = { title: string; explanation: string };

export default function FitGapTip({ projectId }: { projectId: string }) {
  const [fit, setFit] = useState<Point[]>([]);
  const [gap, setGap] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalysis() {
      try {
        const res = await fetch("/api/fit-gap-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) {
          setFit(data.fit ?? []);
          setGap(data.gap ?? []);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalysis();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (error) return null;

  if (loading) {
    return (
      <div
        className="rounded-[20px] border p-5 sm:p-7 shadow-sm text-sm"
        style={{ background: "var(--surface)", borderColor: "var(--line)", color: "var(--ink-faint)" }}
      >
        Analyzing your fit and gaps for this job...
      </div>
    );
  }

  return <FitGapCards fit={fit} gap={gap} />;
}