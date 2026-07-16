import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { formatPayoutDetailsHtml } from "@/lib/payout";
import { convertUsdToCountry, convertUsdToInr } from "@/lib/exchangeRates";

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
    supabase.from("profiles").select("full_name, email, country").eq("id", payment.client_id).single(),
    supabase
      .from("profiles")
      .select("full_name, email, country, payout_method, payout_details")
      .eq("id", payment.freelancer_id)
      .single(),
  ]);

  const projectName = payment.project_name ?? "your project";
  const netAmountUsd = Number(payment.amount);

  const [clientAmount, freelancerAmount, adminAmount] = await Promise.all([
    convertUsdToCountry(netAmountUsd, client?.country),
    convertUsdToCountry(netAmountUsd, freelancer?.country),
    convertUsdToInr(netAmountUsd),
  ]);

  if (client?.email) {
    await sendEmail({
      to: client.email,
      subject: `Payment disbursed — ${projectName}`,
      html: `<p>Hi ${client.full_name ?? "there"},</p>
<p>You've disbursed <strong>${clientAmount.formatted}</strong> to <strong>${freelancer?.full_name ?? "the freelancer"}</strong> for <strong>${projectName}</strong>.</p>
<p>This payment has been released from escrow and is now marked complete.</p>`,
    });
  }

  if (freelancer?.email) {
    await sendEmail({
      to: freelancer.email,
      subject: `You've been paid — ${projectName}`,
      html: `<p>Hi ${freelancer.full_name ?? "there"},</p>
<p>You've received <strong>${freelancerAmount.formatted}</strong> for <strong>${projectName}</strong> from <strong>${client?.full_name ?? "the client"}</strong>.</p>
<p>This payment has been released from escrow and is now in your account.</p>`,
    });
  }

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Payment released — ${adminAmount.formatted} now available for ${freelancer?.full_name ?? "freelancer"} to withdraw`,
      html: `<p>${client?.full_name ?? "A client"} approved and released payment for <strong>${projectName}</strong>.</p>
<p><strong>${adminAmount.formatted}</strong> is now available in <strong>${freelancer?.full_name ?? "the freelancer"}</strong>'s (${freelancer?.email ?? "no email on file"}) balance. No action needed yet — you'll get a separate email with their payout details when they actually request a withdrawal.</p>
${formatPayoutDetailsHtml(freelancer?.payout_method ?? null, freelancer?.payout_details as Record<string, string> | null)}`,
    });
  }

  return NextResponse.json({ success: true });
}
