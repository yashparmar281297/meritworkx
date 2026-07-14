"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    tag: "For newcomers and part-timers",
    price: "Free",
    features: ["5 tokens per month", "AI match score on every job"],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Pro",
    tag: "For active freelancers",
    price: "₹499",
    suffix: "/month",
    features: ["15 tokens per month", "AI match score on every job", "AI proposal writing"],
    cta: "Upgrade to Pro",
    highlight: false,
  },
  {
    name: "Elite",
    tag: "For top earners and agencies",
    price: "₹1,199",
    suffix: "/month",
    features: [
      "40 tokens per month",
      "AI match score on every job",
      "AI proposal writing",
      "AI fit and gap analysis on every match",
    ],
    cta: "Go Elite",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-line px-4 sm:px-6 py-16 sm:py-24" style={{ background: "var(--paper)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 max-w-xl">
          <span className="text-xs font-medium mb-2 block" style={{ color: "var(--yellow-deep)" }}>SUBSCRIPTION PLANS</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: "var(--ink)" }}>
            Pick a plan that matches how often you apply
          </h2>
        </div>

        <p className="mb-2 text-sm sm:text-base" style={{ color: "var(--ink-soft)" }}>
          <span className="font-semibold" style={{ color: "var(--ink)" }}>Your first proposal is free</span> — no token
          is spent on your very first application, ever, on any plan.
        </p>
        <p className="mb-10 sm:mb-12 text-sm sm:text-base" style={{ color: "var(--ink-soft)" }}>
          <span className="font-semibold" style={{ color: "var(--ink)" }}>1 token, 1 project — always</span> — every job
          costs exactly 1 token to apply to, no matter its size or budget.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl p-6 border relative flex flex-col h-full"
              style={
                plan.highlight
                  ? { background: "var(--paper)", borderColor: "var(--yellow)", boxShadow: "0 0 0 3px var(--yellow-ring)" }
                  : { background: "var(--surface)", borderColor: "var(--line)" }
              }
            >
              {plan.highlight && (
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold mb-4 inline-block"
                  style={{ background: "var(--yellow)", color: "var(--ink)" }}
                >
                  Most popular
                </span>
              )}
              <p className="text-xs mb-1" style={{ color: "var(--ink-faint)" }}>{plan.tag}</p>
              <h3 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold" style={{ color: "var(--ink)" }}>{plan.price}</span>
                {plan.suffix && <span style={{ color: "var(--ink-faint)" }}>{plan.suffix}</span>}
              </div>
              

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--ink)" }}>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--good)" }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="w-full py-3 rounded-full font-semibold transition hover:opacity-90 text-center mt-auto"
                style={
                  plan.highlight
                    ? { background: "var(--yellow)", color: "var(--ink)" }
                    : { background: "var(--ink)", color: "var(--paper)" }
                }
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}