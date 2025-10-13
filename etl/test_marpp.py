#!/usr/bin/env python3
"""
Test MARPP table for metro-level RPP data
"""
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

BEA_API_KEY = os.getenv("BEA_API_KEY")
BASE_URL = "https://apps.bea.gov/api/data"

# First, get LineCode values for MARPP
print("="*60)
print("Getting LineCode values for MARPP table...")
print("="*60)

params = {
    "UserID": BEA_API_KEY,
    "method": "GetParameterValues",
    "datasetname": "Regional",
    "TableName": "MARPP",
    "ParameterName": "LineCode",
    "ResultFormat": "json"
}

response = requests.get(BASE_URL, params=params, timeout=10)
data = response.json()

if "BEAAPI" in data:
    results = data["BEAAPI"].get("Results", {})

    if "Error" in results:
        print(f"❌ Error: {results['Error']}")
    elif "ParamValue" in results:
        values = results["ParamValue"]
        print(f"\nAvailable LineCode values for MARPP:")
        for val in values:
            key = val.get("Key", "")
            desc = val.get("Desc", "")
            print(f"  {key}: {desc}")

# Now test fetching RPP data with MARPP
print("\n" + "="*60)
print("Testing MARPP with RPP line code...")
print("="*60)

# Try with line code 1 (typically all items RPP)
params = {
    "UserID": BEA_API_KEY,
    "method": "GetData",
    "datasetname": "Regional",
    "TableName": "MARPP",
    "LineCode": "1",  # Will adjust based on above output
    "GeoFips": "MSA",
    "Year": "2023",
    "ResultFormat": "json"
}

print(f"Parameters: {params}")

response = requests.get(BASE_URL, params=params, timeout=10)
data = response.json()

if "BEAAPI" in data:
    results = data["BEAAPI"].get("Results", {})

    if "Error" in results:
        print(f"❌ BEA Error: {results['Error']}")
    elif "Data" in results:
        data_items = results["Data"]
        print(f"✅ Success! Got {len(data_items)} data points")

        # Show first 5 examples
        print("\nSample data:")
        for item in data_items[:5]:
            print(f"  {item.get('GeoName')}: {item.get('DataValue')} ({item.get('CL_UNIT')})")

        # Save to file for inspection
        with open("/Users/alexyoon/LiveBetter/data/bea_marpp_sample.json", "w") as f:
            json.dump(data_items[:50], f, indent=2)
        print(f"\nSaved first 50 items to data/bea_marpp_sample.json")
    else:
        print(f"⚠️  Unexpected response: {data}")

print("\n" + "="*60)
print("Complete!")
print("="*60)
