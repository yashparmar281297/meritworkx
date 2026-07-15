import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { formatPayoutDetailsHtml } from "@/lib/payout";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { amount } = await request.json();
  const requestedAmount = Number(amount);

  if (!requestedAmount || requestedAmount <= 0) {
    return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
  }

  const [{ data: freelancer }, { data: releasedPayments }, { data: existingWithdrawals }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, payout_method, payout_details")
      .eq("id", user.id)
      .single(),
    supabase
      .from("payments")
      .select("amount")
      .eq("freelancer_id", user.id)
      .eq("type", "project")
      .eq("status", "released"),
    supabase.from("withdrawals").select("amount").eq("freelancer_id", user.id).neq("status", "rejected"),
  ]);

  if (!freelancer?.payout_method || !freelancer?.payout_details) {
    return NextResponse.json(
      { error: "Add your payout details in Settings before requesting a withdrawal." },
      { status: 400 }
    );
  }

  const totalEarned = (releasedPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const totalWithdrawn = (existingWithdrawals ?? []).reduce((sum, w) => sum + Number(w.amount), 0);
  const availableBalance = totalEarned - totalWithdrawn;

  if (requestedAmount > availableBalance) {
    return NextResponse.json(
      { error: `You can withdraw up to $${availableBalance.toFixed(2)}.` },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabase.from("withdrawals").insert({
    freelancer_id: user.id,
    amount: requestedAmount,
    status: "pending",
    payout_method: freelancer.payout_method,
    payout_details: freelancer.payout_details,
  });

  if (insertError) {
    return NextResponse.json({ error: "Could not submit withdrawal request" }, { status: 500 });
  }

  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Action needed: send $${requestedAmount.toFixed(2)} to ${freelancer.full_name ?? "a freelancer"}`,
      html: `<p><strong>${freelancer.full_name ?? "A freelancer"}</strong> (${freelancer.email ?? "no email on file"}) requested a withdrawal of <strong>$${requestedAmount.toFixed(2)}</strong>.</p>
<p>Send it using:</p>
${formatPayoutDetailsHtml(freelancer.payout_method, freelancer.payout_details as Record<string, string>)}`,
    });
  }

  return NextResponse.json({ success: true });
}
