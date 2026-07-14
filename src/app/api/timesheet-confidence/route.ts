import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeTimesheetConfidence } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entryId } = await request.json();
  if (!entryId) {
    return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
  }

  try {
    const result = await computeTimesheetConfidence(supabase, entryId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Confidence analysis failed" }, { status: 500 });
  }
}