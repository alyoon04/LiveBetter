"""
Zillow Research Data client for rent prices

Note: Zillow's public API was discontinued in 2021.
Instead, we use their free Research Data downloads.

Data Source: https://www.zillow.com/research/data/
Documentation: https://www.zillow.com/research/
"""
import logging
import pandas as pd
from typing import Dict, Any, Optional
from datetime import datetime
from .base import BaseAPIClient

logger = logging.getLogger(__name__)


class ZillowDataClient(BaseAPIClient):
    """Client for Zillow Research Data (CSV downloads)"""

    # Updated URL structure (as of 2024)
    BASE_URL = "https://files.zillowstatic.com/research/public_v2"

    def __init__(self):
        super().__init__(self.BASE_URL, api_key=None)

    def get_metro_rent_data(self, bedroom_count: int = 2) -> Dict[str, Dict[str, Any]]:
        """
        Download and parse Zillow metro-level rent data

        Zillow provides several rent metrics:
        - ZORI (Zillow Observed Rent Index) - Most comprehensive, smoothed
        - Median Rent - Raw median asking rents

        Args:
            bedroom_count: Number of bedrooms (1-5, or 0 for all)

        Returns:
            Dictionary mapping metro names/CBSA codes to rent data
        """
        # Zillow ZORI (Zillow Observed Rent Index) - All homes
        # This is their primary rent metric
        filename = "Metro_zori_uc_sfrcondomfr_sm_month.csv"

        url = f"{self.BASE_URL}/rentals/{filename}"
        cache_key = f"zillow_rent_{bedroom_count}br"

        try:
            logger.info(f"Downloading Zillow rent data from {url}")

            # Download CSV directly with pandas
            df = pd.read_csv(url)

            logger.info(f"Downloaded Zillow data: {len(df)} metros")

            # Zillow CSV format:
            # Columns: RegionID, SizeRank, RegionName, RegionType, StateName, [dates...]
            # We want the most recent month's data

            # Get the latest date column (rightmost column that's a date)
            date_columns = [col for col in df.columns if col not in [
                'RegionID', 'SizeRank', 'RegionName', 'RegionType', 'StateName', 'Metro'
            ]]

            if not date_columns:
                raise ValueError("No date columns found in Zillow data")

            latest_date = date_columns[-1]  # Last column is most recent
            logger.info(f"Using Zillow data from: {latest_date}")

            # Build results dictionary
            results = {}

            for _, row in df.iterrows():
                try:
                    region_name = row['RegionName']
                    state_name = row.get('StateName', '')
                    rent_value = row[latest_date]

                    # Skip if rent is NaN
                    if pd.isna(rent_value):
                        continue

                    # Clean metro name (Zillow uses "City, ST" format)
                    metro_key = region_name
                    if ',' in region_name:
                        city = region_name.split(',')[0].strip()
                        metro_key = city

                    results[metro_key] = {
                        "metro_name": region_name,
                        "state": state_name,
                        "median_rent": float(rent_value),
                        "date": latest_date,
                        "bedroom_count": bedroom_count if bedroom_count > 0 else "all",
                        "source": "Zillow ZORI"
                    }

                    # Also index by full name
                    results[region_name] = results[metro_key]

                except (KeyError, ValueError) as e:
                    logger.warning(f"Error parsing Zillow row: {e}")
                    continue

            logger.info(f"Processed {len(results)} metros with rent data")
            return results

        except Exception as e:
            logger.error(f"Error fetching Zillow rent data: {e}")
            raise

    def get_median_rent_by_metro(self, metro_name: str) -> Optional[float]:
        """
        Get median rent for a specific metro

        Args:
            metro_name: Name of metro (e.g., "Atlanta", "San Francisco")

        Returns:
            Median rent value or None if not found
        """
        try:
            rent_data = self.get_metro_rent_data()

            # Try exact match first
            if metro_name in rent_data:
                return rent_data[metro_name]['median_rent']

            # Try case-insensitive partial match
            metro_lower = metro_name.lower()
            for key, value in rent_data.items():
                if metro_lower in key.lower():
                    return value['median_rent']

            logger.warning(f"No Zillow rent data found for: {metro_name}")
            return None

        except Exception as e:
            logger.error(f"Error getting rent for {metro_name}: {e}")
            return None

    def get_all_metro_rents(self) -> pd.DataFrame:
        """
        Get all metro rent data as a pandas DataFrame

        Returns:
            DataFrame with columns: metro_name, state, median_rent, date
        """
        try:
            rent_data = self.get_metro_rent_data()

            # Convert to DataFrame
            records = []
            seen = set()  # Deduplicate

            for key, value in rent_data.items():
                # Skip duplicates (we index by both short and long names)
                if value['metro_name'] in seen:
                    continue
                seen.add(value['metro_name'])

                records.append({
                    'metro_name': value['metro_name'],
                    'state': value['state'],
                    'median_rent': value['median_rent'],
                    'date': value['date'],
                    'source': value['source']
                })

            df = pd.DataFrame(records)
            logger.info(f"Created DataFrame with {len(df)} unique metros")
            return df

        except Exception as e:
            logger.error(f"Error creating rent DataFrame: {e}")
            raise


# Convenience function for quick access
def get_zillow_rents() -> pd.DataFrame:
    """Quick function to get Zillow rent data as DataFrame"""
    client = ZillowDataClient()
    return client.get_all_metro_rents()
