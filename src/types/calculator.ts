// ---------------------------------------------------------------------------
// Calculator type definitions for ClinicalTrials.Tools
// ---------------------------------------------------------------------------

import type { CalculatorCategory, SubscriptionTier } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Enums / literal unions re-exported for convenience
// ---------------------------------------------------------------------------

export type AlternativeHypothesis = "two-sided" | "one-sided";

// ---------------------------------------------------------------------------
// Base input – every calculator extends this
// ---------------------------------------------------------------------------

export interface CalculatorInputBase {
  /** Significance level (Type I error rate). Default 0.05. */
  alpha: number;
  /** Desired statistical power (1 - beta). Default 0.80. */
  power: number;
  /** Alternative hypothesis direction. Default "two-sided". */
  alternative: AlternativeHypothesis;
  /** Allocation ratio n2/n1 (control to treatment). Default 1. */
  allocation_ratio: number;
}

// ---------------------------------------------------------------------------
// Specific calculator input types
// ---------------------------------------------------------------------------

/** Two-Sample T-Test */
export interface TwoSampleTTestInput extends CalculatorInputBase {
  /** Expected mean in group 1 (treatment). */
  mean1: number;
  /** Expected mean in group 2 (control). */
  mean2: number;
  /** Common standard deviation (pooled). */
  sd: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** Two Proportions (Chi-square / Z-test) */
export interface TwoProportionsInput extends CalculatorInputBase {
  /** Expected proportion in group 1. */
  p1: number;
  /** Expected proportion in group 2. */
  p2: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** Paired T-Test */
export interface PairedTTestInput extends CalculatorInputBase {
  /** Expected mean of paired differences. */
  mean_diff: number;
  /** Standard deviation of paired differences. */
  sd_diff: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** One Proportion (exact binomial / normal approx) */
export interface OneProportionInput extends CalculatorInputBase {
  /** Null hypothesis proportion (p0). */
  p0: number;
  /** Alternative proportion (p1). */
  p1: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** Log-Rank Test (survival / time-to-event) */
export interface LogRankTestInput extends CalculatorInputBase {
  /** Hazard ratio (treatment vs control). */
  hazard_ratio: number;
  /** Median survival in control group (same time unit). */
  median_survival_control: number;
  /** Total accrual period (same time unit). */
  accrual_time: number;
  /** Follow-up time after end of accrual (same time unit). */
  follow_up_time: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** Non-Inferiority for Means */
export interface NonInferiorityMeansInput extends CalculatorInputBase {
  /** Expected mean in treatment group. */
  mean_treatment: number;
  /** Expected mean in control group. */
  mean_control: number;
  /** Common standard deviation. */
  sd: number;
  /** Non-inferiority margin (delta). Must be > 0. */
  ni_margin: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** Non-Inferiority for Proportions */
export interface NonInferiorityProportionsInput extends CalculatorInputBase {
  /** Expected proportion in treatment group. */
  p_treatment: number;
  /** Expected proportion in control group. */
  p_control: number;
  /** Non-inferiority margin (delta). Must be > 0. */
  ni_margin: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** One-Way ANOVA */
export interface OneWayAnovaInput extends CalculatorInputBase {
  /** Number of groups / arms. */
  num_groups: number;
  /** Expected group means (array of length num_groups). */
  group_means: number[];
  /** Common within-group standard deviation. */
  sd: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** Correlation (Pearson r) */
export interface CorrelationInput extends CalculatorInputBase {
  /** Expected Pearson correlation coefficient under H1. */
  r: number;
  /** Null correlation under H0 (default 0). */
  r0?: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** Cluster Randomised Controlled Trial */
export interface ClusterRCTInput extends CalculatorInputBase {
  /** Effect size (Cohen's d or risk difference depending on outcome). */
  effect_size: number;
  /** Standard deviation of the outcome (for continuous outcomes). */
  sd?: number;
  /** Expected proportion in control (for binary outcomes). */
  p_control?: number;
  /** Expected proportion in treatment (for binary outcomes). */
  p_treatment?: number;
  /** Intra-cluster correlation coefficient (ICC). */
  icc: number;
  /** Average cluster size (number of subjects per cluster). */
  cluster_size: number;
  /** Optional: coefficient of variation of cluster sizes. */
  cv_cluster_size?: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** 2x2 Crossover Design */
export interface Crossover2x2Input extends CalculatorInputBase {
  /** Expected mean difference between treatments. */
  mean_diff: number;
  /** Within-subject standard deviation. */
  sd_within: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

/** McNemar's Test (paired binary data) */
export interface McNemarTestInput extends CalculatorInputBase {
  /** Probability of discordant pair type 1 (+ / -). */
  p_discordant_12: number;
  /** Probability of discordant pair type 2 (- / +). */
  p_discordant_21: number;
  /** Optional: dropout rate as a decimal (0-1). */
  dropout_rate?: number;
}

// ---------------------------------------------------------------------------
// Discriminated union of all calculator inputs
// ---------------------------------------------------------------------------

export type CalculatorInput =
  | ({ calculator: "two-sample-ttest" } & TwoSampleTTestInput)
  | ({ calculator: "two-proportions" } & TwoProportionsInput)
  | ({ calculator: "paired-ttest" } & PairedTTestInput)
  | ({ calculator: "one-proportion" } & OneProportionInput)
  | ({ calculator: "log-rank-test" } & LogRankTestInput)
  | ({ calculator: "non-inferiority-means" } & NonInferiorityMeansInput)
  | ({ calculator: "non-inferiority-proportions" } & NonInferiorityProportionsInput)
  | ({ calculator: "one-way-anova" } & OneWayAnovaInput)
  | ({ calculator: "correlation" } & CorrelationInput)
  | ({ calculator: "cluster-rct" } & ClusterRCTInput)
  | ({ calculator: "crossover-2x2" } & Crossover2x2Input)
  | ({ calculator: "mcnemar-test" } & McNemarTestInput);

// ---------------------------------------------------------------------------
// Calculator slug literal type
// ---------------------------------------------------------------------------

export type CalculatorSlug = CalculatorInput["calculator"];

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface SensitivityRow {
  /** The parameter being varied (e.g. "power", "effect_size"). */
  parameter: string;
  /** The varied value. */
  value: number;
  /** Resulting total sample size at that value. */
  sample_size_total: number;
  /** Resulting per-group sample size at that value. */
  sample_size_per_group: number;
}

export interface PowerCurvePoint {
  /** Sample size (x-axis). */
  n: number;
  /** Achieved power at that sample size (y-axis). */
  power: number;
}

export interface CalculatorOutput {
  /** Total required sample size (all groups combined). */
  sample_size_total: number;
  /** Sample size per group (for balanced designs). */
  sample_size_per_group: number;
  /** Achieved power given the computed sample size (may differ slightly from requested power). */
  achieved_power: number;
  /** Standardised effect size used in the computation. */
  effect_size: number;
  /** Statistical method / test used. */
  method: string;
  /** LaTeX-formatted formula string. */
  formula: string;
  /** Plain-language assumptions made during computation. */
  assumptions: string[];
  /** Academic references supporting the method. */
  references: string[];
  /** Sensitivity analysis table. */
  sensitivity_table: SensitivityRow[];
  /** Data for rendering a power curve chart. */
  power_curve_data: PowerCurvePoint[];
  /** Calculator engine version that produced this output. */
  version: string;
  /** Non-fatal warnings (e.g. "continuity correction applied"). */
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Calculator metadata (registry entry)
// ---------------------------------------------------------------------------

export interface CalculatorMeta {
  /** URL-safe slug, e.g. "two-sample-ttest". */
  slug: CalculatorSlug;
  /** Human-readable name, e.g. "Two-Sample T-Test". */
  name: string;
  /** Short one-liner shown in cards / lists. */
  shortDescription: string;
  /** Longer description shown on the calculator page. */
  longDescription: string;
  /** Thematic category. */
  category: CalculatorCategory;
  /** Minimum subscription tier required. */
  tier: SubscriptionTier;
  /** Searchable tags. */
  tags: string[];
  /** SEO <title> tag content. */
  seoTitle: string;
  /** SEO meta description. */
  seoDescription: string;
  /** Slugs of related calculators for cross-linking. */
  relatedCalculators: CalculatorSlug[];
  /** Academic references for the methodology. */
  references: string[];
  /** Semantic version for the calculator definition. */
  version: string;
  /** Whether this calculator is highlighted on the homepage / popular section. */
  isPopular: boolean;
}
