import type { SupabaseClient } from "@supabase/supabase-js";

type Checklist = {
  emailVerified: boolean;
  idUploaded: boolean;
  paymentVerified: boolean;
  profileComplete: boolean;
};

type ChecklistResult = {
  checklist: Checklist;
  missingProfileFields: string[];
  score: number;
};

type VerificationResult = {
  status: "verified" | "pending" | "unverified";
  score: number;
  summary: string;
  checklist: Checklist;
  missingProfileFields: string[];
};

async function callOpenAI(prompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });
  if (!res.ok) return "";
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// Cheap, side-effect-free checklist computation — safe to call on every page load
// (no OpenAI call, no DB write). Used for display; computeVerification below wraps
// this with the AI summary + DB write for the explicit "Run verification check" flow.
export async function getVerificationChecklist(
  supabase: SupabaseClient,
  userId: string
): Promise<ChecklistResult> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, bio, avatar_url, skills, company_name, business_email_verified, id_document_url")
    .eq("id", userId)
    .single();

  if (!profile) {
    return {
      checklist: { emailVerified: false, idUploaded: false, paymentVerified: false, profileComplete: false },
      missingProfileFields: [],
      score: 0,
    };
  }

  const { data: emailConfirmed } = await supabase.rpc("is_account_email_confirmed", { p_user_id: userId });

  const emailVerified = !!emailConfirmed || (profile.role === "client" && profile.business_email_verified);
  const idUploaded = !!profile.id_document_url;

  let paymentVerified = false;
  if (profile.role === "freelancer") {
    const { data: sub } = await supabase
      .from("profiles")
      .select("token_plan")
      .eq("id", userId)
      .single();
    paymentVerified = !!sub?.token_plan;
  } else {
    const { data: clientPayments } = await supabase
      .from("payments")
      .select("id, project:projects!inner(client_id)")
      .eq("type", "project")
      .eq("project.client_id", userId)
      .limit(1);
    paymentVerified = (clientPayments ?? []).length > 0;
  }

  const requiredFields: { label: string; value: unknown }[] =
    profile.role === "freelancer"
      ? [
          { label: "full name", value: profile.full_name },
          { label: "bio", value: profile.bio },
          { label: "profile photo", value: profile.avatar_url },
          { label: "at least one skill", value: profile.skills?.length ? "x" : null },
        ]
      : [
          { label: "full name", value: profile.full_name },
          { label: "bio", value: profile.bio },
          { label: "profile photo", value: profile.avatar_url },
          { label: "company name", value: profile.company_name },
        ];
  const missingProfileFields = requiredFields.filter((f) => !f.value).map((f) => f.label);
  const profileComplete = missingProfileFields.length === 0;

  const checklist = { emailVerified, idUploaded, paymentVerified, profileComplete };
  const passedCount = Object.values(checklist).filter(Boolean).length;
  const score = Math.round((passedCount / 4) * 100);

  return { checklist, missingProfileFields, score };
}

export async function computeVerification(
  supabase: SupabaseClient,
  userId: string
): Promise<VerificationResult> {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();

  if (!profile) {
    return {
      status: "unverified",
      score: 0,
      summary: "Profile not found.",
      checklist: { emailVerified: false, idUploaded: false, paymentVerified: false, profileComplete: false },
      missingProfileFields: [],
    };
  }

  const { checklist, missingProfileFields, score } = await getVerificationChecklist(supabase, userId);
  const passedCount = Object.values(checklist).filter(Boolean).length;

  const status: VerificationResult["status"] = score === 100 ? "verified" : score >= 60 ? "pending" : "unverified";

  const summaryPrompt = `Write ONE short, plain-language sentence (under 20 words) summarizing this ${profile.role}'s verification state for a freelance marketplace. Be factual, no fluff.

Email verified: ${checklist.emailVerified}
ID document uploaded: ${checklist.idUploaded}
Payment verified: ${checklist.paymentVerified}
Profile complete: ${checklist.profileComplete}
Overall score: ${score}/100`;

  const summary = (await callOpenAI(summaryPrompt)) || `${passedCount} of 4 verification checks passed.`;

  await supabase
    .from("profiles")
    .update({
      verification_status: status,
      verification_score: score,
      verification_summary: summary,
      verified_at: status === "verified" ? new Date().toISOString() : null,
    })
    .eq("id", userId);

  return { status, score, summary, checklist, missingProfileFields };
}
