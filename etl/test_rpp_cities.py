#!/usr/bin/env python3
"""
Test RPP line codes with known expensive and cheap cities
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BEA_API_KEY = os.getenv("BEA_API_KEY")
BASE_URL = "https://apps.bea.gov/api/data"

# Test cities: expensive and cheap
test_cities = [
    ("41860", "San Francisco"),  # Should be high RPP (~120-130)
    ("35620", "New York"),       # Should be high RPP (~115-125)
    ("33460", "Minneapolis"),    # Should be near 100
    ("12060", "Atlanta"),        # Should be slightly below 100 (~98-100)
    ("38900", "Portland"),       # Should be slightly above 100
    ("40380", "Rochester NY"),   # Should be below 100 (~95)
]

for code in ["3", "4", "5"]:
    print(f"\n{'='*60}")
    print(f"LineCode {code}")
    print(f"{'='*60}")

    for geofips, city_name in test_cities:
        params = {
            "UserID": BEA_API_KEY,
            "method": "GetData",
            "datasetname": "Regional",
            "TableName": "MARPP",
            "LineCode": code,
            "GeoFips": geofips,
            "Year": "2023",
            "ResultFormat": "json"
        }

        try:
            response = requests.get(BASE_URL, params=params, timeout=10)
            data = response.json()

            if "BEAAPI" in data:
                results = data["BEAAPI"].get("Results", {})
                if "Data" in results and results["Data"]:
                    item = results["Data"][0]
                    value = item.get('DataValue')
                    unit = item.get('CL_UNIT')
                    print(f"  {city_name:20s}: {value:>8s} ({unit})")
        except Exception as e:
            print(f"  {city_name:20s}: Error - {e}")

print("\n" + "="*60)
print("Expected RPP patterns (All Items RPP):")
print("="*60)
print("  San Francisco:   ~120-130 (expensive)")
print("  New York:        ~115-125 (expensive)")
print("  Portland:        ~105-110 (above avg)")
print("  Minneapolis:     ~98-102 (near avg)")
print("  Atlanta:         ~96-100 (slightly below)")
print("  Rochester:       ~93-97 (below avg)")
print("\nLineCode 3 or 4 that matches these patterns is likely All Items RPP")
