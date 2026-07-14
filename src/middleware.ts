import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    // Behind some reverse proxies (e.g. Hostinger's Node.js hosting), request.nextUrl's
    // resolved host can be the server's internal bind address (0.0.0.0:3000) instead of
    // the real public domain — trust an explicit site URL when set.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const url = siteUrl ? new URL("/login", siteUrl) : request.nextUrl.clone();
    if (!siteUrl) url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};