#!/bin/bash
# Test API connectivity and configuration

set -e

cd "$(dirname "$0")/.."

echo "=============================================="
echo "LiveBetter API Configuration Test"
echo "=============================================="
echo ""

# Check if venv is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Virtual environment not activated"
    echo "   Run: source venv/bin/activate"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "   Run: cp .env.example .env"
    echo "   Then add your API keys to .env"
    exit 1
fi

# Load environment
source .env 2>/dev/null || true

echo "Testing API clients..."
echo ""

# Test Census API
echo "1. Testing Census Bureau API..."
if [ -z "$CENSUS_API_KEY" ] || [ "$CENSUS_API_KEY" = "your_census_api_key_here" ]; then
    echo "   ⚠️  CENSUS_API_KEY not configured"
    echo "   Get key: https://api.census.gov/data/key_signup.html"
else
    python3 -c "
import sys
sys.path.insert(0, 'api')
from clients.census import CensusAPIClient
try:
    client = CensusAPIClient()
    metros = client.get_metro_population(year=2022)
    print(f'   ✓ Census API working - fetched {len(metros)} metros')
except Exception as e:
    print(f'   ✗ Census API error: {e}')
    sys.exit(1)
"
fi
echo ""

# Test BEA API
echo "2. Testing BEA API..."
if [ -z "$BEA_API_KEY" ] || [ "$BEA_API_KEY" = "your_bea_api_key_here" ]; then
    echo "   ⚠️  BEA_API_KEY not configured"
    echo "   Get key: https://apps.bea.gov/API/signup/"
else
    python3 -c "
import sys
sys.path.insert(0, 'api')
from clients.bea import BEAAPIClient
try:
    client = BEAAPIClient()
    rpp_data = client.get_regional_price_parity()
    print(f'   ✓ BEA API working - fetched {len(rpp_data)} RPP values')
except Exception as e:
    print(f'   ✗ BEA API error: {e}')
    sys.exit(1)
"
fi
echo ""

# Test HUD API
echo "3. Testing HUD API..."
python3 -c "
import sys
sys.path.insert(0, 'api')
from clients.hud import HUDAPIClient
try:
    client = HUDAPIClient()
    # Test with Atlanta CBSA
    fmr = client.get_fmr_by_cbsa('12060')
    if fmr:
        print(f'   ✓ HUD API working - test fetch successful')
    else:
        print(f'   ⚠️  HUD API returned no data')
except Exception as e:
    print(f'   ✗ HUD API error: {e}')
    sys.exit(1)
"
echo ""

# Test EPA API
echo "4. Testing EPA AirNow API..."
if [ -z "$AIRNOW_API_KEY" ] || [ "$AIRNOW_API_KEY" = "your_airnow_api_key_here" ]; then
    echo "   ⚠️  AIRNOW_API_KEY not configured (optional)"
    echo "   Get key: https://docs.airnowapi.org/account/request/"
else
    python3 -c "
import sys
sys.path.insert(0, 'api')
from clients.epa import EPAAPIClient
try:
    client = EPAAPIClient()
    # Test with SF ZIP
    aqi = client.get_air_quality_by_zipcode('94102')
    if aqi:
        print(f'   ✓ EPA API working - AQI: {aqi.get(\"aqi\")}')
    else:
        print(f'   ⚠️  EPA API returned no data')
except Exception as e:
    print(f'   ⚠️  EPA API error: {e}')
"
fi
echo ""

echo "=============================================="
echo "Test Complete"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Configure any missing API keys in .env"
echo "2. Run: cd etl && python fetch_from_apis.py"
echo ""
