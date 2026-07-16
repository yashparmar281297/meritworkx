import { Resend } from "resend";

// Returns true only if Resend actually accepted the email — callers that need the
// user to know about a failed send (e.g. an OTP the user is waiting on) should check
// this instead of assuming success.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured — skipping email send");
    return false;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "MeritWorkX <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    if (error) {
      console.error("Failed to send email:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}
