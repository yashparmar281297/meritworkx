import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions — MeritWorkX",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" lastUpdated="July 14, 2026">
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of MeritWorkX
        (&quot;MeritWorkX&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a freelance marketplace that matches
        clients and freelancers using AI-scored compatibility rather than competitive bidding. By creating an
        account or using the platform, you agree to be bound by these Terms.
      </p>

      <div>
        <h2>1. Who Can Use MeritWorkX</h2>
        <p>
          You must be at least 18 years old and capable of entering a legally binding agreement to use
          MeritWorkX, whether as a Client (posting projects and hiring) or a Freelancer (applying to and
          completing projects). Clients and Freelancers may be based in India or internationally.
        </p>
      </div>

      <div>
        <h2>2. Accounts</h2>
        <p>
          You are responsible for the accuracy of the information on your profile and for maintaining the
          confidentiality of your login credentials. You may sign up using email/password or Google
          Sign-In. One account per person; accounts may not be shared or transferred.
        </p>
      </div>

      <div>
        <h2>3. How Matching Works</h2>
        <p>
          MeritWorkX uses AI to score the compatibility between a Freelancer&apos;s profile, skills, and
          portfolio against a Client&apos;s posted project, and to generate proposal rankings and fit/gap
          analysis. These scores are advisory only — they are intended to help both sides make better
          decisions and do not guarantee project outcomes, quality of work, or successful hiring.
        </p>
      </div>

      <div>
        <h2>4. Fees — Platform Commission</h2>
        <div className="callout">
          <strong>MeritWorkX charges a flat 5% platform fee to the Client and a separate flat 5% platform
          fee to the Freelancer on every completed project transaction — a combined 10% of the project
          value.</strong> This rate is fixed and applies identically whether the project is large or small;
          it does not scale, tier, or change based on project size, budget, or duration.
        </div>
        <p className="mt-3">
          Concretely, for a project valued at $1,000: the Client pays $1,050 (project value + 5% Client
          fee); the Freelancer receives $950 (project value − 5% Freelancer fee); MeritWorkX retains $100
          as its platform fee. Payment gateway processing charges (currently via Razorpay) are separate
          from and in addition to this platform fee, and are absorbed by MeritWorkX out of its retained
          commission, not charged separately to Client or Freelancer.
        </p>
      </div>

      <div>
        <h2>5. How Payments Move</h2>
        <p>
          When a Client funds a project, the full amount (project value + Client fee) is collected via our
          payment gateway partner and held by MeritWorkX. Funds are marked &quot;in escrow&quot; until the
          Client reviews the delivered work and clicks &quot;Approve &amp; Release.&quot; Upon release,
          MeritWorkX disburses the Freelancer&apos;s share to the payout method the Freelancer has provided
          (bank transfer for India-based Freelancers; PayPal or Wise for international Freelancers).
          MeritWorkX does not guarantee a specific disbursement timeline beyond reasonable commercial
          effort following release.
        </p>
      </div>

      <div>
        <h2>6. Subscription Plans &amp; Tokens (Freelancers)</h2>
        <p>
          Freelancers operate on a token system: applying to a project costs one token, except a
          Freelancer&apos;s very first proposal ever, which is free. Tokens are awarded back when a proposal
          is shortlisted or the Freelancer is hired, and are not refunded on rejection. Freelancers may
          subscribe to Pro or Elite plans for a higher monthly token allowance and additional AI features
          (proposal writing, fit/gap analysis); subscriptions renew monthly until cancelled and are billed
          via our payment gateway partner.
        </p>
      </div>

      <div>
        <h2>7. Client &amp; Freelancer Conduct</h2>
        <ul>
          <li>Do not attempt to circumvent MeritWorkX to avoid platform fees (e.g. arranging payment
          outside the platform for a project sourced through it).</li>
          <li>Do not post false, misleading, or plagiarized project descriptions, proposals, or portfolio
          content.</li>
          <li>Do not harass, discriminate against, or misrepresent your identity to other users.</li>
          <li>Freelancers are independent contractors, not employees of MeritWorkX or of any Client.</li>
        </ul>
      </div>

      <div>
        <h2>8. Verification</h2>
        <p>
          MeritWorkX may offer identity, phone, and business email verification to build trust between
          Clients and Freelancers. Verification status is a signal, not a guarantee of a user&apos;s
          identity, reliability, or the legality of their activity.
        </p>
      </div>

      <div>
        <h2>9. Cancellations &amp; Refunds</h2>
        <p>
          Cancellation and refund handling is governed by our separate{" "}
          <a href="/refund-policy" style={{ color: "var(--yellow-deep)", fontWeight: 600 }}>
            Refund &amp; Cancellation Policy
          </a>
          , which forms part of these Terms.
        </p>
      </div>

      <div>
        <h2>10. Disclaimers &amp; Limitation of Liability</h2>
        <p>
          MeritWorkX is a matching and payment-facilitation platform. We are not a party to the working
          relationship, contract, or scope of work agreed between a Client and a Freelancer, and we do not
          guarantee the quality, legality, timeliness, or outcome of any project. To the maximum extent
          permitted by law, MeritWorkX&apos;s total liability arising from your use of the platform is
          limited to the platform fees you paid in the three months preceding the claim.
        </p>
      </div>

      <div>
        <h2>11. Termination</h2>
        <p>
          We may suspend or terminate accounts that violate these Terms, engage in fraud, or attempt to
          circumvent platform fees. You may close your account at any time; obligations relating to
          completed or in-progress transactions survive account closure.
        </p>
      </div>

      <div>
        <h2>12. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India, without regard to conflict-of-law principles,
          regardless of where a Client or Freelancer is located.
        </p>
      </div>

      <div>
        <h2>13. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be reflected by updating the
          &quot;Last updated&quot; date above. Continued use of MeritWorkX after changes take effect
          constitutes acceptance of the revised Terms.
        </p>
      </div>

      <div>
        <h2>14. Contact</h2>
        <p>Questions about these Terms can be sent to the contact details listed on our Contact page.</p>
      </div>
    </LegalLayout>
  );
}
