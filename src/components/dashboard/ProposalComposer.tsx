"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Send, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PlanTier } from "@/lib/planFeatures";
import { findContactInfoViolation, CONTACT_INFO_ERROR } from "@/lib/contentModeration";

export default function ProposalComposer({
  projectId,
  tier,
  tokens,
  alreadyApplied,
  hasUsedFreeProposal,
}: {
  projectId: string;
  tier: PlanTier;
  tokens: number;
  alreadyApplied: boolean;
  hasUsedFreeProposal: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(alreadyApplied);
  const [error, setError] = useState("");

  const canUseAIWriting = tier === "pro" || tier === "elite";

  async function handleGenerate() {
    setError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not generate a proposal.");
      } else {
        setCoverLetter(data.proposal);
      }
    } catch {
      setError("Could not generate a proposal.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend() {
    if (!coverLetter.trim()) {
      setError("Please write a proposal before sending.");
      return;
    }
    setError("");

    const violation = findContactInfoViolation(coverLetter);
    if (violation) {
      setError(CONTACT_INFO_ERROR);
      return;
    }

    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setSending(false);
      return;
    }

    const { error: insertError } = await supabase.from("proposals").insert({
      project_id: projectId,
      freelancer_id: user.id,
      cover_letter: coverLetter,
      status: "pending",
    });

    if (insertError) {
      setError(insertError.message.includes("Message blocked") ? CONTACT_INFO_ERROR : insertError.message);
      setSending(false);
      return;
    }

    setSending(false);
    setSent(true);
    router.refresh();
  }

  if (sent) {
    return (
      <div
        className="rounded-2xl border p-5 flex items-center gap-3"
        style={{ background: "var(--good-soft)", borderColor: "var(--good)" }}
      >
        <Check size={18} style={{ color: "var(--good)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--good)" }}>
          You&apos;ve already sent a proposal for this job.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-5 sm:p-6 flex flex-col gap-4"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Send a proposal
        </h2>
        {canUseAIWriting && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--surface-yellow)", color: "var(--yellow-deep)" }}
          >
            {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {generating ? "Writing..." : "Write with AI"}
          </button>
        )}
      </div>

      <textarea
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
        placeholder="Introduce yourself and explain why you're a good fit for this job..."
        rows={6}
        className="w-full px-4 py-3 rounded-lg border outline-none text-sm resize-none"
        style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
      />

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
  <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
    {hasUsedFreeProposal ? (
      <>
        Sending uses <span className="font-semibold" style={{ color: "var(--ink)" }}>1 token</span>. You have {tokens} left.
      </>
    ) : (
      <span className="font-semibold" style={{ color: "var(--good)" }}>
        Your first proposal is free — no token will be used.
      </span>
    )}
  </p>
  <button
    type="button"
    onClick={handleSend}
    disabled={sending || (hasUsedFreeProposal && tokens <= 0)}
    className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition hover:opacity-90 disabled:opacity-60"
    style={{ background: "var(--yellow)", color: "var(--ink)" }}
  >
    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
    {sending ? "Sending..." : hasUsedFreeProposal && tokens <= 0 ? "No tokens left" : "Send proposal"}
  </button>
</div>
    </div>
  );
}