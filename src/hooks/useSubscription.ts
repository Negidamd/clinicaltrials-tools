"use client";

// ---------------------------------------------------------------------------
// useSubscription – hook to check the current user's subscription tier
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from "react";
import {
  SubscriptionTier,
  TIER_LIMITS,
  type TierLimits,
} from "@/lib/constants";
import type { Subscription, UsageRecord } from "@/types/user";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubscriptionState {
  /** Resolved tier (FREE if unauthenticated or no active sub). */
  tier: SubscriptionTier;
  /** Full subscription object (null for free / unauthenticated). */
  subscription: Subscription | null;
  /** Limits for the current tier. */
  limits: TierLimits;
  /** Current month's usage counters. */
  usage: UsageRecord | null;
  /** Whether data is still being fetched. */
  isLoading: boolean;
  /** Error message if the fetch failed. */
  error: string | null;
}

export interface UseSubscriptionReturn extends SubscriptionState {
  /** Re-fetch subscription data (e.g. after checkout). */
  refresh: () => Promise<void>;
  /** Whether the user is on a paid plan (PRO / TEAM / ENTERPRISE). */
  isPaid: boolean;
  /** Whether the user can perform an action given remaining usage. */
  canUseCalculation: boolean;
  canUseAI: boolean;
  canExportPDF: boolean;
  canCreateProject: boolean;
  /** Remaining counts (-1 = unlimited). */
  remainingCalculations: number;
  remainingAIQueries: number;
  remainingPDFExports: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function remaining(limit: number, used: number): number {
  if (limit === -1) return -1; // unlimited
  return Math.max(0, limit - used);
}

function canUse(limit: number, used: number): boolean {
  if (limit === -1) return true;
  return used < limit;
}

/**
 * Return the current month as "YYYY-MM" for usage tracking.
 */
function currentMonth(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSubscription(): UseSubscriptionReturn {
  const [state, setState] = useState<SubscriptionState>({
    tier: SubscriptionTier.FREE,
    subscription: null,
    limits: TIER_LIMITS[SubscriptionTier.FREE],
    usage: null,
    isLoading: true,
    error: null,
  });

  // -----------------------------------------------------------------------
  // Fetch subscription & usage from the API
  // -----------------------------------------------------------------------
  const fetchSubscription = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/user/subscription", {
        method: "GET",
        credentials: "include",
      });

      // If 401, user is not authenticated -> default to FREE
      if (response.status === 401) {
        setState({
          tier: SubscriptionTier.FREE,
          subscription: null,
          limits: TIER_LIMITS[SubscriptionTier.FREE],
          usage: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription (${response.status})`);
      }

      const data = await response.json();

      const tier: SubscriptionTier = data.tier ?? SubscriptionTier.FREE;
      const subscription: Subscription | null = data.subscription ?? null;
      const usage: UsageRecord | null = data.usage
        ? {
            userId: data.usage.userId,
            month: data.usage.month ?? currentMonth(),
            calculationsUsed: data.usage.calculationsUsed ?? 0,
            aiQueriesUsed: data.usage.aiQueriesUsed ?? 0,
            pdfExportsUsed: data.usage.pdfExportsUsed ?? 0,
          }
        : {
            userId: "",
            month: currentMonth(),
            calculationsUsed: 0,
            aiQueriesUsed: 0,
            pdfExportsUsed: 0,
          };

      setState({
        tier,
        subscription,
        limits: TIER_LIMITS[tier],
        usage,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load subscription";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // -----------------------------------------------------------------------
  // Derived values
  // -----------------------------------------------------------------------
  const { tier, limits, usage } = state;

  const isPaid =
    tier === SubscriptionTier.PRO ||
    tier === SubscriptionTier.TEAM ||
    tier === SubscriptionTier.ENTERPRISE;

  const calcUsed = usage?.calculationsUsed ?? 0;
  const aiUsed = usage?.aiQueriesUsed ?? 0;
  const pdfUsed = usage?.pdfExportsUsed ?? 0;

  const remainingCalculations = remaining(limits.calculationsPerMonth, calcUsed);
  const remainingAIQueries = remaining(limits.aiQueriesPerMonth, aiUsed);
  const remainingPDFExports = remaining(limits.pdfExportsPerMonth, pdfUsed);

  const canUseCalculation = canUse(limits.calculationsPerMonth, calcUsed);
  const canUseAI = canUse(limits.aiQueriesPerMonth, aiUsed);
  const canExportPDF = canUse(limits.pdfExportsPerMonth, pdfUsed);

  // Project limit check requires knowing the current project count, which
  // is fetched separately. Here we expose a simple boolean assuming the
  // project count is provided through usage (future extension). For now
  // we treat unlimited (-1) as always true and limit of 1 as requiring
  // a separate check against actual project count.
  const canCreateProject = limits.maxProjects === -1;

  return {
    ...state,
    refresh: fetchSubscription,
    isPaid,
    canUseCalculation,
    canUseAI,
    canExportPDF,
    canCreateProject,
    remainingCalculations,
    remainingAIQueries,
    remainingPDFExports,
  };
}
