# LiveBetter MVP

LiveBetter helps you find the most affordable U.S. cities based on your salary and lifestyle. This MVP focuses purely on affordability metrics—quality-of-life features coming soon!

## Features

- **Data-driven rankings**: Based on real median costs and regional price parities
- **Transparent cost breakdown**: See exactly how rent, utilities, groceries, and transport factor into affordability
- **Interactive map**: Visual exploration of results with Leaflet
- **Dark mode**: Automatic theme switching
- **Responsive design**: Works seamlessly on desktop and mobile

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** for styling
- **TanStack Query** (React Query) for data fetching
- **Leaflet** for interactive maps

### Backend
- **FastAPI** (Python 3.11+)
- **PostgreSQL** for data storage
- **Uvicorn** ASGI server
- **Pandas** for ETL

### Data Sources
- HUD Fair Market Rents
- BEA Regional Price Parities
- State tax rates (approximated)
- EIA utility costs

## Project Structure

```
LiveBetter/
├── api/                    # FastAPI backend
│   ├── main.py            # Main FastAPI app
│   ├── models.py          # Pydantic models
│   ├── scoring.py         # Affordability scoring logic
│   ├── db.py              # Database layer
│   ├── schema.sql         # Database schema
│   └── routers/
│       └── rank.py        # /rank endpoint
├── etl/                   # ETL scripts
│   ├── seed_metros.py     # Load metros from CSV
│   └── load_costs.py      # Load cost data
├── data/                  # CSV data files
│   ├── metros.csv
│   ├── rents.csv
│   ├── rpp.csv
│   ├── taxes.csv
│   └── utilities.csv
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client
│   │   └── types/        # TypeScript types
│   └── public/
├── tests/                 # Backend tests
│   └── test_scoring.py
└── requirements.txt       # Python dependencies
```

## Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**

### 1. Set Up Database

```bash
# Create database
createdb livebetter

# Or with psql:
psql -U postgres
CREATE DATABASE livebetter;
\q

# Apply schema
psql -U postgres -d livebetter -f api/schema.sql
```

### 2. Set Up Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set environment variables (optional, defaults work for local dev)
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=livebetter
export DB_USER=postgres
export DB_PASSWORD=postgres

# Run ETL scripts to load data
python etl/seed_metros.py
python etl/load_costs.py

# Start FastAPI server
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at:
- **Base**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

### 3. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variable for API URL (optional)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

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
  "limit": 50
}
```

**Response:**
```json
{
  "input": { ... },
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
      "population": 1350000,
      "coords": { "lat": 35.7796, "lon": -78.6382 }
    }
  ]
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:8000/api/rank \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 90000,
    "family_size": 1,
    "rent_cap_pct": 0.3,
    "population_min": 0,
    "limit": 20
  }'
```

## Running Tests

```bash
# Run backend tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=api --cov-report=html
```

## Scoring Methodology

### Affordability Score Formula

1. **Net Monthly Income** = `(Salary × (1 - Tax Rate)) / 12`
2. **Adjusted Income** = `Net Monthly / RPP Index`
3. **Essentials** = `Rent + Utilities + Groceries + Transport`
4. **Discretionary Income (DI)** = `Adjusted Income - Essentials`
5. **Score** = `1 / (1 + e^(-(DI - 1500) / 400))`

The sigmoid function centers around $1,500 discretionary income (score = 0.5).

### Cost Components

- **Rent**: HUD median 2-bedroom rent, capped at `rent_cap_pct` of net income
- **Utilities**: State-level baseline from EIA data
- **Groceries**: Base $350/person/month + $150 per additional person, scaled by RPP
- **Transport**: Base $250/person/month + $75 per additional person, scaled by RPP

### Regional Price Parity (RPP)

RPP adjusts income for regional cost differences:
- **1.00** = national average
- **< 1.00** = cheaper than average (better purchasing power)
- **> 1.00** = more expensive (lower purchasing power)

## Data Caveats

- Data reflects 2024-2025 estimates
- Tax calculations are simplified (no detailed deductions)
- Costs are metro-level medians; individual neighborhoods vary significantly
- Quality-of-life factors not included in MVP
- Healthcare, childcare, and debt not factored in

## Deployment

### Backend (Render/Fly.io)

```bash
# Using Render
# 1. Create PostgreSQL instance
# 2. Create Web Service
# 3. Set environment variables (DB_HOST, DB_PORT, etc.)
# 4. Deploy: render deploys automatically from GitHub

# Using Fly.io
fly launch
fly secrets set DB_HOST=... DB_PORT=... DB_NAME=... DB_USER=... DB_PASSWORD=...
fly deploy
```

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Roadmap / Future Enhancements

- [ ] Quality-of-life metrics (crime, schools, weather, culture)
- [ ] User authentication and saved searches
- [ ] More granular tax calculations
- [ ] Healthcare and childcare cost estimates
- [ ] Natural language search with LLM
- [ ] Neighborhood-level data (vs metro-level)
- [ ] Historical trend analysis
- [ ] Mobile app

## Contributing

This is an MVP. Contributions welcome! Please open an issue first to discuss proposed changes.

## License

MIT

## Contact

For questions or feedback:
- Open an issue on GitHub
- Email: feedback@livebetter.com

---

Built with data transparency and user empowerment in mind. Happy house hunting!
