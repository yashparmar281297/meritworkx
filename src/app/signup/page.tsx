"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/auth/GoogleButton";

type Role = "client" | "freelancer";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please choose whether you're joining as a client or a freelancer.");
      return;
    }
    if (!fullName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Something went wrong creating your account. Please try again.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      email,
      role,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/login?registered=true");
  }

  async function handleGoogleSignup() {
    setError("");

    if (!role) {
      setError("Please choose whether you're joining as a client or a freelancer.");
      return;
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
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
          Create your account
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Choose how you want to use MeritWorkX.
        </p>

        {/* Role selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("client")}
            className="rounded-xl border p-4 text-left transition"
            style={
              role === "client"
                ? { borderColor: "var(--yellow)", background: "var(--surface-yellow)" }
                : { borderColor: "var(--line)", background: "var(--paper)" }
            }
          >
            <Briefcase className="w-5 h-5 mb-2" style={{ color: "var(--ink)" }} />
            <div className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
              As Client
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
              I want to hire talent
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole("freelancer")}
            className="rounded-xl border p-4 text-left transition"
            style={
              role === "freelancer"
                ? { borderColor: "var(--yellow)", background: "var(--surface-yellow)" }
                : { borderColor: "var(--line)", background: "var(--paper)" }
            }
          >
            <User className="w-5 h-5 mb-2" style={{ color: "var(--ink)" }} />
            <div className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
              As Freelancer
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
              I want to find work
            </div>
          </button>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
              style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink)" }}
            />
          </div>

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
              placeholder="At least 6 characters"
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
          <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
            OR
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
        </div>

        <GoogleButton onClick={handleGoogleSignup} disabled={loading} />

        <p className="text-sm text-center mt-6" style={{ color: "var(--ink-soft)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--yellow-deep)" }}>
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}