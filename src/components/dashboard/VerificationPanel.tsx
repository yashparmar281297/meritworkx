"use client";

import { useState } from "react";
import { Check, X, Loader2, ShieldCheck } from "lucide-react";

export default function VerificationPanel({
  role,
  initialStatus,
  initialScore,
  initialSummary,
  initialBusinessEmailVerified,
}: {
  role: string;
  initialStatus: string;
  initialScore: number;
  initialSummary: string | null;
  initialBusinessEmailVerified: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [score, setScore] = useState(initialScore);
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [checking, setChecking] = useState(false);

  const [emailVerified, setEmailVerified] = useState(initialBusinessEmailVerified);
  const [businessEmail, setBusinessEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailStep, setEmailStep] = useState<"idle" | "sent">("idle");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  async function sendEmailOtp() {
    setEmailError("");
    setEmailLoading(true);
    const res = await fetch("/api/verification/send-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: businessEmail }),
    });
    const data = await res.json();
    if (!res.ok) setEmailError(data.error);
    else {
      setEmailStep("sent");
    }
    setEmailLoading(false);
  }

  async function verifyEmailOtp() {
    setEmailError("");
    setEmailLoading(true);
    const res = await fetch("/api/verification/verify-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: businessEmail, code: emailCode }),
    });
    const data = await res.json();
    if (!res.ok) setEmailError(data.error);
    else {
      setEmailVerified(true);
      setEmailStep("idle");
    }
    setEmailLoading(false);
  }

  async function runCheck() {
    setChecking(true);
    const res = await fetch("/api/verification/check", { method: "POST" });
    const data = await res.json();
    setStatus(data.status);
    setScore(data.score);
    setSummary(data.summary);
    setChecking(false);
  }

  const inputStyle = { borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" };
  const statusColor = status === "verified" ? "var(--good)" : status === "pending" ? "var(--yellow-deep)" : "var(--bad)";
  const statusBg = status === "verified" ? "var(--good-soft)" : status === "pending" ? "var(--surface-yellow)" : "var(--bad-soft)";

  return (
    <div
      className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} style={{ color: statusColor }} />
          <h2 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
            Verification
          </h2>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
          style={{ background: statusBg, color: statusColor }}
        >
          {status} · {score}%
        </span>
      </div>

      {summary && (
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          {summary}
        </p>
      )}

      {/* Business email verification (client only) */}
      {role === "client" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {emailVerified ? (
              <Check size={15} style={{ color: "var(--good)" }} />
            ) : (
              <X size={15} style={{ color: "var(--ink-faint)" }} />
            )}
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
              Business email
            </p>
          </div>

          {!emailVerified && (
            <div className="flex flex-col gap-2 pl-6">
              {emailStep === "idle" ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="px-3 py-2 rounded-lg border outline-none text-sm flex-1"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={sendEmailOtp}
                    disabled={emailLoading || !businessEmail}
                    className="px-4 py-2 rounded-lg text-xs font-semibold transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: "var(--yellow)", color: "var(--ink)" }}
                  >
                    {emailLoading ? <Loader2 size={13} className="animate-spin" /> : "Send code"}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="6-digit code"
                    className="px-3 py-2 rounded-lg border outline-none text-sm flex-1"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    disabled={emailLoading || !emailCode}
                    className="px-4 py-2 rounded-lg text-xs font-semibold transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: "var(--yellow)", color: "var(--ink)" }}
                  >
                    {emailLoading ? <Loader2 size={13} className="animate-spin" /> : "Verify"}
                  </button>
                </div>
              )}
              {emailStep === "sent" && !emailError && (
                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                  Code sent via email — check your inbox.
                </p>
              )}
              {emailError && <p className="text-xs" style={{ color: "var(--bad)" }}>{emailError}</p>}
            </div>
          )}
        </div>
      )}

      <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
        The remaining checks — account email confirmation, ID document upload, payment activity, and profile
        completeness — are read automatically from your account.
      </p>

      <button
        type="button"
        onClick={runCheck}
        disabled={checking}
        className="self-start flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--yellow)", color: "var(--ink)" }}
      >
        {checking ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
        {checking ? "Checking..." : "Run verification check"}
      </button>
    </div>
  );
}
