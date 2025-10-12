#!/usr/bin/env python3
"""
Load quality of life metrics from CSV
Usage: python load_qol.py
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

SOURCE_TAG = "2025Q4_mvp_v2"  # Versioning tag for this data batch

def load_metros_from_db(conn) -> pd.DataFrame:
    """Fetch existing metros from database"""
    print("Loading metros from database...")
    query = "SELECT metro_id, cbsa_code FROM metro;"
    df = pd.read_sql_query(query, conn)
    print(f"✓ Loaded {len(df)} metros from database")
    return df

def load_qol_data(data_dir: str, metros_df: pd.DataFrame) -> pd.DataFrame:
    """Load and merge quality of life data"""
    qol_path = os.path.join(data_dir, "quality_of_life.csv")

    if not os.path.exists(qol_path):
        raise FileNotFoundError(f"CSV not found: {qol_path}")

    print(f"Loading quality of life data from {qol_path}...")
    qol_df = pd.read_csv(qol_path)
    print(f"✓ Loaded {len(qol_df)} rows")

    # Ensure cbsa_code is string type
    metros_df['cbsa_code'] = metros_df['cbsa_code'].astype(str)
    qol_df['cbsa_code'] = qol_df['cbsa_code'].astype(str)

    # Merge with metros to get metro_id
    result = metros_df.merge(qol_df, on='cbsa_code', how='inner')

    print(f"✓ Matched {len(result)} metros with QOL data")

    # Validate data ranges
    assert (result['school_score'] >= 0).all() and (result['school_score'] <= 100).all(), "Invalid school scores"
    assert (result['weather_score'] >= 0).all() and (result['weather_score'] <= 100).all(), "Invalid weather scores"
    assert (result['healthcare_score'] >= 0).all() and (result['healthcare_score'] <= 100).all(), "Invalid healthcare scores"
    assert (result['walkability_score'] >= 0).all() and (result['walkability_score'] <= 100).all(), "Invalid walkability scores"
    assert (result['crime_rate'] >= 0).all(), "Invalid crime rates"
    assert (result['air_quality_index'] >= 0).all(), "Invalid air quality values"

    return result

def load_qol_to_db(df: pd.DataFrame, conn):
    """Insert quality of life data into database"""
    cur = conn.cursor()

    try:
        # Clear existing QOL data
        print("Clearing existing quality of life data...")
        cur.execute("TRUNCATE TABLE metro_quality_of_life;")

        # Prepare records for insertion
        records = df[[
            'metro_id',
            'school_score',
            'crime_rate',
            'weather_score',
            'healthcare_score',
            'walkability_score',
            'air_quality_index',
            'commute_time_mins'
        ]].values.tolist()

        # Add source_tag to each record
        records = [rec + [SOURCE_TAG] for rec in records]

        # Bulk insert
        print(f"Inserting {len(records)} quality of life records...")
        insert_query = """
            INSERT INTO metro_quality_of_life
            (metro_id, school_score, crime_rate, weather_score, healthcare_score,
             walkability_score, air_quality_index, commute_time_mins, source_tag)
            VALUES %s
        """
        execute_values(cur, insert_query, records)

        conn.commit()
        print(f"✓ Successfully inserted {len(records)} QOL records")

        # Show stats
        cur.execute("""
            SELECT
                COUNT(*) as total,
                ROUND(AVG(school_score), 1) as avg_school,
                ROUND(AVG(crime_rate), 1) as avg_crime,
                ROUND(AVG(weather_score), 1) as avg_weather
            FROM metro_quality_of_life;
        """)
        stats = cur.fetchone()
        print(f"\nDatabase stats:")
        print(f"  Total metros with QOL data: {stats[0]}")
        print(f"  Average school score: {stats[1]}")
        print(f"  Average crime rate: {stats[2]} per 100k")
        print(f"  Average weather score: {stats[3]}")

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

        # Load and merge QOL data
        qol_df = load_qol_data(data_dir, metros_df)

        # Load into database
        load_qol_to_db(qol_df, conn)

        conn.close()
        print(f"\n✓ QOL data load completed successfully!")
        print(f"Source tag: {SOURCE_TAG}")

    except Exception as e:
        print(f"\n✗ Load failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
