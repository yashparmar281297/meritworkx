import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/dashboard/SettingsForm";
import VerificationPanel from "@/components/dashboard/VerificationPanel";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import PayoutDetailsForm from "@/components/dashboard/PayoutDetailsForm";
import BackButton from "@/components/dashboard/BackButton";
import { getVerificationChecklist } from "@/lib/verification";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

 const { data: profile } = await supabase
  .from("profiles")
  .select(
    "full_name, email, company_name, bio, avatar_url, id_document_url, notifications_enabled, role, skills, verification_status, verification_score, verification_summary, business_email_verified, country, city, token_plan, subscription_expires_at, subscription_cancel_requested, payout_method, payout_details"
  )
  .eq("id", user.id)
  .single();

  const { checklist, missingProfileFields, score } = await getVerificationChecklist(supabase, user.id);
  const status = score === 100 ? "verified" : score >= 60 ? "pending" : "unverified";

  return (
  <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
    <BackButton />
    <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
      Profile settings
    </h1>
      <p className="text-sm mb-8" style={{ color: "var(--ink-soft)" }}>
        Manage your account information and preferences.
      </p>

      <div className="flex flex-col gap-6">
  <SettingsForm userId={user.id} initialProfile={profile} />
  {profile?.role === "freelancer" && (
    <SubscriptionCard
      currentPlan={profile?.token_plan ?? null}
      expiresAt={profile?.subscription_expires_at ?? null}
      cancelRequested={profile?.subscription_cancel_requested ?? false}
      plans={[
        {
          key: "Pro",
          price: "₹499/month",
          features: ["15 tokens per month", "AI match score on every job", "AI proposal writing"],
        },
        {
          key: "Elite",
          price: "₹1,199/month",
          features: [
            "40 tokens per month",
            "AI match score on every job",
            "AI proposal writing",
            "AI fit and gap analysis on every match",
          ],
        },
      ]}
    />
  )}
  {profile?.role === "freelancer" && (
    <PayoutDetailsForm
      isIndia={profile?.country === "India"}
      initialMethod={profile?.payout_method ?? null}
      initialDetails={profile?.payout_details ?? null}
    />
  )}
  <VerificationPanel
    role={profile?.role ?? "freelancer"}
    initialStatus={status}
    initialScore={score}
    initialSummary={profile?.verification_summary ?? null}
    initialBusinessEmailVerified={profile?.business_email_verified ?? false}
    initialChecklist={checklist}
    initialMissingProfileFields={missingProfileFields}
  />
</div>
    </div>
  );
}