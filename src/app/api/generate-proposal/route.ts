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
    .select("title, description, skills")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

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

  const prompt = `You are writing a short, professional freelance job proposal on behalf of a freelancer, addressed to a client. Output ONLY the proposal text — no preamble, no markdown, no quotation marks around it.

JOB
Title: ${project.title}
Description: ${project.description}
Required skills: ${(project.skills ?? []).join(", ") || "Not specified"}

FREELANCER
Name: ${profile?.full_name || "the freelancer"}
Bio: ${profile?.bio || "Not provided"}
Skills: ${(profile?.skills ?? []).join(", ") || "Not specified"}
Portfolio projects:
${portfolioSummary}

Write a 3-5 sentence proposal in first person as the freelancer. Reference specific relevant skills and, if relevant, one matching portfolio project by name. Keep it confident and specific, free of generic filler like "I am a hard worker." End with a brief call to action to discuss next steps.`;

  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
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