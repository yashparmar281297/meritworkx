import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "About Us — MeritWorkX",
};

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <span
            className="inline-flex items-center gap-2 text-xs font-medium border rounded-full px-3 py-1 w-fit"
            style={{ color: "var(--ink-soft)", borderColor: "var(--line)", background: "var(--paper)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--yellow)" }} />
            About us
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--ink)" }}>
            Fit, not price.
          </h1>

          <p className="text-base sm:text-lg" style={{ color: "var(--ink-soft)" }}>
            MeritWorkX exists because most freelance marketplaces reward the lowest bidder, not the best
            match. That model is bad for everyone — clients end up sorting through dozens of generic
            proposals, and skilled freelancers get undercut by a race to the bottom that has nothing to do
            with the quality of their work.
          </p>

          <p style={{ color: "var(--ink-soft)" }}>
            We built MeritWorkX around a simpler idea: score compatibility, not bids. Every project gets an
            AI-generated match score against a freelancer&apos;s actual skills and portfolio, with a
            plain-language reason behind it — so clients can see who genuinely fits, and freelancers spend
            their time applying to work they&apos;re actually right for, not spraying proposals at
            everything.
          </p>

          <p style={{ color: "var(--ink-soft)" }}>
            MeritWorkX is built and run by a small, hands-on team based in India, serving clients and
            freelancers both in India and internationally. We&apos;re early — still shipping, still
            listening closely to the people using the platform, and still improving the matching and
            payment experience every week.
          </p>

          <div
            className="rounded-2xl border p-6 sm:p-8 mt-4"
            style={{ background: "var(--paper)", borderColor: "var(--line)" }}
          >
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>
              What we actually do
            </h2>
            <ul className="flex flex-col gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
              <li>• AI-scored matching between client projects and freelancer profiles/portfolios</li>
              <li>• Escrow-style payment holding, released only once the client approves delivered work</li>
              <li>• A flat, transparent 5% platform fee on both sides of every transaction — no hidden tiers</li>
              <li>• Identity, phone, and business email verification to build trust between both sides</li>
            </ul>
          </div>

          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            Have a question, feedback, or a project that doesn&apos;t fit the mold? We&apos;d genuinely like
            to hear from you — reach out on our{" "}
            <a href="/contact" style={{ color: "var(--yellow-deep)", fontWeight: 600 }}>
              Contact page
            </a>
            .
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
