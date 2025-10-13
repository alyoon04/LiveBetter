#!/usr/bin/env python3
"""
Update metro population data from Census API
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
import getpass
import time
from api.clients.census import CensusAPIClient

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "database": os.getenv("DB_NAME", "livebetter"),
    "user": os.getenv("DB_USER", getpass.getuser()),
    "password": os.getenv("DB_PASSWORD", "")
}


def update_populations():
    """Fetch population data from Census API and update database"""
    print("\n" + "="*60)
    print("UPDATING METRO POPULATION DATA FROM CENSUS API")
    print("="*60)

    # Initialize Census client
    print("\nInitializing Census API client...")
    try:
        client = CensusAPIClient()
        print("✅ Census client initialized")
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

    # Connect to database
    print("\nConnecting to database...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Connected")
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

    # Get metros from database
    cur = conn.cursor()
    cur.execute("SELECT metro_id, name, state, cbsa_code FROM metro ORDER BY name;")
    db_metros = cur.fetchall()
    print(f"✅ Loaded {len(db_metros)} metros from database")

    # Fetch population data
    print("\nFetching population data from Census API...")
    print("(This may take a moment due to rate limiting...)")

    updated_count = 0
    failed_metros = []

    for metro_id, name, state, cbsa_code in db_metros:
        if not cbsa_code:
            failed_metros.append(f"{name}, {state} (no CBSA code)")
            continue

        try:
            # Rate limit: 1 request per second to be safe
            time.sleep(1.1)

            population = client.get_metro_population(cbsa_code)

            if population:
                cur.execute(
                    """
                    UPDATE metro
                    SET population = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE metro_id = %s;
                    """,
                    (population, metro_id)
                )
                updated_count += 1
                print(f"  ✓ {name:30s} {state:2s}: {population:>12,}")
            else:
                failed_metros.append(f"{name}, {state}")

        except Exception as e:
            failed_metros.append(f"{name}, {state} - Error: {str(e)[:50]}")
            print(f"  ✗ {name}, {state}: {e}")

    conn.commit()

    print(f"\n✅ Updated {updated_count}/{len(db_metros)} metros")

    if failed_metros and len(failed_metros) <= 10:
        print(f"\n⚠️  Failed to update {len(failed_metros)} metros:")
        for metro in failed_metros[:10]:
            print(f"   - {metro}")

    # Show statistics
    print("\n" + "="*60)
    print("UPDATED POPULATION STATISTICS")
    print("="*60)

    cur.execute("""
        SELECT
            COUNT(*) as total,
            MIN(population) as min_pop,
            MAX(population) as max_pop,
            ROUND(AVG(population)) as avg_pop
        FROM metro
        WHERE population IS NOT NULL;
    """)
    stats = cur.fetchone()

    print(f"Metros with population: {stats[0]}")
    print(f"Population range: {stats[1]:,} - {stats[2]:,}")
    print(f"Average population: {stats[3]:,}")

    cur.close()
    conn.close()

    return True


if __name__ == "__main__":
    print("\n" + "="*60)
    print("CENSUS POPULATION DATA UPDATER")
    print("="*60)
    print("\nThis script fetches current metro population data from Census API")
    print("and updates the database.")
    print("\nNote: Census API has rate limits, so this will take ~2 minutes.")

    success = update_populations()

    if success:
        print("\n" + "="*60)
        print("✅ POPULATION DATA UPDATED!")
        print("="*60)
        print("\nRestart your API server to use the updated data.")
    else:
        print("\n" + "="*60)
        print("❌ UPDATE FAILED")
        print("="*60)
        sys.exit(1)
