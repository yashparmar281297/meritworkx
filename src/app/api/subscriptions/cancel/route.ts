import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("razorpay_subscription_id, subscription_cancel_requested")
    .eq("id", user.id)
    .single();

  if (!profile?.razorpay_subscription_id) {
    return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
  }

  if (profile.subscription_cancel_requested) {
    return NextResponse.json({ error: "Subscription is already set to cancel" }, { status: 400 });
  }

  if (!process.env.RAZORPAY_KEY_SECRET || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    return NextResponse.json({ error: "Razorpay is not configured yet" }, { status: 500 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    await razorpay.subscriptions.cancel(profile.razorpay_subscription_id, true);
  } catch {
    return NextResponse.json({ error: "Could not cancel subscription with Razorpay" }, { status: 502 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ subscription_cancel_requested: true })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Cancelled with Razorpay, but could not update your account. Contact support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
