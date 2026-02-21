"""
McNemar's test sample size and power calculator.

For paired binary data (e.g. before/after, matched case-control):

    H0: p_10 = p_01  (discordant proportions are equal)
    H1: p_10 != p_01

Formula (Connor 1987):
    n = [z_{alpha/2} * sqrt(p_d) + z_beta * sqrt(p_d - delta^2)]^2 / delta^2

where
    p_d = p_10 + p_01 (total discordant proportion)
    delta = p_10 - p_01

Reference:
- Connor RJ (1987). Sample size for testing differences in proportions
  for the paired-sample design. Biometrics, 43, 207-211.
- Lachin JM (1992). Power and sample size evaluation for the McNemar
  test with application to matched case-control studies. Statistics
  in Medicine, 11, 1239-1251.
"""

import math
from typing import List

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class McNemarInput(CalculatorInput):
    """Input parameters for McNemar's test."""

    p_discordant_10: float = Field(
        ...,
        gt=0.0,
        lt=1.0,
        description="Proportion of discordant pairs where outcome is (1,0) — "
                    "i.e. positive on first measure, negative on second",
    )
    p_discordant_01: float = Field(
        ...,
        gt=0.0,
        lt=1.0,
        description="Proportion of discordant pairs where outcome is (0,1)",
    )
    continuity_correction: bool = Field(
        default=False,
        description="Apply continuity correction (Edwards 1948)",
    )


class McNemarCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "mcnemar",
            "name": "McNemar's Test",
            "description": (
                "Sample size for paired binary data using McNemar's test "
                "(Connor 1987 / Lachin 1992)."
            ),
            "category": "proportions",
            "parameters": McNemarInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = McNemarInput(**params)
        p10 = inp.p_discordant_10
        p01 = inp.p_discordant_01
        warnings: List[str] = []

        delta = p10 - p01
        if delta == 0:
            raise ValueError("p_discordant_10 and p_discordant_01 must differ")

        p_d = p10 + p01  # total discordant proportion
        if p_d >= 1.0:
            raise ValueError("Sum of discordant proportions must be < 1")

        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        # Connor (1987)
        term_h0 = z_alpha * math.sqrt(p_d)
        inner = p_d - delta**2
        if inner < 0:
            raise ValueError("Invalid parameter combination: p_d - delta^2 < 0")
        term_h1 = z_beta * math.sqrt(inner)

        n_exact = (term_h0 + term_h1) ** 2 / delta**2

        if inp.continuity_correction:
            # Edwards continuity correction for McNemar
            # n_cc = n/4 * (1 + sqrt(1 + 4/(n*|delta|)))^2
            n_unc = n_exact
            n_exact = (n_unc / 4.0) * (
                1.0 + math.sqrt(1.0 + 4.0 / (n_unc * abs(delta)))
            ) ** 2

        n = self._ceil(n_exact)

        # Iterative refinement to ensure power meets target
        for _ in range(20):
            pwr = self._power_from_n(n, p10, p01, inp.alpha, inp.alternative)
            if pwr >= inp.power:
                break
            n += 1

        achieved_power = self._power_from_n(n, p10, p01, inp.alpha, inp.alternative)

        # Effect size: odds ratio of discordant pairs
        odds_ratio = p10 / p01 if p01 > 0 else float("inf")

        return CalculatorOutput(
            sample_size_total=n,
            sample_size_per_group=[n],  # n pairs
            achieved_power=round(achieved_power, 6),
            effect_size=round(abs(delta), 4),
            method="McNemar's Test (Connor 1987)",
            formula=(
                r"n = \frac{\left[z_{\alpha/2}\sqrt{p_d} "
                r"+ z_{\beta}\sqrt{p_d - \delta^2}\right]^2}{\delta^2}, "
                r"\quad \delta = p_{10} - p_{01}"
            ),
            assumptions=[
                "Paired (matched) binary data",
                f"Total discordant proportion p_d = {p_d:.4f}",
                f"Discordant odds ratio = {odds_ratio:.3f}",
                f"{'Two' if inp.alternative == 'two_sided' else 'One'}-sided test",
            ],
            references=[
                "Connor RJ (1987). Biometrics, 43, 207-211.",
                "Lachin JM (1992). Statistics in Medicine, 11, 1239-1251.",
            ],
            warnings=warnings,
        )

    def calculate_power(self, params: dict) -> float:
        inp = McNemarInput(**{k: v for k, v in params.items() if k != "n_total"})
        n = int(params["n_total"])
        return self._power_from_n(
            n, inp.p_discordant_10, inp.p_discordant_01, inp.alpha, inp.alternative,
        )

    @staticmethod
    def _power_from_n(
        n: int, p10: float, p01: float, alpha: float, alternative: str,
    ) -> float:
        """Power calculation for McNemar's test."""
        if n < 1:
            return 0.0

        delta = p10 - p01
        p_d = p10 + p01

        # Under H0, the expected number of discordant pairs going each way
        # is n*p_d/2 each. Under H1, it's n*p10 and n*p01.
        # The McNemar test statistic is approximately normal:
        #   Z = (n*delta) / sqrt(n*p_d)  = sqrt(n) * delta / sqrt(p_d)

        if p_d == 0:
            return 1.0 if delta != 0 else 0.0

        se_h0 = math.sqrt(p_d / n)
        inner = p_d - delta**2
        if inner <= 0:
            return 1.0
        se_h1 = math.sqrt(inner / n)

        if se_h0 == 0 or se_h1 == 0:
            return 1.0

        if alternative == "two_sided":
            z_crit = stats.norm.ppf(1.0 - alpha / 2.0)
            power = stats.norm.cdf((abs(delta) - z_crit * se_h0) / se_h1)
            # Add lower tail
            power += stats.norm.cdf((-abs(delta) - z_crit * se_h0) / se_h1)
        else:
            z_crit = stats.norm.ppf(1.0 - alpha)
            power = stats.norm.cdf((abs(delta) - z_crit * se_h0) / se_h1)

        return float(np.clip(power, 0.0, 1.0))
