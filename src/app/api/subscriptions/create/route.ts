import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

const PLAN_IDS: Record<string, string | undefined> = {
  Pro: process.env.RAZORPAY_PRO_PLAN_ID,
  Elite: process.env.RAZORPAY_ELITE_PLAN_ID,
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { plan } = await request.json();

  if (plan !== "Pro" && plan !== "Elite") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planId = PLAN_IDS[plan];

  if (!planId || !process.env.RAZORPAY_KEY_SECRET || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    return NextResponse.json({ error: "Razorpay plan is not configured yet" }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "freelancer") {
    return NextResponse.json({ error: "Only freelancers can upgrade here" }, { status: 403 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  let subscription;
  try {
    subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
      notes: { user_id: user.id, plan },
    });
  } catch (err) {
    console.error("Razorpay subscription creation failed:", JSON.stringify(err, null, 2));
    return NextResponse.json({ error: "Could not create Razorpay subscription" }, { status: 502 });
  }

  return NextResponse.json({
    subscriptionId: subscription.id,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    prefill: { name: profile.full_name ?? "", email: profile.email ?? user.email ?? "" },
  });
}
