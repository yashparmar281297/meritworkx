"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Check } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      return;
    }

    setSending(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not send your message. Please try again.");
      setSending(false);
      return;
    }

    setSending(false);
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  }

  const inputStyle = {
    borderColor: "var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
  };

  if (sent) {
    return (
      <div
        className="rounded-2xl border p-8 text-center flex flex-col items-center gap-3"
        style={{ background: "var(--good-soft)", borderColor: "var(--good)" }}
      >
        <Check size={28} style={{ color: "var(--good)" }} />
        <p className="font-semibold" style={{ color: "var(--ink)" }}>
          Message sent
        </p>
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border p-5 sm:p-8"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div>
        <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="How can we help?"
          className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm resize-none"
          style={inputStyle}
        />
      </div>

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--yellow)", color: "var(--ink)" }}
      >
        {sending && <Loader2 size={16} className="animate-spin" />}
        {sending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
