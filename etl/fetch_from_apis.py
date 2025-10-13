#!/usr/bin/env python3
"""
Fetch real data from government APIs and load into database

Usage: python fetch_from_apis.py [--year 2022]
"""
import sys
import os
import argparse
import logging
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "api"))

from clients.census import CensusAPIClient
from clients.hud import HUDAPIClient
from clients.bea import BEAAPIClient
from clients.epa import EPAAPIClient

import psycopg2
from psycopg2.extras import execute_values
import getpass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "database": os.getenv("DB_NAME", "livebetter"),
    "user": os.getenv("DB_USER", getpass.getuser()),
    "password": os.getenv("DB_PASSWORD", "")
}

SOURCE_TAG = "api_fetch_v1"


def fetch_metro_data(year: int = 2022):
    """
    Fetch metro data from Census API

    Returns:
        List of metro dictionaries
    """
    logger.info("Fetching metro data from Census Bureau...")
    census_client = CensusAPIClient()

    try:
        metros = census_client.get_metro_population(year=year)
        logger.info(f"✓ Fetched {len(metros)} metros from Census API")
        return metros
    except Exception as e:
        logger.error(f"✗ Error fetching metro data: {e}")
        logger.warning("Falling back to existing data in database")
        return []


def fetch_rpp_data():
    """
    Fetch Regional Price Parity data from BEA API

    Returns:
        Dictionary mapping metro names/codes to RPP indices
    """
    logger.info("Fetching RPP data from BEA...")

    try:
        bea_client = BEAAPIClient()
        rpp_data = bea_client.get_regional_price_parity()
        logger.info(f"✓ Fetched RPP data for {len(rpp_data)} areas")
        return rpp_data
    except ValueError as e:
        logger.error(f"✗ BEA API key not configured: {e}")
        logger.warning("Set BEA_API_KEY environment variable to fetch RPP data")
        return {}
    except Exception as e:
        logger.error(f"✗ Error fetching RPP data: {e}")
        return {}


def fetch_fmr_data(cbsa_codes: list):
    """
    Fetch Fair Market Rent data from HUD API

    Args:
        cbsa_codes: List of CBSA codes to fetch

    Returns:
        Dictionary mapping CBSA codes to FMR data
    """
    logger.info(f"Fetching FMR data for {len(cbsa_codes)} metros from HUD...")
    hud_client = HUDAPIClient()

    try:
        fmr_data = hud_client.get_fmr_for_metros(cbsa_codes)
        logger.info(f"✓ Fetched FMR data for {len(fmr_data)} metros")
        return fmr_data
    except Exception as e:
        logger.error(f"✗ Error fetching FMR data: {e}")
        return {}


def fetch_air_quality_data(metros: list):
    """
    Fetch air quality data from EPA API

    Args:
        metros: List of metro dictionaries with lat/lon coordinates

    Returns:
        Dictionary mapping metro IDs to AQI data
    """
    logger.info(f"Fetching air quality data for metros from EPA...")

    try:
        epa_client = EPAAPIClient()
        aqi_data = {}

        for metro in metros:
            # Note: We need lat/lon coordinates which aren't in Census data
            # For now, skip or use ZIP codes
            # This would need a geocoding step or pre-existing coordinate data
            pass

        logger.info(f"✓ Fetched AQI data for {len(aqi_data)} metros")
        return aqi_data
    except Exception as e:
        logger.error(f"✗ Error fetching air quality data: {e}")
        return {}


def load_metros_to_db(metros: list, conn):
    """Load metro data into database"""
    cur = conn.cursor()

    try:
        logger.info("Loading metros into database...")

        # Prepare records (without lat/lon for now as Census doesn't provide it)
        records = []
        for metro in metros:
            # For now, use placeholder coordinates (0, 0)
            # In production, you'd geocode the metro name or use a separate geocoding API
            records.append((
                metro["name"],
                metro["state"],
                metro["cbsa_code"],
                0.0,  # lat placeholder
                0.0,  # lon placeholder
                metro["population"]
            ))

        # Insert with ON CONFLICT to update if exists
        insert_query = """
            INSERT INTO metro (name, state, cbsa_code, lat, lon, population)
            VALUES %s
            ON CONFLICT (cbsa_code) DO UPDATE SET
                name = EXCLUDED.name,
                state = EXCLUDED.state,
                population = EXCLUDED.population;
        """
        execute_values(cur, insert_query, records)
        conn.commit()

        logger.info(f"✓ Loaded {len(records)} metros")

    except Exception as e:
        conn.rollback()
        logger.error(f"✗ Error loading metros: {e}")
        raise
    finally:
        cur.close()


def main():
    parser = argparse.ArgumentParser(description="Fetch data from government APIs")
    parser.add_argument("--year", type=int, default=2022, help="Census year for population data")
    parser.add_argument("--skip-census", action="store_true", help="Skip Census data fetch")
    parser.add_argument("--skip-bea", action="store_true", help="Skip BEA RPP fetch")
    parser.add_argument("--skip-hud", action="store_true", help="Skip HUD FMR fetch")

    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("LiveBetter Data Fetch from APIs")
    logger.info("=" * 60)

    try:
        # Connect to database
        logger.info("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)

        # Fetch metro data from Census
        if not args.skip_census:
            metros = fetch_metro_data(year=args.year)
            if metros:
                load_metros_to_db(metros, conn)

        # Fetch RPP data from BEA
        if not args.skip_bea:
            rpp_data = fetch_rpp_data()
            if rpp_data:
                logger.info(f"RPP data available for {len(rpp_data)} areas")
                # TODO: Match and update metro_costs table

        # Fetch FMR data from HUD
        if not args.skip_hud:
            # Get CBSA codes from database
            cur = conn.cursor()
            cur.execute("SELECT cbsa_code FROM metro WHERE cbsa_code IS NOT NULL;")
            cbsa_codes = [row[0] for row in cur.fetchall()]
            cur.close()

            if cbsa_codes:
                fmr_data = fetch_fmr_data(cbsa_codes)
                if fmr_data:
                    logger.info(f"FMR data available for {len(fmr_data)} metros")
                    # TODO: Update metro_costs table

        conn.close()

        logger.info("")
        logger.info("=" * 60)
        logger.info("✓ Data fetch completed successfully!")
        logger.info("=" * 60)
        logger.info("")
        logger.info("Note: This script demonstrates API integration.")
        logger.info("Additional data processing and matching logic is needed for production.")
        logger.info("Missing pieces:")
        logger.info("  - Geocoding metros to get lat/lon coordinates")
        logger.info("  - Matching RPP data to metros")
        logger.info("  - Matching FMR data to metros")
        logger.info("  - Tax rate calculations")
        logger.info("  - Quality of life metrics (schools, crime, weather, healthcare)")

    except Exception as e:
        logger.error(f"✗ Data fetch failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
