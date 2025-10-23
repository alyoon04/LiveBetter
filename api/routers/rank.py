"""
/rank endpoint router
"""
from fastapi import APIRouter, HTTPException
from typing import List
import sys
from pathlib import Path
import logging

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from models import RankRequest, RankResponse, ResultMetro, Essentials, Coords, QualityOfLife
from db import db
from scoring import calculate_metro_affordability, calculate_qol_scores, calculate_composite_score
from cache import cache

router = APIRouter()
logger = logging.getLogger(__name__)


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
    # Generate cache key from request parameters
    cache_key = cache._generate_cache_key(
        "rank",
        salary=req.salary,
        family_size=req.family_size,
        rent_cap_pct=req.rent_cap_pct,
        population_min=req.population_min,
        limit=req.limit,
        affordability_weight=req.affordability_weight,
        schools_weight=req.schools_weight,
        safety_weight=req.safety_weight,
        weather_weight=req.weather_weight,
        healthcare_weight=req.healthcare_weight,
        walkability_weight=req.walkability_weight
    )

    # Try to get from cache
    cached_response = cache.get(cache_key)
    if cached_response is not None:
        logger.info(f"Cache hit for rank request")
        return RankResponse(**cached_response)

    try:
        # Fetch metros with cost data from database
        metros = db.fetch_metros_with_costs(population_min=req.population_min)

        if not metros:
            raise HTTPException(
                status_code=404,
                detail="No metros found matching the criteria"
            )

        # Calculate affordability and composite scores for each metro
        results: List[ResultMetro] = []

        # Build user preference weights dictionary
        weights = {
            "affordability_weight": req.affordability_weight,
            "schools_weight": req.schools_weight,
            "safety_weight": req.safety_weight,
            "weather_weight": req.weather_weight,
            "healthcare_weight": req.healthcare_weight,
            "walkability_weight": req.walkability_weight,
        }

        for metro in metros:
            try:
                # Calculate affordability metrics with transport mode
                metrics = calculate_metro_affordability(
                    salary=req.salary,
                    family_size=req.family_size,
                    rent_cap_pct=req.rent_cap_pct,
                    eff_tax_rate=float(metro.eff_tax_rate),
                    median_rent=float(metro.median_rent_usd),
                    utilities=float(metro.utilities_monthly),
                    rpp_index=float(metro.rpp_index),
                    transport_mode=req.transport_mode,
                    walkability=float(metro.walkability_score) if metro.walkability_score is not None else None,
                    commute_mins=float(metro.commute_time_mins) if metro.commute_time_mins is not None else None
                )

                affordability_score = metrics["score"]

                # Extract QOL data from metro (convert Decimals to float)
                qol_data = {
                    "school_score": float(metro.school_score) if metro.school_score is not None else None,
                    "crime_rate": float(metro.crime_rate) if metro.crime_rate is not None else None,
                    "weather_score": float(metro.weather_score) if metro.weather_score is not None else None,
                    "healthcare_score": float(metro.healthcare_score) if metro.healthcare_score is not None else None,
                    "walkability_score": float(metro.walkability_score) if metro.walkability_score is not None else None,
                }

                # Calculate normalized QOL scores
                qol_scores = calculate_qol_scores(qol_data)

                # Calculate composite score
                composite_score = calculate_composite_score(
                    affordability_score=affordability_score,
                    qol_scores=qol_scores,
                    weights=weights
                )

                # Build QualityOfLife object if data exists
                quality_of_life = None
                if any(v is not None for v in qol_data.values()):
                    quality_of_life = QualityOfLife(
                        school_score=metro.school_score,
                        crime_rate=metro.crime_rate,
                        weather_score=metro.weather_score,
                        healthcare_score=metro.healthcare_score,
                        walkability_score=metro.walkability_score,
                        air_quality_index=metro.air_quality_index,
                        commute_time_mins=metro.commute_time_mins
                    )

                # Build result object
                result = ResultMetro(
                    metro_id=metro.metro_id,
                    name=metro.name,
                    state=metro.state,
                    score=composite_score,  # Overall composite score
                    affordability_score=affordability_score,  # Just affordability component
                    discretionary_income=metrics["discretionary_income"],
                    essentials=Essentials(**metrics["essentials"]),
                    net_monthly_adjusted=metrics["net_monthly_adjusted"],
                    rpp_index=float(metro.rpp_index),
                    population=metro.population,
                    coords=Coords(lat=metro.lat, lon=metro.lon),
                    quality_of_life=quality_of_life
                )
                results.append(result)

            except Exception as e:
                # Log error but continue with other metros
                print(f"Error processing metro {metro.name}: {e}")
                continue

        # Filter and adjust for bike/walk mode
        if req.transport_mode == "bike_walk":
            # Filter out cities with low walkability (not viable for bike/walk)
            results = [r for r in results if r.quality_of_life and r.quality_of_life.walkability_score and r.quality_of_life.walkability_score >= 50]

            # Boost score for highly walkable cities
            for result in results:
                if result.quality_of_life and result.quality_of_life.walkability_score and result.quality_of_life.walkability_score > 75:
                    result.score = min(1.0, result.score * 1.15)  # 15% boost, capped at 1.0

        # Sort by score (descending)
        results.sort(key=lambda x: x.score, reverse=True)

        # Limit results
        results = results[:req.limit]

        response = RankResponse(input=req, results=results)

        # Cache the response (1 hour TTL for ranking results)
        cache.set(cache_key, response.model_dump(), ttl=3600)
        logger.info(f"Cached rank response")

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
