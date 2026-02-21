"""
Non-inferiority test for two proportions -- sample size and power calculator.

Implements the Farrington-Manning (1990) approach for testing non-inferiority
of a treatment proportion relative to a control proportion.

H0: p_T - p_C <= -Delta_NI   (treatment is inferior)
H1: p_T - p_C >  -Delta_NI   (treatment is non-inferior)

Reference:
- Farrington CP, Manning G (1990). Test statistics and sample size formulae
  for comparative binomial trials with null hypothesis of non-zero risk
  difference or non-unity relative risk. Statistics in Medicine, 9, 1447-1454.
- Blackwelder WC (1982). "Proving the null hypothesis" in clinical trials.
  Controlled Clinical Trials, 3, 345-353.
"""

import math
from typing import List

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats

from .base import BaseCalculator, CalculatorInput, CalculatorOutput


class NonInferiorityProportionsInput(CalculatorInput):
    """Input parameters for non-inferiority test of two proportions."""

    p_treatment: float = Field(
        ...,
        gt=0.0,
        lt=1.0,
        description="Expected proportion in the treatment group",
    )
    p_control: float = Field(
        ...,
        gt=0.0,
        lt=1.0,
        description="Expected proportion in the control group",
    )
    non_inferiority_margin: float = Field(
        ...,
        gt=0.0,
        lt=1.0,
        description="Non-inferiority margin (Delta_NI > 0, on the risk-difference scale)",
    )
    alternative: str = Field(
        default="one_sided",
        description="Should be 'one_sided' for non-inferiority",
    )


class NonInferiorityProportionsCalculator(BaseCalculator):

    def get_description(self) -> dict:
        return {
            "id": "non_inferiority_proportions",
            "name": "Non-Inferiority Test for Proportions",
            "description": (
                "Sample size for a non-inferiority trial comparing two proportions "
                "using the Farrington-Manning method."
            ),
            "category": "non_inferiority",
            "parameters": NonInferiorityProportionsInput.model_json_schema(),
        }

    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        inp = NonInferiorityProportionsInput(**params)
        pT = inp.p_treatment
        pC = inp.p_control
        margin = inp.non_inferiority_margin
        k = inp.allocation_ratio
        warnings: List[str] = []

        delta = pT - pC  # expected true difference
        # Under H1, the actual difference is delta; we need delta > -margin
        # i.e. delta + margin > 0 for the test to make sense
        if delta + margin <= 0:
            raise ValueError(
                "Expected treatment proportion is worse than the NI margin allows."
            )

        z_alpha = stats.norm.ppf(1.0 - inp.alpha)  # one-sided
        z_beta = self._z_beta(inp.power)

        # Farrington-Manning approach:
        # Under H0: p_T - p_C = -margin
        # Restricted MLE proportions under H0
        p_T0, p_C0 = self._restricted_mle(pT, pC, margin, k)

        # Variance under H0 (restricted)
        var_h0 = p_T0 * (1 - p_T0) + p_C0 * (1 - p_C0) / k

        # Variance under H1 (unrestricted)
        var_h1 = pT * (1 - pT) + pC * (1 - pC) / k

        # Sample size formula
        numerator = (z_alpha * math.sqrt(var_h0) + z_beta * math.sqrt(var_h1)) ** 2
        d = delta + margin  # distance from NI boundary under H1
        n1_exact = numerator / d**2

        n1 = self._ceil(n1_exact)
        n2 = self._ceil(n1_exact * k)

        # Iterative refinement to ensure exact power meets target
        for _ in range(20):
            pwr = self._power_from_n(n1, n2, pT, pC, margin, inp.alpha)
            if pwr >= inp.power:
                break
            n1 += 1
            n2 = self._ceil(n1 * k)

        n_total = n1 + n2

        achieved_power = self._power_from_n(n1, n2, pT, pC, margin, inp.alpha)

        return CalculatorOutput(
            sample_size_total=n_total,
            sample_size_per_group=[n1, n2],
            achieved_power=round(achieved_power, 6),
            effect_size=round(d, 4),
            method="Non-Inferiority Test for Proportions (Farrington-Manning 1990)",
            formula=(
                r"n_1 = \frac{\left[z_{\alpha}\sqrt{\hat{V}_0} "
                r"+ z_{\beta}\sqrt{V_1}\right]^2}{(\delta + \Delta_{NI})^2}"
            ),
            assumptions=[
                "Independent samples",
                "Binary outcomes",
                "One-sided test (non-inferiority)",
                f"Non-inferiority margin Delta_NI = {margin}",
                "Farrington-Manning restricted MLE variance under H0",
            ],
            references=[
                "Farrington CP, Manning G (1990). Statistics in Medicine, 9, 1447-1454.",
                "Blackwelder WC (1982). Controlled Clinical Trials, 3, 345-353.",
            ],
            warnings=warnings,
        )

    def calculate_power(self, params: dict) -> float:
        inp = NonInferiorityProportionsInput(
            **{k: v for k, v in params.items() if k != "n_total"}
        )
        n_total = int(params["n_total"])
        k = inp.allocation_ratio
        n1 = max(2, self._ceil(n_total / (1.0 + k)))
        n2 = n_total - n1
        return self._power_from_n(
            n1, n2, inp.p_treatment, inp.p_control,
            inp.non_inferiority_margin, inp.alpha,
        )

    # ------------------------------------------------------------------
    # Farrington-Manning restricted MLE
    # ------------------------------------------------------------------

    @staticmethod
    def _restricted_mle(pT: float, pC: float, margin: float, k: float):
        """
        Compute the restricted MLE of (p_T, p_C) under H0: p_T - p_C = -margin.

        Under the constraint p_T = p_C - margin, maximise the likelihood.
        This leads to a quadratic in p_C.
        """
        # Under H0 constraint: p_T = p_C - margin
        # We find the MLE of p_C that maximises the binomial likelihood
        # subject to this constraint. With allocation ratio k = n2/n1:
        #
        # The combined likelihood leads to:
        #   (1 + k) * p_C^2 - [pT + margin + k*pC_obs + margin + (1+k)*margin/(1+k)] * p_C + ...
        #
        # Simplification: use the pooled approach
        # p_hat_pooled = (pT + k*pC) / (1+k)
        # Under constraint pT_0 = pC_0 - margin:
        #   p_hat_pooled = (pC_0 - margin + k*pC_0) / (1+k)
        #   (1+k)*p_hat_pooled = pC_0*(1+k) - margin
        #   pC_0 = p_hat_pooled + margin/(1+k) ... but this is approximate

        # Exact: solve the quadratic from the score equation
        # Let r = 1/k (ratio n1/n2 inverted for the equation)
        # a*pC^2 + b*pC + c = 0
        a = 1.0 + k
        b = -(1.0 + k) * (pC + margin) - k * pC - pT + margin
        # b simplification: -(pC + margin) - k*(pC + margin) - k*pC - pT + margin
        #   = -(pC + margin)(1+k) - k*pC - pT + margin
        # Let me re-derive cleanly:
        # We want MLE of theta = p_C under constraint p_T = theta - margin
        # Score: n1*(pT - (theta-margin))/((theta-margin)*(1-(theta-margin)))
        #      + n2*(pC - theta)/(theta*(1-theta)) = 0
        # With n2 = k*n1, and using pT, pC as observed (expected) values:
        # (pT - theta + margin) / ((theta-margin)*(1-theta+margin))
        #   + k*(pC - theta) / (theta*(1-theta)) = 0

        # Numerical solution via bisection (robust)
        from scipy.optimize import brentq

        def score(theta):
            pt0 = theta - margin
            if pt0 <= 0 or pt0 >= 1 or theta <= 0 or theta >= 1:
                return float("inf")
            term1 = (pT - pt0) / (pt0 * (1.0 - pt0))
            term2 = k * (pC - theta) / (theta * (1.0 - theta))
            return term1 + term2

        lo = margin + 1e-8
        hi = 1.0 - 1e-8
        try:
            pC_0 = brentq(score, lo, hi, xtol=1e-12)
        except ValueError:
            # fallback: approximate
            pC_0 = pC
        pT_0 = pC_0 - margin
        pT_0 = max(1e-8, min(1 - 1e-8, pT_0))
        return pT_0, pC_0

    def _power_from_n(
        self, n1: int, n2: int, pT: float, pC: float, margin: float, alpha: float,
    ) -> float:
        k = n2 / n1 if n1 > 0 else 1.0
        delta = pT - pC
        d = delta + margin

        pT_0, pC_0 = self._restricted_mle(pT, pC, margin, k)
        se_h0 = math.sqrt(pT_0 * (1 - pT_0) / n1 + pC_0 * (1 - pC_0) / n2)
        se_h1 = math.sqrt(pT * (1 - pT) / n1 + pC * (1 - pC) / n2)

        if se_h0 == 0 or se_h1 == 0:
            return 1.0

        z_crit = stats.norm.ppf(1.0 - alpha)
        z_power = (d - z_crit * se_h0) / se_h1
        power = stats.norm.cdf(z_power)
        return float(np.clip(power, 0.0, 1.0))
