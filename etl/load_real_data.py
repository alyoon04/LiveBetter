#!/usr/bin/env python3
"""
Load real production data from manually downloaded files

Required files:
1. data/zillow_rent_metro.csv - From https://www.zillow.com/research/data/
2. data/bea_rpp_metro.csv - From https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area

Usage: python load_real_data.py
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

SOURCE_TAG = "production_real_data_v1"


def load_zillow_rents(zillow_path: str) -> pd.DataFrame:
    """Load Zillow rent data"""
    print("\n" + "="*60)
    print("LOADING ZILLOW RENT DATA")
    print("="*60)

    if not os.path.exists(zillow_path):
        print(f"❌ File not found: {zillow_path}")
        print("\nDownload from: https://www.zillow.com/research/data/")
        print("Look for: 'ZORI (Smoothed): All Homes Plus Multifamily' - Metro")
        return None

    df = pd.read_csv(zillow_path)
    print(f"✓ Loaded {len(df)} metros from Zillow")

    # Get most recent month
    date_cols = [col for col in df.columns if col not in [
        'RegionID', 'SizeRank', 'RegionName', 'RegionType', 'StateName', 'Metro'
    ]]

    if not date_cols:
        print("❌ No date columns found")
        return None

    latest_date = date_cols[-1]
    print(f"✓ Using data from: {latest_date}")

    # Extract city name from metro name (format: "City, ST Metro Area")
    df['city'] = df['RegionName'].apply(lambda x: x.split(',')[0].strip())

    result = df[['city', 'StateName', latest_date]].copy()
    result.columns = ['city', 'state', 'median_rent']
    result = result.dropna(subset=['median_rent'])

    print(f"✓ Processed {len(result)} metros with rent data")
    return result


def load_bea_rpp(bea_path: str) -> pd.DataFrame:
    """Load BEA Regional Price Parity data"""
    print("\n" + "="*60)
    print("LOADING BEA REGIONAL PRICE PARITY DATA")
    print("="*60)

    if not os.path.exists(bea_path):
        print(f"❌ File not found: {bea_path}")
        print("\nDownload from: https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area")
        print("Export the 'Metro' sheet as CSV")
        return None

    df = pd.read_csv(bea_path)
    print(f"✓ Loaded {len(df)} rows from BEA")

    # BEA format varies, try to find the right columns
    # Typical format: GeoFIPS, GeoName, [year columns...]

    # Find year columns
    year_cols = [col for col in df.columns if col.isdigit() or 'RPP' in col.upper()]

    if not year_cols:
        print("⚠️  Warning: No year columns found, trying alternative format")
        # Try alternative: might have 'All items' column
        if 'All items' in df.columns:
            df['rpp'] = df['All items']
        else:
            print("❌ Cannot determine RPP column")
            return None
    else:
        # Use most recent year
        latest_year = sorted(year_cols)[-1]
        print(f"✓ Using RPP data from: {latest_year}")
        df['rpp'] = df[latest_year]

    # Extract metro name
    if 'GeoName' in df.columns:
        df['metro_name'] = df['GeoName']
    elif 'Area' in df.columns:
        df['metro_name'] = df['Area']
    else:
        print("❌ Cannot find metro name column")
        return None

    # Extract city from metro name
    df['city'] = df['metro_name'].apply(lambda x: str(x).split(',')[0].split('-')[0].strip() if pd.notna(x) else '')

    result = df[['city', 'metro_name', 'rpp']].copy()
    result = result.dropna(subset=['rpp'])

    # Convert RPP to decimal (BEA uses 100 = national average)
    result['rpp_index'] = result['rpp'].astype(float) / 100.0

    print(f"✓ Processed {len(result)} metros with RPP data")
    return result[['city', 'metro_name', 'rpp_index']]


def update_database(rent_df: pd.DataFrame, rpp_df: pd.DataFrame, conn):
    """Update database with real data"""
    print("\n" + "="*60)
    print("UPDATING DATABASE")
    print("="*60)

    # Load existing metros
    db_metros = pd.read_sql_query(
        "SELECT metro_id, name, state FROM metro;",
        conn
    )
    print(f"✓ Loaded {len(db_metros)} metros from database")

    # Normalize names for matching
    db_metros['name_lower'] = db_metros['name'].str.lower().str.strip()

    if rent_df is not None:
        rent_df['city_lower'] = rent_df['city'].str.lower().str.strip()

    if rpp_df is not None:
        rpp_df['city_lower'] = rpp_df['city'].str.lower().str.strip()

    cur = conn.cursor()
    updated_rents = 0
    updated_rpps = 0

    try:
        # Update each metro
        for _, metro in db_metros.iterrows():
            metro_id = metro['metro_id']
            metro_name_lower = metro['name_lower']

            updates = []
            values = []

            # Match rent data
            if rent_df is not None:
                rent_match = rent_df[rent_df['city_lower'] == metro_name_lower]
                if not rent_match.empty:
                    rent_value = float(rent_match.iloc[0]['median_rent'])
                    updates.append("median_rent_usd = %s")
                    values.append(rent_value)
                    updated_rents += 1

            # Match RPP data
            if rpp_df is not None:
                rpp_match = rpp_df[rpp_df['city_lower'] == metro_name_lower]
                if not rpp_match.empty:
                    rpp_value = float(rpp_match.iloc[0]['rpp_index'])
                    updates.append("rpp_index = %s")
                    values.append(rpp_value)
                    updated_rpps += 1

            # Execute update if we have data
            if updates:
                values.append(metro_id)
                query = f"""
                    UPDATE metro_costs
                    SET {', '.join(updates)},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE metro_id = %s;
                """
                cur.execute(query, values)

        conn.commit()

        print(f"\n✓ Updated rent data for {updated_rents} metros")
        print(f"✓ Updated RPP data for {updated_rpps} metros")

        # Show stats
        cur.execute("""
            SELECT
                COUNT(*) as total,
                ROUND(AVG(median_rent_usd), 2) as avg_rent,
                ROUND(AVG(rpp_index), 3) as avg_rpp,
                ROUND(MIN(median_rent_usd), 2) as min_rent,
                ROUND(MAX(median_rent_usd), 2) as max_rent
            FROM metro_costs;
        """)
        stats = cur.fetchone()

        print(f"\n" + "="*60)
        print("DATABASE STATISTICS")
        print("="*60)
        print(f"Total metros with cost data: {stats[0]}")
        print(f"Average rent: ${stats[1]:,.2f}/month")
        print(f"Average RPP: {stats[2]} (1.0 = national avg)")
        print(f"Rent range: ${stats[3]:,.2f} - ${stats[4]:,.2f}")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error updating database: {e}")
        raise
    finally:
        cur.close()


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    zillow_path = os.path.join(project_root, "data", "zillow_rent_metro.csv")
    bea_path = os.path.join(project_root, "data", "bea_rpp_metro.csv")

    print("\n" + "="*60)
    print("LOAD REAL PRODUCTION DATA")
    print("="*60)
    print("\nThis script loads real data from:")
    print(f"1. Zillow rents: {zillow_path}")
    print(f"2. BEA RPP: {bea_path}")

    # Load data files
    rent_df = load_zillow_rents(zillow_path)
    rpp_df = load_bea_rpp(bea_path)

    if rent_df is None and rpp_df is None:
        print("\n❌ No data files found!")
        print("\nPlease download:")
        print("1. Zillow: https://www.zillow.com/research/data/")
        print("2. BEA: https://apps.bea.gov/regional/zip/SARPP.zip")
        sys.exit(1)

    if rent_df is None:
        print("\n⚠️  Zillow data not found - rent data will not be updated")

    if rpp_df is None:
        print("\n⚠️  BEA data not found - RPP data will not be updated")
        print("    (RPP can be loaded later or via BEA API once activated)")

    print("\n✓ Proceeding with available data...")

    # Connect and update
    print("\nConnecting to database...")
    conn = psycopg2.connect(**DB_CONFIG)

    update_database(rent_df, rpp_df, conn)

    conn.close()

    print("\n" + "="*60)
    print("✅ REAL PRODUCTION DATA LOADED SUCCESSFULLY!")
    print("="*60)
    print("\nNext steps:")
    print("1. Restart your API server")
    print("2. Refresh your frontend")
    print("3. Your app now uses REAL data!")
    print()


if __name__ == "__main__":
    main()
