import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phoneNumber } = await request.json();
  if (!phoneNumber) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

  const normalizedPhone = phoneNumber.replace(/[\s-]/g, "");

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from("phone_otps").insert({
    user_id: user.id,
    phone_number: phoneNumber,
    code,
    expires_at: expiresAt,
  });

  await sendSms({
    to: normalizedPhone,
    body: `Your MeritWorkX verification code is ${code}. It expires in 10 minutes.`,
  });

  return NextResponse.json({ sent: true });
}
