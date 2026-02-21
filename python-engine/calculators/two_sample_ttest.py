"""
Two-sample t-test sample size and power calculator.

Reference: Lachin JM (1981). Introduction to sample size determination and
power analysis for clinical trials. Controlled Clinical Trials, 2(2), 93-113.

Supports:
- Equal and unequal group variances
- Equal and unequal allocation ratios (k = n2/n1)
- One-sided and two-sided tests
"""

import math
from typing import Dict, List, Optional, Any

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class TwoSampleTTestInput(CalculatorInput):
    """Input parameters for two-sample t-test sample size calculation."""

    mean_difference: float = Field(
        ...,
        description="Expected difference between the two group means (delta = mu1 - mu2)",
    )
    sd_group1: Optional[float] = Field(
        default=None,
        gt=0,
        description="Standard deviation of group 1",
    )
    sd_group2: Optional[float] = Field(
        default=None,
        gt=0,
        description="Standard deviation of group 2",
    )
    common_sd: Optional[float] = Field(
        default=None,
        gt=0,
        description="Common (pooled) standard deviation; if provided overrides sd_group1 and sd_group2",
    )


class TwoSampleTTestCalculator(BaseCalculator):
    """Implements the Lachin (1981) sample size formula for two independent means."""

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_description(self) -> dict:
        return {
            "id": "two_sample_ttest",
            "name": "Two-Sample t-Test",
            "description": (
                "Sample size and power calculation for comparing two independent "
                "group means using the Lachin (1981) formula."
            ),
            "category": "means",
            "parameters": TwoSampleTTestInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = TwoSampleTTestInput(**params)
        sigma1, sigma2 = self._resolve_sds(inp)
        delta = abs(inp.mean_difference)
        k = inp.allocation_ratio
        warnings: List[str] = []

        if delta == 0:
            raise ValueError("mean_difference must be non-zero for sample size calculation")

        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        # Lachin (1981): n1 = (z_a + z_b)^2 * (sigma1^2 + sigma2^2/k) / delta^2
        n1_exact = ((z_alpha + z_beta) ** 2 * (sigma1**2 + sigma2**2 / k)) / delta**2
        n1 = self._ceil(n1_exact)
        n2 = self._ceil(n1_exact * k)

        # The z-based formula is an approximation. The exact power computed via
        # the noncentral t-distribution may be slightly below the target. We
        # increment n1 (and correspondingly n2) until the exact power meets
        # or exceeds the requested power.
        for _ in range(20):
            pwr = self._power_from_n(n1, n2, delta, sigma1, sigma2, inp.alpha, inp.alternative)
            if pwr >= inp.power:
                break
            n1 += 1
            n2 = self._ceil(n1 * k)

        n_total = n1 + n2

        # Achieved power with integer sample sizes
        achieved_power = self._power_from_n(n1, n2, delta, sigma1, sigma2, inp.alpha, inp.alternative)

        # Effect size (Cohen's d using pooled SD)
        sd_pooled = math.sqrt((sigma1**2 + sigma2**2) / 2.0)
        effect_size = delta / sd_pooled

        if sigma1 != sigma2:
            warnings.append(
                "Unequal variances assumed; Welch-Satterthwaite df adjustment is used for power."
            )

        return CalculatorOutput(
            sample_size_total=n_total,
            sample_size_per_group=[n1, n2],
            achieved_power=round(achieved_power, 6),
            effect_size=round(effect_size, 4),
            method="Two-Sample t-Test (Lachin 1981)",
            formula=self._latex(inp.alternative),
            assumptions=self._assumptions(sigma1, sigma2, inp.alternative),
            references=[
                "Lachin JM (1981). Introduction to sample size determination and power analysis for clinical trials. Controlled Clinical Trials, 2(2), 93-113.",
                "Chow SC, Shao J, Wang H, Lokhnygina Y (2018). Sample Size Calculations in Clinical Research, 3rd ed. CRC Press.",
            ],
            warnings=warnings,
        )

    def calculate_power(self, params: dict) -> float:
        """Calculate power given a total sample size (n_total) and parameters."""
        inp = TwoSampleTTestInput(**{k: v for k, v in params.items() if k != "n_total"})
        sigma1, sigma2 = self._resolve_sds(inp)
        delta = abs(inp.mean_difference)
        k = inp.allocation_ratio
        n_total = int(params["n_total"])

        # Split n_total into per-group sizes respecting allocation ratio
        n1 = max(2, self._ceil(n_total / (1.0 + k)))
        n2 = n_total - n1
        if n2 < 2:
            n2 = 2
            n1 = n_total - n2

        return self._power_from_n(n1, n2, delta, sigma1, sigma2, inp.alpha, inp.alternative)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _resolve_sds(inp: TwoSampleTTestInput):
        if inp.common_sd is not None:
            return inp.common_sd, inp.common_sd
        if inp.sd_group1 is not None and inp.sd_group2 is not None:
            return inp.sd_group1, inp.sd_group2
        raise ValueError(
            "Provide either 'common_sd' or both 'sd_group1' and 'sd_group2'."
        )

    @staticmethod
    def _power_from_n(
        n1: int,
        n2: int,
        delta: float,
        sigma1: float,
        sigma2: float,
        alpha: float,
        alternative: str,
    ) -> float:
        """Exact power via the noncentral t-distribution with Welch-Satterthwaite df."""
        se = math.sqrt(sigma1**2 / n1 + sigma2**2 / n2)
        if se == 0:
            return 1.0

        # Welch-Satterthwaite degrees of freedom
        v1 = sigma1**2 / n1
        v2 = sigma2**2 / n2
        df = (v1 + v2) ** 2 / (v1**2 / (n1 - 1) + v2**2 / (n2 - 1))

        # Noncentrality parameter
        ncp = delta / se

        if alternative == "two_sided":
            t_crit = stats.t.ppf(1.0 - alpha / 2.0, df)
            power = 1.0 - stats.nct.cdf(t_crit, df, ncp) + stats.nct.cdf(-t_crit, df, ncp)
        else:
            t_crit = stats.t.ppf(1.0 - alpha, df)
            power = 1.0 - stats.nct.cdf(t_crit, df, ncp)

        return float(np.clip(power, 0.0, 1.0))

    @staticmethod
    def _latex(alternative: str) -> str:
        if alternative == "two_sided":
            return (
                r"n_1 = \frac{(z_{\alpha/2} + z_{\beta})^2 "
                r"(\sigma_1^2 + \sigma_2^2 / k)}{\delta^2}"
            )
        return (
            r"n_1 = \frac{(z_{\alpha} + z_{\beta})^2 "
            r"(\sigma_1^2 + \sigma_2^2 / k)}{\delta^2}"
        )

    @staticmethod
    def _assumptions(sigma1: float, sigma2: float, alternative: str) -> List[str]:
        assumptions = [
            "Independent samples",
            "Normally distributed outcomes in each group",
        ]
        if sigma1 == sigma2:
            assumptions.append("Equal variances (homoscedasticity)")
        else:
            assumptions.append(
                "Unequal variances; Welch-Satterthwaite approximation for degrees of freedom"
            )
        if alternative == "two_sided":
            assumptions.append("Two-sided hypothesis test")
        else:
            assumptions.append("One-sided hypothesis test")
        return assumptions
