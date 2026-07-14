"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Role = "client" | "freelancer";

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    setError("");

    if (!role) {
      setError("Please choose whether you're joining as a client or a freelancer.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "New user",
      email: user.email,
      role,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push(role === "client" ? "/dashboard/client" : "/dashboard/freelancer");
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
          One more step
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Tell us how you want to use MeritWorkX.
        </p>

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

        {error && (
          <p
            className="text-sm px-3 py-2 rounded-lg mb-4"
            style={{ background: "var(--bad-soft)", color: "var(--bad)" }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--yellow)", color: "var(--ink)" }}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Setting up..." : "Continue"}
        </button>
      </div>
    </main>
  );
}
