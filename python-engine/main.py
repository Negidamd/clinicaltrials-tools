"""
ClinicalTrials.Tools -- Python Statistical Engine

FastAPI application providing sample size and power calculation endpoints
for a wide range of clinical trial designs.
"""

from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --------------- Calculator registry ---------------
from calculators.two_sample_ttest import TwoSampleTTestCalculator
from calculators.two_proportions import TwoProportionsCalculator
from calculators.paired_ttest import PairedTTestCalculator
from calculators.one_proportion import OneProportionCalculator
from calculators.log_rank import LogRankCalculator
from calculators.non_inferiority_means import NonInferiorityMeansCalculator
from calculators.non_inferiority_proportions import NonInferiorityProportionsCalculator
from calculators.one_way_anova import OneWayAnovaCalculator
from calculators.correlation import CorrelationCalculator
from calculators.cluster_rct import ClusterRCTCalculator
from calculators.crossover_2x2 import Crossover2x2Calculator
from calculators.mcnemar import McNemarCalculator

CALCULATORS = {
    "two_sample_ttest": TwoSampleTTestCalculator(),
    "two_proportions": TwoProportionsCalculator(),
    "paired_ttest": PairedTTestCalculator(),
    "one_proportion": OneProportionCalculator(),
    "log_rank": LogRankCalculator(),
    "non_inferiority_means": NonInferiorityMeansCalculator(),
    "non_inferiority_proportions": NonInferiorityProportionsCalculator(),
    "one_way_anova": OneWayAnovaCalculator(),
    "correlation": CorrelationCalculator(),
    "cluster_rct": ClusterRCTCalculator(),
    "crossover_2x2": Crossover2x2Calculator(),
    "mcnemar": McNemarCalculator(),
}

# --------------- FastAPI app ---------------
app = FastAPI(
    title="ClinicalTrials.Tools Statistical Engine",
    description=(
        "A comprehensive statistical engine for clinical trial sample size "
        "and power calculations. Implements well-referenced formulas from "
        "Lachin, Fleiss, Schoenfeld, Cohen, and others."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS -- allow the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------- Request / response models ---------------

class CalculateRequest(BaseModel):
    """Generic request body for all calculators."""
    params: Dict[str, Any] = Field(
        ..., description="Calculator-specific parameters (see /api/v1/calculators for details)"
    )


class PowerCurveRequest(BaseModel):
    params: Dict[str, Any]
    sample_sizes: Optional[List[int]] = Field(
        default=None,
        description="Optional explicit list of total sample sizes to evaluate",
    )


class SensitivityRequest(BaseModel):
    params: Dict[str, Any]
    vary_param: str = Field(
        ..., description="Name of the parameter to vary"
    )
    vary_values: List[float] = Field(
        ..., description="Values to sweep over"
    )


class HealthResponse(BaseModel):
    status: str
    version: str
    calculators_available: int


# --------------- Endpoints ---------------

@app.get("/api/v1/health", response_model=HealthResponse, tags=["meta"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        calculators_available=len(CALCULATORS),
    )


@app.get("/api/v1/calculators", tags=["meta"])
async def list_calculators():
    """List all available calculators with their descriptions and parameter schemas."""
    return {
        cid: calc.get_description() for cid, calc in CALCULATORS.items()
    }


@app.post("/api/v1/calculate/{calculator_type}", tags=["calculate"])
async def calculate_sample_size(calculator_type: str, request: CalculateRequest):
    """Calculate sample size for the specified calculator type."""
    calc = _get_calculator(calculator_type)
    try:
        result = calc.calculate_sample_size(request.params)
        return result.model_dump()
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Calculation error: {exc}")


@app.post("/api/v1/power-curve/{calculator_type}", tags=["calculate"])
async def generate_power_curve(calculator_type: str, request: PowerCurveRequest):
    """Generate power curve data for the specified calculator type."""
    calc = _get_calculator(calculator_type)
    try:
        curve = calc.generate_power_curve(request.params, request.sample_sizes)
        return curve
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Calculation error: {exc}")


@app.post("/api/v1/sensitivity/{calculator_type}", tags=["calculate"])
async def generate_sensitivity_table(calculator_type: str, request: SensitivityRequest):
    """Generate a sensitivity table by varying one parameter."""
    calc = _get_calculator(calculator_type)
    try:
        table = calc.generate_sensitivity_table(
            request.params, request.vary_param, request.vary_values,
        )
        return table
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Calculation error: {exc}")


# --------------- Helpers ---------------

def _get_calculator(calculator_type: str):
    if calculator_type not in CALCULATORS:
        available = ", ".join(sorted(CALCULATORS.keys()))
        raise HTTPException(
            status_code=404,
            detail=f"Calculator '{calculator_type}' not found. Available: {available}",
        )
    return CALCULATORS[calculator_type]


# --------------- Entrypoint ---------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
