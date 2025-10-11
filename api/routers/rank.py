"""
/rank endpoint router
"""
from fastapi import APIRouter, HTTPException
from typing import List
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from models import RankRequest, RankResponse, ResultMetro, Essentials, Coords
from db import db
from scoring import calculate_metro_affordability

router = APIRouter()


@router.post("/rank", response_model=RankResponse, tags=["ranking"])
def rank_metros(req: RankRequest):
    """
    Rank metros by affordability based on user's salary and preferences.

    This endpoint calculates an affordability score for each metro based on:
    - After-tax income adjusted for regional price parity
    - Essential monthly costs (rent, utilities, groceries, transport)
    - Discretionary income remaining after essentials

    Returns metros sorted by affordability score (highest first).
    """
    try:
        # Fetch metros with cost data from database
        metros = db.fetch_metros_with_costs(population_min=req.population_min)

        if not metros:
            raise HTTPException(
                status_code=404,
                detail="No metros found matching the criteria"
            )

        # Calculate affordability for each metro
        results: List[ResultMetro] = []

        for metro in metros:
            try:
                # Calculate all metrics
                metrics = calculate_metro_affordability(
                    salary=req.salary,
                    family_size=req.family_size,
                    rent_cap_pct=req.rent_cap_pct,
                    eff_tax_rate=float(metro.eff_tax_rate),
                    median_rent=float(metro.median_rent_usd),
                    utilities=float(metro.utilities_monthly),
                    rpp_index=float(metro.rpp_index)
                )

                # Build result object
                result = ResultMetro(
                    metro_id=metro.metro_id,
                    name=metro.name,
                    state=metro.state,
                    score=metrics["score"],
                    discretionary_income=metrics["discretionary_income"],
                    essentials=Essentials(**metrics["essentials"]),
                    net_monthly_adjusted=metrics["net_monthly_adjusted"],
                    rpp_index=float(metro.rpp_index),
                    population=metro.population,
                    coords=Coords(lat=metro.lat, lon=metro.lon)
                )
                results.append(result)

            except Exception as e:
                # Log error but continue with other metros
                print(f"Error processing metro {metro.name}: {e}")
                continue

        # Sort by score (descending)
        results.sort(key=lambda x: x.score, reverse=True)

        # Limit results
        results = results[:req.limit]

        return RankResponse(input=req, results=results)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
