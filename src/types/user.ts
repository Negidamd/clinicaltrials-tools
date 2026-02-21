// ---------------------------------------------------------------------------
// User & Subscription type definitions for ClinicalTrials.Tools
// ---------------------------------------------------------------------------

import type { SubscriptionTier } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Subscription status
// ---------------------------------------------------------------------------

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  TRIALING: "TRIALING",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
  UNPAID: "UNPAID",
  INCOMPLETE: "INCOMPLETE",
  INCOMPLETE_EXPIRED: "INCOMPLETE_EXPIRED",
  PAUSED: "PAUSED",
} as const;

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export interface Subscription {
  /** Internal unique identifier. */
  id: string;
  /** Associated user ID. */
  userId: string;
  /** Stripe subscription ID. */
  stripeSubscriptionId: string | null;
  /** Stripe customer ID. */
  stripeCustomerId: string | null;
  /** Current tier. */
  tier: SubscriptionTier;
  /** Current status. */
  status: SubscriptionStatus;
  /** Billing interval. */
  interval: "month" | "year";
  /** Start of the current billing period. */
  currentPeriodStart: Date;
  /** End of the current billing period. */
  currentPeriodEnd: Date;
  /** Whether the subscription will cancel at period end. */
  cancelAtPeriodEnd: boolean;
  /** ISO date string of creation. */
  createdAt: Date;
  /** ISO date string of last update. */
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Usage tracking
// ---------------------------------------------------------------------------

export interface UsageRecord {
  /** ID of the user. */
  userId: string;
  /** Calendar month in YYYY-MM format. */
  month: string;
  /** Number of calculations performed this month. */
  calculationsUsed: number;
  /** Number of AI queries used this month. */
  aiQueriesUsed: number;
  /** Number of PDF exports used this month. */
  pdfExportsUsed: number;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  /** Internal unique identifier (cuid). */
  id: string;
  /** Display name. */
  name: string | null;
  /** Email address (unique). */
  email: string;
  /** URL of profile image / avatar. */
  image: string | null;
  /** Whether the email has been verified. */
  emailVerified: Date | null;
  /** Current subscription details (null for free users). */
  subscription: Subscription | null;
  /** Convenience accessor: resolved tier (FREE if no active sub). */
  tier: SubscriptionTier;
  /** Current month's usage record. */
  usage: UsageRecord | null;
  /** ID of the team the user belongs to (null for solo users). */
  teamId: string | null;
  /** Role within the team. */
  teamRole: "OWNER" | "ADMIN" | "MEMBER" | null;
  /** ISO date string of account creation. */
  createdAt: Date;
  /** ISO date string of last update. */
  updatedAt: Date;
}
