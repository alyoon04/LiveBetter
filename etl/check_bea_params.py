#!/usr/bin/env python3
"""
Check what parameters and values are available for BEA Regional dataset
"""
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

BEA_API_KEY = os.getenv("BEA_API_KEY")
BASE_URL = "https://apps.bea.gov/api/data"

def get_parameter_list():
    """Get list of parameters for Regional dataset"""
    print("\n" + "="*60)
    print("Getting parameter list for Regional dataset...")
    print("="*60)

    params = {
        "UserID": BEA_API_KEY,
        "method": "GetParameterList",
        "datasetname": "Regional",
        "ResultFormat": "json"
    }

    response = requests.get(BASE_URL, params=params, timeout=10)
    data = response.json()

    if "BEAAPI" in data:
        results = data["BEAAPI"].get("Results", {})
        if "Parameter" in results:
            print("\nAvailable parameters:")
            for param in results["Parameter"]:
                print(f"\n- {param.get('ParameterName')}: {param.get('ParameterDescription')}")
                print(f"  Required: {param.get('ParameterIsRequiredFlag')}")
                if param.get("ParameterDefaultValue"):
                    print(f"  Default: {param.get('ParameterDefaultValue')}")

    return data


def get_parameter_values(param_name):
    """Get valid values for a specific parameter"""
    print(f"\n" + "="*60)
    print(f"Getting valid values for {param_name}...")
    print("="*60)

    params = {
        "UserID": BEA_API_KEY,
        "method": "GetParameterValues",
        "datasetname": "Regional",
        "ParameterName": param_name,
        "ResultFormat": "json"
    }

    response = requests.get(BASE_URL, params=params, timeout=10)
    data = response.json()

    if "BEAAPI" in data:
        results = data["BEAAPI"].get("Results", {})

        if "Error" in results:
            print(f"❌ Error: {results['Error']}")
            return None

        if "ParamValue" in results:
            values = results["ParamValue"]
            print(f"\nFound {len(values)} valid values:")

            # Show first 20 and last 5
            for i, val in enumerate(values[:20]):
                desc = val.get("Desc", val.get("Key", ""))
                key = val.get("Key", "")
                print(f"  {key}: {desc}")

            if len(values) > 20:
                print(f"  ... ({len(values) - 25} more)")
                for val in values[-5:]:
                    desc = val.get("Desc", val.get("Key", ""))
                    key = val.get("Key", "")
                    print(f"  {key}: {desc}")

            return values

    return None


# Get parameter list
param_list_data = get_parameter_list()

# Check key parameters
print("\n" + "="*60)
print("Checking key parameters...")
print("="*60)

# Get valid TableName values
table_values = get_parameter_values("TableName")

# Get valid GeoFips values
geo_values = get_parameter_values("GeoFips")

# Get valid Year values
year_values = get_parameter_values("Year")

# Try to find RPP table
if table_values:
    print("\n" + "="*60)
    print("Looking for RPP-related tables...")
    print("="*60)

    rpp_tables = [v for v in table_values if "RPP" in v.get("Desc", "").upper() or "RPP" in v.get("Key", "").upper()]
    if rpp_tables:
        print("\nFound RPP tables:")
        for table in rpp_tables:
            print(f"  Key: {table.get('Key')}")
            print(f"  Desc: {table.get('Desc')}")
            print()

print("\n" + "="*60)
print("Complete!")
print("="*60)
