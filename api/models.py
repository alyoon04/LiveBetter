"""
Pydantic models for LiveBetter API
"""
from pydantic import BaseModel, Field
from typing import Optional

class RankRequest(BaseModel):
    """Request model for /rank endpoint"""
    salary: int = Field(ge=10000, le=1000000, description="Annual pre-tax salary in USD")
    family_size: int = Field(ge=1, le=10, default=1, description="Number of people in household")
    rent_cap_pct: float = Field(ge=0.1, le=0.6, default=0.30, description="Maximum rent as percentage of monthly income")
    population_min: int = Field(ge=0, default=0, description="Minimum metro population filter")
    limit: int = Field(ge=1, le=200, default=50, description="Maximum number of results to return")

    class Config:
        json_schema_extra = {
            "example": {
                "salary": 90000,
                "family_size": 2,
                "rent_cap_pct": 0.3,
                "population_min": 100000,
                "limit": 50
            }
        }

class Essentials(BaseModel):
    """Breakdown of essential monthly costs"""
    rent: float
    utilities: float
    groceries: float
    transport: float

class Coords(BaseModel):
    """Geographic coordinates"""
    lat: float
    lon: float

class ResultMetro(BaseModel):
    """Single metro result with affordability score and cost breakdown"""
    metro_id: int
    name: str
    state: str
    score: float = Field(description="Affordability score (0-1), higher is better")
    discretionary_income: float = Field(description="Monthly discretionary income after essentials")
    essentials: Essentials
    net_monthly_adjusted: float = Field(description="Monthly net income adjusted for regional price parity")
    rpp_index: float = Field(description="Regional Price Parity index (1.0 = national average)")
    population: Optional[int] = None
    coords: Coords

class RankResponse(BaseModel):
    """Response model for /rank endpoint"""
    input: RankRequest
    results: list[ResultMetro]

    class Config:
        json_schema_extra = {
            "example": {
                "input": {
                    "salary": 90000,
                    "family_size": 2,
                    "rent_cap_pct": 0.3,
                    "population_min": 100000,
                    "limit": 50
                },
                "results": [
                    {
                        "metro_id": 101,
                        "name": "Raleigh",
                        "state": "NC",
                        "score": 0.81,
                        "discretionary_income": 2050.0,
                        "essentials": {
                            "rent": 1450.0,
                            "utilities": 170.0,
                            "groceries": 620.0,
                            "transport": 380.0
                        },
                        "net_monthly_adjusted": 4620.0,
                        "rpp_index": 0.95,
                        "population": 1413982,
                        "coords": {"lat": 35.7796, "lon": -78.6382}
                    }
                ]
            }
        }

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    metros_count: Optional[int] = None
