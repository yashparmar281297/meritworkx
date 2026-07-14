"use client";

import { motion } from "framer-motion";

const events = [
  { title: "Job applied", desc: "Submitting a proposal", delta: "−1 token", tone: "neutral" },
  { title: "Shortlisted", desc: "Client shortlists the proposal", delta: "+1 token", tone: "good" },
  { title: "Hired", desc: "Client accepts and hires", delta: "+2 tokens", tone: "good" },
];

export default function TokenSystem() {
  return (
    <section className="section-line py-16 sm:py-24" style={{ background: "var(--surface-yellow)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 sm:mb-12 max-w-xl">
          <span className="text-xs font-medium mb-2 block" style={{ color: "var(--yellow-deep)" }}>TOKEN SYSTEM</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: "var(--ink)" }}>
            One token, one honest application
          </h2>
          <p style={{ color: "var(--ink-soft)" }}>
            Every freelancer starts with a token balance. Applying spends a token — so applications
            carry real intent instead of being free to spam. Good outcomes pay tokens back, with interest.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {events.map((e, i) => (
            <motion.div
              key={e.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl p-4 sm:p-5 border"
              style={{ background: "var(--paper)", borderColor: "var(--line)" }}
            >
              <h3 className="font-semibold mb-1 text-xs sm:text-sm" style={{ color: "var(--ink)" }}>
                {e.title}
              </h3>
              <p className="text-xs mb-3" style={{ color: "var(--ink-soft)" }}>
                {e.desc}
              </p>
              <span
                className="text-sm sm:text-base font-bold"
                style={{
                  color: e.tone === "good" ? "var(--good)" : e.tone === "bad" ? "var(--bad)" : "var(--ink-soft)",
                }}
              >
                {e.delta}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}