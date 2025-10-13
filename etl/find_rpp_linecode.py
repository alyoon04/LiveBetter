#!/usr/bin/env python3
"""
Find the correct LineCode for RPP indices
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BEA_API_KEY = os.getenv("BEA_API_KEY")
BASE_URL = "https://apps.bea.gov/api/data"

# Test different line codes to find RPP
test_codes = ["1", "2", "3", "4", "5", "10", "11", "12"]

for code in test_codes:
    print(f"\n{'='*60}")
    print(f"Testing LineCode {code}")
    print(f"{'='*60}")

    params = {
        "UserID": BEA_API_KEY,
        "method": "GetData",
        "datasetname": "Regional",
        "TableName": "MARPP",
        "LineCode": code,
        "GeoFips": "12060",  # Just Atlanta for faster testing
        "Year": "2023",
        "ResultFormat": "json"
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        data = response.json()

        if "BEAAPI" in data:
            results = data["BEAAPI"].get("Results", {})

            if "Error" in results:
                print(f"❌ Error: {results['Error'].get('APIErrorDescription', 'Unknown')}")
            elif "Data" in results:
                items = results["Data"]
                if items:
                    item = items[0]
                    print(f"✅ Got data:")
                    print(f"   GeoName: {item.get('GeoName')}")
                    print(f"   Unit: {item.get('CL_UNIT')}")
                    print(f"   Value: {item.get('DataValue')}")
                    print(f"   Code: {item.get('Code')}")

                    # Check if this looks like RPP (should be around 90-120 for most cities)
                    try:
                        val = float(item.get('DataValue', '0'))
                        if 70 < val < 150:
                            print(f"   ⭐ This looks like it could be RPP! (value in reasonable range)")
                    except:
                        pass
    except Exception as e:
        print(f"❌ Exception: {e}")

print("\n" + "="*60)
print("Testing complete!")
print("="*60)
print("\nLooking for LineCode with:")
print("- Unit description containing 'RPP' or 'price parity' or 'index'")
print("- Values in range ~70-150")
