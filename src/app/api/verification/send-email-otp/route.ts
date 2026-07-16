import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

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

  const sent = await sendEmail({
    to: email,
    subject: "Your MeritWorkX verification code",
    html: `<p>Your verification code is: <strong style="font-size:20px">${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });

  if (!sent) {
    await supabase.from("email_otps").delete().eq("user_id", user.id).eq("code", code);
    return NextResponse.json(
      { error: "Could not send the verification email. Please try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ sent: true });
}
