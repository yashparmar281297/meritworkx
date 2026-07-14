"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Paperclip, Download, Loader2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProjectFile = {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
};

export default function FileList({
  conversationId,
  currentUserId,
  initialFiles,
}: {
  conversationId: string;
  currentUserId: string;
  initialFiles: ProjectFile[];
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${conversationId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage.from("project-files").upload(path, file);
    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("project-files").getPublicUrl(path);

    const { data: inserted, error: insertError } = await supabase
      .from("project_files")
      .insert({
        conversation_id: conversationId,
        uploaded_by: currentUserId,
        file_name: file.name,
        file_url: data.publicUrl,
      })
      .select()
      .single();

    if (!insertError && inserted) {
      setFiles((prev) => [inserted as ProjectFile, ...prev]);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 flex flex-col gap-3"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Files
        </h2>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--surface-yellow)", color: "var(--yellow-deep)" }}
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
          {uploading ? "Uploading..." : "Attach file"}
        </button>
        <input ref={inputRef} type="file" onChange={handleUpload} className="hidden" />
      </div>

      {files.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
          No files shared yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
         {files.map((f) => (
  <a
    key={f.id}
    href={f.file_url}
    target="_blank"
    rel="noopener noreferrer"
    download
    className="flex items-center gap-3 rounded-lg border px-3 py-2 transition hover:bg-[var(--surface)]"
    style={{ borderColor: "var(--line)" }}
  >
    <FileText
      size={16}
      className="shrink-0"
      style={{ color: "var(--ink-faint)" }}
    />

    <span
      className="text-sm truncate flex-1"
      style={{ color: "var(--ink)" }}
    >
      {f.file_name}
    </span>

    <Download
      size={14}
      className="shrink-0"
      style={{ color: "var(--yellow-deep)" }}
    />
  </a>
))}
        </div>
      )}
    </div>
  );
}