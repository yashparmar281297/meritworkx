"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PayoutMethod = "bank_transfer" | "paypal" | "wise";

type BankDetails = { account_holder: string; account_number: string; ifsc: string };
type EmailDetails = { email: string };

export default function PayoutDetailsForm({
  isIndia,
  initialMethod,
  initialDetails,
}: {
  isIndia: boolean;
  initialMethod: PayoutMethod | null;
  initialDetails: Record<string, string> | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [method, setMethod] = useState<PayoutMethod>(initialMethod ?? (isIndia ? "bank_transfer" : "paypal"));
  const [bank, setBank] = useState<BankDetails>({
    account_holder: initialDetails?.account_holder ?? "",
    account_number: initialDetails?.account_number ?? "",
    ifsc: initialDetails?.ifsc ?? "",
  });
  const [emailDetails, setEmailDetails] = useState<EmailDetails>({
    email: initialDetails?.email ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    borderColor: "var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
  };

  async function handleSave() {
    setError("");
    setSaved(false);

    if (method === "bank_transfer") {
      if (!bank.account_holder || !bank.account_number || !bank.ifsc) {
        setError("Please fill in all bank details.");
        return;
      }
    } else if (!emailDetails.email) {
      setError(`Please enter your ${method === "paypal" ? "PayPal" : "Wise"} email.`);
      return;
    }

    setSaving(true);

    const payout_details = method === "bank_transfer" ? bank : emailDetails;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ payout_method: method, payout_details })
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div
      className="rounded-2xl border p-5 sm:p-8 flex flex-col gap-6"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
          Payout details
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Where we send your earnings when a client&apos;s payment is released.
        </p>
      </div>

      {!isIndia && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod("paypal")}
            className="rounded-xl border p-3 text-sm font-medium transition"
            style={
              method === "paypal"
                ? { borderColor: "var(--yellow)", background: "var(--surface-yellow)", color: "var(--ink)" }
                : { borderColor: "var(--line)", background: "var(--surface)", color: "var(--ink-soft)" }
            }
          >
            PayPal
          </button>
          <button
            type="button"
            onClick={() => setMethod("wise")}
            className="rounded-xl border p-3 text-sm font-medium transition"
            style={
              method === "wise"
                ? { borderColor: "var(--yellow)", background: "var(--surface-yellow)", color: "var(--ink)" }
                : { borderColor: "var(--line)", background: "var(--surface)", color: "var(--ink-soft)" }
            }
          >
            Wise
          </button>
        </div>
      )}

      {method === "bank_transfer" ? (
        <div
          className="rounded-xl border p-4 flex flex-col gap-3"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--ink-faint)" }}
          >
            Bank Details
          </h3>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
              Account holder name
            </label>
            <input
              type="text"
              value={bank.account_holder}
              onChange={(e) => setBank({ ...bank, account_holder: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
              style={inputStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
                Account number
              </label>
              <input
                type="text"
                value={bank.account_number}
                onChange={(e) => setBank({ ...bank, account_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
                IFSC code
              </label>
              <input
                type="text"
                value={bank.ifsc}
                onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            {method === "paypal" ? "PayPal email" : "Wise email"}
          </label>
          <input
            type="email"
            value={emailDetails.email}
            onChange={(e) => setEmailDetails({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
            style={inputStyle}
          />
        </div>
      )}

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--yellow)", color: "var(--ink)" }}
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        {saved && <Check size={16} />}
        {saving ? "Saving..." : saved ? "Saved" : "Save payout details"}
      </button>
    </div>
  );
}
