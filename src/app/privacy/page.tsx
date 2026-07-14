import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — MeritWorkX",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="July 14, 2026">
      <p>
        This Privacy Policy explains what information MeritWorkX collects, why we collect it, and how it is
        used, stored, and protected when you use our platform as a Client or a Freelancer.
      </p>

      <div>
        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Account information:</strong> name, email address, password (or Google sign-in
          token), role (Client or Freelancer), country/city.</li>
          <li><strong>Profile information:</strong> bio, skills, portfolio projects, company name, avatar
          image.</li>
          <li><strong>Verification information:</strong> phone number (for OTP verification), business
          email, government ID document (uploaded voluntarily for identity verification).</li>
          <li><strong>Project &amp; communication data:</strong> project postings, proposals, cover
          letters, messages, timesheet entries, and files exchanged between Clients and Freelancers.</li>
          <li><strong>Payment information:</strong> transaction records (amounts, dates, status) and
          payout details (bank account/IFSC for India-based Freelancers, PayPal/Wise email for
          international Freelancers). We do not directly collect or store full card numbers — card
          payments are processed by our payment gateway partner, Razorpay.</li>
        </ul>
      </div>

      <div>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To operate your account and connect Clients with Freelancers.</li>
          <li>To generate AI match scores, proposal rankings, and fit/gap analysis using your profile,
          skills, and portfolio content against project requirements.</li>
          <li>To process payments, calculate platform fees, and disburse Freelancer payouts.</li>
          <li>To send transactional emails (payment confirmations, notifications, account verification).</li>
          <li>To verify identity and reduce fraud on the platform.</li>
          <li>To improve MeritWorkX&apos;s matching quality and platform features.</li>
        </ul>
      </div>

      <div>
        <h2>3. Third-Party Services We Use</h2>
        <p>We rely on the following third-party services to operate MeritWorkX. Data shared with each is
        limited to what&apos;s necessary for that service to function:</p>
        <ul>
          <li><strong>Supabase</strong> — database, authentication, and file storage.</li>
          <li><strong>Razorpay</strong> — payment processing, escrow-style fund holding, and subscription
          billing.</li>
          <li><strong>OpenAI</strong> — AI-generated match scores, proposal writing assistance, and
          fit/gap analysis, based on project and profile text you provide.</li>
          <li><strong>Resend</strong> — transactional email delivery (payment notifications, receipts).</li>
          <li><strong>Google</strong> — optional Google Sign-In authentication.</li>
        </ul>
      </div>

      <div>
        <h2>4. Data Storage &amp; Security</h2>
        <p>
          Your data is stored in a managed Postgres database via Supabase, with row-level security
          restricting access so that, for example, a Client can only view a Freelancer&apos;s profile and
          portfolio once that Freelancer has applied to one of their projects. Payment credentials (card
          details) are never stored on our servers — they are handled entirely by Razorpay&apos;s
          PCI-compliant infrastructure.
        </p>
      </div>

      <div>
        <h2>5. Cookies</h2>
        <p>
          MeritWorkX uses essential cookies to keep you signed in and maintain your session. We do not
          currently use third-party advertising or tracking cookies.
        </p>
      </div>

      <div>
        <h2>6. Your Rights</h2>
        <p>
          You can review and update most of your profile information directly from your account Settings
          at any time. To request deletion of your account and associated data, or to ask what data we
          hold about you, contact us using the details on our Contact page. We may retain certain
          transaction records after account deletion where required for accounting, tax, or legal
          compliance.
        </p>
      </div>

      <div>
        <h2>7. Children&apos;s Privacy</h2>
        <p>
          MeritWorkX is not intended for individuals under 18. We do not knowingly collect data from
          anyone under 18.
        </p>
      </div>

      <div>
        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected by
          updating the &quot;Last updated&quot; date above.
        </p>
      </div>

      <div>
        <h2>9. Contact</h2>
        <p>Questions about this Privacy Policy can be sent to the contact details listed on our Contact page.</p>
      </div>
    </LegalLayout>
  );
}
