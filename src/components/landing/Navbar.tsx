"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.9)", borderBottom: "1px solid var(--line)" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-base sm:text-lg" style={{ color: "var(--ink)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg" />
          MeritWorkX
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--ink-soft)" }}>
          <Link href="/#how-it-works" className="hover:text-[var(--ink)] transition">How it works</Link>
          <Link href="/#pricing" className="hover:text-[var(--ink)] transition">Pricing</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm px-4 py-2 hover:text-[var(--ink)] transition" style={{ color: "var(--ink-soft)" }}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-full transition hover:opacity-90"
            style={{ background: "var(--yellow)", color: "var(--ink)" }}
          >
            Get started
          </Link>
        </div>

        <button className="md:hidden p-2 rounded-lg" style={{ color: "var(--ink)" }} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 sm:px-6 py-4 flex flex-col gap-4" style={{ borderTop: "1px solid var(--line)", background: "var(--paper)" }}>
          <Link href="/#how-it-works" onClick={() => setOpen(false)} style={{ color: "var(--ink-soft)" }}>How it works</Link>
          <Link href="/#pricing" onClick={() => setOpen(false)} style={{ color: "var(--ink-soft)" }}>Pricing</Link>
          <Link href="/login" onClick={() => setOpen(false)} style={{ color: "var(--ink-soft)" }}>Log in</Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="text-center font-semibold px-4 py-2 rounded-full"
            style={{ background: "var(--yellow)", color: "var(--ink)" }}
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}