"use client";

import { useMemo, useRef, useState } from "react";
import type { GrowthPoint } from "@/lib/adminStats";

const WIDTH = 720;
const HEIGHT = 260;
const PAD_LEFT = 40;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

export default function GrowthChart({ data }: { data: GrowthPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const maxValue = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => Math.max(d.freelancers, d.clients)));
    // round up to a friendly gridline ceiling
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / magnitude) * magnitude;
  }, [data]);

  const n = data.length;
  const x = (i: number) => PAD_LEFT + (n <= 1 ? plotWidth / 2 : (i / (n - 1)) * plotWidth);
  const y = (v: number) => PAD_TOP + plotHeight - (v / maxValue) * plotHeight;

  const freelancerPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.freelancers)}`).join(" ");
  const clientPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.clients)}`).join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => maxValue * f);

  // show at most ~8 x-axis labels to avoid collision on dense (daily) ranges
  const labelStep = Math.max(1, Math.ceil(n / 8));

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const clamped = Math.min(Math.max(relX, PAD_LEFT), WIDTH - PAD_RIGHT);
    const idx = n <= 1 ? 0 : Math.round(((clamped - PAD_LEFT) / plotWidth) * (n - 1));
    setHoverIdx(Math.min(Math.max(idx, 0), n - 1));
  }

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;
  const tooltipLeft = hoverIdx !== null ? (x(hoverIdx) / WIDTH) * 100 : 0;

  return (
    <div
      className="rounded-2xl border p-5 sm:p-6 flex flex-col gap-4"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Platform growth
        </h2>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--yellow-deep)" }} />
            <span style={{ color: "var(--ink-soft)" }}>Freelancers</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--blue)" }} />
            <span style={{ color: "var(--ink-soft)" }}>Clients</span>
          </span>
        </div>
      </div>

      {n === 0 ? (
        <p className="text-sm py-10 text-center" style={{ color: "var(--ink-faint)" }}>
          No data in this range.
        </p>
      ) : (
        <div className="relative w-full" style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-full"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIdx(null)}
          >
            {gridLines.map((v) => (
              <g key={v}>
                <line
                  x1={PAD_LEFT}
                  x2={WIDTH - PAD_RIGHT}
                  y1={y(v)}
                  y2={y(v)}
                  stroke="var(--line)"
                  strokeWidth={1}
                />
                <text x={PAD_LEFT - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--ink-faint)">
                  {Math.round(v)}
                </text>
              </g>
            ))}

            {data.map((d, i) =>
              i % labelStep === 0 ? (
                <text
                  key={i}
                  x={x(i)}
                  y={HEIGHT - PAD_BOTTOM + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--ink-faint)"
                >
                  {d.label}
                </text>
              ) : null
            )}

            <path d={clientPath} fill="none" stroke="var(--blue)" strokeWidth={2} />
            <path d={freelancerPath} fill="none" stroke="var(--yellow-deep)" strokeWidth={2} />

            {hoverIdx !== null && (
              <>
                <line
                  x1={x(hoverIdx)}
                  x2={x(hoverIdx)}
                  y1={PAD_TOP}
                  y2={HEIGHT - PAD_BOTTOM}
                  stroke="var(--line-strong)"
                  strokeWidth={1}
                />
                <circle cx={x(hoverIdx)} cy={y(data[hoverIdx].freelancers)} r={4} fill="var(--yellow-deep)" stroke="var(--paper)" strokeWidth={2} />
                <circle cx={x(hoverIdx)} cy={y(data[hoverIdx].clients)} r={4} fill="var(--blue)" stroke="var(--paper)" strokeWidth={2} />
              </>
            )}
          </svg>

          {hovered && (
            <div
              className="absolute top-1 -translate-x-1/2 rounded-lg border px-3 py-2 text-xs pointer-events-none shadow-sm"
              style={{
                left: `${tooltipLeft}%`,
                background: "var(--paper)",
                borderColor: "var(--line)",
                minWidth: "120px",
              }}
            >
              <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
                {hovered.label}
              </p>
              <p className="flex items-center justify-between gap-3" style={{ color: "var(--ink-soft)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--yellow-deep)" }} />
                  Freelancers
                </span>
                <span className="font-medium" style={{ color: "var(--ink)" }}>{hovered.freelancers}</span>
              </p>
              <p className="flex items-center justify-between gap-3" style={{ color: "var(--ink-soft)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--blue)" }} />
                  Clients
                </span>
                <span className="font-medium" style={{ color: "var(--ink)" }}>{hovered.clients}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
