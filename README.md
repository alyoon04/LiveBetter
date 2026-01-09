# LiveBetter

**Find the most affordable U.S. cities based on your salary and family size.**

LiveBetter ranks U.S. metropolitan areas by affordability using real data from authoritative sources: Zillow rent prices, BEA Regional Price Parities, and Census population data. Get transparent cost breakdowns and see exactly where your money goes.

🌐 **[Live Demo](#)** | 📊 **[API Docs](http://localhost:8000/docs)**

## Features

- **AI-Powered Natural Language Search**: Describe your preferences in plain English (e.g., "I make $75k, family of 3, need good schools") and the system automatically fills the form using GPT-4o-mini
- **Real Production Data**: Zillow rent prices, BEA Regional Price Parities, Census population estimates, and quality of life metrics
- **Transparent Cost Breakdown**: See detailed monthly costs: rent, utilities, groceries, and transport
- **Transportation Mode Options**: Customize for public transit, car ownership, or bike/walk lifestyle with mode-specific cost calculations
- **After-Tax Calculations**: Accurate federal and state income tax estimates with regional adjustments
- **Regional Cost Adjustments**: RPP-adjusted purchasing power (accounts for how far your dollar goes)
- **Interactive Map with Split View**: Dual-pane interface with city cards on the left and synchronized map on the right
- **Quality of Life Weighting**: Prioritize what matters to you - affordability, schools, safety, weather, healthcare, walkability (with composite scoring)
- **Intelligent Caching**: Redis-based caching with automatic in-memory fallback for fast response times (< 100ms cached responses)
- **Smooth Animations**: Typing animations on landing page, staggered card animations, and timeline scroll effects
- **Dark Mode**: Automatic theme switching with system preference detection
- **Responsive Design**: Optimized for desktop and mobile with isolated scroll containers

## Tech Stack

### Frontend
- **Next.js 14** (App Router) with TypeScript
- **TailwindCSS** for styling
- **TanStack Query** (React Query) for data fetching
- **Leaflet** for interactive maps

### Backend
- **FastAPI** (Python 3.11+) with Pydantic validation
- **PostgreSQL** 14+ for data storage
- **Redis** for caching (optional, falls back to in-memory cache)
- **OpenAI API** (GPT-4o-mini) for natural language parsing
- **Uvicorn** ASGI server

### Data Sources
- **Zillow ZORI**: Real median rent data (manually updated)
- **BEA RPP API**: Regional Price Parities (cost-of-living indices)
- **Census API**: Metropolitan area populations
- **State tax rates**: Federal + state income tax calculations

## Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**

### 1. Clone and Setup Database

```bash
git clone https://github.com/yourusername/LiveBetter.git
cd LiveBetter

# Create database
createdb livebetter

# Apply schema
psql -d livebetter -f api/schema.sql
```

### 2. Backend Setup

```bash
# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys (see API Keys section below)

# Load initial metro data
./venv/bin/python etl/seed_metros.py

# Load real Zillow rent data (download CSV first - see Data Setup below)
./venv/bin/python etl/load_real_data.py

# Load BEA RPP data (requires BEA API key)
./venv/bin/python etl/load_bea_rpp.py

# Start API server
cd api
uvicorn main:app --reload --port 8001
```

API will be available at:
- **Base**: http://localhost:8001
- **Docs**: http://localhost:8001/docs
- **Health**: http://localhost:8001/health

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

## API Keys

Get API keys from these services:

1. **BEA (Required)**: https://apps.bea.gov/API/signup/
   - Provides Regional Price Parity data (cost-of-living indices)
   - Activation takes ~24 hours after email confirmation

2. **OpenAI (Recommended for Natural Language Search)**: https://platform.openai.com/api-keys
   - Enables users to describe preferences in plain English
   - Uses GPT-4o-mini (~$0.00015 per request, extremely cost-effective)
   - Falls back to rule-based parser if not configured

3. **Census Bureau (Optional)**: https://api.census.gov/data/key_signup.html
   - For updating population data
   - Rate limited to ~500 requests/day

4. **EPA AirNow (Optional)**: https://docs.airnowapi.org/account/request/
   - For air quality data (experimental feature)

Add keys to `.env`:
```bash
BEA_API_KEY=your_bea_api_key_here
OPENAI_API_KEY=your_openai_key_here  # Recommended - enables AI-powered search
CENSUS_API_KEY=your_census_key_here  # Optional
AIRNOW_API_KEY=your_airnow_key_here  # Optional

# Optional: Redis caching configuration
REDIS_ENABLED=true  # Set to false to use in-memory cache
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL_HOURS=24
```

## Data Setup

### Zillow Rent Data (Required)

Zillow rent data must be manually downloaded (no public API):

1. Visit https://www.zillow.com/research/data/
2. Find: **"ZORI (Smoothed): All Homes Plus Multifamily Time Series ($)"**
3. Download **Metro** level data
4. Save as `data/zillow_rent_metro.csv`
5. Run: `./venv/bin/python etl/load_real_data.py`

### BEA RPP Data (Required)

Automatically fetched via API:

```bash
./venv/bin/python etl/load_bea_rpp.py
```

This fetches Regional Price Parity indices for ~380 metros.

### Census Population (Optional)

Population data is included in the seed data. To update with latest Census data:

```bash
./venv/bin/python etl/update_census_population.py
```

⚠️ Note: Census API is rate-limited. This script takes ~2 minutes.

## Project Structure

```
LiveBetter/
├── api/                          # FastAPI backend
│   ├── main.py                   # FastAPI app entry point
│   ├── models.py                 # Pydantic request/response models
│   ├── scoring.py                # Affordability & QOL scoring logic
│   ├── db.py                     # Database connection & queries
│   ├── cache.py                  # Redis caching with in-memory fallback
│   ├── schema.sql                # PostgreSQL schema
│   ├── clients/                  # External API clients
│   │   ├── base.py              # Base client with rate limiting/caching
│   │   ├── bea.py               # BEA RPP API
│   │   ├── census.py            # Census API
│   │   ├── weather.py           # Open-Meteo weather API
│   │   ├── epa.py               # EPA AirNow API
│   │   ├── zillow.py            # Zillow data utilities
│   │   ├── wikipedia.py         # Wikipedia client (experimental)
│   │   └── hud.py               # HUD API client (experimental)
│   └── routers/
│       ├── rank.py              # /api/rank endpoint
│       └── nl_parser.py         # /api/parse-preferences endpoint
├── etl/                         # Data loading scripts
│   ├── seed_metros.py           # Load metros from CSV
│   ├── load_real_data.py        # Load Zillow rents
│   ├── load_bea_rpp.py          # Load BEA RPP via API
│   └── update_census_population.py  # Update populations
├── data/                        # Data files
│   ├── metros.csv               # Metro definitions (88 major US metros)
│   ├── zillow_rent_metro.csv    # Zillow rent data (manual download)
│   └── bea_marpp_sample.json    # Sample BEA response
├── frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/                # App Router pages (/, /search, /results, /methodology)
│   │   ├── components/         # React components
│   │   │   ├── FormCard.tsx    # Main search form with quality of life sliders
│   │   │   ├── NaturalLanguageInput.tsx  # AI-powered text input
│   │   │   ├── MapView.tsx     # Interactive Leaflet map
│   │   │   ├── CityCard.tsx    # Metro result card with cost breakdown
│   │   │   ├── ScoreBar.tsx    # Visual affordability indicator
│   │   │   ├── TypingAnimation.tsx  # Landing page typing effect
│   │   │   ├── Header.tsx      # Navigation header
│   │   │   ├── Footer.tsx      # Footer component
│   │   │   └── ThemeProvider.tsx  # Dark mode support
│   │   ├── lib/                # API client & utilities
│   │   └── types/              # TypeScript type definitions
│   └── public/                 # Static assets (logo, images)
├── tests/                       # Backend tests
│   └── test_scoring.py
├── .env.example                 # Environment template
└── requirements.txt             # Python dependencies
```

## API Usage

### POST /api/parse-preferences

Parse natural language input into structured search parameters.

**Request:**
```json
{
  "text": "I make $75k with a family of 3, I prefer public transit and care about schools"
}
```

**Response:**
```json
{
  "salary": 75000,
  "family_size": 3,
  "rent_cap_pct": 0.3,
  "population_min": 0,
  "limit": 50,
  "transport_mode": "public_transit",
  "affordability_weight": 10,
  "schools_weight": 8,
  "safety_weight": 0,
  "weather_weight": 0,
  "healthcare_weight": 0,
  "walkability_weight": 0
}
```

**Features:**
- Powered by GPT-4o-mini for accurate parsing
- Falls back to rule-based parser if OpenAI API unavailable
- Understands various salary formats: "75k", "$75000", "75,000"
- Recognizes family descriptions: "single", "couple", "family of 4"
- Maps importance levels: "very important" → 9-10, "important" → 7-8

### POST /api/rank

Rank metros by affordability and quality of life.

**Request:**
```json
{
  "salary": 90000,
  "family_size": 2,
  "rent_cap_pct": 0.3,
  "population_min": 100000,
  "limit": 50,
  "transport_mode": "public_transit",
  "affordability_weight": 10,
  "schools_weight": 0,
  "safety_weight": 0,
  "weather_weight": 0,
  "healthcare_weight": 0,
  "walkability_weight": 0
}
```

**Parameters:**
- `salary`: Annual pre-tax salary (10,000 - 1,000,000)
- `family_size`: Household size (1-10)
- `rent_cap_pct`: Maximum rent as % of income (0.1 - 0.6, default 0.3)
- `population_min`: Filter by minimum metro population (default 0)
- `limit`: Max number of results (1-200, default 50)
- `transport_mode`: Transportation preference (default "public_transit")
  - `"public_transit"`: Lower costs in walkable cities with good transit
  - `"car"`: Car ownership with insurance, gas, maintenance, parking
  - `"bike_walk"`: Minimal costs, filters to walkable cities only
- `affordability_weight` - `walkability_weight`: Quality of life preference weights (0-10)

**Response:**
```json
{
  "input": { "salary": 90000, ... },
  "results": [
    {
      "metro_id": 77,
      "name": "McAllen",
      "state": "TX",
      "score": 0.9986,
      "affordability_score": 0.9986,
      "discretionary_income": 4128.73,
      "essentials": {
        "rent": 1665.0,
        "utilities": 180.0,
        "groceries": 299.44,
        "transport": 213.89
      },
      "net_monthly_adjusted": 6487.06,
      "rpp_index": 0.856,
      "population": 868707,
      "coords": { "lat": 26.2034, "lon": -98.23 }
    }
  ]
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:8001/api/rank \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 90000,
    "family_size": 1,
    "rent_cap_pct": 0.3,
    "population_min": 0,
    "limit": 20,
    "transport_mode": "public_transit",
    "affordability_weight": 10,
    "schools_weight": 0,
    "safety_weight": 0,
    "weather_weight": 0,
    "healthcare_weight": 0,
    "walkability_weight": 0
  }'
```

## Scoring Methodology

### Affordability Score

The app calculates a 0-1 affordability score based on discretionary income:

1. **Calculate Net Monthly Income**:
   - Apply federal and state income tax
   - Divide annual by 12 for monthly

2. **Adjust for Regional Costs**:
   - Divide net income by RPP index
   - Example: $5,000/month in NYC (RPP 1.125) = $4,444 purchasing power

3. **Calculate Essential Expenses**:
   - **Rent**: Real Zillow median, capped at `rent_cap_pct` of net income
   - **Utilities**: ~$150-200/month (state baseline)
   - **Groceries**: $350/person + $150 per additional, scaled by RPP
   - **Transport**: Mode-based calculation, scaled by RPP and city characteristics
     - **Public Transit**: $100 + $40 per person
       - 15% discount in walkable cities (walkability > 65)
       - 30% penalty in car-dependent cities (walkability < 45)
     - **Car Owner**: $450 + $100 per person (includes insurance, gas, maintenance, parking)
       - 10% penalty for long commutes (> 35 min)
     - **Bike/Walk**: $50 flat (minimal costs)
       - Cities with walkability < 50 are filtered out
       - 15% score boost for highly walkable cities (> 75)

4. **Discretionary Income**:
   ```
   DI = Adjusted Net Income - (Rent + Utilities + Groceries + Transport)
   ```

5. **Score** (linear normalization):
   ```
   score = (DI + 500) / 6500
   ```
   - Range: -$500 (score 0) to +$6,000 (score 1)
   - Score 0.5 = $2,750 DI (comfortable)
   - Score 0.8+ = $4,700+ DI (very affordable)
   - Score 0.3 = $1,450 DI (tight budget)
   - Clamped to [0, 1] range

### Quality of Life Scoring

LiveBetter uses a composite scoring system that combines affordability with quality of life factors:

1. **Component Normalization**: Each QOL metric is normalized to a 0-1 scale:
   - **Schools**: 0-100 score (based on test scores, graduation rates)
   - **Safety**: Crime rate per 100k (inverted: lower crime = higher score)
   - **Weather**: 0-100 score (based on temperature, sunshine, precipitation)
   - **Healthcare**: 0-100 score (access and quality metrics)
   - **Walkability**: 0-100 Walk Score index

2. **Weighted Composite Score**:
   ```
   Composite Score = (Affordability × W_afford + Schools × W_school + Safety × W_safety +
                      Weather × W_weather + Healthcare × W_health + Walkability × W_walk) / Total_Weight
   ```
   - Default weights: Affordability=10, others=0 (pure affordability ranking)
   - Users can adjust weights (0-10) to prioritize their preferences
   - Missing data defaults to neutral score (0.5)

3. **Affordability-First Approach**: If no QOL preferences are set, the composite score equals the affordability score, ensuring the tool works as a pure cost-of-living calculator by default.

### Regional Price Parity (RPP)

RPP measures how much $100 buys in each metro compared to the national average:

- **RPP = 1.00**: National average
- **RPP = 0.85**: 15% cheaper (same goods cost $85)
- **RPP = 1.15**: 15% more expensive (same goods cost $115)

**Examples from our data**:
- San Francisco: 1.182 (most expensive)
- New York: 1.125
- McAllen, TX: 0.856 (least expensive)

## Current Data Coverage

- **88 metros** total in database (major U.S. metropolitan areas)
- **Real rent data** from Zillow ZORI (median rent prices)
- **RPP data** from BEA (2023 Regional Price Parities)
- **Quality of life metrics** including school scores, crime rates, weather scores, healthcare scores, walkability scores, air quality, and commute times
- Metro population range: ~100k to 20M+ residents
- RPP range: **0.856** (McAllen, TX) to **1.182** (San Francisco, CA)

## Running Tests

```bash
# Run backend tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=api --cov-report=html
```

## Deployment

### Backend (Render/Railway/Fly.io)

**Environment Variables Required**:
```
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=livebetter
DB_USER=your_db_user
DB_PASSWORD=your_db_password
BEA_API_KEY=your_bea_key

# Recommended for Natural Language Search
OPENAI_API_KEY=your_openai_key

# Optional: Redis caching (improves performance)
REDIS_ENABLED=true
REDIS_HOST=your_redis_host  # Most platforms provide managed Redis
REDIS_PORT=6379
CACHE_TTL_HOURS=24
```

**Deploy Steps**:
1. Create PostgreSQL database
2. Apply schema: `psql -d DATABASE_URL -f api/schema.sql`
3. Run ETL scripts to load data
4. Deploy API with `uvicorn main:app --host 0.0.0.0 --port 8000`

### Frontend (Vercel)

```bash
cd frontend
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Value: https://your-api-domain.com
```

Or connect GitHub repo to Vercel for automatic deployments.

## Data Limitations

- **Rent data**: Metro-level median, updated quarterly (manual Zillow download)
- **RPP data**: Lags 2 years (BEA releases annually)
- **Population**: Census estimates (updated annually)
- **Tax calculations**: Simplified (standard deduction only, no itemized deductions)
- **Cost estimates**: Metro-level averages (neighborhood variation not captured)
- **Transport costs**: Estimated based on mode and city walkability (not personalized to individual commute)
- **Quality-of-life data**: Limited availability for some metros; missing data defaults to neutral score (0.5)

## Roadmap

### Completed ✓
- [x] Real Zillow rent data integration
- [x] BEA RPP integration
- [x] Accurate federal and state tax calculations
- [x] Interactive color-coded map
- [x] Transportation mode preferences (public transit, car, bike/walk)
- [x] Natural language preference parsing with AI (GPT-4o-mini)
- [x] Quality of life weighting system (affordability, schools, safety, weather, healthcare, walkability)
- [x] Redis caching with in-memory fallback
- [x] Dark mode support
- [x] Responsive mobile-friendly design

### In Progress 🚧
- [ ] Enhanced weather data integration (API client implemented, needs UI)
- [ ] Air quality metrics (EPA AirNow integration in progress)

### Planned 📋
- [ ] Complete quality of life data for all 88 metros (currently partial coverage)
- [ ] Automate Zillow data updates (blocked by lack of public API)
- [ ] User authentication and saved searches
- [ ] Healthcare cost estimates (HUD client in development)
- [ ] Neighborhood-level data (vs metro-level)
- [ ] Historical trend analysis and price forecasting
- [ ] Transit quality scores and public transit coverage data
- [ ] Side-by-side metro comparison tool
- [ ] Email alerts for rent price changes
- [ ] Export results to PDF or CSV

## Contributing

Contributions welcome! Please open an issue first to discuss proposed changes.

## License

MIT

## Acknowledgments

- **Zillow Research**: Rent data
- **Bureau of Economic Analysis**: Regional Price Parity data
- **U.S. Census Bureau**: Metropolitan area populations
- **OpenStreetMap**: Map tiles via Leaflet

---

Built with data transparency in mind. **Happy city hunting!** 🏙️
