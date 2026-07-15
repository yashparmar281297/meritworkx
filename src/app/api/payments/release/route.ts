import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { paymentId } = await request.json();
  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("id, client_id, freelancer_id, project_name, amount, total_charged, status")
    .eq("id", paymentId)
    .eq("client_id", user.id)
    .single();

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (payment.status !== "held") {
    return NextResponse.json({ error: "This payment isn't in escrow" }, { status: 400 });
  }

  const { error } = await supabase
    .from("payments")
    .update({ status: "released" })
    .eq("id", paymentId)
    .eq("status", "held");

  if (error) {
    return NextResponse.json({ error: "Could not release payment" }, { status: 500 });
  }

  const [{ data: client }, { data: freelancer }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", payment.client_id).single(),
    supabase
      .from("profiles")
      .select("full_name, email, payout_method, payout_details")
      .eq("id", payment.freelancer_id)
      .single(),
  ]);

  const projectName = payment.project_name ?? "your project";
  const netAmount = Number(payment.amount).toFixed(2);

  function formatPayoutDetails(): string {
    const details = freelancer?.payout_details as Record<string, string> | null;
    if (!freelancer?.payout_method || !details) {
      return "<p style=\"color:#DC2626\">No payout details on file for this freelancer yet — ask them to add it in Settings.</p>";
    }
    if (freelancer.payout_method === "bank_transfer") {
      return `<ul>
<li><strong>Method:</strong> Bank transfer</li>
<li><strong>Account holder:</strong> ${details.account_holder ?? "—"}</li>
<li><strong>Account number:</strong> ${details.account_number ?? "—"}</li>
<li><strong>IFSC code:</strong> ${details.ifsc ?? "—"}</li>
</ul>`;
    }
    const label = freelancer.payout_method === "paypal" ? "PayPal" : "Wise";
    return `<ul>
<li><strong>Method:</strong> ${label}</li>
<li><strong>Email:</strong> ${details.email ?? "—"}</li>
</ul>`;
  }

  if (client?.email) {
    await sendEmail({
      to: client.email,
      subject: `Payment disbursed — ${projectName}`,
      html: `<p>Hi ${client.full_name ?? "there"},</p>
<p>You've disbursed <strong>$${netAmount}</strong> to <strong>${freelancer?.full_name ?? "the freelancer"}</strong> for <strong>${projectName}</strong>.</p>
<p>This payment has been released from escrow and is now marked complete.</p>`,
    });
  }

  if (freelancer?.email) {
    await sendEmail({
      to: freelancer.email,
      subject: `You've been paid — ${projectName}`,
      html: `<p>Hi ${freelancer.full_name ?? "there"},</p>
<p>You've received <strong>$${netAmount}</strong> for <strong>${projectName}</strong> from <strong>${client?.full_name ?? "the client"}</strong>.</p>
<p>This payment has been released from escrow and is now in your account.</p>`,
    });
  }

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Action needed: transfer $${netAmount} to ${freelancer?.full_name ?? "freelancer"} — ${projectName}`,
      html: `<p>${client?.full_name ?? "A client"} approved and released payment for <strong>${projectName}</strong>.</p>
<p>Send <strong>$${netAmount}</strong> to <strong>${freelancer?.full_name ?? "the freelancer"}</strong> (${freelancer?.email ?? "no email on file"}) using:</p>
${formatPayoutDetails()}`,
    });
  }

  return NextResponse.json({ success: true });
}
