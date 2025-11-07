"""
Metro data endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import db
from models import ResultMetro, Essentials, Coords, QualityOfLife
from typing import List

router = APIRouter()


class MetroBatchRequest(BaseModel):
    """Request to fetch multiple metros by ID"""
    metro_ids: List[int]


@router.post("/metros/batch", response_model=List[ResultMetro])
def get_metros_batch(request: MetroBatchRequest):
    """
    Fetch multiple metros by their IDs.

    This endpoint is used for the comparison feature to retrieve
    full metro data for selected cities.

    Parameters:
    - metro_ids: List of metro IDs to fetch

    Returns:
    - List of ResultMetro objects with basic data (no recalculated scores)
    """
    if not request.metro_ids:
        raise HTTPException(status_code=400, detail="No metro IDs provided")

    if len(request.metro_ids) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 metros allowed per request")

    try:
        metro_rows = db.get_metros_by_ids(request.metro_ids)

        if not metro_rows:
            raise HTTPException(status_code=404, detail="No metros found with provided IDs")

        # Convert database rows to ResultMetro objects
        results = []
        for metro in metro_rows:
            # Build QualityOfLife object if data exists
            quality_of_life = None
            if any([
                metro.school_score is not None,
                metro.crime_rate is not None,
                metro.weather_score is not None,
                metro.healthcare_score is not None,
                metro.walkability_score is not None,
                metro.air_quality_index is not None,
                metro.commute_time_mins is not None
            ]):
                quality_of_life = QualityOfLife(
                    school_score=metro.school_score,
                    crime_rate=metro.crime_rate,
                    weather_score=metro.weather_score,
                    healthcare_score=metro.healthcare_score,
                    walkability_score=metro.walkability_score,
                    air_quality_index=metro.air_quality_index,
                    commute_time_mins=metro.commute_time_mins
                )

            # Create result with placeholder values for scores since we're just fetching data
            result = ResultMetro(
                metro_id=metro.metro_id,
                name=metro.name,
                state=metro.state,
                score=0.0,  # Placeholder - frontend will use data from original search
                affordability_score=0.0,  # Placeholder
                discretionary_income=0.0,  # Placeholder
                essentials=Essentials(
                    rent=float(metro.median_rent_usd),
                    utilities=float(metro.utilities_monthly),
                    groceries=0.0,  # Calculated on frontend
                    transport=0.0   # Calculated on frontend
                ),
                net_monthly_adjusted=0.0,  # Placeholder
                rpp_index=float(metro.rpp_index),
                population=metro.population,
                coords=Coords(lat=metro.lat, lon=metro.lon),
                quality_of_life=quality_of_life
            )
            results.append(result)

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
