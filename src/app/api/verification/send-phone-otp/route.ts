import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phoneNumber } = await request.json();
  if (!phoneNumber) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from("phone_otps").insert({
    user_id: user.id,
    phone_number: phoneNumber,
    code,
    expires_at: expiresAt,
  });

  // TODO (production): send `code` via Twilio/MSG91/etc. instead of returning it.
  console.log(`[DEV] Phone OTP for ${phoneNumber}: ${code}`);

  return NextResponse.json({ sent: true, devCode: code });
}