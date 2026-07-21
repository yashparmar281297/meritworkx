import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — MeritWorkX",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="July 15, 2026">
      <p>
        We try to keep this in plain language, not legalese — but it&apos;s still a real agreement. These
        Terms of Service (&quot;Terms&quot;) govern your access to and use of MeritWorkX (&quot;we&quot;,
        &quot;us&quot;, &quot;our&quot;), a freelance marketplace that matches clients and freelancers using
        AI-scored compatibility instead of competitive bidding. By creating an account or using the
        platform, you agree to be bound by these Terms.
      </p>

      <div>
        <h2>1. Acceptance of Terms</h2>
        <p>
          Creating an account, posting a project, submitting a proposal, or otherwise using MeritWorkX
          means you accept these Terms. If you&apos;re using MeritWorkX on behalf of a company, you&apos;re
          confirming you have authority to bind that company to these Terms.
        </p>
      </div>

      <div>
        <h2>2. Who Can Use MeritWorkX</h2>
        <p>
          You must be at least 18 years old and capable of entering a legally binding agreement to use
          MeritWorkX, whether as a Client (posting projects and hiring) or a Freelancer (applying to and
          completing projects). Clients and Freelancers may be based in India or internationally.
        </p>
      </div>

      <div>
        <h2>3. Accounts</h2>
        <p>
          You&apos;re responsible for the accuracy of your profile and for keeping your login credentials
          confidential — you&apos;re responsible for activity under your account. Sign up with email/password
          or Google Sign-In. One account per person; accounts may not be shared, sold, or transferred.
        </p>
      </div>

      <div>
        <h2>4. How Matching Works</h2>
        <p>
          MeritWorkX uses AI to score compatibility between a Freelancer&apos;s profile, skills, and
          portfolio against a Client&apos;s posted project, and to generate proposal rankings and fit/gap
          analysis. These scores are advisory — they help both sides make faster, better-informed decisions.
          They don&apos;t guarantee project outcomes, work quality, or a successful hire.
        </p>
      </div>

      <div>
        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Arrange payment outside MeritWorkX for a project you sourced through it, to avoid platform
          fees.</li>
          <li>Post false, misleading, or plagiarized project descriptions, proposals, or portfolio
          content.</li>
          <li>Harass, discriminate against, or misrepresent your identity to other users.</li>
          <li>Attempt to circumvent, disable, or probe the platform&apos;s security, or scrape/harvest data
          beyond normal use.</li>
          <li>Use the platform for anything illegal, or that infringes someone else&apos;s rights.</li>
        </ul>
        <p className="mt-2">
          Violating this section may result in warning, suspension, or termination of your account, at our
          discretion, without refund of platform fees already earned on completed transactions.
        </p>
      </div>

      <div>
        <h2>6. Fees — Platform Commission</h2>
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
          from this platform fee and are absorbed by MeritWorkX out of its retained commission, not charged
          separately to Client or Freelancer.
        </p>
      </div>

      <div>
        <h2>7. How Payments Move</h2>
        <p>
          When a Client funds a project, the full amount (project value + Client fee) is collected via our
          payment gateway partner and held by MeritWorkX. Funds are marked &quot;in escrow&quot; until the
          Client reviews the delivered work and clicks &quot;Approve &amp; Release.&quot; Upon release, the
          Freelancer&apos;s balance becomes available for withdrawal to the payout method they&apos;ve
          provided (bank transfer for India-based Freelancers; PayPal or Wise for international
          Freelancers). Once the Freelancer submits a withdrawal request, funds are typically
          transferred to their payout method within <strong>3 to 5 working days</strong>.
        </p>
      </div>

      <div>
        <h2>8. Subscription Plans &amp; Tokens (Freelancers)</h2>
        <p>
          Freelancers operate on a token system: applying to a project costs one token, except a
          Freelancer&apos;s very first proposal ever, which is free. Tokens are credited back when a
          proposal is shortlisted or the Freelancer is hired, and are not refunded on rejection. Freelancers
          may subscribe to Pro or Elite plans for a higher monthly token allowance and additional AI
          features (proposal writing, fit/gap analysis); subscriptions renew monthly until cancelled and
          are billed via our payment gateway partner. If a renewal payment fails, your plan may lapse to
          the free Starter tier until payment succeeds.
        </p>
      </div>

      <div>
        <h2>9. Intellectual Property</h2>
        <p>
          MeritWorkX owns the platform itself — its design, code, branding, and AI matching logic. You keep
          ownership of the content you create and upload (project descriptions, proposals, portfolio work,
          messages). By posting content, you grant MeritWorkX a limited license to store, process, and
          display it as needed to operate the service (e.g. showing your portfolio to a Client
          you&apos;ve applied to). We don&apos;t use your content to train AI models shared across other
          users, and we don&apos;t sell it.
        </p>
        <p className="mt-2">
          Ownership of the actual deliverables produced in a project (code, designs, documents, etc.) is a
          matter between the Client and Freelancer, governed by whatever they agree to for that project —
          MeritWorkX is not a party to that agreement.
        </p>
      </div>

      <div>
        <h2>10. User Content</h2>
        <p>
          You warrant that you own or have the necessary rights to anything you post (portfolio work,
          project descriptions, proposals, uploaded files) and that it doesn&apos;t violate any law or
          third party&apos;s rights. We don&apos;t pre-screen content, but we may remove content or suspend
          an account that violates these Terms.
        </p>
      </div>

      <div>
        <h2>11. Verification</h2>
        <p>
          MeritWorkX offers identity, phone, and business email verification to build trust between Clients
          and Freelancers. A verification badge is a signal, not a guarantee of a user&apos;s identity,
          reliability, or the legality of their activity.
        </p>
      </div>

      <div>
        <h2>12. Cancellations &amp; Refunds</h2>
        <p>
          Cancellation and refund handling is governed by our separate{" "}
          <a href="/refund-policy" style={{ color: "var(--yellow-deep)", fontWeight: 600 }}>
            Refund &amp; Cancellation Policy
          </a>
          , which forms part of these Terms.
        </p>
      </div>

      <div>
        <h2>13. Disclaimers</h2>
        <p>
          MeritWorkX is provided &quot;as is,&quot; without warranties of any kind. We&apos;re a matching
          and payment-facilitation platform — we&apos;re not a party to the working relationship, contract,
          or scope of work agreed between a Client and Freelancer, and we don&apos;t guarantee the quality,
          legality, timeliness, or outcome of any project. AI-generated match scores, fit/gap analysis, and
          proposal drafts are starting points for your own judgment, not a guarantee of accuracy.
        </p>
      </div>

      <div>
        <h2>14. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, MeritWorkX is not liable for indirect, incidental, or
          consequential damages, lost profits, or lost data arising from your use of the platform. Our
          total liability to you for any claim is capped at the greater of the platform fees you paid us in
          the three months preceding the claim, or $100.
        </p>
      </div>

      <div>
        <h2>15. Indemnification</h2>
        <p>
          You agree to indemnify and hold MeritWorkX harmless from any claim arising from your use of the
          platform, the content you post, your violation of these Terms, or your infringement of a third
          party&apos;s rights.
        </p>
      </div>

      <div>
        <h2>16. Termination</h2>
        <p>
          You may close your account at any time. We may suspend or terminate accounts that violate these
          Terms, engage in fraud, or attempt to circumvent platform fees, with or without notice depending
          on severity. Obligations relating to completed or in-progress transactions, and sections that by
          their nature should survive (IP, disclaimers, liability limits, indemnification), continue after
          termination.
        </p>
      </div>

      <div>
        <h2>17. Governing Law &amp; Disputes</h2>
        <p>
          These Terms are governed by the laws of India, regardless of where a Client or Freelancer is
          located. If a dispute arises, we&apos;ll try to resolve it directly with you first; unresolved
          disputes are subject to the exclusive jurisdiction of the courts of India.
        </p>
      </div>

      <div>
        <h2>18. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be reflected by updating the
          &quot;Last updated&quot; date above, and where practical we&apos;ll make reasonable efforts to
          notify you. Continued use of MeritWorkX after changes take effect means you accept the revised
          Terms.
        </p>
      </div>

      <div>
        <h2>19. Miscellaneous</h2>
        <p>
          These Terms, together with our Privacy Policy and Refund &amp; Cancellation Policy, are the
          entire agreement between you and MeritWorkX on these topics. If any provision is found
          unenforceable, the rest remains in effect. Our failure to enforce a provision isn&apos;t a waiver
          of it. You may not assign your rights under these Terms without our consent; we may assign ours
          freely (e.g. in a merger or acquisition). Nothing here creates a partnership, joint venture, or
          employment relationship between you and MeritWorkX.
        </p>
      </div>

      <div>
        <h2>20. Contact</h2>
        <p>
          Questions about these Terms can be sent via our{" "}
          <a href="/contact" style={{ color: "var(--yellow-deep)", fontWeight: 600 }}>
            Contact page
          </a>
          .
        </p>
      </div>
    </LegalLayout>
  );
}
