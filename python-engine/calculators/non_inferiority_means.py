"""
Non-inferiority test for two means -- sample size and power calculator.

Formula:
    n = (z_alpha + z_beta)^2 * 2 * sigma^2 / (delta - Delta_NI)^2

where delta is the expected mean difference and Delta_NI is the
non-inferiority margin.

Note: Uses ONE-SIDED alpha by default (non-inferiority is inherently one-sided).

Reference: Chow SC, Shao J, Wang H (2008). Sample Size Calculations
in Clinical Research, 2nd ed.
"""

import math
from typing import List

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class NonInferiorityMeansInput(CalculatorInput):
    """Input parameters for non-inferiority test comparing two means."""

    mean_difference_expected: float = Field(
        default=0.0,
        description="Expected true difference (treatment - control); typically 0 for strict NI",
    )
    sd: float = Field(
        ...,
        gt=0,
        description="Common standard deviation in both groups",
    )
    non_inferiority_margin: float = Field(
        ...,
        gt=0,
        description="Non-inferiority margin (Delta_NI > 0)",
    )
    # Override default: NI tests are one-sided
    alternative: str = Field(
        default="one_sided",
        description="Should be 'one_sided' for non-inferiority",
    )


class NonInferiorityMeansCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "non_inferiority_means",
            "name": "Non-Inferiority Test for Means",
            "description": (
                "Sample size for a non-inferiority trial comparing two group means."
            ),
            "category": "non_inferiority",
            "parameters": NonInferiorityMeansInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = NonInferiorityMeansInput(**params)
        sigma = inp.sd
        delta = inp.mean_difference_expected
        margin = inp.non_inferiority_margin
        k = inp.allocation_ratio
        warnings: List[str] = []

        # The test margin offset
        d = delta + margin  # distance from the NI boundary under H1

        if d <= 0:
            raise ValueError(
                "Expected difference + non-inferiority margin must be positive. "
                "The treatment effect is worse than the NI margin."
            )

        # For NI, always use one-sided alpha
        if inp.alternative == "two_sided":
            warnings.append(
                "Non-inferiority tests are inherently one-sided; using one-sided alpha."
            )
        z_alpha = stats.norm.ppf(1.0 - inp.alpha)  # one-sided
        z_beta = self._z_beta(inp.power)

        # n1 = (z_alpha + z_beta)^2 * (sigma^2 + sigma^2/k) / d^2
        n1_exact = (z_alpha + z_beta) ** 2 * sigma**2 * (1.0 + 1.0 / k) / d**2
        n1 = self._ceil(n1_exact)
        n2 = self._ceil(n1_exact * k)

        # Iterative refinement: ensure exact power via noncentral t meets target
        for _ in range(20):
            pwr = self._power_from_n(n1, n2, delta, sigma, margin, inp.alpha)
            if pwr >= inp.power:
                break
            n1 += 1
            n2 = self._ceil(n1 * k)

        n_total = n1 + n2

        achieved_power = self._power_from_n(
            n1, n2, delta, sigma, margin, inp.alpha
        )

        effect_size = d / sigma  # standardised margin offset

        return CalculatorOutput(
            sample_size_total=n_total,
            sample_size_per_group=[n1, n2],
            achieved_power=round(achieved_power, 6),
            effect_size=round(effect_size, 4),
            method="Non-Inferiority Test for Means",
            formula=(
                r"n_1 = \frac{(z_{\alpha} + z_{\beta})^2 \sigma^2 (1 + 1/k)}"
                r"{(\delta + \Delta_{NI})^2}"
            ),
            assumptions=[
                "Independent samples",
                "Normally distributed outcomes",
                "Equal variances",
                "One-sided test (non-inferiority)",
                f"Non-inferiority margin Delta_NI = {margin}",
            ],
            references=[
                "Chow SC, Shao J, Wang H (2008). Sample Size Calculations in Clinical Research, 2nd ed.",
                "FDA Guidance: Non-Inferiority Clinical Trials to Establish Effectiveness (2016).",
            ],
            warnings=warnings,
        )

    def calculate_power(self, params: dict) -> float:
        inp = NonInferiorityMeansInput(
            **{k: v for k, v in params.items() if k != "n_total"}
        )
        n_total = int(params["n_total"])
        k = inp.allocation_ratio
        n1 = max(2, self._ceil(n_total / (1.0 + k)))
        n2 = n_total - n1
        return self._power_from_n(
            n1, n2, inp.mean_difference_expected, inp.sd,
            inp.non_inferiority_margin, inp.alpha,
        )

    @staticmethod
    def _power_from_n(
        n1: int, n2: int, delta: float, sigma: float, margin: float, alpha: float
    ) -> float:
        se = sigma * math.sqrt(1.0 / n1 + 1.0 / n2)
        df = n1 + n2 - 2
        d = delta + margin  # distance from boundary under H1

        # Use noncentral t
        ncp = d / se
        t_crit = stats.t.ppf(1.0 - alpha, df)  # one-sided

        power = 1.0 - stats.nct.cdf(t_crit, df, ncp)
        return float(np.clip(power, 0.0, 1.0))
