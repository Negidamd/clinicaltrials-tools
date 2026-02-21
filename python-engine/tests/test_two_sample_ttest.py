"""
Tests for the two-sample t-test sample size calculator.

Known reference values verified against:
- nQuery Advisor output
- G*Power 3 output
- R pwr::pwr.t.test and TrialSize::TwoSampleMean.NIS
- Lachin (1981) textbook examples

Note: The calculator uses the Lachin (1981) z-based formula as a starting
point, then iteratively increases n until the exact power (via noncentral t)
meets or exceeds the target. Therefore the achieved power always >= target,
and the sample size may be 1-2 units above the pure z-approximation ceiling.
"""

import math
import sys
import os

import pytest

# Ensure the project root is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from calculators.two_sample_ttest import TwoSampleTTestCalculator


@pytest.fixture
def calc():
    return TwoSampleTTestCalculator()


class TestTwoSampleTTestSampleSize:
    """Test sample size calculations against known values."""

    def test_equal_sd_equal_allocation_two_sided(self, calc):
        """
        delta=5, common_sd=10, alpha=0.05, power=0.80, two-sided, k=1
        Z-approximation gives n1=63, but exact t-power at 63 is ~0.795.
        After iterative refinement: n1=64, total=128, exact power >= 0.80.
        """
        result = calc.calculate_sample_size({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "two_sided",
            "allocation_ratio": 1.0,
        })

        assert result.sample_size_per_group[0] == 64
        assert result.sample_size_per_group[1] == 64
        assert result.sample_size_total == 128
        assert result.achieved_power >= 0.80

    def test_equal_sd_equal_allocation_one_sided(self, calc):
        """
        One-sided test: delta=5, common_sd=10, alpha=0.05, power=0.80
        After iterative refinement: n1=51, total=102, power >= 0.80.
        """
        result = calc.calculate_sample_size({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "one_sided",
            "allocation_ratio": 1.0,
        })

        assert result.sample_size_per_group[0] == 51
        assert result.sample_size_per_group[1] == 51
        assert result.sample_size_total == 102
        assert result.achieved_power >= 0.80

    def test_unequal_allocation_ratio(self, calc):
        """
        Unequal allocation k=2 (n2 = 2*n1):
        delta=5, common_sd=10, alpha=0.05, power=0.80, two-sided
        After refinement: n1=49, n2=98, total=147, power >= 0.80.
        """
        result = calc.calculate_sample_size({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "two_sided",
            "allocation_ratio": 2.0,
        })

        assert result.sample_size_per_group[0] == 49
        assert result.sample_size_per_group[1] == 98
        assert result.sample_size_total == 147
        assert result.achieved_power >= 0.80

    def test_unequal_variances(self, calc):
        """
        Unequal SDs: sd1=8, sd2=12, delta=5, alpha=0.05, power=0.80, two-sided
        After refinement: n1=67, n2=67, total=134, power >= 0.80.
        """
        result = calc.calculate_sample_size({
            "mean_difference": 5.0,
            "sd_group1": 8.0,
            "sd_group2": 12.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "two_sided",
            "allocation_ratio": 1.0,
        })

        assert result.sample_size_per_group[0] == 67
        assert result.sample_size_per_group[1] == 67
        assert result.sample_size_total == 134
        assert result.achieved_power >= 0.80
        assert "Unequal variances" in result.warnings[0]

    def test_high_power(self, calc):
        """
        Higher power (0.90):
        delta=5, common_sd=10, alpha=0.05, power=0.90, two-sided
        After refinement: n1=86, n2=86, total=172, power >= 0.90.
        """
        result = calc.calculate_sample_size({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.90,
            "alternative": "two_sided",
            "allocation_ratio": 1.0,
        })

        assert result.sample_size_per_group[0] == 86
        assert result.sample_size_per_group[1] == 86
        assert result.sample_size_total == 172
        assert result.achieved_power >= 0.90

    def test_small_effect_size(self, calc):
        """
        Small effect (d=0.2, i.e. delta=2, sd=10):
        After refinement: n1=394, total=788, power >= 0.80.
        """
        result = calc.calculate_sample_size({
            "mean_difference": 2.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "two_sided",
            "allocation_ratio": 1.0,
        })

        assert result.sample_size_per_group[0] == 394
        assert result.sample_size_per_group[1] == 394
        assert result.sample_size_total == 788
        assert result.achieved_power >= 0.80

    def test_effect_size_computation(self, calc):
        """Verify Cohen's d is computed correctly."""
        result = calc.calculate_sample_size({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "two_sided",
        })
        assert abs(result.effect_size - 0.5) < 0.001

    def test_negative_mean_difference(self, calc):
        """Negative mean_difference should give same sample size as positive."""
        r_pos = calc.calculate_sample_size({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
        })
        r_neg = calc.calculate_sample_size({
            "mean_difference": -5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
        })
        assert r_pos.sample_size_total == r_neg.sample_size_total

    def test_zero_difference_raises(self, calc):
        """mean_difference=0 should raise ValueError."""
        with pytest.raises(ValueError, match="non-zero"):
            calc.calculate_sample_size({
                "mean_difference": 0.0,
                "common_sd": 10.0,
            })

    def test_missing_sd_raises(self, calc):
        """Must provide common_sd or both sd_group1 and sd_group2."""
        with pytest.raises(ValueError, match="common_sd"):
            calc.calculate_sample_size({
                "mean_difference": 5.0,
                "sd_group1": 10.0,
                # sd_group2 missing
            })


class TestTwoSampleTTestPower:
    """Test power calculations."""

    def test_power_at_computed_n(self, calc):
        """Power at the computed sample size should meet or exceed target."""
        result = calc.calculate_sample_size({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "two_sided",
        })
        power = calc.calculate_power({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "alternative": "two_sided",
            "n_total": result.sample_size_total,
        })
        assert power >= 0.80

    def test_power_increases_with_n(self, calc):
        """Power should increase monotonically with sample size."""
        base_params = {
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "alternative": "two_sided",
        }
        powers = []
        for n in [20, 50, 100, 200, 500]:
            p = calc.calculate_power({**base_params, "n_total": n})
            powers.append(p)

        for i in range(1, len(powers)):
            assert powers[i] >= powers[i - 1], (
                f"Power should increase: n={[20,50,100,200,500][i]} "
                f"gave power={powers[i]:.4f} <= {powers[i-1]:.4f}"
            )

    def test_power_small_n(self, calc):
        """Very small n should yield low power."""
        power = calc.calculate_power({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "alternative": "two_sided",
            "n_total": 10,
        })
        assert power < 0.30

    def test_power_at_90_target(self, calc):
        """Verify power >= 0.90 at the computed n for 90% power target."""
        result = calc.calculate_sample_size({
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.90,
            "alternative": "two_sided",
        })
        assert result.achieved_power >= 0.90


class TestTwoSampleTTestPowerCurve:
    """Test power curve generation."""

    def test_power_curve_auto_range(self, calc):
        params = {
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "two_sided",
        }
        curve = calc.generate_power_curve(params)
        assert "sample_sizes" in curve
        assert "powers" in curve
        assert len(curve["sample_sizes"]) == len(curve["powers"])
        assert len(curve["sample_sizes"]) > 5

    def test_power_curve_custom_range(self, calc):
        params = {
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "two_sided",
        }
        curve = calc.generate_power_curve(params, sample_sizes=[50, 100, 150, 200])
        assert curve["sample_sizes"] == [50, 100, 150, 200]
        assert len(curve["powers"]) == 4


class TestTwoSampleTTestSensitivity:
    """Test sensitivity table generation."""

    def test_sensitivity_vary_power(self, calc):
        params = {
            "mean_difference": 5.0,
            "common_sd": 10.0,
            "alpha": 0.05,
            "power": 0.80,
            "alternative": "two_sided",
        }
        table = calc.generate_sensitivity_table(
            params, "power", [0.70, 0.80, 0.90, 0.95]
        )
        assert table["varied_parameter"] == "power"
        assert len(table["rows"]) == 4
        # Higher power should yield larger sample sizes
        sizes = [r["sample_size_total"] for r in table["rows"]]
        for i in range(1, len(sizes)):
            assert sizes[i] >= sizes[i - 1]
