import type { Metadata } from "next";
import { Mail } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Contact Us — MeritWorkX",
};

const LINKEDIN_URL = "https://www.linkedin.com/company/136107134/admin/dashboard/";

function LinkedinIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          <span
            className="inline-flex items-center gap-2 text-xs font-medium border rounded-full px-3 py-1 w-fit"
            style={{ color: "var(--ink-soft)", borderColor: "var(--line)", background: "var(--paper)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--yellow)" }} />
            Contact us
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--ink)" }}>
            Get in touch
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            Question, feedback, or something not working right? Reach us directly using the details below.
          </p>

          <div className="flex flex-col gap-4 mt-2">
            <a
              href="mailto:support@meritworkx.com"
              className="flex items-center gap-4 rounded-2xl border p-5 transition hover:shadow-sm"
              style={{ background: "var(--paper)", borderColor: "var(--line)" }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--surface-yellow)" }}
              >
                <Mail size={18} style={{ color: "var(--yellow-deep)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  Email us
                </p>
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  support@meritworkx.com
                </p>
              </div>
            </a>

            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border p-5 transition hover:shadow-sm"
              style={{ background: "var(--paper)", borderColor: "var(--line)" }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--surface-yellow)" }}
              >
                <LinkedinIcon size={18} color="#A16207" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  Follow us on LinkedIn
                </p>
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  MeritWorkX
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
