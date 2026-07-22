import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Second layer on top of the regex check in src/lib/contentModeration.ts and the
// Postgres trigger — catches obfuscated attempts a pattern match would miss
// (spelled-out numbers, "at"/"dot" instead of @/., social handles, vague requests
// to "finish this privately", etc.). Fails open on any API error so an OpenAI
// outage never blocks ordinary messages/proposals from sending.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await request.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ flagged: false });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ flagged: false });
  }

  const prompt = `You are a content moderator for a freelance marketplace. Clients and freelancers must keep all contact and payment arrangements on-platform. Decide if the message below is trying to share contact information or move the conversation/payment off-platform — including disguised or obfuscated attempts (e.g. spelling out a phone number in words, writing an email as "name at gmail dot com", sharing a social media handle or username to be contacted on, or vaguely asking to "continue this elsewhere" or "finish the deal privately").

Do NOT flag ordinary freelance conversation — discussing skills, experience, portfolios in general terms, project scope, pricing on the platform, deadlines, or technology names (e.g. "Node.js", "React").

Message:
"""
${text}
"""

Respond with ONLY a JSON object, no other text: {"flagged": true or false, "reason": "short reason if flagged, else empty string"}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ flagged: false });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      flagged: !!parsed.flagged,
      reason: typeof parsed.reason === "string" ? parsed.reason : "",
    });
  } catch {
    return NextResponse.json({ flagged: false });
  }
}
