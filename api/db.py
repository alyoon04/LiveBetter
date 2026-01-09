"""
Database connection and query layer for LiveBetter
"""
import os
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

# Database configuration from environment
import getpass

# Support both DATABASE_URL and individual env vars
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Parse DATABASE_URL for psycopg2
    DB_CONFIG = {"dsn": DATABASE_URL}
else:
    # Fall back to individual environment variables
    DB_CONFIG = {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", 5432)),
        "database": os.getenv("DB_NAME", "livebetter"),
        "user": os.getenv("DB_USER", getpass.getuser()),
        "password": os.getenv("DB_PASSWORD", "")
    }


@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        yield conn
    finally:
        conn.close()


class MetroRow:
    """Data class for metro with costs and quality of life data"""
    def __init__(self, row: dict):
        self.metro_id = row['metro_id']
        self.name = row['name']
        self.state = row['state']
        self.cbsa_code = row['cbsa_code']
        self.lat = row['lat']
        self.lon = row['lon']
        self.population = row['population']
        self.median_rent_usd = row['median_rent_usd']
        self.rpp_index = row['rpp_index']
        self.eff_tax_rate = row['eff_tax_rate']
        self.utilities_monthly = row['utilities_monthly']

        # Quality of life metrics (may be None)
        self.school_score = row.get('school_score')
        self.crime_rate = row.get('crime_rate')
        self.weather_score = row.get('weather_score')
        self.healthcare_score = row.get('healthcare_score')
        self.walkability_score = row.get('walkability_score')
        self.air_quality_index = row.get('air_quality_index')
        self.commute_time_mins = row.get('commute_time_mins')


class Database:
    """Database access layer"""

    def __init__(self):
        self.config = DB_CONFIG

    def get_connection(self):
        """Get a new database connection"""
        return psycopg2.connect(**self.config)

    def fetch_metros_with_costs(
        self,
        population_min: int = 0,
        state: Optional[str] = None
    ) -> List[MetroRow]:
        """
        Fetch all metros with their cost data.

        Args:
            population_min: Minimum population filter
            state: Optional state filter (e.g., 'CA')

        Returns:
            List of MetroRow objects
        """
        with get_db_connection() as conn:
            cur = conn.cursor(cursor_factory=RealDictCursor)

            query = """
                SELECT
                    m.metro_id,
                    m.name,
                    m.state,
                    m.cbsa_code,
                    m.lat,
                    m.lon,
                    m.population,
                    mc.median_rent_usd,
                    mc.rpp_index,
                    mc.eff_tax_rate,
                    mc.utilities_monthly,
                    qol.school_score,
                    qol.crime_rate,
                    qol.weather_score,
                    qol.healthcare_score,
                    qol.walkability_score,
                    qol.air_quality_index,
                    qol.commute_time_mins
                FROM metro m
                INNER JOIN metro_costs mc ON m.metro_id = mc.metro_id
                LEFT JOIN metro_quality_of_life qol ON m.metro_id = qol.metro_id
                WHERE m.population >= %s
            """
            params = [population_min]

            if state:
                query += " AND m.state = %s"
                params.append(state)

            query += " ORDER BY m.population DESC;"

            cur.execute(query, params)
            rows = cur.fetchall()
            cur.close()

            return [MetroRow(dict(row)) for row in rows]

    def get_metro_count(self) -> int:
        """Get total count of metros in database"""
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM metro;")
            count = cur.fetchone()[0]
            cur.close()
            return count

    def get_metros_by_ids(self, metro_ids: List[int]) -> List[MetroRow]:
        """
        Fetch specific metros by their IDs.

        Args:
            metro_ids: List of metro IDs to fetch

        Returns:
            List of MetroRow objects
        """
        if not metro_ids:
            return []

        with get_db_connection() as conn:
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Create placeholders for the IN clause
            placeholders = ','.join(['%s'] * len(metro_ids))

            query = f"""
                SELECT
                    m.metro_id,
                    m.name,
                    m.state,
                    m.cbsa_code,
                    m.lat,
                    m.lon,
                    m.population,
                    mc.median_rent_usd,
                    mc.rpp_index,
                    mc.eff_tax_rate,
                    mc.utilities_monthly,
                    qol.school_score,
                    qol.crime_rate,
                    qol.weather_score,
                    qol.healthcare_score,
                    qol.walkability_score,
                    qol.air_quality_index,
                    qol.commute_time_mins
                FROM metro m
                INNER JOIN metro_costs mc ON m.metro_id = mc.metro_id
                LEFT JOIN metro_quality_of_life qol ON m.metro_id = qol.metro_id
                WHERE m.metro_id IN ({placeholders})
                ORDER BY m.metro_id;
            """

            cur.execute(query, metro_ids)
            rows = cur.fetchall()
            cur.close()

            return [MetroRow(dict(row)) for row in rows]

    def health_check(self) -> dict:
        """
        Perform a database health check.

        Returns:
            Dictionary with health status
        """
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()

                # Check connection
                cur.execute("SELECT 1;")

                # Get counts
                cur.execute("SELECT COUNT(*) FROM metro;")
                metro_count = cur.fetchone()[0]

                cur.execute("SELECT COUNT(*) FROM metro_costs;")
                costs_count = cur.fetchone()[0]

                cur.close()

                return {
                    "status": "healthy",
                    "metros": metro_count,
                    "metros_with_costs": costs_count
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Singleton instance
db = Database()
