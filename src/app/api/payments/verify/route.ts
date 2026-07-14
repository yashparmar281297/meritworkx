import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentRowId } = await request.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentRowId) {
    return NextResponse.json({ error: "Missing verification fields" }, { status: 400 });
  }

  if (!process.env.RAZORPAY_KEY_SECRET || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    return NextResponse.json({ error: "Razorpay is not configured yet" }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // Razorpay's own processing fee is only known once the payment is captured —
  // fetch it so platform earning can reflect the true net, not just the gross split.
  let razorpayFeeInr: number | null = null;
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    if (typeof paymentDetails.fee === "number") {
      razorpayFeeInr = paymentDetails.fee / 100;
    }
  } catch (err) {
    console.error("Could not fetch Razorpay payment fee:", err);
  }

  const { error } = await supabase
    .from("payments")
    .update({
      status: "held",
      razorpay_payment_id,
      razorpay_signature,
      razorpay_fee_inr: razorpayFeeInr,
    })
    .eq("id", paymentRowId)
    .eq("client_id", user.id)
    .eq("razorpay_order_id", razorpay_order_id);

  if (error) {
    return NextResponse.json({ error: "Could not update payment record" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
