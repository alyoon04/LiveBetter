#!/usr/bin/env python3
"""
Test different BEA API parameter combinations to find what works
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BEA_API_KEY = os.getenv("BEA_API_KEY")
BASE_URL = "https://apps.bea.gov/api/data"

def test_params(params, description):
    """Test a parameter combination"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"{'='*60}")
    print(f"Parameters: {params}")

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()

            # Check for errors in BEA response
            if "BEAAPI" in data:
                results = data["BEAAPI"].get("Results", {})

                if "Error" in results:
                    print(f"❌ BEA Error: {results['Error']}")
                    return False

                if "Data" in results:
                    data_count = len(results["Data"])
                    print(f"✅ Success! Got {data_count} data points")

                    # Show first item as example
                    if data_count > 0:
                        print(f"Sample data: {results['Data'][0]}")
                    return True
                else:
                    print(f"⚠️  No Data field in response")
                    print(f"Response: {data}")
            else:
                print(f"⚠️  Unexpected response format: {data}")
        else:
            print(f"❌ HTTP Error: {response.text}")

    except Exception as e:
        print(f"❌ Exception: {e}")

    return False


# Test 1: Original parameters
params1 = {
    "UserID": BEA_API_KEY,
    "method": "GetData",
    "datasetname": "Regional",
    "TableName": "SARPP",
    "LineCode": "1",
    "GeoFIPS": "MSA",
    "Year": "LAST5",
    "ResultFormat": "json"
}
test_params(params1, "Original (GeoFIPS with LAST5)")

# Test 2: Try specific year
params2 = {
    "UserID": BEA_API_KEY,
    "method": "GetData",
    "datasetname": "Regional",
    "TableName": "SARPP",
    "LineCode": "1",
    "GeoFIPS": "MSA",
    "Year": "2022",
    "ResultFormat": "json"
}
test_params(params2, "Specific year (2022)")

# Test 3: Try GeoFips (lowercase 'ips')
params3 = {
    "UserID": BEA_API_KEY,
    "method": "GetData",
    "datasetname": "Regional",
    "TableName": "SARPP",
    "LineCode": "1",
    "GeoFips": "MSA",
    "Year": "2022",
    "ResultFormat": "json"
}
test_params(params3, "GeoFips (lowercase 'ips') with 2022")

# Test 4: Try ALL for all geographies
params4 = {
    "UserID": BEA_API_KEY,
    "method": "GetData",
    "datasetname": "Regional",
    "TableName": "SARPP",
    "LineCode": "1",
    "GeoFips": "ALL",
    "Year": "2022",
    "ResultFormat": "json"
}
test_params(params4, "GeoFips=ALL with 2022")

# Test 5: Try without LineCode
params5 = {
    "UserID": BEA_API_KEY,
    "method": "GetData",
    "datasetname": "Regional",
    "TableName": "SARPP",
    "GeoFips": "MSA",
    "Year": "2022",
    "ResultFormat": "json"
}
test_params(params5, "Without LineCode")

# Test 6: Try LAST1 instead of LAST5
params6 = {
    "UserID": BEA_API_KEY,
    "method": "GetData",
    "datasetname": "Regional",
    "TableName": "SARPP",
    "LineCode": "1",
    "GeoFips": "MSA",
    "Year": "LAST1",
    "ResultFormat": "json"
}
test_params(params6, "GeoFips with LAST1")

print("\n" + "="*60)
print("Testing complete!")
print("="*60)
