# LiveBetter

**Find the most affordable U.S. cities based on your salary and family size.**

LiveBetter ranks U.S. metropolitan areas by affordability using real data from authoritative sources: Zillow rent prices, BEA Regional Price Parities, and Census population data. Get transparent cost breakdowns and see exactly where your money goes.

🌐 **[Live Demo](#)** | 📊 **[API Docs](http://localhost:8000/docs)**

## Features

- **Real Production Data**: Zillow rent prices, BEA cost-of-living indices, Census population
- **Transparent Cost Breakdown**: See rent, utilities, groceries, and transport costs
- **After-Tax Calculations**: Accurate federal and state tax estimates
- **Regional Cost Adjustments**: RPP-adjusted purchasing power
- **Interactive Map**: Visual exploration with Leaflet
- **Dark Mode**: Automatic theme switching
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

### Frontend
- **Next.js 14** (App Router) with TypeScript
- **TailwindCSS** for styling
- **TanStack Query** (React Query) for data fetching
- **Leaflet** for interactive maps

### Backend
- **FastAPI** (Python 3.11+) with Pydantic validation
- **PostgreSQL** 14+ for data storage
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

Get free API keys from these services:

1. **BEA (Required)**: https://apps.bea.gov/API/signup/
   - Provides Regional Price Parity data (cost-of-living indices)
   - Activation takes ~24 hours after email confirmation

2. **Census Bureau (Optional)**: https://api.census.gov/data/key_signup.html
   - For updating population data
   - Rate limited to ~500 requests/day

3. **EPA AirNow (Optional)**: https://docs.airnowapi.org/account/request/
   - For air quality data (currently not used in rankings)

Add keys to `.env`:
```bash
BEA_API_KEY=your_bea_api_key_here
CENSUS_API_KEY=your_census_key_here  # Optional
AIRNOW_API_KEY=your_airnow_key_here  # Optional
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
│   ├── scoring.py                # Affordability scoring logic
│   ├── db.py                     # Database layer
│   ├── schema.sql                # PostgreSQL schema
│   ├── clients/                  # External API clients
│   │   ├── base.py              # Base client with rate limiting/caching
│   │   ├── bea.py               # BEA RPP API
│   │   ├── census.py            # Census API
│   │   └── epa.py               # EPA AirNow API
│   └── routers/
│       └── rank.py              # /api/rank endpoint
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
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # API client
│   │   └── types/              # TypeScript types
│   └── public/
├── tests/                       # Backend tests
│   └── test_scoring.py
├── .env.example                 # Environment template
└── requirements.txt             # Python dependencies
```

## API Usage

### POST /api/rank

Rank metros by affordability.

**Request:**
```json
{
  "salary": 90000,
  "family_size": 2,
  "rent_cap_pct": 0.3,
  "population_min": 100000,
  "limit": 50,
  "affordability_weight": 10,
  "schools_weight": 0,
  "safety_weight": 0,
  "weather_weight": 0,
  "healthcare_weight": 0,
  "walkability_weight": 0
}
```

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
   - **Transport**: $250/person + $75 per additional, scaled by RPP

4. **Discretionary Income**:
   ```
   DI = Adjusted Net Income - (Rent + Utilities + Groceries + Transport)
   ```

5. **Score** (sigmoid function):
   ```
   score = 1 / (1 + e^(-(DI - 1500) / 400))
   ```
   - Centers around $1,500/month discretionary income
   - Score 0.5 = $1,500 DI (breaking even comfortably)
   - Score 0.9+ = $2,500+ DI (very affordable)
   - Score 0.3 = $700 DI (tight budget)

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

- **87 metros** with real rent data (Zillow, August 2025)
- **87 metros** with RPP data (BEA, 2023)
- **88 metros** total in database
- Average rent: **$1,825/month**
- RPP range: **0.856 to 1.182**

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
- **No quality-of-life factors**: Schools, crime, weather, healthcare not included

## Roadmap

- [x] Real Zillow rent data
- [x] BEA RPP integration
- [x] Accurate tax calculations
- [x] Interactive map
- [ ] Automate Zillow data updates (if API becomes available)
- [ ] Quality-of-life metrics (if free data sources found)
- [ ] User authentication and saved searches
- [ ] Healthcare cost estimates
- [ ] Neighborhood-level data (vs metro-level)
- [ ] Historical trend analysis

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
