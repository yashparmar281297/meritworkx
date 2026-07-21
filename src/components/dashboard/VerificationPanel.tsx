"use client";

import { useState } from "react";
import { Check, X, Loader2, ShieldCheck } from "lucide-react";

type Checklist = {
  emailVerified: boolean;
  idUploaded: boolean;
  paymentVerified: boolean;
  profileComplete: boolean;
};

export default function VerificationPanel({
  role,
  initialStatus,
  initialScore,
  initialSummary,
  initialBusinessEmailVerified,
  initialChecklist,
  initialMissingProfileFields,
}: {
  role: string;
  initialStatus: string;
  initialScore: number;
  initialSummary: string | null;
  initialBusinessEmailVerified: boolean;
  initialChecklist: Checklist;
  initialMissingProfileFields: string[];
}) {
  const [status, setStatus] = useState(initialStatus);
  const [score, setScore] = useState(initialScore);
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [checking, setChecking] = useState(false);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [missingProfileFields, setMissingProfileFields] = useState(initialMissingProfileFields);

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
    if (data.checklist) setChecklist(data.checklist);
    if (data.missingProfileFields) setMissingProfileFields(data.missingProfileFields);
    setChecking(false);
  }

  const inputStyle = { borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" };
  const statusColor = status === "verified" ? "var(--good)" : status === "pending" ? "var(--yellow-deep)" : "var(--bad)";
  const statusBg = status === "verified" ? "var(--good-soft)" : status === "pending" ? "var(--surface-yellow)" : "var(--bad-soft)";

  const checklistItems: { key: keyof Checklist; label: string; hint: string }[] = [
    {
      key: "emailVerified",
      label: "Account email confirmed",
      hint: "Confirm your account email (check your inbox for the confirmation link), or verify a business email below.",
    },
    {
      key: "idUploaded",
      label: "ID document uploaded",
      hint: "Upload a government ID in the \"ID verification document\" field above.",
    },
    {
      key: "paymentVerified",
      label: "Payment activity",
      hint:
        role === "freelancer"
          ? "Subscribe to a Pro or Elite plan to satisfy this check."
          : "Fund at least one project via escrow to satisfy this check.",
    },
    {
      key: "profileComplete",
      label: "Profile complete",
      hint:
        missingProfileFields.length > 0
          ? `Missing: ${missingProfileFields.join(", ")}.`
          : "Fill in your full name, bio, profile photo, and " +
            (role === "freelancer" ? "at least one skill" : "company name") +
            " above.",
    },
  ];

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

      <div className="flex flex-col gap-3">
        {checklistItems.map((item) => {
          const done = checklist[item.key];
          return (
            <div key={item.key} className="flex items-start gap-2">
              {done ? (
                <Check size={15} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} />
              ) : (
                <X size={15} className="mt-0.5 shrink-0" style={{ color: "var(--bad)" }} />
              )}
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                  {item.label}
                </p>
                {!done && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
                    {item.hint}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Business email verification (client only) */}
      {role === "client" && (
        <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-2">
            {emailVerified ? (
              <Check size={15} style={{ color: "var(--good)" }} />
            ) : (
              <X size={15} style={{ color: "var(--ink-faint)" }} />
            )}
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
              Business email <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(optional)</span>
            </p>
          </div>
          <p className="text-xs pl-6" style={{ color: "var(--ink-faint)" }}>
            Not required — your account email confirmation above already satisfies the email check. Only use
            this if you&apos;d like to additionally prove a separate company email address.
          </p>

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
