"""
One-way ANOVA sample size and power calculator.

Power is computed via the noncentral F distribution:
    F ~ F(df1, df2, lambda)
where
    df1 = g - 1, df2 = N - g, lambda = N * f^2
    f = sigma_m / sigma  (Cohen's f)

Reference: Cohen J (1988). Statistical Power Analysis for the Behavioral
Sciences, 2nd ed., Erlbaum.
"""

import math
from typing import List, Optional

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class OneWayAnovaInput(CalculatorInput):
    """Input parameters for one-way ANOVA."""

    num_groups: int = Field(
        ...,
        ge=2,
        description="Number of groups (g >= 2)",
    )
    means: Optional[List[float]] = Field(
        default=None,
        description="Expected group means (length must equal num_groups). "
                    "Used to compute Cohen's f if effect_size_f is not provided.",
    )
    common_sd: Optional[float] = Field(
        default=None,
        gt=0,
        description="Common within-group standard deviation",
    )
    effect_size_f: Optional[float] = Field(
        default=None,
        gt=0,
        description="Cohen's f effect size. If provided, means and common_sd are optional.",
    )


class OneWayAnovaCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "one_way_anova",
            "name": "One-Way ANOVA",
            "description": (
                "Sample size for comparing g group means via one-way analysis of variance, "
                "using the noncentral F distribution."
            ),
            "category": "means",
            "parameters": OneWayAnovaInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = OneWayAnovaInput(**params)
        g = inp.num_groups
        f_effect = self._resolve_f(inp)
        warnings: List[str] = []

        if f_effect <= 0:
            raise ValueError("Effect size f must be positive")

        # Iterative search: find n_per_group such that power >= target
        # Start from the normal-approximation lower bound
        z_alpha = self._z(inp.alpha, "two_sided")  # ANOVA is always two-sided conceptually
        z_beta = self._z_beta(inp.power)

        # Rough starting estimate: n ~ (z_a + z_b)^2 / (f^2) + 1 per group
        n_per_group_start = max(2, self._ceil((z_alpha + z_beta) ** 2 / f_effect**2 / g) + 1)

        n_per_group = n_per_group_start
        for _ in range(10000):
            pwr = self._power_for_n(n_per_group, g, f_effect, inp.alpha)
            if pwr >= inp.power:
                break
            n_per_group += 1

        n_total = n_per_group * g
        achieved_power = self._power_for_n(n_per_group, g, f_effect, inp.alpha)

        return CalculatorOutput(
            sample_size_total=n_total,
            sample_size_per_group=[n_per_group] * g,
            achieved_power=round(achieved_power, 6),
            effect_size=round(f_effect, 4),
            method="One-Way ANOVA (Noncentral F)",
            formula=(
                r"\lambda = N f^2, \quad "
                r"f = \frac{\sigma_m}{\sigma}, \quad "
                r"1 - \beta = P\left(F_{g-1, N-g, \lambda} > F_{\alpha, g-1, N-g}\right)"
            ),
            assumptions=[
                "Independent observations",
                "Normally distributed outcomes in each group",
                "Equal variances (homoscedasticity) across groups",
                "Equal group sizes",
            ],
            references=[
                "Cohen J (1988). Statistical Power Analysis for the Behavioral Sciences, 2nd ed.",
            ],
            warnings=warnings,
        )

    def calculate_power(self, params: dict) -> float:
        inp = OneWayAnovaInput(**{k: v for k, v in params.items() if k != "n_total"})
        n_total = int(params["n_total"])
        g = inp.num_groups
        f_effect = self._resolve_f(inp)
        n_per_group = max(2, n_total // g)
        return self._power_for_n(n_per_group, g, f_effect, inp.alpha)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _resolve_f(self, inp: OneWayAnovaInput) -> float:
        """Resolve Cohen's f from inputs."""
        if inp.effect_size_f is not None:
            return inp.effect_size_f
        if inp.means is not None and inp.common_sd is not None:
            if len(inp.means) != inp.num_groups:
                raise ValueError("Length of means must equal num_groups")
            grand_mean = np.mean(inp.means)
            sigma_m = math.sqrt(np.mean([(m - grand_mean) ** 2 for m in inp.means]))
            return sigma_m / inp.common_sd
        raise ValueError("Provide either effect_size_f, or both means and common_sd.")

    @staticmethod
    def _power_for_n(n_per_group: int, g: int, f_effect: float, alpha: float) -> float:
        """Exact power via noncentral F distribution."""
        N = n_per_group * g
        df1 = g - 1
        df2 = N - g
        if df2 < 1:
            return 0.0

        lam = N * f_effect**2  # noncentrality parameter

        f_crit = stats.f.ppf(1.0 - alpha, df1, df2)
        power = 1.0 - stats.ncf.cdf(f_crit, df1, df2, lam)
        return float(np.clip(power, 0.0, 1.0))
