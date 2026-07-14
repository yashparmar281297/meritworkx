"use client";

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Send, Paperclip, FileText, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
};

export default function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
  otherPersonName,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  otherPersonName?: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channelName = `conversation-${conversationId}`;

    const existing = supabase.getChannels().find((ch: { topic: string }) => ch.topic === `realtime:${channelName}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload: { new: Message }) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePendingFile() {
    setPendingFile(null);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed && !pendingFile) return;

    setSending(true);

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (pendingFile) {
      const safeName = pendingFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${conversationId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from("project-files").upload(path, pendingFile);
      if (uploadError) {
        alert(uploadError.message);
        setSending(false);
        return;
      }

      const { data } = supabase.storage.from("project-files").getPublicUrl(path);
      fileUrl = data.publicUrl;
      fileName = pendingFile.name;
    }

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: trimmed || `📎 ${fileName}`,
      file_url: fileUrl,
      file_name: fileName,
    });

    if (!error) {
      setBody("");
      setPendingFile(null);
    }
    setSending(false);
  }

  return (
    <div
  className="flex flex-col h-full rounded-2xl border overflow-hidden"
  style={{ background: "var(--paper)", borderColor: "var(--line)" }}
>
      {otherPersonName && (
        <div className="px-4 sm:px-5 py-3 border-b" style={{ borderColor: "var(--line)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            {otherPersonName}
          </p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="text-sm text-center mt-8" style={{ color: "var(--ink-faint)" }}>
            No messages yet — say hello!
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[75%] rounded-2xl px-3.5 py-2 text-xs"
                  style={
                    isMine
                      ? { background: "var(--yellow)", color: "var(--ink)" }
                      : { background: "var(--surface)", color: "var(--ink)" }
                  }
                >
                  {m.file_url ? (
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-2 underline"
                    >
                      <FileText size={14} className="shrink-0" />
                      {m.file_name}
                    </a>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  )}
                  <p
                    className="text-[10px] mt-1"
                    style={{ color: isMine ? "rgba(28,25,23,0.6)" : "var(--ink-faint)" }}
                  >
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex flex-col gap-2 p-3 sm:p-4 border-t" style={{ borderColor: "var(--line)" }}>
        {pendingFile && (
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2 w-fit"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}
          >
            <FileText size={14} className="shrink-0" style={{ color: "var(--ink-faint)" }} />
            <span className="text-xs truncate max-w-[200px]" style={{ color: "var(--ink)" }}>
              {pendingFile.name}
            </span>
            <button type="button" onClick={removePendingFile} className="shrink-0" style={{ color: "var(--ink-faint)" }}>
              <X size={13} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition hover:bg-[var(--surface)]"
            style={{ color: "var(--ink-faint)" }}
          >
            <Paperclip size={16} />
          </button>
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
          <input
  type="text"
  value={body}
  onChange={(e) => setBody(e.target.value)}
  placeholder="Type a message..."
  className="flex-1 px-4 py-2 rounded-full border outline-none text-xs"
  style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
/>
          <button
            type="submit"
            disabled={sending || (!body.trim() && !pendingFile)}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--yellow)", color: "var(--ink)" }}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}