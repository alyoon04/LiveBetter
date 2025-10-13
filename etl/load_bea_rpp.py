#!/usr/bin/env python3
"""
Load BEA Regional Price Parity data into database
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
import getpass
from api.clients.bea import BEAAPIClient

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "database": os.getenv("DB_NAME", "livebetter"),
    "user": os.getenv("DB_USER", getpass.getuser()),
    "password": os.getenv("DB_PASSWORD", "")
}


def load_rpp_data():
    """Fetch RPP data from BEA API and load into database"""
    print("\n" + "="*60)
    print("LOADING BEA REGIONAL PRICE PARITY DATA")
    print("="*60)

    # Initialize BEA client
    print("\nInitializing BEA API client...")
    try:
        client = BEAAPIClient()
        print("✅ BEA client initialized")
    except Exception as e:
        print(f"❌ Error initializing BEA client: {e}")
        return False

    # Fetch RPP data
    print("\nFetching RPP data from BEA API (2023)...")
    try:
        rpp_data = client.get_regional_price_parity(year=2023)
        print(f"✅ Fetched RPP data for {len(rpp_data)} locations")
    except Exception as e:
        print(f"❌ Error fetching RPP data: {e}")
        return False

    # Connect to database
    print("\nConnecting to database...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Connected to database")
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return False

    # Load metros from database
    print("\nLoading metros from database...")
    cur = conn.cursor()
    cur.execute("SELECT metro_id, name, state FROM metro;")
    db_metros = cur.fetchall()
    print(f"✅ Loaded {len(db_metros)} metros from database")

    # Match and update
    print("\nMatching BEA data to database metros...")
    updated_count = 0
    not_found = []

    for metro_id, metro_name, state in db_metros:
        # Normalize metro name for matching
        name_lower = metro_name.lower().strip()

        # Try to find RPP value
        rpp_value = None

        # Try exact match
        if name_lower.title() in rpp_data:
            rpp_value = rpp_data[name_lower.title()]
        elif metro_name in rpp_data:
            rpp_value = rpp_data[metro_name]
        else:
            # Try variations
            for key in rpp_data.keys():
                if isinstance(key, str) and len(key) > 5:  # Skip FIPS codes
                    if key.lower().startswith(name_lower):
                        rpp_value = rpp_data[key]
                        break

        if rpp_value:
            # Update database
            cur.execute(
                """
                UPDATE metro_costs
                SET rpp_index = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE metro_id = %s;
                """,
                (float(rpp_value), metro_id)
            )
            updated_count += 1
        else:
            not_found.append(metro_name)

    conn.commit()

    print(f"\n✅ Updated RPP data for {updated_count}/{len(db_metros)} metros")

    if not_found and len(not_found) <= 10:
        print(f"\n⚠️  Could not find RPP for {len(not_found)} metros:")
        for name in not_found[:10]:
            print(f"   - {name}")

    # Show statistics
    print("\n" + "="*60)
    print("DATABASE STATISTICS")
    print("="*60)

    cur.execute("""
        SELECT
            COUNT(*) as total,
            ROUND(AVG(rpp_index), 3) as avg_rpp,
            ROUND(MIN(rpp_index), 3) as min_rpp,
            ROUND(MAX(rpp_index), 3) as max_rpp,
            ROUND(AVG(median_rent_usd), 2) as avg_rent
        FROM metro_costs
        WHERE rpp_index IS NOT NULL;
    """)
    stats = cur.fetchone()

    print(f"Metros with RPP data: {stats[0]}")
    print(f"Average RPP: {stats[1]} (1.0 = national avg)")
    print(f"RPP range: {stats[2]} - {stats[3]}")
    print(f"Average rent: ${stats[4]:,.2f}/month")

    cur.close()
    conn.close()

    return True


if __name__ == "__main__":
    print("\n" + "="*60)
    print("BEA REGIONAL PRICE PARITY LOADER")
    print("="*60)
    print("\nThis script fetches RPP data from BEA API and loads it into the database.")

    success = load_rpp_data()

    if success:
        print("\n" + "="*60)
        print("✅ RPP DATA LOADED SUCCESSFULLY!")
        print("="*60)
        print("\nNext steps:")
        print("1. Restart your API server")
        print("2. Test rankings with real RPP data")
        print()
    else:
        print("\n" + "="*60)
        print("❌ FAILED TO LOAD RPP DATA")
        print("="*60)
        sys.exit(1)
