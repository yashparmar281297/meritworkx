import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — MeritWorkX",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="July 15, 2026">
      <div>
        <h2>Overview</h2>
        <p>
          We collect the data we actually need to run MeritWorkX, we don&apos;t sell your personal data,
          and you can request deletion of your account at any time. This policy explains what we collect,
          why, and how it&apos;s protected.
        </p>
      </div>

      <div>
        <h2>1. Information We Collect</h2>
        <p><strong>Information you give us directly:</strong></p>
        <ul>
          <li>Account information: name, email address, password (or Google sign-in token), role (Client
          or Freelancer), country/city.</li>
          <li>Profile information: bio, skills, portfolio projects, company name, avatar image.</li>
          <li>Verification information: phone number (for OTP verification), business email, and a
          government ID document if you choose to upload one for identity verification.</li>
          <li>Project &amp; communication data: project postings, proposals, cover letters, messages,
          timesheet entries, and files exchanged between Clients and Freelancers.</li>
          <li>Payment information: transaction records (amounts, dates, status) and payout details (bank
          account/IFSC for India-based Freelancers, PayPal/Wise email for international Freelancers). We
          never see or store full card numbers — card payments are processed entirely by Razorpay.</li>
        </ul>
        <p className="mt-2"><strong>Information collected automatically:</strong></p>
        <ul>
          <li>Basic authentication metadata (IP address, device/browser type, sign-in timestamps) captured
          by our authentication provider (Supabase) as a normal part of securing your login sessions.</li>
        </ul>
        <p className="mt-2">
          We don&apos;t currently run third-party analytics or advertising trackers on MeritWorkX.
        </p>
      </div>

      <div>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To operate your account and connect Clients with Freelancers.</li>
          <li>To generate AI match scores, proposal rankings, fit/gap analysis, and AI-assisted proposal
          drafts, using your profile, skills, and portfolio content against project requirements.</li>
          <li>To process payments, calculate platform fees, and handle Freelancer withdrawal requests.</li>
          <li>To send transactional emails (payment confirmations, withdrawal notifications, account
          verification, notifications about your projects/proposals).</li>
          <li>To verify identity and reduce fraud on the platform.</li>
          <li>To improve MeritWorkX&apos;s matching quality and platform features.</li>
        </ul>
        <p className="mt-2">
          We do not use your content to train AI models that are shared with or used for other
          users&apos; benefit.
        </p>
      </div>

      <div>
        <h2>3. How We Share Your Information</h2>
        <p>We do not sell your personal data. We share it only with:</p>
        <ul>
          <li><strong>Service providers</strong> who help us run the platform (listed in the next section) —
          each only receives what they need to do their job.</li>
          <li><strong>Other users, where the platform is designed to show it</strong> — e.g. a Client can see
          a Freelancer&apos;s profile and portfolio once that Freelancer has applied to one of their
          projects, and vice versa.</li>
          <li><strong>Legal or law enforcement authorities</strong>, only when required by law.</li>
          <li><strong>A successor business</strong>, if MeritWorkX is ever acquired or merged — you&apos;d be
          notified if that changes how your data is handled.</li>
        </ul>
      </div>

      <div>
        <h2>4. Third-Party Services We Use</h2>
        <ul>
          <li><strong>Supabase</strong> — database, authentication, and file storage.</li>
          <li><strong>Razorpay</strong> — payment processing, escrow-style fund holding, subscription
          billing, and withdrawal payouts. PCI-DSS compliant for card data.</li>
          <li><strong>OpenAI</strong> — AI-generated match scores, proposal writing assistance, fit/gap
          analysis, and timesheet evidence review, based on project/profile text and files you provide.</li>
          <li><strong>Resend</strong> — transactional email delivery.</li>
          <li><strong>Google</strong> — optional Google Sign-In authentication.</li>
        </ul>
      </div>

      <div>
        <h2>5. Cookies</h2>
        <p>
          MeritWorkX uses essential cookies only, to keep you signed in and maintain your session. We
          don&apos;t use marketing, advertising, or third-party tracking cookies.
        </p>
      </div>

      <div>
        <h2>6. Data Retention</h2>
        <p>
          We keep your account data for as long as your account is active. If you delete your account, we
          remove your profile and content within a reasonable period, except where we&apos;re required to
          keep transaction/payment records longer for accounting, tax, or legal compliance purposes.
        </p>
      </div>

      <div>
        <h2>7. Security</h2>
        <p>
          Data is protected in transit via HTTPS/TLS. Your profile and project data is stored in a managed
          Postgres database with row-level security rules that restrict who can access what — for example,
          a Client can only see a Freelancer&apos;s profile once that Freelancer has actually applied to
          one of their projects. Passwords are handled by Supabase Auth&apos;s built-in secure hashing; we
          never see or store your plaintext password. Payment credentials are handled entirely by
          Razorpay&apos;s PCI-DSS compliant infrastructure.
        </p>
      </div>

      <div>
        <h2>8. Your Rights</h2>
        <p>
          You can review and update most of your profile information directly from Settings at any time.
          You can request:
        </p>
        <ul>
          <li>Access to the data we hold about you.</li>
          <li>Correction of inaccurate data.</li>
          <li>Deletion of your account and associated data.</li>
          <li>A copy of your data in a portable format.</li>
        </ul>
        <p className="mt-2">
          Send these requests via our Contact page. We aim to respond within a reasonable timeframe. We may
          retain certain transaction records after account deletion where required for accounting, tax, or
          legal compliance.
        </p>
      </div>

      <div>
        <h2>9. Children&apos;s Privacy</h2>
        <p>
          MeritWorkX is not intended for individuals under 18. We do not knowingly collect data from anyone
          under 18.
        </p>
      </div>

      <div>
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected by
          updating the &quot;Last updated&quot; date above.
        </p>
      </div>

      <div>
        <h2>11. Contact</h2>
        <p>
          Questions about this Privacy Policy can be sent via our{" "}
          <a href="/contact" style={{ color: "var(--yellow-deep)", fontWeight: 600 }}>
            Contact page
          </a>
          .
        </p>
      </div>
    </LegalLayout>
  );
}
