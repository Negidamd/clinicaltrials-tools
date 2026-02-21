"use client";

// ---------------------------------------------------------------------------
// useFeatureGate – hook to check feature access based on subscription tier
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import {
  SubscriptionTier,
  TIER_LIMITS,
  type TierLimits,
} from "@/lib/constants";
import { getCalculatorMeta } from "@/lib/calculator-registry";
import type { CalculatorSlug } from "@/types/calculator";
import { useSubscription, type UseSubscriptionReturn } from "./useSubscription";

// ---------------------------------------------------------------------------
// Tier hierarchy (higher index = more access)
// ---------------------------------------------------------------------------

const TIER_RANK: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.PRO]: 1,
  [SubscriptionTier.TEAM]: 2,
  [SubscriptionTier.ENTERPRISE]: 3,
};

/**
 * Returns `true` if `userTier` is at least `requiredTier`.
 */
function tierSatisfies(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier,
): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
}

// ---------------------------------------------------------------------------
// Feature identifiers
// ---------------------------------------------------------------------------

export type Feature =
  | "calculation"
  | "ai_query"
  | "pdf_export"
  | "create_project"
  | "team_seats"
  | "priority_support"
  | "custom_contract"
  | `calculator:${CalculatorSlug}`;

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseFeatureGateReturn {
  /** Whether the feature is available to the current user at all. */
  hasAccess: boolean;
  /** Whether the user has remaining quota for the feature (usage-limited). */
  hasQuota: boolean;
  /** Combined check: has both access AND quota. */
  canUse: boolean;
  /** The minimum tier required for this feature. */
  requiredTier: SubscriptionTier;
  /** The user's current tier. */
  currentTier: SubscriptionTier;
  /** Limits of the user's current tier. */
  limits: TierLimits;
  /** Whether subscription data is still loading. */
  isLoading: boolean;
  /** Human-readable reason the feature is locked (null if accessible). */
  lockedReason: string | null;
  /** Full subscription hook return for advanced usage. */
  subscription: UseSubscriptionReturn;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFeatureGate(feature: Feature): UseFeatureGateReturn {
  const sub = useSubscription();

  const result = useMemo((): Omit<UseFeatureGateReturn, "subscription"> => {
    const { tier, limits, isLoading } = sub;

    // Determine required tier for the feature
    let requiredTier: SubscriptionTier = SubscriptionTier.FREE;

    // --- Calculator-specific tier requirement ---
    if (feature.startsWith("calculator:")) {
      const slug = feature.replace("calculator:", "") as CalculatorSlug;
      const meta = getCalculatorMeta(slug);
      if (meta) {
        requiredTier = meta.tier as SubscriptionTier;
      } else {
        // Unknown calculator: block access
        return {
          hasAccess: false,
          hasQuota: false,
          canUse: false,
          requiredTier: SubscriptionTier.PRO,
          currentTier: tier,
          limits,
          isLoading,
          lockedReason: `Calculator "${slug}" not found.`,
        };
      }
    }

    // --- Feature-specific tier and quota checks ---
    let hasQuota = true;

    switch (feature) {
      case "calculation":
        hasQuota = sub.canUseCalculation;
        break;
      case "ai_query":
        hasQuota = sub.canUseAI;
        break;
      case "pdf_export":
        hasQuota = sub.canExportPDF;
        break;
      case "create_project":
        hasQuota = sub.canCreateProject;
        break;
      case "team_seats":
        requiredTier = SubscriptionTier.TEAM;
        break;
      case "priority_support":
        requiredTier = SubscriptionTier.TEAM;
        break;
      case "custom_contract":
        requiredTier = SubscriptionTier.ENTERPRISE;
        break;
      default:
        // For calculator: features, requiredTier is already set above
        break;
    }

    const hasAccess = tierSatisfies(tier, requiredTier);
    const canUse = hasAccess && hasQuota;

    // Build a human-readable lock reason
    let lockedReason: string | null = null;
    if (!hasAccess) {
      const tierLabel =
        requiredTier === SubscriptionTier.PRO
          ? "Pro"
          : requiredTier === SubscriptionTier.TEAM
            ? "Team"
            : requiredTier === SubscriptionTier.ENTERPRISE
              ? "Enterprise"
              : "a higher";
      lockedReason = `This feature requires a ${tierLabel} plan. Upgrade to unlock it.`;
    } else if (!hasQuota) {
      lockedReason = buildQuotaMessage(feature, limits, sub);
    }

    return {
      hasAccess,
      hasQuota,
      canUse,
      requiredTier,
      currentTier: tier,
      limits,
      isLoading,
      lockedReason,
    };
  }, [feature, sub]);

  return {
    ...result,
    subscription: sub,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildQuotaMessage(
  feature: Feature,
  limits: TierLimits,
  sub: UseSubscriptionReturn,
): string {
  switch (feature) {
    case "calculation":
      return `You have used all ${limits.calculationsPerMonth} calculations this month. Upgrade for unlimited calculations.`;
    case "ai_query":
      return `You have used all ${limits.aiQueriesPerMonth} AI queries this month. Upgrade for unlimited AI access.`;
    case "pdf_export":
      return `You have used all ${limits.pdfExportsPerMonth} PDF exports this month. Upgrade for unlimited exports.`;
    case "create_project":
      return `You have reached the limit of ${limits.maxProjects} project${limits.maxProjects === 1 ? "" : "s"}. Upgrade to create more projects.`;
    default:
      return "You have reached your usage limit for this feature. Upgrade for more access.";
  }
}

// ---------------------------------------------------------------------------
// Convenience hooks (thin wrappers)
// ---------------------------------------------------------------------------

/**
 * Check if the user can access a specific calculator.
 */
export function useCalculatorAccess(slug: CalculatorSlug): UseFeatureGateReturn {
  return useFeatureGate(`calculator:${slug}`);
}

/**
 * Check if the user can perform another calculation (quota check).
 */
export function useCalculationQuota(): UseFeatureGateReturn {
  return useFeatureGate("calculation");
}

/**
 * Check if the user can perform an AI query.
 */
export function useAIQueryQuota(): UseFeatureGateReturn {
  return useFeatureGate("ai_query");
}

/**
 * Check if the user can export a PDF.
 */
export function usePDFExportQuota(): UseFeatureGateReturn {
  return useFeatureGate("pdf_export");
}
