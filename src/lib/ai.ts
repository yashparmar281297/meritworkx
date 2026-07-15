import type { SupabaseClient } from "@supabase/supabase-js";
import AdmZip from "adm-zip";

async function callOpenAI(prompt: string, temperature = 0.3, jsonMode = false) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: prompt }],
      temperature,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenAI error:", text);
    throw new Error("AI request failed");
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function getPortfolioSummary(supabase: SupabaseClient, freelancerId: string) {
  const { data: portfolio } = await supabase
    .from("portfolio_projects")
    .select("title, description, technologies, skills")
    .eq("freelancer_id", freelancerId);

  return (
    (portfolio ?? [])
      .map(
        (p, i) =>
          `${i + 1}. ${p.title} — ${p.description} (Tech: ${(p.technologies ?? []).join(", ")}; Skills: ${(p.skills ?? []).join(", ")})`
      )
      .join("\n") || "No portfolio projects added yet."
  );
}

export async function getOrComputeMatchScore(
  supabase: SupabaseClient,
  projectId: string,
  freelancerId: string
): Promise<{ score: number; reason: string }> {
  const { data: cached } = await supabase
    .from("match_scores")
    .select("score, reason")
    .eq("project_id", projectId)
    .eq("freelancer_id", freelancerId)
    .maybeSingle();

  if (cached) return cached;

  const { data: project } = await supabase
    .from("projects")
    .select("title, description, skills")
    .eq("id", projectId)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("bio, skills")
    .eq("id", freelancerId)
    .single();

  const portfolioSummary = await getPortfolioSummary(supabase, freelancerId);

  const prompt = `You are a hiring-fit analysis engine for a freelance marketplace. Compare the JOB with the FREELANCER's profile and portfolio, and output ONLY valid JSON in this exact shape: {"score": <integer 0-100>, "reason": "<one plain-language sentence, under 25 words, explaining the match>"}.

JOB
Title: ${project?.title}
Description: ${project?.description}
Required skills: ${(project?.skills ?? []).join(", ") || "Not specified"}

FREELANCER
Bio: ${profile?.bio || "Not provided"}
Skills: ${(profile?.skills ?? []).join(", ") || "Not specified"}
Portfolio projects:
${portfolioSummary}

Score based on overlap between required skills and the freelancer's skills/bio/portfolio, and relevance of past portfolio work to this job. Be honest — a poor fit should score low, not just default to a mid-range number.`;

  const content = await callOpenAI(prompt, 0.3);

  let parsed: { score: number; reason: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { score: 0, reason: "Could not analyze this match." };
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));
  const reason = parsed.reason ?? "No explanation provided.";

  await supabase.from("match_scores").insert({
    project_id: projectId,
    freelancer_id: freelancerId,
    score,
    reason,
  });

  return { score, reason };
}

export type FitGapPoint = { title: string; explanation: string };
export type FitGapResult = { fit: FitGapPoint[]; gap: FitGapPoint[] };

export async function getOrComputeFitGapAnalysis(
  supabase: SupabaseClient,
  projectId: string,
  freelancerId: string
): Promise<FitGapResult> {
  const { data: cached } = await supabase
    .from("fit_gap_analyses")
    .select("analysis")
    .eq("project_id", projectId)
    .eq("freelancer_id", freelancerId)
    .maybeSingle();

  if (cached && cached.analysis && (cached.analysis.fit || cached.analysis.gap)) {
    return { fit: cached.analysis.fit ?? [], gap: cached.analysis.gap ?? [] };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("title, description, skills")
    .eq("id", projectId)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("bio, skills")
    .eq("id", freelancerId)
    .single();

  const portfolioSummary = await getPortfolioSummary(supabase, freelancerId);

  const prompt = `You are a hiring-fit advisor helping a client evaluate a freelancer's proposal. Compare the JOB with the FREELANCER's profile and portfolio.

Output ONLY valid JSON in this exact shape: {"fit": [{"title": "short heading", "explanation": "one sentence, under 20 words"}], "gap": [{"title": "short heading", "explanation": "one sentence, under 20 words"}]}.

Include up to 5 specific, genuine points in each array based on real overlap and gaps between the JOB's requirements and the FREELANCER's bio, skills, and portfolio projects. If there are fewer than 5 truthful points for either array, include only as many as are honest — never pad with generic filler.

JOB
Title: ${project?.title}
Description: ${project?.description}
Required skills: ${(project?.skills ?? []).join(", ") || "Not specified"}

FREELANCER
Bio: ${profile?.bio || "Not provided"}
Skills: ${(profile?.skills ?? []).join(", ") || "Not specified"}
Portfolio projects:
${portfolioSummary}`;

  const content = await callOpenAI(prompt, 0.3, true);

  let parsed: FitGapResult;
  try {
    const raw = JSON.parse(content);
    parsed = { fit: raw.fit ?? [], gap: raw.gap ?? [] };
  } catch {
    parsed = { fit: [], gap: [] };
  }

  await supabase.from("fit_gap_analyses").insert({
    project_id: projectId,
    freelancer_id: freelancerId,
    analysis: parsed,
  });

  return parsed;
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
const OFFICE_EXTENSIONS = ["pdf", "docx", "xlsx", "xls", "pptx", "odt", "ods", "odp"];
const PLAIN_TEXT_EXTENSIONS = [
  "txt", "md", "log", "json", "xml", "yaml", "yml", "csv",
  "html", "htm", "css", "js", "jsx", "ts", "tsx", "php", "sql",
  "py", "java", "c", "cpp", "cs", "rb", "go", "rs", "sh", "env",
];
const MAX_CONTENT_CHARS = 8000;

async function downloadBuffer(fileUrl: string): Promise<Buffer | null> {
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      console.error("downloadBuffer: fetch failed with status", res.status, fileUrl);
      return null;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error("downloadBuffer: error", err);
    return null;
  }
}

async function extractOfficeText(buffer: Buffer): Promise<string | null> {
  try {
    const officeParser = await import("officeparser");
    // `fileType` is not a real OfficeParserConfig option — the package auto-detects
    // format from the buffer's own magic bytes. `ocr: true` is the important part:
    // without it, scanned pages and image-based content are silently skipped,
    // producing a near-empty extraction even though the file clearly has content.
    const ast = await officeParser.parseOffice(buffer, { ocr: true });
    const text = typeof ast.toText === "function" ? ast.toText() : String(ast);
    return text?.trim().slice(0, MAX_CONTENT_CHARS) || null;
  } catch (err) {
    console.error("extractOfficeText failed:", err);
    return null;
  }
}

function extractPlainText(buffer: Buffer): string | null {
  try {
    const text = buffer.toString("utf-8");
    return text.trim().slice(0, MAX_CONTENT_CHARS) || null;
  } catch (err) {
    console.error("extractPlainText failed:", err);
    return null;
  }
}

function extractZipSummary(buffer: Buffer): string | null {
  try {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries().filter((e) => !e.isDirectory);

    const fileList = entries.map((e) => e.entryName).slice(0, 100).join("\n");

    let contentDump = "";
    let remaining = MAX_CONTENT_CHARS;

    for (const entry of entries) {
      if (remaining <= 0) break;
      const ext = entry.entryName.split(".").pop()?.toLowerCase() ?? "";
      if (!PLAIN_TEXT_EXTENSIONS.includes(ext)) continue;
      if (entry.entryName.includes("node_modules/") || entry.entryName.includes(".git/")) continue;

      const entryContent = entry.getData().toString("utf-8").slice(0, 1500);
      const chunk = `\n--- ${entry.entryName} ---\n${entryContent}\n`;
      contentDump += chunk.slice(0, remaining);
      remaining -= chunk.length;
    }

    return `FILE LIST:\n${fileList}\n\nSAMPLE FILE CONTENTS:${contentDump || "\n(no readable text files found in archive)"}`.slice(
      0,
      MAX_CONTENT_CHARS
    );
  } catch (err) {
    console.error("extractZipSummary failed:", err);
    return null;
  }
}

async function extractFileContent(fileUrl: string, fileName: string): Promise<string | null> {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const buffer = await downloadBuffer(fileUrl);
  if (!buffer) return null;

  if (OFFICE_EXTENSIONS.includes(extension)) {
    return extractOfficeText(buffer);
  }
  if (extension === "zip") {
    return extractZipSummary(buffer);
  }
  if (PLAIN_TEXT_EXTENSIONS.includes(extension)) {
    return extractPlainText(buffer);
  }
  return null;
}

export async function computeTimesheetConfidence(
  supabase: SupabaseClient,
  entryId: string
): Promise<{ score: number; reason: string }> {
  const { data: entry, error: entryError } = await supabase
    .from("timesheet_entries")
    .select("id, conversation_id, freelancer_id, description, hours, file_url, file_name, entry_date")
    .eq("id", entryId)
    .single();

  if (entryError) {
    console.error("computeTimesheetConfidence: could not fetch entry:", entryError);
  }
  if (!entry) return { score: 0, reason: "Entry not found." };

  const { data: pastEntriesRaw } = await supabase
    .from("timesheet_entries")
    .select("description, hours, confidence_score")
    .eq("conversation_id", entry.conversation_id)
    .eq("freelancer_id", entry.freelancer_id)
    .neq("id", entryId)
    .order("created_at", { ascending: false })
    .limit(10);

  const pastEntries = pastEntriesRaw ?? [];
  const historySummary =
    pastEntries.length > 0
      ? pastEntries
          .map(
            (p, i) =>
              `${i + 1}. "${p.description}" — ${p.hours} hrs${p.confidence_score != null ? ` (past confidence: ${p.confidence_score}%)` : ""}`
          )
          .join("\n")
      : "No prior entries yet — this is the freelancer's first logged entry on this project.";

  const extension = entry.file_name?.split(".").pop()?.toLowerCase() ?? "";
  const isImage = IMAGE_EXTENSIONS.includes(extension);

  let evidenceNote = "No file was attached to this entry.";
  let extractedContent: string | null = null;

  if (isImage && entry.file_url) {
    evidenceNote = "An image was attached — inspect it directly below and compare it to the description.";
  } else if (entry.file_url && entry.file_name) {
    extractedContent = await extractFileContent(entry.file_url, entry.file_name);
    if (extractedContent) {
      const wordCount = extractedContent.split(/\s+/).filter(Boolean).length;
      evidenceNote = `A file ("${entry.file_name}") was attached and its actual content is included below — compare it directly against the description. The extracted content is approximately ${wordCount} words long.`;
    } else {
      evidenceNote = `A file ("${entry.file_name}") was attached but its content could not be extracted. Treat this as weak, unverifiable evidence.`;
    }
  }

  const promptText = `You are evaluating a freelancer's daily timesheet entry for honesty and consistency, on behalf of the client who is paying for this time. Be a skeptical, careful auditor — do not default to a moderate score when you lack real evidence or when things don't match.

NEW ENTRY
Description: "${entry.description}"
Claimed hours: ${entry.hours}
Evidence: ${evidenceNote}
${extractedContent ? `\nEXTRACTED FILE CONTENT:\n${extractedContent}\n` : ""}

THIS FREELANCER'S PAST ENTRIES ON THIS SAME PROJECT (most recent first)
${historySummary}

Output ONLY valid JSON in this exact shape: {"score": <integer 0-100>, "reason": "<one plain-language sentence, under 25 words>"}.

Scoring rules — follow these strictly:
- Topic match is NECESSARY but NOT SUFFICIENT for a high score. You must ALSO judge whether the claimed hours are a PLAUSIBLE amount of time for the actual amount and complexity of work shown in the evidence.
- Use your own general knowledge of how long this kind of task typically takes (e.g. writing a short 1-2 page plan or document is normally well under an hour of focused work, not several hours; a large multi-section report with deep research/data can legitimately take much longer). Weigh the extracted word count and apparent depth/complexity against the claimed hours.
- If the topic matches but the claimed hours are clearly excessive for the amount/complexity of work shown (e.g. a short, simple document claimed to take many hours with no other described activity like meetings, research, or revisions), score MODERATE (50-70), not high — and say so explicitly in the reason (e.g. "content matches but the claimed hours seem high for a document this length").
- If the attached file's actual content (image or extracted text) clearly relates to a DIFFERENT topic than the description claims, score LOW (below 35) regardless of hours, and say so explicitly.
- Only score HIGH (80+) when the topic clearly matches AND the claimed hours are reasonably proportionate to the complexity/length of the actual evidence.
- If there is no attached file, or the file type couldn't be read (evidence is "unverifiable"), you cannot confirm the work — score in the 40-60 range at most, and say the score reflects lack of verifiable evidence.
- Consistency with past entries only INCREASES a score that evidence already supports — it should never excuse a clear content mismatch or an implausible time claim.
- Never default to a "safe" middle score like 65-70 just because you're unsure; reason explicitly about topic match AND hour plausibility every time, and let the score reflect both.`;

  const content: Array<Record<string, unknown>> = [{ type: "text", text: promptText }];

  if (isImage && entry.file_url) {
    content.push({ type: "image_url", image_url: { url: entry.file_url } });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenAI error (timesheet confidence):", text);
    return { score: 0, reason: "Could not analyze this entry." };
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";

  let parsed: { score: number; reason: string };
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("computeTimesheetConfidence: could not parse AI JSON:", raw, err);
    parsed = { score: 0, reason: "Could not analyze this entry." };
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));
  const reason = parsed.reason ?? "No explanation provided.";

  const { error: updateError } = await supabase
    .from("timesheet_entries")
    .update({ confidence_score: score, confidence_reason: reason })
    .eq("id", entryId);

  if (updateError) {
    console.error("computeTimesheetConfidence: could not save score to DB:", updateError);
  }

  return { score, reason };
}


export type ProposalRankEntry = {
  proposalId: string;
  freelancerName: string;
  score: number;
  rank: number;
  isBestMatch: boolean;
};

export async function getOrComputeProposalRankings(
  supabase: SupabaseClient,
  projectId: string
): Promise<Record<string, { rank: number; isBestMatch: boolean }>> {
  const { data: cached } = await supabase
    .from("proposal_rankings")
    .select("rankings")
    .eq("project_id", projectId)
    .maybeSingle();

  if (cached) return cached.rankings as Record<string, { rank: number; isBestMatch: boolean }>;

  const { data: project } = await supabase
    .from("projects")
    .select("title, description, skills")
    .eq("id", projectId)
    .single();

  const { data: proposalsRaw } = await supabase
    .from("proposals")
    .select("id, freelancer:profiles(id, full_name, bio, skills)")
    .eq("project_id", projectId);

  const proposals = (proposalsRaw ?? [])
    .map((p) => ({
      id: p.id,
      freelancer: Array.isArray(p.freelancer) ? p.freelancer[0] ?? null : p.freelancer,
    }))
    .filter((p) => p.freelancer);

  if (proposals.length === 0) return {};

  // Get each freelancer's score + fit/gap (already cached from earlier features)
  const enriched = await Promise.all(
    proposals.map(async (p) => {
      const freelancerId = p.freelancer!.id;
      const { score } = await getOrComputeMatchScore(supabase, projectId, freelancerId);
      const { fit, gap } = await getOrComputeFitGapAnalysis(supabase, projectId, freelancerId);
      const portfolioSummary = await getPortfolioSummary(supabase, freelancerId);
      return {
        proposalId: p.id,
        freelancerId,
        name: p.freelancer!.full_name,
        score,
        fit,
        gap,
        skills: p.freelancer!.skills ?? [],
        portfolioSummary,
      };
    })
  );

  // Group by score
  const byScore = new Map<number, typeof enriched>();
  for (const e of enriched) {
    const group = byScore.get(e.score) ?? [];
    group.push(e);
    byScore.set(e.score, group);
  }

  const sortedScores = Array.from(byScore.keys()).sort((a, b) => b - a);
  const finalOrder: typeof enriched = [];

  for (const score of sortedScores) {
    const group = byScore.get(score)!;

    if (group.length === 1) {
      finalOrder.push(group[0]);
      continue;
    }

    // Tie-break this group with AI, using fit/gap detail as the deciding evidence
    const candidatesText = group
      .map(
        (c, i) =>
          `Candidate ${i + 1} (id: ${c.proposalId}): ${c.name}
Skills: ${c.skills.join(", ") || "Not specified"}
Fit points: ${c.fit.map((f) => `${f.title} — ${f.explanation}`).join("; ") || "None"}
Gap points: ${c.gap.map((g) => `${g.title} — ${g.explanation}`).join("; ") || "None"}
Portfolio: ${c.portfolioSummary}`
      )
      .join("\n\n");

    const tieBreakPrompt = `Multiple freelancer candidates have the exact same AI match score (${score}) for this job. Rank them from best to worst fit using their fit/gap analysis and portfolio as the deciding evidence — even small differences in relevant experience or gaps should break the tie.

JOB
Title: ${project?.title}
Description: ${project?.description}
Required skills: ${(project?.skills ?? []).join(", ") || "Not specified"}

CANDIDATES
${candidatesText}

Output ONLY valid JSON in this exact shape: {"order": ["<proposalId in best-to-worst order>", ...]}. Include every candidate id exactly once.`;

    const content = await callOpenAI(tieBreakPrompt, 0.2, true);

    let orderedIds: string[] = group.map((c) => c.proposalId);
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.order) && parsed.order.length === group.length) {
        orderedIds = parsed.order;
      }
    } catch {
      // fall back to original order if parsing fails
    }

    for (const id of orderedIds) {
      const found = group.find((c) => c.proposalId === id);
      if (found) finalOrder.push(found);
    }
  }

  // Assign ranks: same score group shares rank numbering that continues sequentially
  const rankings: Record<string, { rank: number; isBestMatch: boolean }> = {};
  finalOrder.forEach((entry, index) => {
    rankings[entry.proposalId] = {
      rank: index + 1,
      isBestMatch: index === 0,
    };
  });

  await supabase.from("proposal_rankings").insert({
    project_id: projectId,
    rankings,
  });

  return rankings;
}
// const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

// async function extractPdfText(fileUrl: string): Promise<string | null> {
//   try {
//     const res = await fetch(fileUrl);
//     if (!res.ok) return null;
//     const buffer = Buffer.from(await res.arrayBuffer());

//     const pdfParse = (await import("pdf-parse")).default;
//     const parsed = await pdfParse(buffer);

//     return parsed.text.trim().slice(0, 6000) || null;
//   } catch (err) {
//     console.error("PDF extraction failed:", err);
//     return null;
//   }
// }

// export async function computeTimesheetConfidence(
//   supabase: SupabaseClient,
//   entryId: string
// ): Promise<{ score: number; reason: string }> {
//   const { data: entry } = await supabase
//     .from("timesheet_entries")
//     .select("id, conversation_id, freelancer_id, description, hours, file_url, file_name, entry_date")
//     .eq("id", entryId)
//     .single();

//   if (!entry) return { score: 0, reason: "Entry not found." };

//   const { data: pastEntriesRaw } = await supabase
//     .from("timesheet_entries")
//     .select("description, hours, confidence_score")
//     .eq("conversation_id", entry.conversation_id)
//     .eq("freelancer_id", entry.freelancer_id)
//     .neq("id", entryId)
//     .order("created_at", { ascending: false })
//     .limit(10);

//   const pastEntries = pastEntriesRaw ?? [];
//   const historySummary =
//     pastEntries.length > 0
//       ? pastEntries
//           .map(
//             (p, i) =>
//               `${i + 1}. "${p.description}" — ${p.hours} hrs${p.confidence_score != null ? ` (past confidence: ${p.confidence_score}%)` : ""}`
//           )
//           .join("\n")
//       : "No prior entries yet — this is the freelancer's first logged entry on this project.";

//   const extension = entry.file_name?.split(".").pop()?.toLowerCase() ?? "";
//   const isImage = IMAGE_EXTENSIONS.includes(extension);
//   const isPdf = extension === "pdf";

//   let evidenceNote = "No file was attached to this entry.";
//   let pdfText: string | null = null;

//   if (isImage && entry.file_url) {
//     evidenceNote = "An image was attached — inspect it directly below and compare it to the description.";
//   } else if (isPdf && entry.file_url) {
//     pdfText = await extractPdfText(entry.file_url);
//     evidenceNote = pdfText
//       ? "A PDF was attached and its text content is included below — compare it directly against the description."
//       : "A PDF was attached but its text could not be extracted (may be scanned/image-based). Treat this as unverifiable evidence.";
//   } else if (entry.file_name) {
//     evidenceNote = `A file named "${entry.file_name}" was attached, but this file type cannot be opened or read — you only know its name, not its actual content. Treat this as weak, unverifiable evidence.`;
//   }

//   const promptText = `You are evaluating a freelancer's daily timesheet entry for honesty and consistency, on behalf of the client who is paying for this time. Be a skeptical, careful auditor — do not default to a moderate score when you lack real evidence or when things don't match.

// NEW ENTRY
// Description: "${entry.description}"
// Claimed hours: ${entry.hours}
// Evidence: ${evidenceNote}
// ${pdfText ? `\nPDF CONTENT (extracted text):\n${pdfText}\n` : ""}

// THIS FREELANCER'S PAST ENTRIES ON THIS SAME PROJECT (most recent first)
// ${historySummary}

// Output ONLY valid JSON in this exact shape: {"score": <integer 0-100>, "reason": "<one plain-language sentence, under 25 words>"}.

// Scoring rules — follow these strictly:
// - If the attached file's actual content (image or extracted PDF text) clearly relates to a DIFFERENT topic than the description claims, score LOW (below 35) and say so explicitly in the reason — a topic mismatch is a strong red flag, not a minor issue.
// - If the file's content clearly and specifically supports the description, score HIGH (80+).
// - If there is no attached file, or the file type couldn't be read (evidence is "unverifiable"), you cannot confirm the work — score in the 40-60 range at most, and say the score reflects lack of verifiable evidence, not confirmation.
// - Consistency with past entries only INCREASES a score that evidence already supports — it should never be used to excuse a clear content mismatch.
// - Never default to a "safe" middle score like 65-70 just because you're unsure; if unsure due to missing evidence, say so and score accordingly (40-60), and if there's a clear mismatch, score low.`;

//   const content: Array<Record<string, unknown>> = [{ type: "text", text: promptText }];

//   if (isImage && entry.file_url) {
//     content.push({ type: "image_url", image_url: { url: entry.file_url } });
//   }

//   const res = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-5.4-mini",
//       messages: [{ role: "user", content }],
//       temperature: 0.2,
//       response_format: { type: "json_object" },
//     }),
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     console.error("OpenAI error (timesheet confidence):", text);
//     return { score: 0, reason: "Could not analyze this entry." };
//   }

//   const data = await res.json();
//   const raw = data.choices?.[0]?.message?.content ?? "{}";

//   let parsed: { score: number; reason: string };
//   try {
//     parsed = JSON.parse(raw);
//   } catch {
//     parsed = { score: 0, reason: "Could not analyze this entry." };
//   }

//   const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));
//   const reason = parsed.reason ?? "No explanation provided.";

//   await supabase
//     .from("timesheet_entries")
//     .update({ confidence_score: score, confidence_reason: reason })
//     .eq("id", entryId);

//   return { score, reason };
// }