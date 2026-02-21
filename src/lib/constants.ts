// ---------------------------------------------------------------------------
// App-wide constants for ClinicalTrials.Tools
// ---------------------------------------------------------------------------

/** Canonical application name used in titles, meta tags, and branding. */
export const APP_NAME = "ClinicalTrials.Tools" as const;

/** Root domain (without protocol). */
export const APP_DOMAIN = "clinicaltrials.tools" as const;

/** Full base URL used for OG images, canonical links, etc. */
export const APP_URL = "https://clinicaltrials.tools" as const;

/** Support email shown in footer, error messages, etc. */
export const SUPPORT_EMAIL = "support@clinicaltrials.tools" as const;

// ---------------------------------------------------------------------------
// Subscription tiers
// ---------------------------------------------------------------------------

export const SubscriptionTier = {
  FREE: "FREE",
  PRO: "PRO",
  TEAM: "TEAM",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type SubscriptionTier =
  (typeof SubscriptionTier)[keyof typeof SubscriptionTier];

// ---------------------------------------------------------------------------
// Tier limits
// ---------------------------------------------------------------------------

export interface TierLimits {
  /** Maximum calculations per calendar month. -1 = unlimited. */
  calculationsPerMonth: number;
  /** Maximum AI assistant queries per calendar month. -1 = unlimited. */
  aiQueriesPerMonth: number;
  /** Maximum PDF report exports per calendar month. -1 = unlimited. */
  pdfExportsPerMonth: number;
  /** Maximum saved projects. -1 = unlimited. */
  maxProjects: number;
  /** Number of team seats included. 1 = individual. */
  seats: number;
  /** Whether the user can access priority support. */
  prioritySupport: boolean;
  /** Whether a custom contract / SLA is available. */
  customContract: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    calculationsPerMonth: 20,
    aiQueriesPerMonth: 3,
    pdfExportsPerMonth: 3,
    maxProjects: 1,
    seats: 1,
    prioritySupport: false,
    customContract: false,
  },
  PRO: {
    calculationsPerMonth: -1,
    aiQueriesPerMonth: -1,
    pdfExportsPerMonth: -1,
    maxProjects: -1,
    seats: 1,
    prioritySupport: false,
    customContract: false,
  },
  TEAM: {
    calculationsPerMonth: -1,
    aiQueriesPerMonth: -1,
    pdfExportsPerMonth: -1,
    maxProjects: -1,
    seats: 5,
    prioritySupport: true,
    customContract: false,
  },
  ENTERPRISE: {
    calculationsPerMonth: -1,
    aiQueriesPerMonth: -1,
    pdfExportsPerMonth: -1,
    maxProjects: -1,
    seats: -1, // custom
    prioritySupport: true,
    customContract: true,
  },
} as const;

// ---------------------------------------------------------------------------
// Pricing  (amounts in USD cents for Stripe compatibility)
// ---------------------------------------------------------------------------

export interface PricingPlan {
  tier: SubscriptionTier;
  interval: "month" | "year";
  /** Display price in dollars. */
  priceDisplay: number;
  /** Stripe-compatible price in cents. */
  priceCents: number;
  /** Stripe Price ID (set in env, placeholder here). */
  stripePriceId: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: SubscriptionTier.PRO,
    interval: "month",
    priceDisplay: 49,
    priceCents: 4900,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
  },
  {
    tier: SubscriptionTier.PRO,
    interval: "year",
    priceDisplay: 490,
    priceCents: 49000,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID ?? "",
  },
  {
    tier: SubscriptionTier.TEAM,
    interval: "month",
    priceDisplay: 149,
    priceCents: 14900,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_PRICE_ID ?? "",
  },
  {
    tier: SubscriptionTier.TEAM,
    interval: "year",
    priceDisplay: 1490,
    priceCents: 149000,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_ANNUAL_PRICE_ID ?? "",
  },
] as const;

// ---------------------------------------------------------------------------
// Calculator categories
// ---------------------------------------------------------------------------

export const CalculatorCategory = {
  MEANS: "MEANS",
  PROPORTIONS: "PROPORTIONS",
  SURVIVAL: "SURVIVAL",
  NON_INFERIORITY: "NON_INFERIORITY",
  ANOVA: "ANOVA",
  CORRELATION: "CORRELATION",
  CLUSTER: "CLUSTER",
  CROSSOVER: "CROSSOVER",
  PAIRED: "PAIRED",
} as const;

export type CalculatorCategory =
  (typeof CalculatorCategory)[keyof typeof CalculatorCategory];

/** Human-readable labels for each calculator category. */
export const CALCULATOR_CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  MEANS: "Comparing Means",
  PROPORTIONS: "Comparing Proportions",
  SURVIVAL: "Survival / Time-to-Event",
  NON_INFERIORITY: "Non-Inferiority",
  ANOVA: "ANOVA",
  CORRELATION: "Correlation",
  CLUSTER: "Cluster Randomised",
  CROSSOVER: "Crossover Design",
  PAIRED: "Paired / Matched",
} as const;

// ---------------------------------------------------------------------------
// Misc app-wide constants
// ---------------------------------------------------------------------------

/** Default significance level (two-sided). */
export const DEFAULT_ALPHA = 0.05;

/** Default statistical power. */
export const DEFAULT_POWER = 0.8;

/** Default allocation ratio (1:1). */
export const DEFAULT_ALLOCATION_RATIO = 1;

/** Maximum number of rows in a sensitivity table returned from the API. */
export const MAX_SENSITIVITY_ROWS = 50;

/** Maximum number of points on a power curve. */
export const MAX_POWER_CURVE_POINTS = 200;

/** Current calculator engine version tag. */
export const CALCULATOR_ENGINE_VERSION = "1.0.0";

/** Debounce delay (ms) for live-calculation on input change. */
export const CALCULATION_DEBOUNCE_MS = 300;

/** API route prefix for calculator endpoints. */
export const API_CALCULATOR_PREFIX = "/api/calculators";

/** API route prefix for AI assistant endpoints. */
export const API_AI_PREFIX = "/api/ai";

/** Number of recent calculations shown on the dashboard. */
export const DASHBOARD_RECENT_LIMIT = 10;

/** Maximum file-upload size for protocol PDFs (bytes). 10 MB. */
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
