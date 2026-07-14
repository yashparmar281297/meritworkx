import Link from "next/link";

export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen" style={{ background: "var(--surface)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link
          href="/"
          className="text-sm font-medium inline-block mb-8 transition hover:opacity-70"
          style={{ color: "var(--yellow-deep)" }}
        >
          ← Back to MeritWorkX
        </Link>

        <div
          className="rounded-2xl border p-6 sm:p-10"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--ink)" }}>
            {title}
          </h1>
          <p className="text-xs mb-8" style={{ color: "var(--ink-faint)" }}>
            Last updated: {lastUpdated}
          </p>

          <div className="legal-content flex flex-col gap-6" style={{ color: "var(--ink-soft)" }}>
            {children}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8 text-sm">
          <Link href="/terms" className="font-medium transition hover:opacity-70" style={{ color: "var(--yellow-deep)" }}>
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className="font-medium transition hover:opacity-70" style={{ color: "var(--yellow-deep)" }}>
            Privacy Policy
          </Link>
          <Link href="/refund-policy" className="font-medium transition hover:opacity-70" style={{ color: "var(--yellow-deep)" }}>
            Refund &amp; Cancellation Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
