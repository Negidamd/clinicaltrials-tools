"""
Cluster randomised controlled trial (cRCT) sample size calculator.

Design effect approach:
    DEFF = 1 + (m - 1) * ICC
    n_adj = n_ind * DEFF

where m is the cluster size and ICC is the intra-cluster correlation.

Optional: coefficient of variation of cluster sizes (Eldridge 2006).

References:
- Donner A, Klar N (2000). Design and Analysis of Cluster Randomization
  Trials in Health Research. Arnold.
- Eldridge SM, Ashby D, Kerry S (2006). Sample size for cluster randomized
  trials: effect of coefficient of variation of cluster size and analysis
  method. International Journal of Epidemiology, 35, 1292-1300.
- Campbell MK, Walters SJ (2014). How to Design, Analyse and Report
  Cluster Randomised Trials in Medicine and Health Related Research.
"""

import math
from typing import List, Optional

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class ClusterRCTInput(CalculatorInput):
    """Input parameters for cluster RCT sample size calculation."""

    effect_size: float = Field(
        ...,
        gt=0,
        description="Expected effect size (e.g. Cohen's d for continuous, or risk difference for binary)",
    )
    icc: float = Field(
        ...,
        ge=0.0,
        lt=1.0,
        description="Intra-cluster correlation coefficient (ICC, rho)",
    )
    cluster_size: int = Field(
        ...,
        ge=2,
        description="Average number of subjects per cluster (m)",
    )
    cv_cluster_size: Optional[float] = Field(
        default=None,
        ge=0.0,
        description="Coefficient of variation of cluster sizes (Eldridge 2006 correction). "
                    "If provided, adjusts DEFF for variable cluster sizes.",
    )
    num_clusters_per_arm: Optional[int] = Field(
        default=None,
        ge=1,
        description="If provided, compute power for this many clusters per arm instead of sample size.",
    )


class ClusterRCTCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "cluster_rct",
            "name": "Cluster Randomised Controlled Trial",
            "description": (
                "Sample size adjustment for cluster randomised designs using the "
                "design effect (DEFF) approach."
            ),
            "category": "cluster",
            "parameters": ClusterRCTInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = ClusterRCTInput(**params)
        m = inp.cluster_size
        icc = inp.icc
        d = inp.effect_size
        k = inp.allocation_ratio
        warnings: List[str] = []

        # Design effect
        deff = 1.0 + (m - 1) * icc

        # Eldridge (2006) correction for variable cluster sizes
        if inp.cv_cluster_size is not None and inp.cv_cluster_size > 0:
            cv = inp.cv_cluster_size
            deff = 1.0 + ((cv**2 + 1) * m - 1) * icc
            warnings.append(
                f"Design effect adjusted for CV of cluster size = {cv:.2f} "
                f"(Eldridge 2006)."
            )

        # Individual-level sample size (two-sample z-test approximation)
        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        # n_ind per group for individual-level (Cohen's d)
        n_ind_per_group = ((z_alpha + z_beta) / d) ** 2 * (1.0 + 1.0 / k) / 2.0

        # Adjust for clustering
        n_adj_per_group = n_ind_per_group * deff

        # Number of clusters per group
        clusters_per_group_1 = self._ceil(n_adj_per_group / m)
        clusters_per_group_2 = self._ceil(clusters_per_group_1 * k)

        # Iterative refinement: the z-based formula does not account for the
        # small cluster-level degrees of freedom. Increase clusters until the
        # exact power (via noncentral t with cluster-level df) meets the target.
        for _ in range(500):
            pwr = self._power_cluster(
                clusters_per_group_1, clusters_per_group_2, m, icc, d, inp.alpha, inp.alternative,
            )
            if pwr >= inp.power:
                break
            clusters_per_group_1 += 1
            clusters_per_group_2 = self._ceil(clusters_per_group_1 * k)

        # Total subjects per group
        n1 = clusters_per_group_1 * m
        n2 = clusters_per_group_2 * m
        n_total = n1 + n2

        # Achieved power using cluster-adjusted df
        achieved_power = self._power_cluster(
            clusters_per_group_1, clusters_per_group_2, m, icc, d, inp.alpha, inp.alternative,
        )

        total_clusters = clusters_per_group_1 + clusters_per_group_2

        return CalculatorOutput(
            sample_size_total=n_total,
            sample_size_per_group=[n1, n2],
            achieved_power=round(achieved_power, 6),
            effect_size=round(d, 4),
            method="Cluster RCT (Design Effect Approach)",
            formula=(
                r"DEFF = 1 + (m - 1) \rho, \quad "
                r"n_{\text{adj}} = n_{\text{ind}} \times DEFF, \quad "
                r"k = \lceil n_{\text{adj}} / m \rceil"
            ),
            assumptions=[
                "Subjects nested within clusters",
                f"Intra-cluster correlation (ICC) = {icc}",
                f"Average cluster size m = {m}",
                f"Design effect DEFF = {deff:.3f}",
                f"Total clusters = {total_clusters} ({clusters_per_group_1} + {clusters_per_group_2})",
                f"{'Two' if inp.alternative == 'two_sided' else 'One'}-sided test",
            ],
            references=[
                "Donner A, Klar N (2000). Design and Analysis of Cluster Randomization Trials. Arnold.",
                "Eldridge SM, Ashby D, Kerry S (2006). Int J Epidemiology, 35, 1292-1300.",
            ],
            warnings=warnings,
        )

    def calculate_power(self, params: dict) -> float:
        inp = ClusterRCTInput(**{k: v for k, v in params.items() if k != "n_total"})
        n_total = int(params["n_total"])
        m = inp.cluster_size
        k_alloc = inp.allocation_ratio

        # Split total into per-arm subject counts, then clusters
        n1 = self._ceil(n_total / (1.0 + k_alloc))
        n2 = n_total - n1
        c1 = max(2, self._ceil(n1 / m))
        c2 = max(2, self._ceil(n2 / m))

        return self._power_cluster(
            c1, c2, m, inp.icc, inp.effect_size, inp.alpha, inp.alternative,
        )

    @staticmethod
    def _power_cluster(
        c1: int, c2: int, m: int, icc: float, d: float, alpha: float, alternative: str,
    ) -> float:
        """Power via t-test with cluster-level degrees of freedom.

        df = c1 + c2 - 2 (between-cluster df)
        Effective n per group adjusted for ICC.
        """
        deff = 1.0 + (m - 1) * icc
        if deff == 0:
            deff = 1.0

        # Effective individual sample sizes accounting for ICC
        n1_eff = c1 * m / deff
        n2_eff = c2 * m / deff

        se = math.sqrt(1.0 / n1_eff + 1.0 / n2_eff)
        df = c1 + c2 - 2  # cluster-level df

        if df < 1 or se == 0:
            return 0.0

        ncp = d / se

        if alternative == "two_sided":
            t_crit = stats.t.ppf(1.0 - alpha / 2.0, df)
            power = 1.0 - stats.nct.cdf(t_crit, df, ncp) + stats.nct.cdf(-t_crit, df, ncp)
        else:
            t_crit = stats.t.ppf(1.0 - alpha, df)
            power = 1.0 - stats.nct.cdf(t_crit, df, ncp)

        return float(np.clip(power, 0.0, 1.0))
