import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — MeritWorkX",
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" lastUpdated="July 14, 2026">
      <p>
        This policy explains how project payments, escrow funds, subscriptions, and platform fees are
        handled when a project is cancelled or a refund is requested.
      </p>

      <div>
        <h2>1. How Project Escrow Works</h2>
        <p>
          When a Client funds a project, the full amount (project value + 5% Client fee) is collected and
          held by MeritWorkX as &quot;in escrow&quot; — it is not released to the Freelancer until the
          Client reviews the delivered work and explicitly clicks &quot;Approve &amp; Release.&quot;
        </p>
      </div>

      <div>
        <h2>2. Cancelling Before Release</h2>
        <p>
          If a project is cancelled by mutual agreement between the Client and Freelancer before the
          Client releases payment, the Client may contact us to request a refund of the escrowed amount.
          Refunds in this case are processed back to the original payment method, minus any payment
          gateway processing charges already incurred on the original transaction, which are
          non-refundable to us by our payment gateway partner.
        </p>
      </div>

      <div>
        <h2>3. After Release — Platform Fees Are Non-Refundable</h2>
        <div className="callout">
          Once a payment has been released to a Freelancer, the <strong>5% Client platform fee and 5%
          Freelancer platform fee are non-refundable</strong>, as MeritWorkX&apos;s matching, escrow, and
          payment-facilitation services have already been fully rendered at that point. This applies
          equally regardless of the size of the project.
        </div>
        <p className="mt-3">
          Disputes about the quality or completeness of delivered work after release should first be
          resolved directly between the Client and Freelancer. MeritWorkX may assist in good-faith dispute
          resolution but does not guarantee reversal of a released payment.
        </p>
      </div>

      <div>
        <h2>4. Disputes Before Release</h2>
        <p>
          If a Client and Freelancer disagree about whether delivered work meets the agreed scope while
          funds are still in escrow, either party may contact MeritWorkX support. We will review the
          project details and communication history and make a good-faith determination on releasing,
          partially releasing, or refunding the escrowed amount.
        </p>
      </div>

      <div>
        <h2>5. Subscription Refunds (Freelancers)</h2>
        <p>
          Pro and Elite subscription payments are billed monthly. Cancelling a subscription stops future
          renewal but does not refund the current billing period — you retain access to the plan&apos;s
          benefits (token allowance, AI features) until the period you already paid for ends.
        </p>
      </div>

      <div>
        <h2>6. Tokens</h2>
        <p>
          Tokens spent applying to a project are not refunded if a proposal is rejected. Tokens are
          credited back automatically if a proposal is shortlisted or the Freelancer is hired, per our
          Terms of Service.
        </p>
      </div>

      <div>
        <h2>7. Failed or Duplicate Payments</h2>
        <p>
          If a payment attempt fails or you are charged more than once for the same escrow funding due to
          a technical error, contact us with the payment reference shown on your payment slip and we will
          investigate and correct it, including a full refund of any erroneous duplicate charge.
        </p>
      </div>

      <div>
        <h2>8. How to Request a Refund</h2>
        <p>
          Contact us using the details on our Contact page with your account email, the project name, and
          the payment reference from your Payments page. We aim to respond to refund requests within a
          reasonable timeframe.
        </p>
      </div>
    </LegalLayout>
  );
}
