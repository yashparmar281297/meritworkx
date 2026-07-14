import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from("email_otps").insert({
    user_id: user.id,
    email,
    code,
    expires_at: expiresAt,
  });

  // TODO (production): send `code` via a real email provider (Resend/SendGrid) instead of returning it.
  console.log(`[DEV] Email OTP for ${email}: ${code}`);

  return NextResponse.json({ sent: true, devCode: code });
}