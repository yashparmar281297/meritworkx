import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";
import { convertUsdToInr } from "@/lib/exchangeRates";

const FEE_RATE = 0.05;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { projectId, amount } = await request.json();
  const projectValue = Number(amount);

  if (!projectId || !projectValue || projectValue <= 0) {
    return NextResponse.json({ error: "Invalid project or amount" }, { status: 400 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, client_id")
    .eq("id", projectId)
    .single();

  if (!project || project.client_id !== user.id) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("freelancer_id")
    .eq("project_id", projectId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "No hired freelancer for this project yet" }, { status: 400 });
  }

  const { data: existingHeld } = await supabase
    .from("payments")
    .select("id")
    .eq("project_id", projectId)
    .eq("client_id", user.id)
    .eq("status", "held")
    .maybeSingle();

  if (existingHeld) {
    return NextResponse.json({ error: "This project already has an active escrow payment" }, { status: 400 });
  }

  // Clear out any previous attempt that was never actually completed (checkout
  // closed before paying) so the client isn't permanently blocked from retrying.
  await supabase
    .from("payments")
    .delete()
    .eq("project_id", projectId)
    .eq("client_id", user.id)
    .eq("status", "created");

  const clientFee = Math.round(projectValue * FEE_RATE * 100) / 100;
  const totalCharged = projectValue + clientFee;
  const freelancerFee = Math.round(projectValue * FEE_RATE * 100) / 100;
  const netPayout = projectValue - freelancerFee;
  const platformEarning = clientFee + freelancerFee;

  const { amount: totalChargedInr } = await convertUsdToInr(totalCharged);
  const amountInPaise = Math.round(totalChargedInr * 100);

  if (!process.env.RAZORPAY_KEY_SECRET || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    return NextResponse.json({ error: "Razorpay is not configured yet" }, { status: 500 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  let order;
  try {
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `proj_${projectId.slice(0, 8)}_${Date.now()}`,
    });
  } catch {
    return NextResponse.json({ error: "Could not create Razorpay order" }, { status: 502 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { data: paymentRow, error: insertError } = await supabase
    .from("payments")
    .insert({
      type: "project",
      status: "created",
      client_id: user.id,
      freelancer_id: conversation.freelancer_id,
      project_id: projectId,
      project_name: project.title,
      client_name: profile?.full_name ?? null,
      payment_date: new Date().toISOString().slice(0, 10),
      amount: netPayout,
      project_value: projectValue,
      client_fee: clientFee,
      freelancer_fee: freelancerFee,
      total_charged: totalCharged,
      platform_earning: platformEarning,
      razorpay_order_id: order.id,
    })
    .select("id")
    .single();

  if (insertError || !paymentRow) {
    return NextResponse.json({ error: "Could not create payment record" }, { status: 500 });
  }

  return NextResponse.json({
    orderId: order.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    paymentRowId: paymentRow.id,
    prefill: { name: profile?.full_name ?? "", email: profile?.email ?? user.email ?? "" },
  });
}
