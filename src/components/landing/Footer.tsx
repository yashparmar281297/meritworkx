import Link from "next/link";

export default function Footer() {
  return (
    <footer className="section-line px-4 sm:px-6 py-12 sm:py-16" style={{ background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
        <div>
          <div className="flex items-center gap-2 font-semibold text-lg mb-3" style={{ color: "var(--ink)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg" />
            MeritWorkX
          </div>
          <p className="text-sm max-w-xs" style={{ color: "var(--ink-faint)" }}>
            A freelance marketplace that matches on skill, not on who bids lowest.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>Product</h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            <li><Link href="/signup" className="hover:text-[var(--ink)]">Find work</Link></li>
            <li><Link href="/signup" className="hover:text-[var(--ink)]">Hire talent</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-[var(--ink)]">How it works</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>Company</h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            <li><Link href="/about" className="hover:text-[var(--ink)]">About us</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--ink)]">Contact</Link></li>
            <li>
              <a
                href="https://www.linkedin.com/company/136107134/admin/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--ink)]"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>Legal</h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            <li><Link href="/terms" className="hover:text-[var(--ink)]">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-[var(--ink)]">Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-[var(--ink)]">Refund Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 sm:mt-12 pt-6 text-xs" style={{ borderTop: "1px solid var(--line)", color: "var(--ink-faint)" }}>
        © 2026 MeritWorkX. All rights reserved.
      </div>
    </footer>
  );
}