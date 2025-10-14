#!/usr/bin/env python3
"""
Update metro population data from multiple sources

Priority order:
1. Wikipedia (most current, community-maintained)
2. Census API (official but lags 1-2 years)

The script will try Wikipedia first for each metro, then fall back to Census if needed.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
import getpass
import time
from api.clients.wikipedia import WikipediaPopulationClient
from api.clients.census import CensusAPIClient

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "database": os.getenv("DB_NAME", "livebetter"),
    "user": os.getenv("DB_USER", getpass.getuser()),
    "password": os.getenv("DB_PASSWORD", "")
}


def get_population_multi_source(metro_name: str, state: str, cbsa_code: str,
                                 wiki_client: WikipediaPopulationClient,
                                 census_client: CensusAPIClient):
    """
    Try to get population from multiple sources in priority order

    Args:
        metro_name: Metro area name
        state: State code
        cbsa_code: CBSA code for Census API
        wiki_client: Wikipedia client instance
        census_client: Census client instance

    Returns:
        Dict with population, year, and source, or None if all sources fail
    """
    # Try Census API first (most reliable and accurate)
    if cbsa_code:
        try:
            time.sleep(1.1)  # Rate limiting for Census API
            census_data = census_client.get_single_metro_population(cbsa_code)
            if census_data and census_data.get('population'):
                return census_data
        except Exception as e:
            print(f"    ℹ Census lookup failed: {str(e)[:50]}")

    # Fallback to Wikipedia if Census fails
    try:
        wiki_data = wiki_client.get_metro_population(metro_name, state)
        if wiki_data and wiki_data.get('population'):
            return wiki_data
    except Exception as e:
        print(f"    ℹ Wikipedia lookup failed: {str(e)[:50]}")

    return None


def update_populations(force_update: bool = False):
    """
    Fetch population data from multiple sources and update database

    Args:
        force_update: If True, update all metros. If False, only update those without data.
    """
    print("\n" + "="*70)
    print("UPDATING METRO POPULATION DATA FROM MULTIPLE SOURCES")
    print("="*70)
    print("\nPriority: 1) Census API (official)  2) Wikipedia (fallback)")

    # Initialize clients
    print("\nInitializing data clients...")
    try:
        wiki_client = WikipediaPopulationClient()
        census_client = CensusAPIClient()
        print("✅ Clients initialized")
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

    if force_update:
        query = "SELECT metro_id, name, state, cbsa_code FROM metro ORDER BY name;"
        print("📊 Mode: Updating ALL metros")
    else:
        query = """
            SELECT metro_id, name, state, cbsa_code
            FROM metro
            WHERE population IS NULL OR population_source IS NULL
            ORDER BY name;
        """
        print("📊 Mode: Updating only metros without population data")

    cur.execute(query)
    db_metros = cur.fetchall()
    print(f"✅ Loaded {len(db_metros)} metros to update")

    if len(db_metros) == 0:
        print("\n✅ All metros already have population data!")
        print("💡 Use --force to update all metros regardless")
        cur.close()
        conn.close()
        return True

    # Fetch population data
    print("\nFetching population data...")
    print("(This may take a few minutes due to rate limiting...)\n")

    updated_count = 0
    failed_metros = []
    source_counts = {'wikipedia': 0, 'census_pep': 0, 'census_acs': 0}

    for metro_id, name, state, cbsa_code in db_metros:
        print(f"  Processing: {name:30s} {state:2s}", end=" ")

        try:
            # Get population from multiple sources
            pop_data = get_population_multi_source(
                name, state, cbsa_code,
                wiki_client, census_client
            )

            if pop_data:
                population = pop_data['population']
                source = pop_data['source']
                year = pop_data.get('year')

                cur.execute(
                    """
                    UPDATE metro
                    SET population = %s,
                        population_source = %s,
                        population_updated_at = CURRENT_TIMESTAMP
                    WHERE metro_id = %s;
                    """,
                    (population, source, metro_id)
                )

                # Format source display
                source_display = {
                    'wikipedia': '📚 Wiki',
                    'census_pep': '📊 Census PEP',
                    'census_acs': '📊 Census ACS'
                }.get(source, source)

                year_display = f" ({year})" if year else ""

                print(f"→ {population:>12,} {source_display}{year_display}")

                updated_count += 1
                source_counts[source] = source_counts.get(source, 0) + 1

                # Commit after each update to avoid losing progress
                conn.commit()
            else:
                failed_metros.append(f"{name}, {state}")
                print("→ ❌ No data found")

        except Exception as e:
            failed_metros.append(f"{name}, {state} - Error: {str(e)[:50]}")
            print(f"→ ❌ Error: {str(e)[:40]}")

        # Small delay to be respectful with rate limiting
        time.sleep(0.5)

    print(f"\n{'='*70}")
    print(f"✅ Updated {updated_count}/{len(db_metros)} metros")
    print(f"\nData sources used:")
    for source, count in source_counts.items():
        if count > 0:
            print(f"  • {source}: {count} metros")

    if failed_metros:
        print(f"\n⚠️  Failed to update {len(failed_metros)} metros")
        if len(failed_metros) <= 10:
            for metro in failed_metros[:10]:
                print(f"   - {metro}")
        else:
            print(f"   (showing first 10 of {len(failed_metros)})")
            for metro in failed_metros[:10]:
                print(f"   - {metro}")

    # Show statistics
    print(f"\n{'='*70}")
    print("UPDATED POPULATION STATISTICS")
    print("="*70)

    cur.execute("""
        SELECT
            COUNT(*) as total,
            MIN(population) as min_pop,
            MAX(population) as max_pop,
            ROUND(AVG(population)) as avg_pop,
            COUNT(*) FILTER (WHERE population_source = 'wikipedia') as wiki_count,
            COUNT(*) FILTER (WHERE population_source LIKE 'census%') as census_count
        FROM metro
        WHERE population IS NOT NULL;
    """)
    stats = cur.fetchone()

    print(f"Metros with population: {stats[0]}")
    print(f"Population range: {stats[1]:,} - {stats[2]:,}")
    print(f"Average population: {int(stats[3]):,}")
    print(f"\nSources: {stats[4]} from Wikipedia, {stats[5]} from Census")

    cur.close()
    conn.close()

    return True


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Update metro population data from multiple sources"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Update all metros, even if they already have population data"
    )
    args = parser.parse_args()

    print("\n" + "="*70)
    print("POPULATION DATA UPDATER")
    print("="*70)
    print("\nThis script fetches current metro population data from:")
    print("  1. Census API (official MSA population data)")
    print("  2. Wikipedia (fallback if Census unavailable)")
    print("\nNote: This will take several minutes due to rate limiting.")

    success = update_populations(force_update=args.force)

    if success:
        print("\n" + "="*70)
        print("✅ POPULATION DATA UPDATED!")
        print("="*70)
        print("\nRestart your API server to use the updated data.")
    else:
        print("\n" + "="*70)
        print("❌ UPDATE FAILED")
        print("="*70)
        sys.exit(1)
