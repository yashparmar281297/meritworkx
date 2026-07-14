"use client";

import { motion } from "framer-motion";

const freelancerSteps = [
  { n: "01", title: "Create your profile", desc: "Add skills, portfolio and experience. AI scores your profile instantly." },
  { n: "02", title: "Get AI-matched", desc: "See your compatibility score for every open job — with a plain-language explanation." },
  { n: "03", title: "Apply smart", desc: "One token per application. Refunded automatically when shortlisted." },
  { n: "04", title: "Work & get paid", desc: "Milestone escrow protects both sides. Transparent, fair and secure." },
];

const clientSteps = [
  { n: "01", title: "Post a job", desc: "Describe the work and the skills it needs. AI starts matching right away." },
  { n: "02", title: "Review AI-ranked talent", desc: "See candidates ordered by match score, each with a plain-language reason why." },
  { n: "03", title: "Shortlist & hire", desc: "No bids to compare — just fit. Message and hire directly from the match." },
  { n: "04", title: "Pay on milestones", desc: "Funds sit in escrow and release as work is delivered and approved." },
];

function ProcessBox({
  label,
  steps,
  delay,
}: {
  label: string;
  steps: typeof freelancerSteps;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border p-6 sm:p-8"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <span
        className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
        style={{ background: "var(--yellow-soft)", color: "var(--yellow-deep)" }}
      >
        {label}
      </span>

      <div className="flex flex-col gap-6">
        {steps.map((step) => (
          <div key={step.n} className="flex gap-4">
            <div
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-xs"
              style={{ background: "var(--yellow)", color: "var(--ink)" }}
            >
              {step.n}
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base" style={{ color: "var(--ink)" }}>
                {step.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Process() {
  return (
    <section id="how-it-works" className="section-line py-16 sm:py-24" style={{ background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <span className="text-xs font-medium mb-2 block" style={{ color: "var(--yellow-deep)" }}>PROCESS</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: "var(--ink)" }}>
            From profile to paid
          </h2>
          <p style={{ color: "var(--ink-soft)" }}>The same four steps, on both sides of the match.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ProcessBox label="For freelancers · Find work" steps={freelancerSteps} delay={0} />
          <ProcessBox label="For clients · Hire talent" steps={clientSteps} delay={0.1} />
        </div>
      </div>
    </section>
  );
}