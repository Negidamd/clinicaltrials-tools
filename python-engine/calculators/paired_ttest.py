"""
Paired (dependent) t-test sample size and power calculator.

Formula:
    n = (z_{alpha/2} + z_beta)^2 * sigma_d^2 / delta^2

where sigma_d is the standard deviation of the paired differences
and delta is the expected mean difference.

Reference: Chow SC, Shao J, Wang H (2008). Sample Size Calculations
in Clinical Research, 2nd ed., Chapman & Hall/CRC.
"""

import math
from typing import List

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class PairedTTestInput(CalculatorInput):
    """Input parameters for paired t-test."""

    mean_difference: float = Field(
        ...,
        description="Expected mean of the paired differences (delta)",
    )
    sd_difference: float = Field(
        ...,
        gt=0,
        description="Standard deviation of the paired differences (sigma_d)",
    )


class PairedTTestCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "paired_ttest",
            "name": "Paired t-Test",
            "description": (
                "Sample size for comparing paired (matched) means, e.g. before/after designs."
            ),
            "category": "means",
            "parameters": PairedTTestInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = PairedTTestInput(**params)
        delta = abs(inp.mean_difference)
        sd = inp.sd_difference

        if delta == 0:
            raise ValueError("mean_difference must be non-zero")

        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        n_exact = (z_alpha + z_beta) ** 2 * sd**2 / delta**2
        n = self._ceil(n_exact)

        # Iterative refinement: ensure exact power via noncentral t meets target
        for _ in range(20):
            pwr = self._power_from_n(n, delta, sd, inp.alpha, inp.alternative)
            if pwr >= inp.power:
                break
            n += 1

        achieved_power = self._power_from_n(n, delta, sd, inp.alpha, inp.alternative)
        effect_size = delta / sd  # Cohen's d_z

        return CalculatorOutput(
            sample_size_total=n,
            sample_size_per_group=[n],
            achieved_power=round(achieved_power, 6),
            effect_size=round(effect_size, 4),
            method="Paired t-Test",
            formula=r"n = \frac{(z_{\alpha/2} + z_{\beta})^2 \sigma_d^2}{\delta^2}",
            assumptions=[
                "Paired (matched) observations",
                "Normally distributed differences",
                f"{'Two' if inp.alternative == 'two_sided' else 'One'}-sided test",
            ],
            references=[
                "Chow SC, Shao J, Wang H (2008). Sample Size Calculations in Clinical Research, 2nd ed.",
            ],
            warnings=[],
        )

    def calculate_power(self, params: dict) -> float:
        inp = PairedTTestInput(**{k: v for k, v in params.items() if k != "n_total"})
        n = int(params["n_total"])
        delta = abs(inp.mean_difference)
        sd = inp.sd_difference
        return self._power_from_n(n, delta, sd, inp.alpha, inp.alternative)

    @staticmethod
    def _power_from_n(n: int, delta: float, sd: float, alpha: float, alternative: str) -> float:
        if n < 2:
            return 0.0
        df = n - 1
        se = sd / math.sqrt(n)
        ncp = delta / se

        if alternative == "two_sided":
            t_crit = stats.t.ppf(1.0 - alpha / 2.0, df)
            power = 1.0 - stats.nct.cdf(t_crit, df, ncp) + stats.nct.cdf(-t_crit, df, ncp)
        else:
            t_crit = stats.t.ppf(1.0 - alpha, df)
            power = 1.0 - stats.nct.cdf(t_crit, df, ncp)

        return float(np.clip(power, 0.0, 1.0))
