"""
2x2 Crossover design sample size and power calculator.

In a 2x2 crossover trial each subject receives both treatments in
random order. The variance relevant for the treatment comparison is
the within-subject variance.

Formula:
    n = (z_{alpha/2} + z_beta)^2 * 2 * sigma_w^2 / delta^2

where sigma_w is the within-subject standard deviation and delta is
the expected treatment difference.

Reference: Senn S (2002). Cross-over Trials in Clinical Research, 2nd ed.
"""

import math
from typing import List

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class Crossover2x2Input(CalculatorInput):
    """Input parameters for 2x2 crossover design."""

    mean_difference: float = Field(
        ...,
        description="Expected treatment difference (delta)",
    )
    sd_within: float = Field(
        ...,
        gt=0,
        description="Within-subject standard deviation (sigma_w)",
    )


class Crossover2x2Calculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "crossover_2x2",
            "name": "2x2 Crossover Design",
            "description": (
                "Sample size for a two-period, two-treatment crossover trial. "
                "Each subject serves as their own control."
            ),
            "category": "crossover",
            "parameters": Crossover2x2Input.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = Crossover2x2Input(**params)
        delta = abs(inp.mean_difference)
        sigma_w = inp.sd_within

        if delta == 0:
            raise ValueError("mean_difference must be non-zero")

        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        # n = total subjects (each measured twice)
        n_exact = (z_alpha + z_beta) ** 2 * 2 * sigma_w**2 / delta**2
        n = self._ceil(n_exact)
        # Ensure even number for balanced allocation to sequences
        if n % 2 != 0:
            n += 1

        # Iterative refinement: ensure exact power via noncentral t meets target
        for _ in range(20):
            pwr = self._power_from_n(n, delta, sigma_w, inp.alpha, inp.alternative)
            if pwr >= inp.power:
                break
            n += 2  # keep even

        achieved_power = self._power_from_n(n, delta, sigma_w, inp.alpha, inp.alternative)
        effect_size = delta / sigma_w

        return CalculatorOutput(
            sample_size_total=n,
            sample_size_per_group=[n // 2, n // 2],  # two sequences
            achieved_power=round(achieved_power, 6),
            effect_size=round(effect_size, 4),
            method="2x2 Crossover Design",
            formula=(
                r"n = \frac{(z_{\alpha/2} + z_{\beta})^2 \cdot 2\sigma_w^2}{\delta^2}"
            ),
            assumptions=[
                "Two-period, two-treatment crossover",
                "No carryover effect",
                "No period effect (or adequately modelled)",
                "Normally distributed within-subject differences",
                f"{'Two' if inp.alternative == 'two_sided' else 'One'}-sided test",
            ],
            references=[
                "Senn S (2002). Cross-over Trials in Clinical Research, 2nd ed. Wiley.",
                "Jones B, Kenward MG (2015). Design and Analysis of Cross-Over Trials, 3rd ed. CRC Press.",
            ],
            warnings=[],
        )

    def calculate_power(self, params: dict) -> float:
        inp = Crossover2x2Input(**{k: v for k, v in params.items() if k != "n_total"})
        n = int(params["n_total"])
        delta = abs(inp.mean_difference)
        sigma_w = inp.sd_within
        return self._power_from_n(n, delta, sigma_w, inp.alpha, inp.alternative)

    @staticmethod
    def _power_from_n(n: int, delta: float, sigma_w: float, alpha: float, alternative: str) -> float:
        if n < 2:
            return 0.0
        # In crossover, df = n - 2 (for the AB/BA design, df for treatment comparison)
        df = n - 2
        if df < 1:
            return 0.0

        se = sigma_w * math.sqrt(2.0 / n)
        ncp = delta / se

        if alternative == "two_sided":
            t_crit = stats.t.ppf(1.0 - alpha / 2.0, df)
            power = 1.0 - stats.nct.cdf(t_crit, df, ncp) + stats.nct.cdf(-t_crit, df, ncp)
        else:
            t_crit = stats.t.ppf(1.0 - alpha, df)
            power = 1.0 - stats.nct.cdf(t_crit, df, ncp)

        return float(np.clip(power, 0.0, 1.0))
