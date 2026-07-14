import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan } = await request.json();

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature || !plan) {
    return NextResponse.json({ error: "Missing verification fields" }, { status: 400 });
  }

  if (plan !== "Pro" && plan !== "Elite") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Razorpay is not configured yet" }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Subscription verification failed" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, earned_tokens")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "freelancer") {
    return NextResponse.json({ error: "Only freelancers can upgrade here" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  const expiresAtDate = expiresAt.toISOString().slice(0, 10);

  const PLAN_TOKEN_ALLOWANCE: Record<string, number> = { Pro: 15, Elite: 40 };

  const update = {
    token_plan: plan,
    subscription_expires_at: expiresAtDate,
    razorpay_subscription_id,
    tokens: PLAN_TOKEN_ALLOWANCE[plan] + (profile.earned_tokens ?? 0),
    earned_tokens: 0,
    last_token_reset: today,
    subscription_cancel_requested: false,
  };

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Could not save subscription" }, { status: 500 });
  }

  const PLAN_PRICE_INR: Record<string, number> = { Pro: 499, Elite: 1199 };

  const { error: paymentError } = await supabase.from("payments").insert({
    type: "subscription",
    status: "released",
    payment_date: today,
    amount: PLAN_PRICE_INR[plan],
    subscription_plan: plan,
    freelancer_id: user.id,
  });

  if (paymentError) {
    console.error("Could not record subscription payment:", paymentError);
  }

  return NextResponse.json({ success: true, expiresAt: expiresAtDate });
}
