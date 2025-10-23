"""
LiveBetter FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import rank
from models import HealthResponse
from db import db
from cache import cache

# Application metadata
VERSION = "1.0.0"
TITLE = "LiveBetter API"
DESCRIPTION = """
LiveBetter API helps you find the most affordable U.S. metros based on your salary and lifestyle.

## Features

* **Affordability Ranking**: Get metros ranked by affordability score
* **Cost Breakdown**: See detailed breakdown of rent, utilities, groceries, and transport
* **Transportation Modes**: Choose public transit, car ownership, or bike/walk lifestyle
* **Regional Price Parity**: Costs adjusted for local purchasing power
* **Flexible Filters**: Filter by population, state, and more

## Methodology

Affordability is calculated based on:
1. After-tax income adjusted for regional price parity
2. Essential monthly costs (rent, utilities, groceries, mode-based transport)
3. Discretionary income (income minus essentials)
4. Linear score normalization from -$500 to $6,000 discretionary income

Transport costs vary by mode and city characteristics:
- **Public Transit**: $100 + $40/person, adjusted for city walkability
- **Car**: $450 + $100/person, includes all vehicle costs
- **Bike/Walk**: $50 flat, filters to walkable cities only
"""

# Create FastAPI app
app = FastAPI(
    title=TITLE,
    description=DESCRIPTION,
    version=VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - allow all origins for MVP
# In production, restrict to specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production: ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rank.router, prefix="/api", tags=["ranking"])


@app.get("/", tags=["health"])
def root():
    """Root endpoint"""
    return {
        "name": TITLE,
        "version": VERSION,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["health"])
def health_check():
    """
    Health check endpoint.
    Returns database connectivity status, metro count, and cache status.
    """
    db_health = db.health_check()
    cache_health = cache.health_check()

    overall_status = "healthy" if db_health["status"] == "healthy" else "unhealthy"

    return {
        "status": overall_status,
        "version": VERSION,
        "database": db_health,
        "cache": cache_health
    }


# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
