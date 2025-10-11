#!/usr/bin/env python3
"""
Load metro costs from multiple CSVs (rents, RPP, taxes, utilities)
Usage: python load_costs.py
"""
import os
import sys
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

# Database connection parameters
import getpass
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "database": os.getenv("DB_NAME", "livebetter"),
    "user": os.getenv("DB_USER", getpass.getuser()),
    "password": os.getenv("DB_PASSWORD", "")
}

SOURCE_TAG = "2025Q4_mvp_v1"  # Versioning tag for this data batch

def load_metros_from_db(conn) -> pd.DataFrame:
    """Fetch existing metros from database"""
    print("Loading metros from database...")
    query = "SELECT metro_id, cbsa_code, state FROM metro;"
    df = pd.read_sql_query(query, conn)
    print(f"✓ Loaded {len(df)} metros from database")
    return df

def load_csv(path: str, name: str) -> pd.DataFrame:
    """Load and validate a CSV file"""
    if not os.path.exists(path):
        raise FileNotFoundError(f"CSV not found: {path}")
    print(f"Loading {name} from {path}...")
    df = pd.read_csv(path)
    print(f"✓ Loaded {len(df)} rows from {name}")
    return df

def merge_costs_data(metros_df: pd.DataFrame, data_dir: str) -> pd.DataFrame:
    """Merge all cost data sources into a single dataframe"""

    # Load all CSVs
    rents_df = load_csv(os.path.join(data_dir, "rents.csv"), "rents")
    rpp_df = load_csv(os.path.join(data_dir, "rpp.csv"), "RPP")
    taxes_df = load_csv(os.path.join(data_dir, "taxes.csv"), "taxes")
    utilities_df = load_csv(os.path.join(data_dir, "utilities.csv"), "utilities")

    # Start with metros as base
    result = metros_df.copy()

    # Ensure cbsa_code is string type in all dataframes
    result['cbsa_code'] = result['cbsa_code'].astype(str)
    rents_df['cbsa_code'] = rents_df['cbsa_code'].astype(str)
    rpp_df['cbsa_code'] = rpp_df['cbsa_code'].astype(str)

    # Merge rents by cbsa_code
    result = result.merge(rents_df, on='cbsa_code', how='left')

    # Merge RPP by cbsa_code
    result = result.merge(rpp_df, on='cbsa_code', how='left')

    # Merge utilities by state
    result = result.merge(utilities_df, on='state', how='left')

    # For taxes, we need to pick a representative band
    # For MVP, we'll use the 100k band as a default effective rate
    taxes_100k = taxes_df[taxes_df['band'] == 100000][['state', 'effective_rate']]
    taxes_100k = taxes_100k.rename(columns={'effective_rate': 'eff_tax_rate'})
    result = result.merge(taxes_100k, on='state', how='left')

    # Validate: check for missing critical data
    critical_cols = ['median_rent_usd', 'rpp_index', 'eff_tax_rate', 'utilities_monthly']
    missing_counts = result[critical_cols].isnull().sum()

    print("\nData completeness check:")
    for col, missing in missing_counts.items():
        status = "✓" if missing == 0 else "⚠"
        print(f"{status} {col}: {len(result) - missing}/{len(result)} present")

    if result[critical_cols].isnull().any().any():
        print("\n⚠ Warning: Some metros have missing cost data. They will be skipped.")
        result = result.dropna(subset=critical_cols)
        print(f"Proceeding with {len(result)} metros with complete data")

    # Validate ranges
    assert (result['median_rent_usd'] > 0).all(), "Invalid rent values found"
    assert (result['rpp_index'] > 0).all(), "Invalid RPP values found"
    assert ((result['eff_tax_rate'] >= 0) & (result['eff_tax_rate'] <= 1)).all(), "Invalid tax rates"
    assert (result['utilities_monthly'] > 0).all(), "Invalid utility values found"

    print(f"\n✓ Successfully merged cost data for {len(result)} metros")
    return result

def load_costs_to_db(df: pd.DataFrame, conn):
    """Insert metro_costs into database"""
    cur = conn.cursor()

    try:
        # Clear existing costs
        print("Clearing existing metro_costs...")
        cur.execute("TRUNCATE TABLE metro_costs;")

        # Prepare records for insertion
        records = df[[
            'metro_id',
            'median_rent_usd',
            'rpp_index',
            'eff_tax_rate',
            'utilities_monthly'
        ]].values.tolist()

        # Add source_tag to each record
        records = [rec + [SOURCE_TAG] for rec in records]

        # Bulk insert
        print(f"Inserting {len(records)} metro cost records...")
        insert_query = """
            INSERT INTO metro_costs
            (metro_id, median_rent_usd, rpp_index, eff_tax_rate, utilities_monthly, source_tag)
            VALUES %s
        """
        execute_values(cur, insert_query, records)

        conn.commit()
        print(f"✓ Successfully inserted {len(records)} cost records")

        # Show stats
        cur.execute("""
            SELECT
                COUNT(*) as total,
                ROUND(AVG(median_rent_usd), 2) as avg_rent,
                ROUND(AVG(rpp_index), 3) as avg_rpp
            FROM metro_costs;
        """)
        stats = cur.fetchone()
        print(f"\nDatabase stats:")
        print(f"  Total metros with costs: {stats[0]}")
        print(f"  Average rent: ${stats[1]}")
        print(f"  Average RPP: {stats[2]}")

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
    data_dir = os.path.join(project_root, "data")

    print(f"Data directory: {data_dir}\n")

    try:
        # Connect to database
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)

        # Load metros from DB
        metros_df = load_metros_from_db(conn)

        # Merge all cost data
        merged_df = merge_costs_data(metros_df, data_dir)

        # Load into database
        load_costs_to_db(merged_df, conn)

        conn.close()
        print(f"\n✓ Cost load completed successfully!")
        print(f"Source tag: {SOURCE_TAG}")

    except Exception as e:
        print(f"\n✗ Load failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
