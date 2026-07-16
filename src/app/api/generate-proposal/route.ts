import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanTier, planHasAIProposalWriting } from "@/lib/planFeatures";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await request.json();
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("bio, skills, full_name, token_plan")
    .eq("id", user.id)
    .single();

  const tier = getPlanTier(profile?.token_plan ?? null);
  if (!planHasAIProposalWriting(tier)) {
    return NextResponse.json(
      { error: "AI proposal writing is available on Pro and Elite plans." },
      { status: 403 }
    );
  }

  const { data: project } = await supabase
    .from("projects")
    .select("title, description, skills, budget_min, budget_max, rate_type, duration, weekly_commitment, client_id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const [{ data: portfolio }, { data: clientProfile }] = await Promise.all([
    supabase
      .from("portfolio_projects")
      .select("title, description, technologies, skills")
      .eq("freelancer_id", user.id),
    supabase.from("profiles").select("country").eq("id", project.client_id).single(),
  ]);

  const portfolioSummary =
    (portfolio ?? [])
      .map(
        (p, i) =>
          `${i + 1}. ${p.title} — ${p.description} (Technologies: ${(p.technologies ?? []).join(", ") || "Not specified"}; Skills: ${(p.skills ?? []).join(", ") || "Not specified"})`
      )
      .join("\n") || "No portfolio projects added yet.";

  const budget =
    project.rate_type === "range" && project.budget_min !== project.budget_max
      ? `$${project.budget_min} – $${project.budget_max}`
      : `$${project.budget_min}`;

  const prompt = `# ROLE
You are the world's best freelance proposal writer and business consultant. Your job is NOT to write a generic proposal — it's to deeply understand the client's requirements, analyze the freelancer's profile, and write a proposal that maximizes the chances of getting hired. It must read like it was written personally by an experienced professional, never like AI output, never from a generic template. Never mention AI.

# INPUTS

PROJECT
Title: ${project.title}
Description: ${project.description}
Required skills: ${(project.skills ?? []).join(", ") || "Not specified"}
Budget: ${budget}
Project type: ${project.rate_type === "range" ? "Range" : "Fixed Price"}
Duration: ${project.duration ?? "Not specified"}
Weekly commitment: ${project.weekly_commitment ?? "Not specified"}
Client country: ${clientProfile?.country ?? "Not specified"}

FREELANCER
Name: ${profile?.full_name || "the freelancer"}
Bio: ${profile?.bio || "Not provided"}
Skills: ${(profile?.skills ?? []).join(", ") || "Not specified"}
Portfolio projects:
${portfolioSummary}

# ANALYSIS PROCESS (do this internally, do not output it)
1. Understand what the client REALLY wants: the underlying business problem, technical problem, expected outcome, hidden requirements, likely challenges, and urgency level — read between the lines of the description, don't just restate it.
2. Compare every required skill against the freelancer's skills and bio to gauge real fit — don't claim expertise that isn't supported by the freelancer's actual skills/bio/portfolio.
3. Rank the portfolio projects by relevance to this specific job. Use only the 2-3 most relevant ones, woven in naturally. Never force an irrelevant project in just to have something to say.
4. Infer the client's likely priorities from the description (speed, quality, communication, budget, technical depth, long-term relationship) and adjust tone/emphasis accordingly.

# WRITING RULES
- Sound completely human — vary sentence length, use natural contractions, never sound robotic or like a template.
- Never open with generic AI phrases like "I am excited," "I can do this," "I am perfect for this," or "I have read your project."
- Do not exaggerate or promise impossible timelines. Do not copy phrases from the project description back verbatim — paraphrase to show genuine understanding instead.
- Only reference skills, experience, or portfolio work that are actually present in the FREELANCER inputs above. Never invent credentials, years of experience, or projects that weren't given to you.

# STRUCTURE
- **Greeting** — short and natural (e.g. "Hi there,").
- **Opening** — start by showing genuine understanding of the client's goal, not by introducing the freelancer immediately.
- **Understanding** — briefly show what you understood: expected deliverables, and any risks worth flagging.
- **Why I'm a good fit** — relevant experience, technologies, and domain knowledge, grounded only in the FREELANCER inputs.
- **Relevant work** — mention 2-3 portfolio projects naturally, only if genuinely relevant.
- **Approach** — a short, concrete plan (a few bullet points is fine).
- **Value addition** — one useful thing the client didn't explicitly ask for (e.g. documentation, scalability, a UX improvement) — only if it's a natural, honest fit, not a forced upsell.
- **Questions** — 2-3 genuinely useful questions, only for information that's actually missing from the description. Never ask something already answered above.
- **Closing** — confident, low-pressure call to action, sign off with the freelancer's name.

# FORMATTING
Use clear paragraph spacing. Use short headings or bold only where it genuinely helps scannability (e.g. before the approach bullets). Use bullet points for the approach/questions. Do not over-format — it should read like a well-written email, not a slide deck.

# LENGTH
Medium length: enough to be substantive and specific, not a wall of text. Roughly 200-350 words.

# OUTPUT
Return ONLY the final proposal text. No preamble, no analysis notes, no markdown code fences, no explanation of what you did — just the proposal itself, ready to send.`;

  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 1200,
    }),
  });

  if (!openaiResponse.ok) {
    const errText = await openaiResponse.text();
    console.error("OpenAI error:", errText);
    return NextResponse.json({ error: "AI proposal generation failed" }, { status: 500 });
  }

  const data = await openaiResponse.json();
  const proposal = data.choices?.[0]?.message?.content?.trim() ?? "";

  return NextResponse.json({ proposal });
}
