import type { SupabaseClient } from "@supabase/supabase-js";

type VerificationResult = {
  status: "verified" | "pending" | "unverified";
  score: number;
  summary: string;
  checklist: {
    emailVerified: boolean;
    idUploaded: boolean;
    paymentVerified: boolean;
    profileComplete: boolean;
  };
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

export async function computeVerification(
  supabase: SupabaseClient,
  userId: string
): Promise<VerificationResult> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, bio, avatar_url, skills, company_name, business_email_verified, id_document_url")
    .eq("id", userId)
    .single();

  if (!profile) {
    return {
      status: "unverified",
      score: 0,
      summary: "Profile not found.",
      checklist: { emailVerified: false, idUploaded: false, paymentVerified: false, profileComplete: false },
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

  const requiredFields =
    profile.role === "freelancer"
      ? [profile.full_name, profile.bio, profile.avatar_url, profile.skills?.length ? "x" : null]
      : [profile.full_name, profile.bio, profile.avatar_url, profile.company_name];
  const filledCount = requiredFields.filter(Boolean).length;
  const profileComplete = filledCount === requiredFields.length;

  const checklist = { emailVerified, idUploaded, paymentVerified, profileComplete };
  const passedCount = Object.values(checklist).filter(Boolean).length;
  const score = Math.round((passedCount / 4) * 100);

  const status: VerificationResult["status"] = score === 100 ? "verified" : score >= 60 ? "pending" : "unverified";

  const summaryPrompt = `Write ONE short, plain-language sentence (under 20 words) summarizing this ${profile.role}'s verification state for a freelance marketplace. Be factual, no fluff.

Email verified: ${emailVerified}
ID document uploaded: ${idUploaded}
Payment verified: ${paymentVerified}
Profile complete: ${profileComplete}
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

  return { status, score, summary, checklist };
}