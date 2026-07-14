import { Check, TriangleAlert } from "lucide-react";

type Point = { title: string; explanation: string };

export default function FitGapCards({ fit, gap }: { fit: Point[]; gap: Point[] }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Fit Analysis — green card */}
      <div
        className="rounded-[20px] border p-5 sm:p-7 shadow-sm"
        style={{ background: "var(--good-soft)", borderColor: "#BBF0CE" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--good)" }}
          >
            <Check size={14} strokeWidth={3} color="white" />
          </span>
          <h3 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
            Fit Analysis
          </h3>
        </div>
        <p className="text-xs mb-5" style={{ color: "var(--ink-soft)" }}>
          AI found the following strengths based on the client&apos;s job requirements.
        </p>

        {fit.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            No clear strengths identified for this match.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {fit.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--paper)", border: "1.5px solid var(--good)" }}
                >
                  <Check size={13} style={{ color: "var(--good)" }} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {point.title}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--ink-soft)" }}>
                    {point.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gap Analysis — red card */}
      <div
        className="rounded-[20px] border p-5 sm:p-7 shadow-sm"
        style={{ background: "var(--bad-soft)", borderColor: "#FCC9C9" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--bad)" }}
          >
            <TriangleAlert size={13} strokeWidth={2.5} color="white" />
          </span>
          <h3 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
            Gap Analysis
          </h3>
        </div>
        <p className="text-xs mb-5" style={{ color: "var(--ink-soft)" }}>
          AI identified the following areas where the freelancer does not fully meet the job requirements.
        </p>

        {gap.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            No significant gaps identified for this match.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {gap.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--paper)", border: "1.5px solid var(--bad)" }}
                >
                  <TriangleAlert size={12} style={{ color: "var(--bad)" }} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {point.title}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--ink-soft)" }}>
                    {point.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}