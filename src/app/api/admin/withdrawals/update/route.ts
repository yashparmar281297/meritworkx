import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { convertUsdToCountry } from "@/lib/exchangeRates";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { withdrawalId, status } = await request.json();
  if (!withdrawalId || !["completed", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: withdrawal } = await supabase
    .from("withdrawals")
    .select("id, amount, status, freelancer:profiles(full_name, email, country)")
    .eq("id", withdrawalId)
    .single();

  if (!withdrawal) {
    return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
  }
  if (withdrawal.status !== "pending") {
    return NextResponse.json({ error: "This withdrawal has already been resolved" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("withdrawals")
    .update({ status })
    .eq("id", withdrawalId)
    .eq("status", "pending");

  if (updateError) {
    return NextResponse.json({ error: "Could not update withdrawal" }, { status: 500 });
  }

  const freelancer = Array.isArray(withdrawal.freelancer) ? withdrawal.freelancer[0] : withdrawal.freelancer;

  if (freelancer?.email) {
    const { formatted } = await convertUsdToCountry(Number(withdrawal.amount), freelancer.country);
    if (status === "completed") {
      await sendEmail({
        to: freelancer.email,
        subject: "Your withdrawal has been sent",
        html: `<p>Hi ${freelancer.full_name ?? "there"},</p>
<p>Your withdrawal of <strong>${formatted}</strong> has been sent to your saved payout method.</p>`,
      });
    } else {
      await sendEmail({
        to: freelancer.email,
        subject: "Your withdrawal request needs attention",
        html: `<p>Hi ${freelancer.full_name ?? "there"},</p>
<p>Your withdrawal request of <strong>${formatted}</strong> could not be processed. Please check your payout
details in Settings and submit a new withdrawal request, or contact us if you need help.</p>`,
      });
    }
  }

  return NextResponse.json({ success: true });
}
