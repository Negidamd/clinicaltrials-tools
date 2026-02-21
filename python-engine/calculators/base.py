"""
Base calculator classes and shared models for the ClinicalTrials.Tools statistical engine.
"""

import math
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats


class CalculatorInput(BaseModel):
    """Base input model shared by all calculators."""

    alpha: float = Field(
        default=0.05,
        gt=0.0,
        lt=1.0,
        description="Significance level (Type I error rate)",
    )
    power: float = Field(
        default=0.80,
        gt=0.0,
        lt=1.0,
        description="Statistical power (1 - Type II error rate)",
    )
    alternative: str = Field(
        default="two_sided",
        description="Alternative hypothesis: 'two_sided', 'one_sided', or 'less'/'greater'",
    )
    allocation_ratio: float = Field(
        default=1.0,
        gt=0.0,
        description="Allocation ratio k = n2/n1 (ratio of group 2 to group 1 sample sizes)",
    )


class CalculatorOutput(BaseModel):
    """Standard output model returned by all calculators."""

    sample_size_total: int = Field(description="Total sample size across all groups")
    sample_size_per_group: List[int] = Field(
        description="Sample size for each group"
    )
    achieved_power: float = Field(
        description="Actual achieved power with the computed integer sample sizes"
    )
    effect_size: float = Field(description="Computed or supplied effect size")
    method: str = Field(description="Name of the statistical method used")
    formula: str = Field(description="LaTeX representation of the formula used")
    assumptions: List[str] = Field(
        default_factory=list, description="Assumptions underlying the calculation"
    )
    references: List[str] = Field(
        default_factory=list, description="Literature references for the method"
    )
    sensitivity_table: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Sensitivity analysis table varying key parameters",
    )
    power_curve_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Data points for generating a power curve plot",
    )
    version: str = Field(default="1.0.0", description="Calculator version")
    warnings: List[str] = Field(
        default_factory=list, description="Any warnings about the computation"
    )


class BaseCalculator(ABC):
    """Abstract base class for all sample size calculators."""

    @abstractmethod
    def calculate_sample_size(self, params: dict) -> CalculatorOutput:
        """Compute the required sample size given the input parameters."""
        ...

    @abstractmethod
    def calculate_power(self, params: dict) -> float:
        """Compute the achieved power for a given sample size and parameters."""
        ...

    @abstractmethod
    def get_description(self) -> dict:
        """Return a dictionary describing this calculator (name, id, description, etc.)."""
        ...

    # ------------------------------------------------------------------
    # Shared helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _z(alpha: float, alternative: str) -> float:
        """Return the critical z-value for the given alpha and alternative."""
        if alternative == "two_sided":
            return stats.norm.ppf(1.0 - alpha / 2.0)
        else:
            return stats.norm.ppf(1.0 - alpha)

    @staticmethod
    def _z_beta(power: float) -> float:
        """Return the z-value corresponding to the desired power."""
        return stats.norm.ppf(power)

    @staticmethod
    def _ceil(x: float) -> int:
        """Ceiling to the nearest integer, with safeguard for tiny float errors."""
        return int(math.ceil(x - 1e-10))

    # ------------------------------------------------------------------
    # Power curve generation
    # ------------------------------------------------------------------

    def generate_power_curve(
        self,
        params: dict,
        sample_sizes: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """Generate power values over a range of sample sizes.

        If *sample_sizes* is not provided, an automatic range is constructed
        from 10 to 2x the computed sample size.
        """
        if sample_sizes is None:
            result = self.calculate_sample_size(params)
            n_max = max(result.sample_size_total * 2, 40)
            sample_sizes = list(
                np.unique(
                    np.concatenate(
                        [
                            np.arange(10, n_max + 1, max(1, (n_max - 10) // 50)),
                            [result.sample_size_total],
                        ]
                    )
                ).astype(int)
            )

        powers: List[float] = []
        for n in sample_sizes:
            p = params.copy()
            p["n_total"] = int(n)
            try:
                pwr = self.calculate_power(p)
                powers.append(round(pwr, 6))
            except Exception:
                powers.append(None)

        return {
            "sample_sizes": [int(s) for s in sample_sizes],
            "powers": powers,
            "alpha": params.get("alpha", 0.05),
            "target_power": params.get("power", 0.80),
        }

    # ------------------------------------------------------------------
    # Sensitivity table generation
    # ------------------------------------------------------------------

    def generate_sensitivity_table(
        self,
        params: dict,
        vary_param: str,
        vary_values: List[float],
    ) -> Dict[str, Any]:
        """Generate a sensitivity table by varying one parameter."""
        rows: List[Dict[str, Any]] = []
        for val in vary_values:
            p = params.copy()
            p[vary_param] = val
            try:
                result = self.calculate_sample_size(p)
                rows.append(
                    {
                        vary_param: val,
                        "sample_size_total": result.sample_size_total,
                        "sample_size_per_group": result.sample_size_per_group,
                        "achieved_power": result.achieved_power,
                    }
                )
            except Exception as exc:
                rows.append(
                    {
                        vary_param: val,
                        "error": str(exc),
                    }
                )
        return {
            "varied_parameter": vary_param,
            "rows": rows,
        }
