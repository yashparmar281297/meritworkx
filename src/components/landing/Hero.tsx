"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MatchCard from "./MatchCard";


export default function Hero() {
  return (
    <section className="relative pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-24 dot-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* LEFT: text, buttons, stats */}
        <div>
          <span
            className="inline-flex items-center gap-2 text-xs font-medium border rounded-full px-3 py-1 mb-6"
            style={{ color: "var(--ink-soft)", borderColor: "var(--line)", background: "var(--paper)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--yellow)" }} />
            For clients and freelancers
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6"
            style={{ color: "var(--ink)" }}
          >
            Hire and work,{" "}
            <span style={{ background: "var(--yellow-soft)", padding: "0 8px", borderRadius: "6px" }}>
              on merit.
            </span>
          </motion.h1>

          <p className="text-base sm:text-lg mb-8 max-w-md" style={{ color: "var(--ink-soft)" }}>
            MeritWorkX matches the right freelancer to the right job with an AI score and a
            plain-language reason — not the lowest bid. No bidding wars, no spam applications,
            just work that fits.
          </p>

           <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 mb-10">
<Link
  href="/signup"
  className="font-semibold px-5 sm:px-6 py-3 rounded-full hover:opacity-90 transition text-center"
  style={{ background: "var(--yellow)", color: "var(--ink)" }}
>
  Hire talent
</Link>
<Link
  href="/signup"
  className="border px-5 sm:px-6 py-3 rounded-full hover:bg-[var(--surface)] transition text-center"
  style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}
>
  Find work
</Link>
</div>
  

          <div className="flex flex-nowrap justify-between sm:justify-start gap-2 sm:gap-8 md:gap-10">
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-bold whitespace-nowrap" style={{ color: "var(--ink)" }}>0</div>
              <div className="text-[10px] sm:text-sm whitespace-nowrap" style={{ color: "var(--ink-faint)" }}>Bidding wars</div>
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-bold whitespace-nowrap" style={{ color: "var(--ink)" }}>100%</div>
              <div className="text-[10px] sm:text-sm whitespace-nowrap" style={{ color: "var(--ink-faint)" }}>Merit based</div>
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-bold whitespace-nowrap" style={{ color: "var(--ink)" }}>AI-first</div>
              <div className="text-[10px] sm:text-sm whitespace-nowrap" style={{ color: "var(--ink-faint)" }}>Matching, not bidding</div>
            </div>
          </div>
        </div>

        {/* RIGHT: card */}
        <div className="flex justify-center md:justify-end">
          <MatchCard />
        </div>
      </div>
    </section>
  );
}