import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phoneNumber, code } = await request.json();

  const { data: otp } = await supabase
    .from("phone_otps")
    .select("id, expires_at, verified")
    .eq("user_id", user.id)
    .eq("phone_number", phoneNumber)
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otp) return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  if (otp.verified) return NextResponse.json({ error: "Code already used." }, { status: 400 });
  if (new Date(otp.expires_at) < new Date()) return NextResponse.json({ error: "Code expired." }, { status: 400 });

  await supabase.from("phone_otps").update({ verified: true }).eq("id", otp.id);
  await supabase.from("profiles").update({ phone_number: phoneNumber, phone_verified: true }).eq("id", user.id);

  return NextResponse.json({ verified: true });
}