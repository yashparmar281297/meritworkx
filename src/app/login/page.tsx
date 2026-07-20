"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_admin")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setError("Could not find your profile. Please try signing up again.");
      setLoading(false);
      return;
    }

    if (profile.is_admin) {
      router.push("/admin");
    } else if (profile.role === "client") {
      router.push("/dashboard/client");
    } else {
      router.push("/dashboard/freelancer");
    }
  }

  async function handleGoogleLogin() {
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "var(--surface)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6 sm:p-8"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg" />
          <span style={{ color: "var(--ink)" }}>MeritWorkX</span>
        </Link>

        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--ink)" }}>
          Welcome back
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Log in to continue to your dashboard.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
              style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
              style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--yellow)", color: "var(--ink)" }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
            OR
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
        </div>

        <GoogleButton onClick={handleGoogleLogin} disabled={loading} />

        <p className="text-sm text-center mt-6" style={{ color: "var(--ink-soft)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold" style={{ color: "var(--yellow-deep)" }}>
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}