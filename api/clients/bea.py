"""
BEA (Bureau of Economic Analysis) API client for Regional Price Parities

API Documentation: https://apps.bea.gov/api/
Get API key: https://apps.bea.gov/API/signup/
"""
import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from .base import BaseAPIClient

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class BEAAPIClient(BaseAPIClient):
    """Client for BEA Regional Price Parity API"""

    BASE_URL = "https://apps.bea.gov/api/data"

    def __init__(self):
        api_key = os.getenv("BEA_API_KEY")
        if not api_key:
            raise ValueError("BEA_API_KEY environment variable is required")
        super().__init__(self.BASE_URL, api_key)

    def get_regional_price_parity(self, year: Optional[int] = None) -> Dict[str, float]:
        """
        Get Regional Price Parity indices for all metropolitan areas

        RPP Index: 100 = national average, >100 = more expensive, <100 = less expensive

        Args:
            year: Year for RPP data (defaults to latest available, typically 2-3 years behind)

        Returns:
            Dictionary mapping CBSA codes (or state/metro names) to RPP indices
        """
        params = {
            "UserID": self.api_key,
            "method": "GetData",
            "datasetname": "Regional",
            "TableName": "MARPP",  # MSA RPP (not SARPP which is state-level)
            "LineCode": "3",  # All items RPP (LineCode 3, not 1)
            "GeoFips": "MSA",  # Metropolitan Statistical Areas
            "ResultFormat": "json"
        }

        if year:
            params["Year"] = str(year)
        else:
            # Get latest year
            params["Year"] = "LAST5"  # Get last 5 years, we'll take the most recent

        cache_key = f"bea_rpp_{year or 'latest'}"

        try:
            response = self.get("", params, cache_key)

            # Parse BEA response format
            if "BEAAPI" not in response:
                raise ValueError("Invalid BEA API response")

            results = response["BEAAPI"]["Results"]

            if "Error" in results:
                raise ValueError(f"BEA API Error: {results['Error']}")

            data = results.get("Data", [])

            # Build RPP dictionary
            rpp_dict = {}
            latest_year = None

            for item in data:
                try:
                    geo_name = item.get("GeoName", "")
                    rpp_value = float(item.get("DataValue", "100"))
                    item_year = item.get("TimePeriod", "")
                    geo_fips = item.get("GeoFips", "")

                    # Track latest year
                    if not latest_year or item_year > latest_year:
                        latest_year = item_year

                    # Only use most recent year if we got multiple years
                    if year or item_year == latest_year:
                        # Convert RPP from 100-based to 1.0-based (e.g., 105 -> 1.05)
                        rpp_normalized = rpp_value / 100.0

                        # Store by CBSA code (GeoFips) and name
                        rpp_dict[geo_fips] = rpp_normalized

                        # Also store by cleaned metro name for easier lookup
                        # Format: "Atlanta-Sandy Springs-Roswell, GA" -> "Atlanta"
                        if geo_name:
                            metro_name = geo_name.split(",")[0].split("-")[0].strip()
                            rpp_dict[metro_name] = rpp_normalized

                except (ValueError, KeyError) as e:
                    logger.warning(f"Error parsing RPP data: {e}")
                    continue

            logger.info(f"Fetched RPP data for {len(rpp_dict)} areas (year: {latest_year})")
            return rpp_dict

        except Exception as e:
            logger.error(f"Error fetching RPP data: {e}")
            raise

    def get_state_rpp(self, year: Optional[int] = None) -> Dict[str, float]:
        """
        Get Regional Price Parity indices for all states

        Args:
            year: Year for RPP data

        Returns:
            Dictionary mapping state codes to RPP indices
        """
        params = {
            "UserID": self.api_key,
            "method": "GetData",
            "datasetname": "Regional",
            "TableName": "SARPP",
            "LineCode": "1",
            "GeoFIPS": "STATE",
            "ResultFormat": "json"
        }

        if year:
            params["Year"] = str(year)
        else:
            params["Year"] = "LAST1"

        cache_key = f"bea_state_rpp_{year or 'latest'}"

        try:
            response = self.get("", params, cache_key)

            if "BEAAPI" not in response:
                raise ValueError("Invalid BEA API response")

            results = response["BEAAPI"]["Results"]
            data = results.get("Data", [])

            rpp_dict = {}
            for item in data:
                try:
                    state_code = item.get("GeoFips", "")
                    state_name = item.get("GeoName", "")
                    rpp_value = float(item.get("DataValue", "100")) / 100.0

                    if state_code:
                        rpp_dict[state_code] = rpp_value
                    if state_name:
                        rpp_dict[state_name] = rpp_value

                except (ValueError, KeyError):
                    continue

            logger.info(f"Fetched state RPP data for {len(rpp_dict)} states")
            return rpp_dict

        except Exception as e:
            logger.error(f"Error fetching state RPP: {e}")
            raise
