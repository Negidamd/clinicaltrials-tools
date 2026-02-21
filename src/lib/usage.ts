import prisma from "@/lib/prisma";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UsageType = "calculation" | "ai_query" | "pdf_export";

interface UsageAllowed {
  allowed: true;
  remaining: number;
}

interface UsageDenied {
  allowed: false;
  remaining: 0;
  limit: number;
}

type UsageResult = UsageAllowed | UsageDenied;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a usage type to the corresponding Prisma field name and tier limit key.
 */
function usageFieldMap(type: UsageType) {
  switch (type) {
    case "calculation":
      return {
        field: "calculationsThisMonth" as const,
        limitKey: "calculationsPerMonth" as const,
      };
    case "ai_query":
      return {
        field: "aiQueriesThisMonth" as const,
        limitKey: "aiQueriesPerMonth" as const,
      };
    case "pdf_export":
      // PDF exports are tracked via the calculations counter for now
      return {
        field: "calculationsThisMonth" as const,
        limitKey: "pdfExportsPerMonth" as const,
      };
  }
}

/**
 * Check whether the user's lastUsageReset is in the current calendar month.
 * If not, reset all usage counters and update lastUsageReset.
 */
async function ensureCurrentMonth(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastUsageReset: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const resetDate = user.lastUsageReset;

  const isSameMonth =
    resetDate.getFullYear() === now.getFullYear() &&
    resetDate.getMonth() === now.getMonth();

  if (!isSameMonth) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        calculationsThisMonth: 0,
        aiQueriesThisMonth: 0,

        lastUsageReset: now,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether the user can perform an action of the given type, and if so
 * increment their usage counter atomically.
 *
 * @param userId  The ID of the user.
 * @param type    The type of action being performed.
 * @returns       An object indicating whether the action is allowed and the
 *                remaining count (or the limit if denied).
 */
export async function checkAndIncrementUsage(
  userId: string,
  type: UsageType
): Promise<UsageResult> {
  // Ensure counters are reset if we've crossed into a new month
  await ensureCurrentMonth(userId);

  // Fetch the user's current usage and subscription tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      calculationsThisMonth: true,
      aiQueriesThisMonth: true,

      subscription: { select: { tier: true, status: true } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Determine the tier (default to FREE)
  const tier: SubscriptionTier =
    user.subscription?.status === "ACTIVE" || user.subscription?.status === "TRIALING"
      ? (user.subscription.tier as SubscriptionTier)
      : "FREE";

  const limits = TIER_LIMITS[tier];
  const { field, limitKey } = usageFieldMap(type);
  const limit = limits[limitKey];
  const currentUsage = user[field];

  // Unlimited (-1) => always allowed
  if (limit === -1) {
    // Still increment for tracking purposes
    await prisma.user.update({
      where: { id: userId },
      data: { [field]: { increment: 1 } },
    });

    return { allowed: true, remaining: -1 };
  }

  // Check if user has exceeded their limit
  if (currentUsage >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  // Increment the counter
  await prisma.user.update({
    where: { id: userId },
    data: { [field]: { increment: 1 } },
  });

  const remaining = limit - (currentUsage + 1);

  return { allowed: true, remaining };
}
