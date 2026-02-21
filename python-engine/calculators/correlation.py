"""
Correlation test sample size and power calculator.

Uses Fisher's z-transformation:
    z_r = 0.5 * ln((1+r)/(1-r))  (arctanh)
    n = [(z_{alpha/2} + z_beta) / (z_r - z_r0)]^2 + 3

Reference: Cohen J (1988). Statistical Power Analysis for the Behavioral
Sciences, 2nd ed.
"""

import math
from typing import List

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class CorrelationInput(CalculatorInput):
    """Input parameters for correlation test."""

    r: float = Field(
        ...,
        gt=-1.0,
        lt=1.0,
        description="Expected correlation coefficient under H1",
    )
    r0: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description="Null hypothesis correlation (default 0)",
    )


class CorrelationCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "correlation",
            "name": "Correlation Test (Pearson)",
            "description": (
                "Sample size for testing a Pearson correlation using Fisher z-transformation."
            ),
            "category": "correlation",
            "parameters": CorrelationInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = CorrelationInput(**params)
        r, r0 = inp.r, inp.r0

        if r == r0:
            raise ValueError("r and r0 must differ")

        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        # Fisher z-transform
        zr = np.arctanh(r)
        zr0 = np.arctanh(r0)

        n_exact = ((z_alpha + z_beta) / (zr - zr0)) ** 2 + 3
        n = self._ceil(n_exact)

        # Iterative refinement to ensure power meets target
        for _ in range(20):
            pwr = self._power_from_n(n, r, r0, inp.alpha, inp.alternative)
            if pwr >= inp.power:
                break
            n += 1

        achieved_power = self._power_from_n(n, r, r0, inp.alpha, inp.alternative)

        return CalculatorOutput(
            sample_size_total=n,
            sample_size_per_group=[n],
            achieved_power=round(achieved_power, 6),
            effect_size=round(abs(r - r0), 4),
            method="Correlation Test (Fisher z-transformation)",
            formula=(
                r"n = \left(\frac{z_{\alpha/2} + z_{\beta}}"
                r"{z_r - z_{r_0}}\right)^2 + 3, \quad "
                r"z_r = \text{arctanh}(r)"
            ),
            assumptions=[
                "Bivariate normal distribution",
                "Fisher z-transformation for variance stabilisation",
                f"{'Two' if inp.alternative == 'two_sided' else 'One'}-sided test",
                f"Null correlation rho_0 = {r0}",
            ],
            references=[
                "Cohen J (1988). Statistical Power Analysis for the Behavioral Sciences, 2nd ed.",
                "Fisher RA (1921). On the 'probable error' of a coefficient of correlation deduced from a small sample. Metron, 1, 3-32.",
            ],
            warnings=[],
        )

    def calculate_power(self, params: dict) -> float:
        inp = CorrelationInput(**{k: v for k, v in params.items() if k != "n_total"})
        n = int(params["n_total"])
        return self._power_from_n(n, inp.r, inp.r0, inp.alpha, inp.alternative)

    @staticmethod
    def _power_from_n(n: int, r: float, r0: float, alpha: float, alternative: str) -> float:
        if n <= 3:
            return 0.0
        zr = np.arctanh(r)
        zr0 = np.arctanh(r0)
        se = 1.0 / math.sqrt(n - 3)

        if alternative == "two_sided":
            z_crit = stats.norm.ppf(1.0 - alpha / 2.0)
            power = (
                stats.norm.cdf((abs(zr - zr0) - z_crit * se) / se)
                + stats.norm.cdf((-abs(zr - zr0) - z_crit * se) / se)
            )
            # Cleaner formulation:
            power = (
                stats.norm.cdf(abs(zr - zr0) / se - z_crit)
                + stats.norm.cdf(-abs(zr - zr0) / se - z_crit)
            )
        else:
            z_crit = stats.norm.ppf(1.0 - alpha)
            power = stats.norm.cdf(abs(zr - zr0) / se - z_crit)

        return float(np.clip(power, 0.0, 1.0))
