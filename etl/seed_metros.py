#!/usr/bin/env python3
"""
Seed metros table from metros.csv
Usage: python seed_metros.py
"""
import os
import sys
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

# Database connection parameters
# Set these as environment variables or modify directly
import getpass
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "database": os.getenv("DB_NAME", "livebetter"),
    "user": os.getenv("DB_USER", getpass.getuser()),
    "password": os.getenv("DB_PASSWORD", "")
}

def load_metros_csv(csv_path: str) -> pd.DataFrame:
    """Load and validate metros CSV"""
    print(f"Loading metros from {csv_path}...")
    df = pd.read_csv(csv_path)

    # Validate required columns
    required_cols = ['cbsa_code', 'name', 'state', 'lat', 'lon', 'population']
    missing = set(required_cols) - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Validate data types and ranges
    df['lat'] = pd.to_numeric(df['lat'], errors='coerce')
    df['lon'] = pd.to_numeric(df['lon'], errors='coerce')
    df['population'] = pd.to_numeric(df['population'], errors='coerce').fillna(0).astype(int)

    # Check for nulls in critical fields
    if df[['cbsa_code', 'name', 'state']].isnull().any().any():
        raise ValueError("Found null values in required fields (cbsa_code, name, state)")

    print(f"✓ Loaded {len(df)} metros")
    return df

def seed_database(df: pd.DataFrame):
    """Insert metros into database"""
    print("Connecting to database...")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        # Clear existing data (for idempotent reloads)
        print("Clearing existing metros...")
        cur.execute("TRUNCATE TABLE metro CASCADE;")

        # Prepare data for insertion
        records = df[['cbsa_code', 'name', 'state', 'lat', 'lon', 'population']].values.tolist()

        # Bulk insert
        print(f"Inserting {len(records)} metros...")
        insert_query = """
            INSERT INTO metro (cbsa_code, name, state, lat, lon, population)
            VALUES %s
        """
        execute_values(cur, insert_query, records)

        conn.commit()
        print(f"✓ Successfully inserted {len(records)} metros")

        # Show some stats
        cur.execute("SELECT COUNT(*), COUNT(DISTINCT state) FROM metro;")
        total, states = cur.fetchone()
        print(f"Database now contains {total} metros across {states} states")

    except Exception as e:
        conn.rollback()
        print(f"✗ Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()

def main():
    # Determine path to CSV
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    csv_path = os.path.join(project_root, "data", "metros.csv")

    if not os.path.exists(csv_path):
        print(f"✗ CSV not found at {csv_path}")
        sys.exit(1)

    try:
        df = load_metros_csv(csv_path)
        seed_database(df)
        print("\n✓ Seed completed successfully!")
    except Exception as e:
        print(f"\n✗ Seed failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
