import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // 1. Return cached score if we already computed it
  const { data: cached } = await supabase
    .from("match_scores")
    .select("score, reason")
    .eq("project_id", projectId)
    .eq("freelancer_id", user.id)
    .single();

  if (cached) {
    return NextResponse.json(cached);
  }

  // 2. Fetch the job details
  const { data: project } = await supabase
    .from("projects")
    .select("title, description, skills")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // 3. Fetch the freelancer's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("bio, skills")
    .eq("id", user.id)
    .single();

  // 4. Fetch the freelancer's portfolio
  const { data: portfolio } = await supabase
    .from("portfolio_projects")
    .select("title, description, technologies, skills")
    .eq("freelancer_id", user.id);

  const portfolioSummary =
    (portfolio ?? [])
      .map(
        (p, i) =>
          `${i + 1}. ${p.title} — ${p.description} (Tech: ${(p.technologies ?? []).join(", ")}; Skills: ${(p.skills ?? []).join(", ")})`
      )
      .join("\n") || "No portfolio projects added yet.";

  const prompt = `You are a hiring-fit analysis engine for a freelance marketplace. Compare the JOB with the FREELANCER's profile and portfolio, and output ONLY valid JSON in this exact shape: {"score": <integer 0-100>, "reason": "<one plain-language sentence, under 25 words, explaining the match>"}.

JOB
Title: ${project.title}
Description: ${project.description}
Required skills: ${(project.skills ?? []).join(", ") || "Not specified"}

FREELANCER
Bio: ${profile?.bio || "Not provided"}
Skills: ${(profile?.skills ?? []).join(", ") || "Not specified"}
Portfolio projects:
${portfolioSummary}

Score based on overlap between required skills and the freelancer's skills/bio/portfolio, and relevance of past portfolio work to this job. Be honest — a poor fit should score low, not just default to a mid-range number.`;

  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!openaiResponse.ok) {
    const errText = await openaiResponse.text();
    console.error("OpenAI error:", errText);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }

  const openaiData = await openaiResponse.json();
  const content = openaiData.choices?.[0]?.message?.content ?? "{}";

  let parsed: { score: number; reason: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));
  const reason = parsed.reason ?? "No explanation provided.";

  // 5. Cache it so we never re-call OpenAI for this pairing again
  await supabase.from("match_scores").insert({
    project_id: projectId,
    freelancer_id: user.id,
    score,
    reason,
  });

  return NextResponse.json({ score, reason });
}