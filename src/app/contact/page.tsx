import type { Metadata } from "next";
import { Mail } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — MeritWorkX",
};

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
            Question, feedback, or something not working right? Send us a message and we&apos;ll get back
            to you.
          </p>

          <ContactForm />

          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-faint)" }}>
            <Mail size={15} />
            You can also reach us directly — the form above goes straight to our inbox.
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
