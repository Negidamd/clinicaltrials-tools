"""
Log-rank test sample size and power calculator for time-to-event (survival) endpoints.

References:
- Schoenfeld DA (1983). Sample-size formula for the proportional-hazards
  regression model. Biometrics, 39(2), 499-503.
- Freedman LS (1982). Tables of the number of patients required in clinical
  trials using the logrank test. Statistics in Medicine, 1(2), 121-129.
- Lachin JM, Foulkes MA (1986). Evaluation of sample size and power for
  analyses of survival with allowance for nonuniform patient entry, losses
  to follow-up, noncompliance, and stratification. Biometrics, 42, 507-519.
"""

import math
from typing import List, Optional

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class LogRankInput(CalculatorInput):
    """Input parameters for the log-rank test sample size calculation."""

    hazard_ratio: float = Field(
        ...,
        gt=0.0,
        description="Hazard ratio (treatment/control). HR < 1 implies treatment benefit.",
    )
    prob_event_control: float = Field(
        ...,
        gt=0.0,
        le=1.0,
        description="Probability of event in the control group over the study period",
    )
    accrual_time: Optional[float] = Field(
        default=None,
        gt=0,
        description="Accrual period in time units (optional, for Lachin-Foulkes adjustment)",
    )
    followup_time: Optional[float] = Field(
        default=None,
        gt=0,
        description="Minimum follow-up time after end of accrual (optional)",
    )
    dropout_rate: float = Field(
        default=0.0,
        ge=0.0,
        lt=1.0,
        description="Expected proportion lost to follow-up / dropout",
    )
    method: str = Field(
        default="schoenfeld",
        description="Method: 'schoenfeld' (1983) or 'freedman' (1982)",
    )


class LogRankCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "log_rank",
            "name": "Log-Rank Test (Survival)",
            "description": (
                "Sample size for time-to-event endpoints comparing two survival curves "
                "using the log-rank test (Schoenfeld 1983 or Freedman 1982)."
            ),
            "category": "survival",
            "parameters": LogRankInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = LogRankInput(**params)
        hr = inp.hazard_ratio
        k = inp.allocation_ratio  # n2/n1  (control/treatment or vice versa)
        warnings: List[str] = []

        if hr == 1.0:
            raise ValueError("hazard_ratio must differ from 1.0")

        z_alpha = self._z(inp.alpha, inp.alternative)
        z_beta = self._z_beta(inp.power)

        if inp.method == "freedman":
            d, n_total = self._freedman(hr, k, z_alpha, z_beta, inp)
        else:
            d, n_total = self._schoenfeld(hr, k, z_alpha, z_beta, inp)

        # Adjust for dropout
        if inp.dropout_rate > 0:
            n_total_adj = math.ceil(n_total / (1.0 - inp.dropout_rate))
            warnings.append(
                f"Sample size inflated from {n_total} to {n_total_adj} "
                f"to account for {inp.dropout_rate:.0%} dropout."
            )
            n_total = n_total_adj

        n1 = self._ceil(n_total / (1.0 + k))
        n2 = n_total - n1

        achieved_power = self._power_from_events(d, hr, k, inp.alpha, inp.alternative)

        method_label = (
            "Log-Rank Test (Schoenfeld 1983)" if inp.method == "schoenfeld"
            else "Log-Rank Test (Freedman 1982)"
        )

        return CalculatorOutput(
            sample_size_total=n_total,
            sample_size_per_group=[n1, n2],
            achieved_power=round(achieved_power, 6),
            effect_size=round(math.log(hr), 4),
            method=method_label,
            formula=self._latex(inp.method),
            assumptions=[
                "Proportional hazards assumption",
                "Exponential (constant hazard) within each group",
                f"{'Two' if inp.alternative == 'two_sided' else 'One'}-sided test",
                f"Allocation ratio k = {k}",
            ],
            references=[
                "Schoenfeld DA (1983). Sample-size formula for the proportional-hazards regression model. Biometrics, 39(2), 499-503.",
                "Freedman LS (1982). Tables of the number of patients required in clinical trials using the logrank test. Statistics in Medicine, 1(2), 121-129.",
            ],
            warnings=warnings,
        )

    def calculate_power(self, params: dict) -> float:
        inp = LogRankInput(**{k: v for k, v in params.items() if k != "n_total"})
        n_total = int(params["n_total"])
        hr = inp.hazard_ratio
        k = inp.allocation_ratio

        # Estimate events from n_total
        p_event = self._overall_event_prob(inp)
        d = self._ceil(n_total * p_event)

        return self._power_from_events(d, hr, k, inp.alpha, inp.alternative)

    # ------------------------------------------------------------------
    # Schoenfeld (1983)
    # ------------------------------------------------------------------

    def _schoenfeld(self, hr, k, z_alpha, z_beta, inp):
        """
        D = (z_alpha + z_beta)^2 / [p1 * p2 * (log HR)^2]
        where p1 = 1/(1+k), p2 = k/(1+k) are the allocation fractions.
        """
        p1 = 1.0 / (1.0 + k)
        p2 = k / (1.0 + k)
        log_hr = math.log(hr)

        d_exact = (z_alpha + z_beta) ** 2 / (p1 * p2 * log_hr**2)
        d = self._ceil(d_exact)

        # Convert events to total sample size
        p_event = self._overall_event_prob(inp)
        n_total = self._ceil(d / p_event)

        return d, n_total

    # ------------------------------------------------------------------
    # Freedman (1982)
    # ------------------------------------------------------------------

    def _freedman(self, hr, k, z_alpha, z_beta, inp):
        """
        D = (z_alpha + z_beta)^2 * (1 + k*HR)^2 / [k * (HR - 1)^2]
        """
        d_exact = (z_alpha + z_beta) ** 2 * (1.0 + k * hr) ** 2 / (k * (hr - 1.0) ** 2)
        d = self._ceil(d_exact)

        p_event = self._overall_event_prob(inp)
        n_total = self._ceil(d / p_event)

        return d, n_total

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _overall_event_prob(self, inp: LogRankInput) -> float:
        """Compute overall probability of event, accounting for both groups."""
        p_event_ctrl = inp.prob_event_control
        hr = inp.hazard_ratio
        k = inp.allocation_ratio

        # Under exponential model, p_event_trt = 1 - (1 - p_event_ctrl)^HR
        p_event_trt = 1.0 - (1.0 - p_event_ctrl) ** hr

        # Overall event probability (weighted by allocation)
        p_event = (p_event_trt + k * p_event_ctrl) / (1.0 + k)
        return max(p_event, 0.001)

    @staticmethod
    def _power_from_events(d: int, hr: float, k: float, alpha: float, alternative: str) -> float:
        """Compute power given the number of events using Schoenfeld formula."""
        p1 = 1.0 / (1.0 + k)
        p2 = k / (1.0 + k)
        log_hr = math.log(hr)

        if alternative == "two_sided":
            z_crit = stats.norm.ppf(1.0 - alpha / 2.0)
        else:
            z_crit = stats.norm.ppf(1.0 - alpha)

        z_power = abs(log_hr) * math.sqrt(d * p1 * p2) - z_crit
        power = stats.norm.cdf(z_power)
        return float(np.clip(power, 0.0, 1.0))

    @staticmethod
    def _latex(method: str) -> str:
        if method == "freedman":
            return (
                r"D = \frac{(z_{\alpha/2} + z_{\beta})^2 (1 + k \cdot HR)^2}"
                r"{k (HR - 1)^2}"
            )
        return (
            r"D = \frac{(z_{\alpha/2} + z_{\beta})^2}"
            r"{p_1 p_2 (\log HR)^2}"
        )
