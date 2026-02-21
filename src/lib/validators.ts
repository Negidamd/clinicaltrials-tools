// ---------------------------------------------------------------------------
// Zod validation schemas for all calculator inputs  (Zod v4)
// ---------------------------------------------------------------------------

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared field schemas
// ---------------------------------------------------------------------------

/** Significance level: must be between 0 (exclusive) and 1 (exclusive). */
const alphaSchema = z
  .number()
  .gt(0, "Alpha must be greater than 0")
  .lt(1, "Alpha must be less than 1")
  .default(0.05);

/** Statistical power: must be between 0 (exclusive) and 1 (exclusive). */
const powerSchema = z
  .number()
  .gt(0, "Power must be greater than 0")
  .lt(1, "Power must be less than 1")
  .default(0.8);

/** Alternative hypothesis direction. */
const alternativeSchema = z
  .enum(["two-sided", "one-sided"])
  .default("two-sided");

/** Allocation ratio n2/n1 (must be > 0). */
const allocationRatioSchema = z
  .number()
  .gt(0, "Allocation ratio must be greater than 0")
  .default(1);

/** Optional dropout rate: between 0 and <1. */
const dropoutRateSchema = z
  .number()
  .gte(0, "Dropout rate cannot be negative")
  .lt(1, "Dropout rate must be less than 1")
  .optional();

/** Positive standard deviation. */
const positiveSD = z
  .number()
  .gt(0, "Standard deviation must be greater than 0");

/** A probability (proportion) strictly between 0 and 1. */
const proportion = z
  .number()
  .gt(0, "Proportion must be greater than 0")
  .lt(1, "Proportion must be less than 1");

/** A probability (proportion) between 0 and 1, inclusive of boundaries. */
const proportionInclusive = z
  .number()
  .gte(0, "Proportion must be >= 0")
  .lte(1, "Proportion must be <= 1");

// ---------------------------------------------------------------------------
// Base schema (all calculators share these fields)
// ---------------------------------------------------------------------------

const baseInputSchema = z.object({
  alpha: alphaSchema,
  power: powerSchema,
  alternative: alternativeSchema,
  allocation_ratio: allocationRatioSchema,
});

// ---------------------------------------------------------------------------
// 1. Two-Sample T-Test
// ---------------------------------------------------------------------------

export const twoSampleTTestSchema = baseInputSchema.extend({
  mean1: z.number({ message: "Mean for group 1 is required" }),
  mean2: z.number({ message: "Mean for group 2 is required" }),
  sd: positiveSD,
  dropout_rate: dropoutRateSchema,
}).check(
  (ctx) => {
    if (ctx.value.mean1 === ctx.value.mean2) {
      ctx.issues.push({
        code: "custom",
        message: "Group means must differ to detect an effect",
        path: ["mean2"],
        input: ctx.value,
      });
    }
  },
);

// ---------------------------------------------------------------------------
// 2. Two Proportions
// ---------------------------------------------------------------------------

export const twoProportionsSchema = baseInputSchema.extend({
  p1: proportion,
  p2: proportion,
  dropout_rate: dropoutRateSchema,
}).check(
  (ctx) => {
    if (ctx.value.p1 === ctx.value.p2) {
      ctx.issues.push({
        code: "custom",
        message: "Proportions must differ to detect an effect",
        path: ["p2"],
        input: ctx.value,
      });
    }
  },
);

// ---------------------------------------------------------------------------
// 3. Paired T-Test
// ---------------------------------------------------------------------------

export const pairedTTestSchema = baseInputSchema.extend({
  mean_diff: z
    .number({ message: "Mean difference is required" })
    .refine((v) => v !== 0, "Mean difference must be non-zero"),
  sd_diff: positiveSD,
  dropout_rate: dropoutRateSchema,
});

// ---------------------------------------------------------------------------
// 4. One Proportion
// ---------------------------------------------------------------------------

export const oneProportionSchema = baseInputSchema.extend({
  p0: proportion,
  p1: proportion,
  dropout_rate: dropoutRateSchema,
}).check(
  (ctx) => {
    if (ctx.value.p0 === ctx.value.p1) {
      ctx.issues.push({
        code: "custom",
        message: "Null and alternative proportions must differ",
        path: ["p1"],
        input: ctx.value,
      });
    }
  },
);

// ---------------------------------------------------------------------------
// 5. Log-Rank Test
// ---------------------------------------------------------------------------

export const logRankTestSchema = baseInputSchema.extend({
  hazard_ratio: z
    .number()
    .gt(0, "Hazard ratio must be greater than 0")
    .refine((v) => v !== 1, "Hazard ratio of 1 implies no effect"),
  median_survival_control: z
    .number()
    .gt(0, "Median survival must be greater than 0"),
  accrual_time: z
    .number()
    .gt(0, "Accrual time must be greater than 0"),
  follow_up_time: z
    .number()
    .gte(0, "Follow-up time cannot be negative"),
  dropout_rate: dropoutRateSchema,
});

// ---------------------------------------------------------------------------
// 6. Non-Inferiority for Means
// ---------------------------------------------------------------------------

export const nonInferiorityMeansSchema = baseInputSchema.extend({
  mean_treatment: z.number({ message: "Treatment mean is required" }),
  mean_control: z.number({ message: "Control mean is required" }),
  sd: positiveSD,
  ni_margin: z
    .number()
    .gt(0, "Non-inferiority margin must be greater than 0"),
  dropout_rate: dropoutRateSchema,
});

// ---------------------------------------------------------------------------
// 7. Non-Inferiority for Proportions
// ---------------------------------------------------------------------------

export const nonInferiorityProportionsSchema = baseInputSchema.extend({
  p_treatment: proportion,
  p_control: proportion,
  ni_margin: z
    .number()
    .gt(0, "Non-inferiority margin must be greater than 0")
    .lt(1, "Non-inferiority margin must be less than 1"),
  dropout_rate: dropoutRateSchema,
});

// ---------------------------------------------------------------------------
// 8. One-Way ANOVA
// ---------------------------------------------------------------------------

export const oneWayAnovaSchema = baseInputSchema.extend({
  num_groups: z
    .number()
    .int("Number of groups must be an integer")
    .gte(2, "At least 2 groups are required")
    .lte(20, "Maximum 20 groups supported"),
  group_means: z
    .array(z.number())
    .min(2, "At least 2 group means are required")
    .max(20, "Maximum 20 group means"),
  sd: positiveSD,
  dropout_rate: dropoutRateSchema,
}).check(
  (ctx) => {
    if (ctx.value.group_means.length !== ctx.value.num_groups) {
      ctx.issues.push({
        code: "custom",
        message: `Expected ${ctx.value.num_groups} group means but received ${ctx.value.group_means.length}`,
        path: ["group_means"],
        input: ctx.value,
      });
    }
    // Ensure not all group means are identical
    const unique = new Set(ctx.value.group_means);
    if (unique.size === 1) {
      ctx.issues.push({
        code: "custom",
        message: "Group means must not all be identical",
        path: ["group_means"],
        input: ctx.value,
      });
    }
  },
);

// ---------------------------------------------------------------------------
// 9. Correlation
// ---------------------------------------------------------------------------

export const correlationSchema = baseInputSchema.extend({
  r: z
    .number()
    .gt(-1, "Correlation must be greater than -1")
    .lt(1, "Correlation must be less than 1")
    .refine((v) => v !== 0, "Expected correlation must be non-zero"),
  r0: z
    .number()
    .gte(-1, "Null correlation must be >= -1")
    .lte(1, "Null correlation must be <= 1")
    .default(0)
    .optional(),
  dropout_rate: dropoutRateSchema,
});

// ---------------------------------------------------------------------------
// 10. Cluster RCT
// ---------------------------------------------------------------------------

export const clusterRCTSchema = baseInputSchema.extend({
  effect_size: z
    .number()
    .refine((v) => v !== 0, "Effect size must be non-zero"),
  sd: positiveSD.optional(),
  p_control: proportion.optional(),
  p_treatment: proportion.optional(),
  icc: z
    .number()
    .gte(0, "ICC cannot be negative")
    .lt(1, "ICC must be less than 1"),
  cluster_size: z
    .number()
    .int("Cluster size must be an integer")
    .gte(2, "Cluster size must be at least 2"),
  cv_cluster_size: z
    .number()
    .gte(0, "Coefficient of variation cannot be negative")
    .optional(),
  dropout_rate: dropoutRateSchema,
});

// ---------------------------------------------------------------------------
// 11. Crossover 2x2
// ---------------------------------------------------------------------------

export const crossover2x2Schema = baseInputSchema.extend({
  mean_diff: z
    .number({ message: "Mean difference is required" })
    .refine((v) => v !== 0, "Mean difference must be non-zero"),
  sd_within: positiveSD,
  dropout_rate: dropoutRateSchema,
});

// ---------------------------------------------------------------------------
// 12. McNemar's Test
// ---------------------------------------------------------------------------

export const mcnemarTestSchema = baseInputSchema.extend({
  p_discordant_12: proportionInclusive,
  p_discordant_21: proportionInclusive,
  dropout_rate: dropoutRateSchema,
}).check(
  (ctx) => {
    const sum = ctx.value.p_discordant_12 + ctx.value.p_discordant_21;
    if (sum <= 0 || sum > 1) {
      ctx.issues.push({
        code: "custom",
        message:
          "Sum of discordant probabilities must be between 0 (exclusive) and 1 (inclusive)",
        path: ["p_discordant_21"],
        input: ctx.value,
      });
    }
    if (ctx.value.p_discordant_12 === ctx.value.p_discordant_21) {
      ctx.issues.push({
        code: "custom",
        message: "Discordant probabilities must differ to detect an effect",
        path: ["p_discordant_21"],
        input: ctx.value,
      });
    }
  },
);

// ---------------------------------------------------------------------------
// Discriminated union schema for the API request body
// ---------------------------------------------------------------------------

export const calculatorInputSchema = z.discriminatedUnion("calculator", [
  z.object({ calculator: z.literal("two-sample-ttest") }).extend(
    twoSampleTTestSchema.shape,
  ),
  z.object({ calculator: z.literal("two-proportions") }).extend(
    twoProportionsSchema.shape,
  ),
  z.object({ calculator: z.literal("paired-ttest") }).extend(
    pairedTTestSchema.shape,
  ),
  z.object({ calculator: z.literal("one-proportion") }).extend(
    oneProportionSchema.shape,
  ),
  z.object({ calculator: z.literal("log-rank-test") }).extend(
    logRankTestSchema.shape,
  ),
  z.object({ calculator: z.literal("non-inferiority-means") }).extend(
    nonInferiorityMeansSchema.shape,
  ),
  z.object({ calculator: z.literal("non-inferiority-proportions") }).extend(
    nonInferiorityProportionsSchema.shape,
  ),
  z.object({ calculator: z.literal("one-way-anova") }).extend(
    oneWayAnovaSchema.shape,
  ),
  z.object({ calculator: z.literal("correlation") }).extend(
    correlationSchema.shape,
  ),
  z.object({ calculator: z.literal("cluster-rct") }).extend(
    clusterRCTSchema.shape,
  ),
  z.object({ calculator: z.literal("crossover-2x2") }).extend(
    crossover2x2Schema.shape,
  ),
  z.object({ calculator: z.literal("mcnemar-test") }).extend(
    mcnemarTestSchema.shape,
  ),
]);

// ---------------------------------------------------------------------------
// Inferred types from schemas (useful for form defaults)
// ---------------------------------------------------------------------------

export type TwoSampleTTestFormValues = z.infer<typeof twoSampleTTestSchema>;
export type TwoProportionsFormValues = z.infer<typeof twoProportionsSchema>;
export type PairedTTestFormValues = z.infer<typeof pairedTTestSchema>;
export type OneProportionFormValues = z.infer<typeof oneProportionSchema>;
export type LogRankTestFormValues = z.infer<typeof logRankTestSchema>;
export type NonInferiorityMeansFormValues = z.infer<typeof nonInferiorityMeansSchema>;
export type NonInferiorityProportionsFormValues = z.infer<typeof nonInferiorityProportionsSchema>;
export type OneWayAnovaFormValues = z.infer<typeof oneWayAnovaSchema>;
export type CorrelationFormValues = z.infer<typeof correlationSchema>;
export type ClusterRCTFormValues = z.infer<typeof clusterRCTSchema>;
export type Crossover2x2FormValues = z.infer<typeof crossover2x2Schema>;
export type McNemarTestFormValues = z.infer<typeof mcnemarTestSchema>;
export type CalculatorInputFormValues = z.infer<typeof calculatorInputSchema>;

// ---------------------------------------------------------------------------
// Schema lookup map (keyed by calculator slug)
// ---------------------------------------------------------------------------

export const VALIDATOR_MAP: Record<string, z.ZodType> = {
  "two-sample-ttest": twoSampleTTestSchema,
  "two-proportions": twoProportionsSchema,
  "paired-ttest": pairedTTestSchema,
  "one-proportion": oneProportionSchema,
  "log-rank-test": logRankTestSchema,
  "non-inferiority-means": nonInferiorityMeansSchema,
  "non-inferiority-proportions": nonInferiorityProportionsSchema,
  "one-way-anova": oneWayAnovaSchema,
  correlation: correlationSchema,
  "cluster-rct": clusterRCTSchema,
  "crossover-2x2": crossover2x2Schema,
  "mcnemar-test": mcnemarTestSchema,
};

/** Result type for `validateCalculatorInput`. */
export type ValidationResult =
  | { success: true; data: unknown }
  | { success: false; error: { issues: Array<{ code: string; message: string; path: (string | number)[] }> } };

/**
 * Validate inputs for a specific calculator.
 * Returns `{ success: true, data }` or `{ success: false, error }`.
 */
export function validateCalculatorInput(
  slug: string,
  data: unknown,
): ValidationResult {
  const schema = VALIDATOR_MAP[slug];
  if (!schema) {
    return {
      success: false,
      error: {
        issues: [
          {
            code: "custom",
            message: `Unknown calculator slug: "${slug}"`,
            path: ["calculator"],
          },
        ],
      },
    };
  }
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: {
      issues: result.error.issues.map((iss) => ({
        code: iss.code ?? "custom",
        message: iss.message,
        path: (iss.path ?? []).map((p) =>
          typeof p === "symbol" ? p.toString() : p,
        ),
      })),
    },
  };
}
