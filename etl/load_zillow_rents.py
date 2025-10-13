#!/usr/bin/env python3
"""
Load Zillow rent data from manually downloaded CSV

Download from: https://www.zillow.com/research/data/
Look for: "ZORI (Smoothed): All Homes Plus Multifamily Time Series ($)" - Metro level
Save as: data/zillow_rent_metro.csv

Usage: python load_zillow_rents.py
"""
import os
import sys
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import getpass

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "database": os.getenv("DB_NAME", "livebetter"),
    "user": os.getenv("DB_USER", getpass.getuser()),
    "password": os.getenv("DB_PASSWORD", "")
}

SOURCE_TAG = "zillow_manual_v1"


def load_zillow_rent_csv(csv_path: str) -> pd.DataFrame:
    """Load and parse Zillow rent CSV"""
    print(f"Loading Zillow rent data from {csv_path}...")

    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Zillow CSV not found at {csv_path}\n"
            "Download from: https://www.zillow.com/research/data/\n"
            "Look for: 'ZORI (Smoothed)' Metro data"
        )

    df = pd.read_csv(csv_path)
    print(f"✓ Loaded {len(df)} metros from Zillow CSV")

    # Zillow format: RegionID, SizeRank, RegionName, RegionType, StateName, [date columns...]
    # Get most recent month
    date_cols = [col for col in df.columns if col not in [
        'RegionID', 'SizeRank', 'RegionName', 'RegionType', 'StateName'
    ]]

    if not date_cols:
        raise ValueError("No date columns found in CSV")

    latest_date = date_cols[-1]
    print(f"✓ Using data from: {latest_date}")

    # Extract relevant data
    result = df[['RegionName', 'StateName', latest_date]].copy()
    result.columns = ['metro_name', 'state', 'median_rent']

    # Remove rows with missing rent data
    result = result.dropna(subset=['median_rent'])

    # Parse metro name to extract city
    result['city'] = result['metro_name'].apply(lambda x: x.split(',')[0].strip())

    print(f"✓ Processed {len(result)} metros with rent data")
    return result


def match_metros_to_db(rent_df: pd.DataFrame, conn) -> pd.DataFrame:
    """Match Zillow metros to database metros"""
    print("Matching Zillow metros to database...")

    # Load metros from database
    query = "SELECT metro_id, name, state FROM metro;"
    db_metros = pd.read_sql_query(query, conn)

    # Try to match by city name and state
    # Normalize names for matching
    rent_df['city_norm'] = rent_df['city'].str.lower().str.strip()
    db_metros['name_norm'] = db_metros['name'].str.lower().str.strip()

    # Merge on normalized city and state
    matched = rent_df.merge(
        db_metros,
        left_on=['city_norm', 'state'],
        right_on=['name_norm', 'state'],
        how='inner'
    )

    print(f"✓ Matched {len(matched)} metros to database")

    if len(matched) < len(db_metros) * 0.5:
        print(f"⚠️  Warning: Only matched {len(matched)}/{len(db_metros)} metros")
        print("   Some metros may not have rent data")

    return matched[['metro_id', 'median_rent']]


def update_metro_costs(matched_df: pd.DataFrame, conn):
    """Update metro_costs table with Zillow rent data"""
    cur = conn.cursor()

    try:
        print(f"Updating rent data for {len(matched_df)} metros...")

        # Update median_rent_usd for each metro
        updated_count = 0
        for _, row in matched_df.iterrows():
            cur.execute(
                """
                UPDATE metro_costs
                SET median_rent_usd = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE metro_id = %s;
                """,
                (float(row['median_rent']), int(row['metro_id']))
            )
            if cur.rowcount > 0:
                updated_count += 1

        conn.commit()
        print(f"✓ Updated rent data for {updated_count} metros")

        # Show stats
        cur.execute("""
            SELECT
                COUNT(*) as total,
                ROUND(AVG(median_rent_usd), 2) as avg_rent,
                ROUND(MIN(median_rent_usd), 2) as min_rent,
                ROUND(MAX(median_rent_usd), 2) as max_rent
            FROM metro_costs;
        """)
        stats = cur.fetchone()
        print(f"\nRent statistics:")
        print(f"  Average rent: ${stats[1]:,.2f}/month")
        print(f"  Min rent: ${stats[2]:,.2f}/month")
        print(f"  Max rent: ${stats[3]:,.2f}/month")

    except Exception as e:
        conn.rollback()
        print(f"✗ Error: {e}")
        raise
    finally:
        cur.close()


def main():
    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    zillow_csv = os.path.join(project_root, "data", "zillow_rent_metro.csv")

    print("=" * 60)
    print("Load Zillow Rent Data")
    print("=" * 60)
    print()

    try:
        # Load Zillow CSV
        rent_df = load_zillow_rent_csv(zillow_csv)

        # Connect to database
        print("\nConnecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)

        # Match metros
        matched_df = match_metros_to_db(rent_df, conn)

        if len(matched_df) == 0:
            print("\n✗ No metros matched between Zillow data and database")
            print("   Check that metro names in database match Zillow format")
            sys.exit(1)

        # Update database
        update_metro_costs(matched_df, conn)

        conn.close()

        print()
        print("=" * 60)
        print("✓ Zillow rent data loaded successfully!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Restart your API server to use the new rent data")
        print("2. Test the rankings to see updated results")

    except FileNotFoundError as e:
        print(f"\n✗ {e}")
        print("\nHow to get Zillow data:")
        print("1. Go to: https://www.zillow.com/research/data/")
        print("2. Find: 'ZORI (Smoothed): All Homes Plus Multifamily' - Metro level")
        print("3. Download CSV and save as: data/zillow_rent_metro.csv")
        print("4. Run this script again")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Load failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
