import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanTier, planHasFitGapAnalysis } from "@/lib/planFeatures";
import { getOrComputeFitGapAnalysis } from "@/lib/ai";

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
    .select("token_plan")
    .eq("id", user.id)
    .single();

  const tier = getPlanTier(profile?.token_plan ?? null);
  if (!planHasFitGapAnalysis(tier)) {
    return NextResponse.json(
      { error: "Fit and gap analysis is available on the Elite plan." },
      { status: 403 }
    );
  }

  try {
    const result = await getOrComputeFitGapAnalysis(supabase, projectId, user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Fit and gap analysis failed" }, { status: 500 });
  }
}