import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  // Behind some reverse proxies (e.g. Hostinger's Node.js hosting), the request's
  // own resolved host can be the server's internal bind address (0.0.0.0:3000)
  // instead of the real public domain — trust an explicit site URL when set.
  const origin = process.env.NEXT_PUBLIC_SITE_URL || requestOrigin;
  const code = searchParams.get("code");
  const role = searchParams.get("role");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        return NextResponse.redirect(`${origin}/dashboard/${profile.role}`);
      }

      if (role === "client" || role === "freelancer") {
        const meta = data.user.user_metadata;
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: meta?.full_name ?? meta?.name ?? "New user",
          email: data.user.email,
          role,
        });

        if (!insertError) {
          return NextResponse.redirect(`${origin}/dashboard/${role}`);
        }
      }

      return NextResponse.redirect(`${origin}/auth/complete-profile`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
