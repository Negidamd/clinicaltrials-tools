"""
One-sample test for a proportion -- sample size and power calculator.

Normal approximation to the binomial:
    n = [z_{alpha/2} * sqrt(p0*q0) + z_beta * sqrt(p1*q1)]^2 / (p1 - p0)^2

Reference: Fleiss JL (1981). Statistical Methods for Rates and Proportions.
"""

import math
from typing import List

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class OneProportionInput(CalculatorInput):
    """Input parameters for one-proportion test."""

    p0: float = Field(
        ...,
        gt=0.0,
        lt=1.0,
        description="Null hypothesis proportion",
    )
    p1: float = Field(
        ...,
        gt=0.0,
        lt=1.0,
        description="Alternative hypothesis proportion (expected true proportion)",
    )
    continuity_correction: bool = Field(
        default=False,
        description="Apply continuity correction",
    )


class OneProportionCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "one_proportion",
            "name": "One-Sample Proportion Test",
            "description": (
                "Sample size for testing a single proportion against a hypothesised value "
                "using the normal approximation to the binomial."
            ),
            "category": "proportions",
            "parameters": OneProportionInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = OneProportionInput(**params)
        p0, p1 = inp.p0, inp.p1
        delta = abs(p1 - p0)
        warnings: List[str] = []

        if delta == 0:
            raise ValueError("p0 and p1 must differ")

        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        numerator = (z_alpha * math.sqrt(p0 * (1 - p0)) + z_beta * math.sqrt(p1 * (1 - p1))) ** 2
        n_exact = numerator / delta**2

        if inp.continuity_correction:
            # Fleiss continuity correction for one-proportion
            n_uncorrected = n_exact
            n_exact = (n_uncorrected / 4.0) * (
                1.0 + math.sqrt(1.0 + 4.0 / (n_uncorrected * delta))
            ) ** 2

        n = self._ceil(n_exact)

        # Iterative refinement to ensure exact power meets target
        for _ in range(20):
            pwr = self._power_from_n(n, p0, p1, inp.alpha, inp.alternative)
            if pwr >= inp.power:
                break
            n += 1

        achieved_power = self._power_from_n(n, p0, p1, inp.alpha, inp.alternative)

        # Effect size: Cohen h
        h = 2.0 * (math.asin(math.sqrt(p1)) - math.asin(math.sqrt(p0)))

        if n * min(p0, p1) < 5 or n * min(1 - p0, 1 - p1) < 5:
            warnings.append(
                "Expected count under one hypothesis is < 5; normal approximation may be unreliable."
            )

        method_label = "One-Proportion Z-Test (Normal Approximation)"
        if inp.continuity_correction:
            method_label += " with continuity correction"

        return CalculatorOutput(
            sample_size_total=n,
            sample_size_per_group=[n],
            achieved_power=round(achieved_power, 6),
            effect_size=round(abs(h), 4),
            method=method_label,
            formula=(
                r"n = \frac{\left[z_{\alpha/2}\sqrt{p_0 q_0} "
                r"+ z_{\beta}\sqrt{p_1 q_1}\right]^2}{(p_1 - p_0)^2}"
            ),
            assumptions=[
                "Binary outcome",
                "Normal approximation to the binomial",
                f"{'Two' if inp.alternative == 'two_sided' else 'One'}-sided test",
            ],
            references=[
                "Fleiss JL (1981). Statistical Methods for Rates and Proportions. Wiley.",
            ],
            warnings=warnings,
        )

    def calculate_power(self, params: dict) -> float:
        inp = OneProportionInput(**{k: v for k, v in params.items() if k != "n_total"})
        n = int(params["n_total"])
        return self._power_from_n(n, inp.p0, inp.p1, inp.alpha, inp.alternative)

    @staticmethod
    def _power_from_n(n: int, p0: float, p1: float, alpha: float, alternative: str) -> float:
        if n < 1:
            return 0.0
        se_h0 = math.sqrt(p0 * (1 - p0) / n)
        se_h1 = math.sqrt(p1 * (1 - p1) / n)
        delta = p1 - p0

        if se_h0 == 0 or se_h1 == 0:
            return 1.0

        if alternative == "two_sided":
            z_crit = stats.norm.ppf(1.0 - alpha / 2.0)
            power = (
                stats.norm.cdf((abs(delta) - z_crit * se_h0) / se_h1)
                + stats.norm.cdf((-abs(delta) - z_crit * se_h0) / se_h1)
            )
        else:
            z_crit = stats.norm.ppf(1.0 - alpha)
            power = stats.norm.cdf((abs(delta) - z_crit * se_h0) / se_h1)

        return float(np.clip(power, 0.0, 1.0))
