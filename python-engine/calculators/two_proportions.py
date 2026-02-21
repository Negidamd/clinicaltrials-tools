"""
Two-sample test for proportions -- sample size and power calculator.

References:
- Fleiss JL (1981). Statistical Methods for Rates and Proportions, 2nd ed.
- Fleiss JL, Tytun A, Ury HK (1980). A simple approximation for calculating
  sample sizes for comparing independent proportions. Biometrics, 36, 343-346.
- Cohen J (1988). Statistical Power Analysis for the Behavioral Sciences, 2nd ed.

Supports:
- Normal approximation (Fleiss 1981) with and without continuity correction
- Arcsine transformation method (Cohen 1988)
- Unequal allocation ratios
- One-sided and two-sided tests
"""

import math
from typing import Dict, List, Optional, Any

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class TwoProportionsInput(CalculatorInput):
    """Input parameters for two-proportion sample size calculation."""

    p1: float = Field(
        ...,
        gt=0.0,
        lt=1.0,
        description="Expected proportion in group 1 (treatment)",
    )
    p2: float = Field(
        ...,
        gt=0.0,
        lt=1.0,
        description="Expected proportion in group 2 (control)",
    )
    continuity_correction: bool = Field(
        default=False,
        description="Apply Yates continuity correction (Fleiss 1981)",
    )
    method: str = Field(
        default="normal",
        description="Method: 'normal' (Fleiss) or 'arcsine' (Cohen h)",
    )


class TwoProportionsCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "two_proportions",
            "name": "Two-Sample Test for Proportions",
            "description": (
                "Sample size for comparing two independent proportions using "
                "normal approximation (Fleiss 1981) or arcsine transformation (Cohen 1988)."
            ),
            "category": "proportions",
            "parameters": TwoProportionsInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = TwoProportionsInput(**params)

        if inp.method == "arcsine":
            return self._arcsine_method(inp)
        return self._normal_method(inp)

    def calculate_power(self, params: dict) -> float:
        inp = TwoProportionsInput(**{k: v for k, v in params.items() if k != "n_total"})
        n_total = int(params["n_total"])
        k = inp.allocation_ratio
        n1 = max(2, self._ceil(n_total / (1.0 + k)))
        n2 = n_total - n1

        if inp.method == "arcsine":
            return self._arcsine_power(n1, n2, inp)
        return self._normal_power(n1, n2, inp)

    # ------------------------------------------------------------------
    # Normal approximation (Fleiss 1981)
    # ------------------------------------------------------------------

    def _normal_method(self, inp: TwoProportionsInput) -> CalculatorOutput:
        p1, p2, k = inp.p1, inp.p2, inp.allocation_ratio
        delta = abs(p1 - p2)
        warnings: List[str] = []

        if delta == 0:
            raise ValueError("p1 and p2 must differ for sample size calculation")

        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        # Pooled proportion under H0
        p_bar = (p1 + k * p2) / (1.0 + k)
        q_bar = 1.0 - p_bar

        # Fleiss (1981) without continuity correction
        numerator = (
            z_alpha * math.sqrt((1.0 + 1.0 / k) * p_bar * q_bar)
            + z_beta * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2) / k)
        ) ** 2
        n1_exact = numerator / delta**2

        if inp.continuity_correction:
            # Fleiss continuity correction
            n1_uncorrected = n1_exact
            n1_exact = (n1_uncorrected / 4.0) * (
                1.0 + math.sqrt(1.0 + 2.0 * (1.0 + 1.0 / k) / (n1_uncorrected * delta))
            ) ** 2

        n1 = self._ceil(n1_exact)
        n2 = self._ceil(n1_exact * k)

        # Iterative refinement to ensure exact power meets target
        for _ in range(20):
            pwr = self._normal_power(n1, n2, inp)
            if pwr >= inp.power:
                break
            n1 += 1
            n2 = self._ceil(n1 * k)

        n_total = n1 + n2

        achieved_power = self._normal_power(n1, n2, inp)

        # Cohen's h as effect size
        h = 2.0 * (math.asin(math.sqrt(p1)) - math.asin(math.sqrt(p2)))

        method_label = "Two Proportions (Fleiss 1981)"
        if inp.continuity_correction:
            method_label += " with continuity correction"

        if any(n * p < 5 for n, p in [(n1, p1), (n1, 1 - p1), (n2, p2), (n2, 1 - p2)]):
            warnings.append(
                "Some expected cell counts are below 5; normal approximation may be unreliable."
            )

        return CalculatorOutput(
            sample_size_total=n_total,
            sample_size_per_group=[n1, n2],
            achieved_power=round(achieved_power, 6),
            effect_size=round(abs(h), 4),
            method=method_label,
            formula=self._latex_normal(inp.continuity_correction),
            assumptions=[
                "Independent samples",
                "Binary outcomes",
                "Normal approximation to the binomial distribution",
                f"{'Two' if inp.alternative == 'two_sided' else 'One'}-sided test",
            ],
            references=[
                "Fleiss JL (1981). Statistical Methods for Rates and Proportions, 2nd ed. Wiley.",
                "Fleiss JL, Tytun A, Ury HK (1980). Biometrics, 36, 343-346.",
            ],
            warnings=warnings,
        )

    def _normal_power(self, n1: int, n2: int, inp: TwoProportionsInput) -> float:
        p1, p2 = inp.p1, inp.p2
        delta = p1 - p2
        p_bar = (n1 * p1 + n2 * p2) / (n1 + n2)
        q_bar = 1.0 - p_bar

        se_h0 = math.sqrt(p_bar * q_bar * (1.0 / n1 + 1.0 / n2))
        se_h1 = math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)

        if se_h0 == 0 or se_h1 == 0:
            return 1.0

        if inp.alternative == "two_sided":
            z_crit = stats.norm.ppf(1.0 - inp.alpha / 2.0)
            power = (
                stats.norm.cdf((abs(delta) - z_crit * se_h0) / se_h1)
                + stats.norm.cdf((-abs(delta) - z_crit * se_h0) / se_h1)
            )
        else:
            z_crit = stats.norm.ppf(1.0 - inp.alpha)
            power = stats.norm.cdf((abs(delta) - z_crit * se_h0) / se_h1)

        return float(np.clip(power, 0.0, 1.0))

    # ------------------------------------------------------------------
    # Arcsine transformation (Cohen 1988)
    # ------------------------------------------------------------------

    def _arcsine_method(self, inp: TwoProportionsInput) -> CalculatorOutput:
        p1, p2, k = inp.p1, inp.p2, inp.allocation_ratio

        h = 2.0 * (math.asin(math.sqrt(p1)) - math.asin(math.sqrt(p2)))
        if abs(h) == 0:
            raise ValueError("p1 and p2 must differ for sample size calculation")

        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        # For equal allocation: n_per_group = ((z_a + z_b) / h)^2
        # For unequal allocation: n1 = ((z_a + z_b) / h)^2 * (1 + 1/k) / 2
        # where the factor adjusts for the allocation ratio
        n_equal = ((z_alpha + z_beta) / abs(h)) ** 2
        n1_exact = n_equal * (1.0 + 1.0 / k) / 2.0
        n1 = self._ceil(n1_exact)
        n2 = self._ceil(n1_exact * k)

        # Iterative refinement to ensure exact power meets target
        for _ in range(20):
            pwr = self._arcsine_power(n1, n2, inp)
            if pwr >= inp.power:
                break
            n1 += 1
            n2 = self._ceil(n1 * k)

        n_total = n1 + n2

        achieved_power = self._arcsine_power(n1, n2, inp)

        return CalculatorOutput(
            sample_size_total=n_total,
            sample_size_per_group=[n1, n2],
            achieved_power=round(achieved_power, 6),
            effect_size=round(abs(h), 4),
            method="Two Proportions (Arcsine Transformation, Cohen 1988)",
            formula=r"n = \left(\frac{z_{\alpha/2} + z_{\beta}}{h}\right)^2, \quad h = 2\arcsin\sqrt{p_1} - 2\arcsin\sqrt{p_2}",
            assumptions=[
                "Independent samples",
                "Binary outcomes",
                "Variance-stabilising arcsine transformation",
                f"{'Two' if inp.alternative == 'two_sided' else 'One'}-sided test",
            ],
            references=[
                "Cohen J (1988). Statistical Power Analysis for the Behavioral Sciences, 2nd ed. Erlbaum.",
            ],
            warnings=[],
        )

    def _arcsine_power(self, n1: int, n2: int, inp: TwoProportionsInput) -> float:
        p1, p2 = inp.p1, inp.p2
        h = 2.0 * (math.asin(math.sqrt(p1)) - math.asin(math.sqrt(p2)))
        # Effective n for unequal groups: harmonic-mean-based
        n_eff = 2.0 / (1.0 / n1 + 1.0 / n2)
        se = 1.0 / math.sqrt(n_eff) if n_eff > 0 else 1e12

        if inp.alternative == "two_sided":
            z_crit = stats.norm.ppf(1.0 - inp.alpha / 2.0)
            power = stats.norm.cdf(abs(h) / se - z_crit) + stats.norm.cdf(-abs(h) / se - z_crit)
        else:
            z_crit = stats.norm.ppf(1.0 - inp.alpha)
            power = stats.norm.cdf(abs(h) / se - z_crit)

        return float(np.clip(power, 0.0, 1.0))

    # ------------------------------------------------------------------
    # LaTeX
    # ------------------------------------------------------------------

    @staticmethod
    def _latex_normal(cc: bool) -> str:
        base = (
            r"n_1 = \frac{\left[z_{\alpha/2}\sqrt{(1+1/k)\bar{p}\bar{q}} "
            r"+ z_{\beta}\sqrt{p_1 q_1 + p_2 q_2 / k}\right]^2}{(p_1 - p_2)^2}"
        )
        if cc:
            base += r" \quad \text{(with continuity correction)}"
        return base
