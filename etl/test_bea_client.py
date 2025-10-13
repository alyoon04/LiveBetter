#!/usr/bin/env python3
"""
Test the updated BEA client with correct MARPP parameters
"""
import sys
sys.path.insert(0, '/Users/alexyoon/LiveBetter')

from api.clients.bea import BEAAPIClient

print("="*60)
print("Testing BEA Client with corrected parameters")
print("="*60)

try:
    client = BEAAPIClient()
    print("✅ Client initialized")

    # Test fetching RPP data
    print("\nFetching RPP data for 2023...")
    rpp_data = client.get_regional_price_parity(year=2023)

    print(f"\n✅ Success! Got RPP data for {len(rpp_data)} entries")

    # Show some examples
    print("\nSample RPP values:")
    test_cities = ["Atlanta", "New York", "San Francisco", "Austin", "Miami"]

    for city in test_cities:
        if city in rpp_data:
            rpp_val = rpp_data[city]
            print(f"  {city:20s}: {rpp_val:.3f} ({rpp_val*100:.1f} on 100-scale)")
        else:
            print(f"  {city:20s}: Not found in data")

    # Show first 10 by metro name
    print("\nFirst 10 metros:")
    count = 0
    for key, val in rpp_data.items():
        if len(key) > 5:  # Skip FIPS codes, show names only
            print(f"  {key}: {val:.3f}")
            count += 1
            if count >= 10:
                break

    print("\n" + "="*60)
    print("✅ BEA API is working correctly!")
    print("="*60)

except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
