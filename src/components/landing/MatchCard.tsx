"use client";

import { motion } from "framer-motion";

export default function MatchCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-sm rounded-2xl border p-5 float-slow shadow-sm"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "var(--good-soft)", color: "var(--good)" }}>
          Match found
        </span>
        <span
          className="text-2xl font-bold px-2 rounded-md"
          style={{ color: "var(--ink)", background: "var(--yellow-soft)" }}
        >
          94
        </span>
      </div>

      <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>Senior React Developer</h3>
      <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
        Strong overlap on React, TypeScript and Node. 4 past projects in fintech dashboards match this brief closely.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["React", "TypeScript", "Node.js"].map((skill) => (
          <span key={skill} className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}>
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--ink-faint)" }}>1 token to apply</span>
        <button className="text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition" style={{ background: "var(--ink)", color: "var(--paper)" }}>
          View match
        </button>
      </div>
    </motion.div>
  );
}