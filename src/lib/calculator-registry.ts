// ---------------------------------------------------------------------------
// Calculator Registry – full metadata for every MVP calculator
// ---------------------------------------------------------------------------

import {
  CalculatorCategory,
  SubscriptionTier,
} from "@/lib/constants";
import type { CalculatorMeta, CalculatorSlug } from "@/types/calculator";

// ---------------------------------------------------------------------------
// Registry array
// ---------------------------------------------------------------------------

export const CALCULATOR_REGISTRY: CalculatorMeta[] = [
  // -----------------------------------------------------------------------
  // 1. Two-Sample T-Test  (FREE)
  // -----------------------------------------------------------------------
  {
    slug: "two-sample-ttest",
    name: "Two-Sample T-Test",
    shortDescription:
      "Sample size for comparing two independent group means.",
    longDescription:
      "Calculate the required sample size to detect a specified difference between two independent group means using a two-sample (unpaired) t-test. Assumes normally distributed continuous outcomes with equal or unequal variances. Supports unequal allocation ratios and dropout adjustment.",
    category: CalculatorCategory.MEANS,
    tier: SubscriptionTier.FREE,
    tags: [
      "t-test",
      "two-sample",
      "independent",
      "means",
      "continuous",
      "parallel",
      "RCT",
    ],
    seoTitle:
      "Two-Sample T-Test Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Free online sample size calculator for two-sample (independent) t-test. Determine the number of participants needed to compare two group means with desired power and significance level.",
    relatedCalculators: [
      "paired-ttest",
      "non-inferiority-means",
      "one-way-anova",
    ],
    references: [
      "Chow SC, Shao J, Wang H, Lokhnygina Y. Sample Size Calculations in Clinical Research. 3rd ed. Chapman & Hall/CRC; 2018.",
      "Lachin JM. Introduction to Sample Size Determination and Power Analysis for Clinical Trials. Controlled Clinical Trials. 1981;2(2):93-113.",
    ],
    version: "1.0.0",
    isPopular: true,
  },

  // -----------------------------------------------------------------------
  // 2. Two Proportions  (FREE)
  // -----------------------------------------------------------------------
  {
    slug: "two-proportions",
    name: "Two Proportions (Chi-Square / Z-Test)",
    shortDescription:
      "Sample size for comparing two independent proportions.",
    longDescription:
      "Calculate the required sample size to detect a difference between two independent proportions using the normal approximation (Z-test) or continuity-corrected Chi-square test. Widely used for binary endpoints in parallel-group RCTs.",
    category: CalculatorCategory.PROPORTIONS,
    tier: SubscriptionTier.FREE,
    tags: [
      "proportions",
      "chi-square",
      "z-test",
      "binary",
      "RCT",
      "response rate",
    ],
    seoTitle:
      "Two Proportions Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Free online sample size calculator for comparing two independent proportions. Plan your clinical trial with the exact number of participants for binary outcomes.",
    relatedCalculators: [
      "one-proportion",
      "non-inferiority-proportions",
      "mcnemar-test",
    ],
    references: [
      "Fleiss JL, Levin B, Paik MC. Statistical Methods for Rates and Proportions. 3rd ed. Wiley; 2003.",
      "Casagrande JT, Pike MC, Smith PG. An improved approximate formula for calculating sample sizes for comparing two binomial distributions. Biometrics. 1978;34(3):483-486.",
    ],
    version: "1.0.0",
    isPopular: true,
  },

  // -----------------------------------------------------------------------
  // 3. Paired T-Test  (FREE)
  // -----------------------------------------------------------------------
  {
    slug: "paired-ttest",
    name: "Paired T-Test",
    shortDescription:
      "Sample size for comparing paired / matched continuous outcomes.",
    longDescription:
      "Calculate the required number of pairs (or subjects measured twice) to detect a mean difference in paired observations. Applicable to pre-post designs, matched case-control studies, and crossover trials analysed at the subject level.",
    category: CalculatorCategory.PAIRED,
    tier: SubscriptionTier.FREE,
    tags: [
      "paired",
      "matched",
      "pre-post",
      "within-subject",
      "continuous",
    ],
    seoTitle: "Paired T-Test Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Free sample size calculator for paired t-test. Determine the number of pairs needed for pre-post or matched designs with specified power and effect size.",
    relatedCalculators: [
      "two-sample-ttest",
      "crossover-2x2",
      "mcnemar-test",
    ],
    references: [
      "Chow SC, Shao J, Wang H, Lokhnygina Y. Sample Size Calculations in Clinical Research. 3rd ed. Chapman & Hall/CRC; 2018.",
    ],
    version: "1.0.0",
    isPopular: false,
  },

  // -----------------------------------------------------------------------
  // 4. One Proportion  (FREE)
  // -----------------------------------------------------------------------
  {
    slug: "one-proportion",
    name: "One Proportion (Single-Arm)",
    shortDescription:
      "Sample size for testing a single proportion against a null value.",
    longDescription:
      "Calculate the required sample size for a one-sample test of proportions. Commonly used in single-arm Phase II oncology trials (Simon's design context) and diagnostic accuracy studies where a treatment response rate is tested against a historical benchmark.",
    category: CalculatorCategory.PROPORTIONS,
    tier: SubscriptionTier.FREE,
    tags: [
      "one-sample",
      "single-arm",
      "proportion",
      "Phase II",
      "binomial",
    ],
    seoTitle:
      "One Proportion Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Free sample size calculator for a single proportion. Find how many subjects are needed to test a response rate against a null value in single-arm trials.",
    relatedCalculators: [
      "two-proportions",
      "non-inferiority-proportions",
    ],
    references: [
      "Fleiss JL, Levin B, Paik MC. Statistical Methods for Rates and Proportions. 3rd ed. Wiley; 2003.",
      "A'Hern RP. Sample size tables for exact single-stage phase II designs. Statistics in Medicine. 2001;20(6):859-866.",
    ],
    version: "1.0.0",
    isPopular: false,
  },

  // -----------------------------------------------------------------------
  // 5. Log-Rank Test  (FREE)
  // -----------------------------------------------------------------------
  {
    slug: "log-rank-test",
    name: "Log-Rank Test (Survival)",
    shortDescription:
      "Sample size for comparing two survival curves via the log-rank test.",
    longDescription:
      "Calculate the required number of events and subjects for a two-arm survival study using the Schoenfeld or Freedman method. Takes into account accrual period, follow-up duration, and expected dropout to convert required events to total enrolment.",
    category: CalculatorCategory.SURVIVAL,
    tier: SubscriptionTier.FREE,
    tags: [
      "survival",
      "log-rank",
      "time-to-event",
      "hazard ratio",
      "Kaplan-Meier",
      "oncology",
    ],
    seoTitle:
      "Log-Rank Test Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Free sample size calculator for the log-rank test. Plan survival studies by specifying hazard ratio, accrual time, and follow-up to get required events and subjects.",
    relatedCalculators: [
      "two-sample-ttest",
      "two-proportions",
    ],
    references: [
      "Schoenfeld DA. Sample-size formula for the proportional-hazards regression model. Biometrics. 1983;39(2):499-503.",
      "Freedman LS. Tables of the number of patients required in clinical trials using the logrank test. Statistics in Medicine. 1982;1(2):121-129.",
      "Lachin JM, Foulkes MA. Evaluation of sample size and power for analyses of survival with allowance for nonuniform patient entry, losses to follow-up, noncompliance, and stratification. Biometrics. 1986;42(3):507-519.",
    ],
    version: "1.0.0",
    isPopular: true,
  },

  // -----------------------------------------------------------------------
  // 6. Non-Inferiority for Means  (PRO)
  // -----------------------------------------------------------------------
  {
    slug: "non-inferiority-means",
    name: "Non-Inferiority Test for Means",
    shortDescription:
      "Sample size for a non-inferiority trial comparing two means.",
    longDescription:
      "Calculate the required sample size to demonstrate that a new treatment is not worse than a control by more than a pre-specified non-inferiority margin (delta) for a continuous endpoint. Uses a one-sided test at the alpha level.",
    category: CalculatorCategory.NON_INFERIORITY,
    tier: SubscriptionTier.PRO,
    tags: [
      "non-inferiority",
      "NI",
      "means",
      "continuous",
      "margin",
      "equivalence",
    ],
    seoTitle:
      "Non-Inferiority Means Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Calculate sample size for non-inferiority trials comparing two continuous means. Specify the NI margin, expected difference, and common SD.",
    relatedCalculators: [
      "two-sample-ttest",
      "non-inferiority-proportions",
    ],
    references: [
      "Chow SC, Shao J, Wang H, Lokhnygina Y. Sample Size Calculations in Clinical Research. 3rd ed. Chapman & Hall/CRC; 2018. Chapter 4.",
      "FDA Guidance for Industry: Non-Inferiority Clinical Trials to Establish Effectiveness. 2016.",
    ],
    version: "1.0.0",
    isPopular: false,
  },

  // -----------------------------------------------------------------------
  // 7. Non-Inferiority for Proportions  (PRO)
  // -----------------------------------------------------------------------
  {
    slug: "non-inferiority-proportions",
    name: "Non-Inferiority Test for Proportions",
    shortDescription:
      "Sample size for a non-inferiority trial comparing two proportions.",
    longDescription:
      "Calculate the required sample size to demonstrate that a new treatment's success rate is not worse than a control by more than a pre-specified non-inferiority margin (delta) for a binary endpoint. Uses the Farrington-Manning or normal approximation approach.",
    category: CalculatorCategory.NON_INFERIORITY,
    tier: SubscriptionTier.PRO,
    tags: [
      "non-inferiority",
      "NI",
      "proportions",
      "binary",
      "margin",
    ],
    seoTitle:
      "Non-Inferiority Proportions Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Calculate sample size for non-inferiority trials comparing two proportions. Specify the NI margin and expected response rates.",
    relatedCalculators: [
      "two-proportions",
      "non-inferiority-means",
      "one-proportion",
    ],
    references: [
      "Farrington CP, Manning G. Test statistics and sample size formulae for comparative binomial trials with null hypothesis of non-zero risk difference or non-unity relative risk. Statistics in Medicine. 1990;9(12):1447-1454.",
      "Chow SC, Shao J, Wang H, Lokhnygina Y. Sample Size Calculations in Clinical Research. 3rd ed. Chapman & Hall/CRC; 2018. Chapter 4.",
    ],
    version: "1.0.0",
    isPopular: false,
  },

  // -----------------------------------------------------------------------
  // 8. One-Way ANOVA  (PRO)
  // -----------------------------------------------------------------------
  {
    slug: "one-way-anova",
    name: "One-Way ANOVA",
    shortDescription:
      "Sample size for comparing means across multiple groups.",
    longDescription:
      "Calculate the required sample size per group for a one-way analysis of variance (F-test) to detect differences among K group means. Specify the expected group means and common within-group standard deviation to compute the effect size (Cohen's f) automatically.",
    category: CalculatorCategory.ANOVA,
    tier: SubscriptionTier.PRO,
    tags: [
      "ANOVA",
      "F-test",
      "multiple groups",
      "means",
      "multi-arm",
    ],
    seoTitle:
      "One-Way ANOVA Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Calculate sample size for one-way ANOVA (F-test) comparing means across multiple groups. Specify group means and standard deviation.",
    relatedCalculators: [
      "two-sample-ttest",
      "cluster-rct",
    ],
    references: [
      "Cohen J. Statistical Power Analysis for the Behavioral Sciences. 2nd ed. Lawrence Erlbaum Associates; 1988.",
      "O'Brien RG, Muller KE. Unified power analysis for t-tests through multivariate hypotheses. In: Edwards LK, ed. Applied Analysis of Variance in Behavioral Science. Marcel Dekker; 1993:297-344.",
    ],
    version: "1.0.0",
    isPopular: false,
  },

  // -----------------------------------------------------------------------
  // 9. Correlation  (PRO)
  // -----------------------------------------------------------------------
  {
    slug: "correlation",
    name: "Correlation (Pearson r)",
    shortDescription:
      "Sample size for testing a Pearson correlation coefficient.",
    longDescription:
      "Calculate the required sample size to detect a specified Pearson correlation coefficient that differs from a null value (typically 0). Uses Fisher's z-transformation for the power computation. Useful for biomarker studies and observational research.",
    category: CalculatorCategory.CORRELATION,
    tier: SubscriptionTier.PRO,
    tags: [
      "correlation",
      "Pearson",
      "Fisher z",
      "biomarker",
      "association",
    ],
    seoTitle:
      "Correlation Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Calculate sample size for testing a Pearson correlation coefficient. Determine how many subjects are needed to detect a specified correlation with desired power.",
    relatedCalculators: [
      "two-sample-ttest",
    ],
    references: [
      "Cohen J. Statistical Power Analysis for the Behavioral Sciences. 2nd ed. Lawrence Erlbaum Associates; 1988. Chapter 3.",
      "Fisher RA. On the 'probable error' of a coefficient of correlation deduced from a small sample. Metron. 1921;1:3-32.",
    ],
    version: "1.0.0",
    isPopular: false,
  },

  // -----------------------------------------------------------------------
  // 10. Cluster RCT  (PRO)
  // -----------------------------------------------------------------------
  {
    slug: "cluster-rct",
    name: "Cluster Randomised Controlled Trial",
    shortDescription:
      "Sample size accounting for intra-cluster correlation (ICC).",
    longDescription:
      "Calculate the required number of clusters and total subjects for a cluster randomised controlled trial. Adjusts the standard individual-level sample size by the design effect (1 + (m-1) * ICC) and optionally accounts for varying cluster sizes via the coefficient of variation.",
    category: CalculatorCategory.CLUSTER,
    tier: SubscriptionTier.PRO,
    tags: [
      "cluster",
      "ICC",
      "design effect",
      "community",
      "group-randomised",
    ],
    seoTitle:
      "Cluster RCT Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Calculate sample size for cluster randomised controlled trials. Account for intra-cluster correlation (ICC), cluster size, and design effect.",
    relatedCalculators: [
      "two-sample-ttest",
      "two-proportions",
      "one-way-anova",
    ],
    references: [
      "Eldridge SM, Ashby D, Kerry S. Sample size for cluster randomized trials: effect of coefficient of variation of cluster size and analysis method. International Journal of Epidemiology. 2006;35(5):1292-1300.",
      "Hemming K, Girling AJ, Sitch AJ, Marsh J, Lilford RJ. Sample size calculations for cluster randomised controlled trials with a fixed number of clusters. BMC Medical Research Methodology. 2011;11:102.",
    ],
    version: "1.0.0",
    isPopular: true,
  },

  // -----------------------------------------------------------------------
  // 11. Crossover 2x2  (PRO)
  // -----------------------------------------------------------------------
  {
    slug: "crossover-2x2",
    name: "2\u00D72 Crossover Design",
    shortDescription:
      "Sample size for a two-period, two-treatment crossover trial.",
    longDescription:
      "Calculate the required number of subjects for a standard AB/BA crossover design comparing two treatments on a continuous endpoint. Uses the within-subject standard deviation, which is typically smaller than the between-subject SD, yielding smaller sample sizes than parallel designs.",
    category: CalculatorCategory.CROSSOVER,
    tier: SubscriptionTier.PRO,
    tags: [
      "crossover",
      "AB/BA",
      "within-subject",
      "repeated measures",
      "bioequivalence",
    ],
    seoTitle:
      "2x2 Crossover Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Calculate sample size for a 2x2 crossover clinical trial. Use within-subject variability for efficient trial planning in AB/BA designs.",
    relatedCalculators: [
      "paired-ttest",
      "two-sample-ttest",
    ],
    references: [
      "Senn S. Cross-over Trials in Clinical Research. 2nd ed. Wiley; 2002.",
      "Julious SA. Sample Sizes for Clinical Trials. Chapman & Hall/CRC; 2009. Chapter 12.",
    ],
    version: "1.0.0",
    isPopular: false,
  },

  // -----------------------------------------------------------------------
  // 12. McNemar's Test  (PRO)
  // -----------------------------------------------------------------------
  {
    slug: "mcnemar-test",
    name: "McNemar\u2019s Test",
    shortDescription:
      "Sample size for comparing paired / matched binary outcomes.",
    longDescription:
      "Calculate the required number of matched pairs for McNemar's test of correlated proportions. Commonly used in diagnostic accuracy studies (comparing two tests on the same subjects) and before-after designs with a dichotomous outcome.",
    category: CalculatorCategory.PAIRED,
    tier: SubscriptionTier.PRO,
    tags: [
      "McNemar",
      "paired",
      "binary",
      "discordant",
      "matched",
      "diagnostic",
    ],
    seoTitle:
      "McNemar Test Sample Size Calculator | ClinicalTrials.Tools",
    seoDescription:
      "Calculate sample size for McNemar's test of paired proportions. Determine pairs needed for comparing two correlated binary outcomes.",
    relatedCalculators: [
      "paired-ttest",
      "two-proportions",
    ],
    references: [
      "Connor RJ. Sample size for testing differences in proportions for the paired-sample design. Biometrics. 1987;43(1):207-211.",
      "Lachin JM. Biostatistical Methods: The Assessment of Relative Risks. 2nd ed. Wiley; 2011.",
    ],
    version: "1.0.0",
    isPopular: false,
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Map from slug to CalculatorMeta for O(1) lookups. */
export const CALCULATOR_MAP = new Map<CalculatorSlug, CalculatorMeta>(
  CALCULATOR_REGISTRY.map((c) => [c.slug, c]),
);

/** Get metadata for a single calculator by slug. Returns undefined if not found. */
export function getCalculatorMeta(
  slug: string,
): CalculatorMeta | undefined {
  return CALCULATOR_MAP.get(slug as CalculatorSlug);
}

/** All slugs as an array (useful for dynamic route generation). */
export const ALL_CALCULATOR_SLUGS: CalculatorSlug[] = CALCULATOR_REGISTRY.map(
  (c) => c.slug,
);

/** Calculators that are free-tier accessible. */
export const FREE_CALCULATORS = CALCULATOR_REGISTRY.filter(
  (c) => c.tier === SubscriptionTier.FREE,
);

/** Calculators that require PRO or above. */
export const PRO_CALCULATORS = CALCULATOR_REGISTRY.filter(
  (c) => c.tier === SubscriptionTier.PRO,
);

/** Calculators flagged as popular. */
export const POPULAR_CALCULATORS = CALCULATOR_REGISTRY.filter(
  (c) => c.isPopular,
);

/** Group calculators by category. */
export function getCalculatorsByCategory(): Record<string, CalculatorMeta[]> {
  const grouped: Record<string, CalculatorMeta[]> = {};
  for (const calc of CALCULATOR_REGISTRY) {
    if (!grouped[calc.category]) {
      grouped[calc.category] = [];
    }
    grouped[calc.category].push(calc);
  }
  return grouped;
}
