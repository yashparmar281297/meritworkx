"use client";

import { motion } from "framer-motion";
import { Sparkles, Coins, Wand2 } from "lucide-react";

const items = [
  { icon: Sparkles, title: "AI-scored matches", desc: "Every job and every freelancer gets a compatibility score, backed by a plain-language reason — not just a number." },
  { icon: Coins, title: "Tokens, not spam", desc: "Applying costs a token. It keeps proposals intentional, and means clients open fewer, better-fit applications." },
  { icon: Wand2, title: "AI that helps you apply", desc: "On paid plans, AI drafts your proposal and lays out exactly why you fit a role — and where you don't, yet." },
];

export default function WhySection() {
  return (
    <section className="section-line py-16 sm:py-24" style={{ background: "var(--paper)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-14 max-w-xl">
          <span className="text-xs font-medium mb-2 block" style={{ color: "var(--yellow-deep)" }}>WHY MERITWORKX</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: "var(--ink)" }}>
            Everything here is built around one idea: fit, not price
          </h2>
          <p style={{ color: "var(--ink-soft)" }}>Three things make that real — from the first match to the final payment.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl p-6 border-l-4"
              style={{ background: "var(--surface)", borderColor: "var(--yellow)" }}
            >
              <item.icon className="w-6 h-6 mb-4" style={{ color: "var(--ink)" }} />
              <h3 className="font-semibold mb-2" style={{ color: "var(--ink)" }}>{item.title}</h3>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}