import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error("RAZORPAY_WEBHOOK_SECRET not configured — rejecting webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id && payment?.id) {
      const supabase = await createClient();
      const feeInr = typeof payment.fee === "number" ? payment.fee / 100 : null;

      const { error } = await supabase.rpc("mark_payment_captured_by_order", {
        p_razorpay_order_id: payment.order_id,
        p_razorpay_payment_id: payment.id,
        p_razorpay_fee_inr: feeInr,
      });

      if (error) {
        console.error("Webhook: could not mark payment captured:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
