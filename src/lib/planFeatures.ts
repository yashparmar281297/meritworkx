export type PlanTier = "starter" | "pro" | "elite";

export function getPlanTier(plan: string | null): PlanTier {
  if (plan === "Elite") return "elite";
  if (plan === "Pro") return "pro";
  return "starter";
}

export function planHasAIProposalWriting(tier: PlanTier) {
  return tier === "pro" || tier === "elite";
}

export function planHasFitGapAnalysis(tier: PlanTier) {
  return tier === "elite";
}