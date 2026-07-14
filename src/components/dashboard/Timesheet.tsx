"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Clock, Paperclip, FileText, X, Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type TimesheetEntry = {
  id: string;
  description: string;
  hours: number;
  file_url: string | null;
  file_name: string | null;
  entry_date: string;
  created_at: string;
  confidence_score: number | null;
  confidence_reason: string | null;
};

export default function Timesheet({
  conversationId,
  canSubmit,
  entries,
}: {
  conversationId: string;
  canSubmit: boolean;
  entries: TimesheetEntry[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!description.trim() || !hours) {
      setError("Please add a description and total time invested.");
      return;
    }

    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setSending(false);
      return;
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (pendingFile) {
      const safeName = pendingFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${conversationId}/timesheet-${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from("project-files").upload(path, pendingFile);
      if (uploadError) {
        setError(uploadError.message);
        setSending(false);
        return;
      }

      const { data } = supabase.storage.from("project-files").getPublicUrl(path);
      fileUrl = data.publicUrl;
      fileName = pendingFile.name;
    }

    const { data: inserted, error: insertError } = await supabase
  .from("timesheet_entries")
  .insert({
    conversation_id: conversationId,
    freelancer_id: user.id,
    description: description.trim(),
    hours: Number(hours),
    file_url: fileUrl,
    file_name: fileName,
  })
  .select()
  .single();

if (insertError || !inserted) {
  setError(insertError?.message ?? "Could not save entry.");
  setSending(false);
  return;
}

setDescription("");
setHours("");
setPendingFile(null);
setSending(false);
router.refresh();

// Fire the AI confidence analysis in the background — doesn't block the freelancer's UI
fetch("/api/timesheet-confidence", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ entryId: inserted.id }),
}).then(() => router.refresh());
  }

  const inputStyle = {
    borderColor: "var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
  };

  return (
    <div
  className="rounded-2xl border p-4 sm:p-5 flex flex-col gap-4 h-full min-h-0"
  style={{ background: "var(--paper)", borderColor: "var(--line)" }}
>
      <div className="flex items-center gap-2 shrink-0">
  <Clock size={14} style={{ color: "var(--yellow-deep)" }} />
  <h2 className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
    Timesheet
  </h2>
</div>

      {canSubmit && (
  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 shrink-0">
    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="What did you work on today?"
      rows={2}
      className="w-full px-3 py-2 rounded-lg border outline-none text-xs resize-none"
      style={inputStyle}
    />

    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        step="0.25"
        min="0"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        placeholder="Hours, e.g. 3.5"
        className="w-28 px-3 py-2 rounded-lg border outline-none text-xs"
        style={inputStyle}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-2 rounded-lg border transition hover:bg-[var(--surface)]"
        style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
      >
        <Paperclip size={12} />
        {pendingFile ? "Change file" : "Attach file"}
      </button>
      <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
    </div>

          {pendingFile && (
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-2 w-fit"
              style={{ background: "var(--surface)", borderColor: "var(--line)" }}
            >
              <FileText size={14} className="shrink-0" style={{ color: "var(--ink-faint)" }} />
              <span className="text-xs truncate max-w-[200px]" style={{ color: "var(--ink)" }}>
                {pendingFile.name}
              </span>
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                className="shrink-0"
                style={{ color: "var(--ink-faint)" }}
              >
                <X size={13} />
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
              {error}
            </p>
          )}

          <button
  type="submit"
  disabled={sending}
  className="self-start flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition hover:opacity-90 disabled:opacity-60"
  style={{ background: "var(--yellow)", color: "var(--ink)" }}
>
  {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
  {sending ? "Sending..." : "Send to client"}
</button>
        </form>
      )}

      <div
  className="flex flex-col gap-2.5 pt-2 border-t overflow-y-auto min-h-0 flex-1"
  style={{ borderColor: "var(--line)" }}
>
  {entries.length === 0 ? (
    <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
      No timesheet entries yet.
    </p>
  ) : (
    entries.map((entry) => (
            <div
  key={entry.id}
  className="rounded-xl border p-2.5 sm:p-3"
  style={{ background: "var(--surface)", borderColor: "var(--line)" }}
>
  <div className="flex items-center justify-between gap-3 mb-1">
    <span className="text-[11px] font-medium" style={{ color: "var(--ink-faint)" }}>
      {new Date(entry.entry_date).toLocaleDateString()}
    </span>
  <div className="flex items-center gap-1.5">
  {!canSubmit && entry.confidence_score != null && (
    <span
      title={entry.confidence_reason ?? undefined}
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full cursor-help"
    style={{
      background:
        entry.confidence_score >= 75 ? "var(--good-soft)" : entry.confidence_score >= 50 ? "var(--surface-yellow)" : "var(--bad-soft)",
      color:
        entry.confidence_score >= 75 ? "var(--good)" : entry.confidence_score >= 50 ? "var(--yellow-deep)" : "var(--bad)",
    }}
  >
    {entry.confidence_score}% confidence
  </span>
  )}
  <span
    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
    style={{ background: "var(--surface-yellow)", color: "var(--yellow-deep)" }}
  >
    {entry.hours} hrs
  </span>
</div>
</div>
              <p
  className="text-xs whitespace-pre-wrap mb-1.5"
  style={{ color: "var(--ink)" }}
>
  {entry.description}
</p>

{!canSubmit && entry.confidence_reason && (
  <p
    className="text-[11px] mb-1.5 italic"
    style={{ color: "var(--ink-faint)" }}
  >
    {entry.confidence_reason}
  </p>
)}

{entry.file_url && (
  <a
    href={entry.file_url}
    target="_blank"
    rel="noopener noreferrer"
    download
    className="inline-flex items-center gap-1.5 text-[11px] font-medium transition hover:opacity-70"
    style={{ color: "var(--yellow-deep)" }}
  >
    <FileText size={12} />
    {entry.file_name}
  </a>
)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}