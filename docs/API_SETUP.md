# Production API Setup Guide

This guide explains how to integrate real government data APIs to make LiveBetter production-ready.

## Overview

LiveBetter now includes API clients for fetching authoritative data from:

1. **US Census Bureau** - Metro population data
2. **HUD (Housing & Urban Development)** - Fair Market Rents
3. **BEA (Bureau of Economic Analysis)** - Regional Price Parities
4. **EPA AirNow** - Air Quality Index

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/alexyoon/LiveBetter
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Get API Keys

#### Census Bureau API Key (Required)
- **Sign up**: https://api.census.gov/data/key_signup.html
- **Free**: Yes, instant approval
- **Rate Limit**: 500 requests/day without key, 5000/day with key

#### BEA API Key (Required for RPP data)
- **Sign up**: https://apps.bea.gov/API/signup/
- **Free**: Yes, email confirmation required
- **Rate Limit**: 100 requests/minute

#### EPA AirNow API Key (Optional, for air quality)
- **Sign up**: https://docs.airnowapi.org/account/request/
- **Free**: Yes, manual approval (1-2 days)
- **Rate Limit**: 500 requests/hour

#### HUD API (No key required)
- **Documentation**: https://www.huduser.gov/portal/dataset/fmr-api.html
- **Free**: Yes, public access

### 3. Configure Environment

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```bash
# API Keys
CENSUS_API_KEY=your_actual_census_key_here
BEA_API_KEY=your_actual_bea_key_here
AIRNOW_API_KEY=your_actual_epa_key_here

# API Configuration
API_TIMEOUT=30
API_RETRY_ATTEMPTS=3
API_RATE_LIMIT_PER_MINUTE=60

# Caching
CACHE_ENABLED=true
CACHE_TTL_HOURS=24
```

### 4. Test API Connections

Test each API client:

```bash
cd api
python -c "from clients.census import CensusAPIClient; client = CensusAPIClient(); print(f'Census: {len(client.get_metro_population())} metros')"

python -c "from clients.bea import BEAAPIClient; client = BEAAPIClient(); data = client.get_regional_price_parity(); print(f'BEA: {len(data)} RPP values')"

python -c "from clients.hud import HUDAPIClient; client = HUDAPIClient(); data = client.get_fmr_by_cbsa('12060'); print(f'HUD: {data}')"
```

### 5. Fetch Real Data

Run the ETL script to fetch data from APIs:

```bash
cd etl
python fetch_from_apis.py --year 2022
```

Options:
- `--year YYYY` - Census year for population data (2010-2022)
- `--skip-census` - Skip Census API call
- `--skip-bea` - Skip BEA API call
- `--skip-hud` - Skip HUD API call

## API Client Architecture

### Base Client (`api/clients/base.py`)

All API clients extend `BaseAPIClient` which provides:

- **Rate Limiting**: Token bucket algorithm, configurable per-minute limits
- **Retry Logic**: Exponential backoff for failed requests
- **Caching**: File-based cache with configurable TTL
- **Error Handling**: Automatic retry for transient errors, clear exception messages

### Census Bureau Client (`api/clients/census.py`)

**Purpose**: Fetch official metro area population data

**Key Methods**:
- `get_metro_population(year=2022)` - Get all metro populations for a given year
- `get_cbsa_metadata()` - Get CBSA codes and names

**Data Source**: American Community Survey (ACS) 1-year estimates

**Example**:
```python
from clients.census import CensusAPIClient

client = CensusAPIClient()
metros = client.get_metro_population(year=2022)

for metro in metros:
    print(f"{metro['name']}, {metro['state']}: {metro['population']:,}")
```

### HUD Client (`api/clients/hud.py`)

**Purpose**: Fetch Fair Market Rent data

**Key Methods**:
- `get_fmr_by_cbsa(cbsa_code, year=None)` - Get FMR for specific metro
- `get_fmr_for_metros(cbsa_codes, year=None)` - Batch fetch multiple metros
- `get_state_fmr_data(state_code, year=None)` - Get all FMRs in a state

**Data**: 2-bedroom apartment fair market rents

**Example**:
```python
from clients.hud import HUDAPIClient

client = HUDAPIClient()
fmr_data = client.get_fmr_by_cbsa("12060")  # Atlanta
print(f"Atlanta 2BR Rent: ${fmr_data['median_rent_2br']}")
```

### BEA Client (`api/clients/bea.py`)

**Purpose**: Fetch Regional Price Parity indices

**Key Methods**:
- `get_regional_price_parity(year=None)` - Get RPP for all metros
- `get_state_rpp(year=None)` - Get RPP for all states

**Data**: RPP Index (1.0 = national average, >1.0 = more expensive)

**Example**:
```python
from clients.bea import BEAAPIClient

client = BEAAPIClient()
rpp_data = client.get_regional_price_parity()
print(f"San Francisco RPP: {rpp_data['San Francisco']}")
```

### EPA Client (`api/clients/epa.py`)

**Purpose**: Fetch Air Quality Index data

**Key Methods**:
- `get_air_quality_by_zipcode(zipcode)` - Get current AQI for ZIP
- `get_air_quality_by_latlon(lat, lon)` - Get AQI for coordinates
- `get_forecast_by_zipcode(zipcode)` - Get AQI forecast

**Data**: Real-time and forecasted AQI (0-500 scale)

**Example**:
```python
from clients.epa import EPAAPIClient

client = EPAAPIClient()
aqi = client.get_air_quality_by_zipcode("94102")  # SF
print(f"AQI: {aqi['aqi']} - {aqi['category']}")
```

## Caching

API responses are automatically cached to reduce API calls and improve performance.

- **Location**: `.cache/` directory (gitignored)
- **TTL**: 24 hours by default (configurable via `CACHE_TTL_HOURS`)
- **Key Format**: `{api}_{resource}_{params}.json`

To clear cache:
```bash
rm -rf .cache/
```

To disable caching:
```bash
export CACHE_ENABLED=false
```

## Rate Limiting

The base client implements rate limiting to respect API quotas:

- **Default**: 60 requests/minute
- **Algorithm**: Token bucket with automatic throttling
- **Configurable**: Set `API_RATE_LIMIT_PER_MINUTE` in `.env`

## Error Handling

API clients handle common errors:

1. **Network Errors**: Automatic retry with exponential backoff
2. **Rate Limit (429)**: Wait and retry
3. **Server Errors (5xx)**: Retry up to 3 times
4. **Missing Data**: Return None or empty dict, log warning
5. **Invalid API Key**: Raise ValueError with helpful message

## Production Considerations

### Missing Data

The current sample data includes several metrics not yet available from free APIs:

- **School Scores**: Requires GreatSchools API (paid) or web scraping
- **Crime Rates**: FBI UCR data (available but requires ETL processing)
- **Weather Scores**: Requires NOAA API + custom scoring algorithm
- **Healthcare Scores**: Requires CMS data + custom scoring
- **Walkability**: Requires Walk Score API (paid)
- **Commute Times**: Requires Census LODES data processing
- **Utility Costs**: State-by-state data collection
- **Tax Rates**: State tax authority APIs + calculations

### Data Update Schedule

Recommended refresh frequency:

- **Population**: Annual (Census releases yearly ACS estimates)
- **FMR**: Annual (HUD updates October each fiscal year)
- **RPP**: Annual (BEA releases ~2 years behind)
- **Air Quality**: Daily or real-time

### Data Quality

Always validate API responses:

```python
def validate_metro_data(metro):
    assert metro.get('population', 0) > 0, "Invalid population"
    assert 0 < metro.get('rpp_index', 1) < 3, "Invalid RPP"
    assert metro.get('median_rent', 0) > 0, "Invalid rent"
```

### Geocoding

Census API doesn't provide lat/lon coordinates. Options:

1. **Google Geocoding API** (paid, $5/1000 requests)
2. **OpenStreetMap Nominatim** (free, rate-limited)
3. **Mapbox Geocoding** (free tier: 100k/month)
4. **Pre-computed coordinates** (maintain CSV with metro lat/lon)

Example using Mapbox:

```python
import requests

def geocode_metro(name, state):
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{name}%20{state}.json"
    params = {
        "access_token": os.getenv("MAPBOX_API_KEY"),
        "types": "place",
        "limit": 1
    }
    response = requests.get(url, params=params)
    data = response.json()

    if data['features']:
        coords = data['features'][0]['center']
        return {"lon": coords[0], "lat": coords[1]}
    return None
```

## Next Steps

1. **Get API Keys**: Sign up for Census and BEA API keys (required)
2. **Test APIs**: Run test commands to verify connectivity
3. **Fetch Data**: Run `fetch_from_apis.py` to get real data
4. **Add Geocoding**: Implement metro coordinate lookup
5. **Match & Load**: Complete the ETL logic to match API data to database
6. **Schedule Updates**: Set up cron jobs for periodic data refresh
7. **Add Missing Metrics**: Integrate additional data sources for QOL metrics
8. **Monitor**: Add logging and alerting for API failures

## Support

- **Census API Docs**: https://www.census.gov/data/developers/guidance.html
- **HUD API Docs**: https://www.huduser.gov/portal/dataset/fmr-api.html
- **BEA API Docs**: https://apps.bea.gov/api/
- **EPA API Docs**: https://docs.airnowapi.org/
