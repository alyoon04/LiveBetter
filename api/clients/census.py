"""
Census Bureau API client for metro area population data

API Documentation: https://www.census.gov/data/developers/data-sets.html
Get API key: https://api.census.gov/data/key_signup.html
"""
import os
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv
from .base import BaseAPIClient

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class CensusAPIClient(BaseAPIClient):
    """Client for US Census Bureau API"""

    BASE_URL = "https://api.census.gov/data"

    def __init__(self):
        api_key = os.getenv("CENSUS_API_KEY")
        if not api_key:
            logger.warning("CENSUS_API_KEY not set - API requests may be rate limited")
        super().__init__(self.BASE_URL, api_key)

    def get_metro_population(self, year: int = 2022) -> List[Dict[str, Any]]:
        """
        Get population data for all metropolitan statistical areas

        Args:
            year: Census year (2010-2022 for ACS estimates)

        Returns:
            List of dicts with metro_id (CBSA code), name, and population
        """
        # Use American Community Survey (ACS) 1-year estimates
        endpoint = f"{year}/acs/acs1"

        params = {
            "get": "NAME,B01001_001E",  # B01001_001E is total population
            "for": "metropolitan statistical area/micropolitan statistical area:*",
        }

        cache_key = f"census_metro_pop_{year}"

        try:
            data = self.get(endpoint, params, cache_key)

            # Parse response
            # Format: [["NAME", "B01001_001E", "metropolitan statistical area/micropolitan statistical area"], ...]
            if not data or len(data) < 2:
                raise ValueError("Invalid response from Census API")

            headers = data[0]
            name_idx = headers.index("NAME")
            pop_idx = headers.index("B01001_001E")
            cbsa_idx = headers.index("metropolitan statistical area/micropolitan statistical area")

            results = []
            for row in data[1:]:
                try:
                    # Parse name (format: "Atlanta-Sandy Springs-Roswell, GA Metro Area")
                    full_name = row[name_idx]
                    # Extract city name (before first comma)
                    city_name = full_name.split(",")[0].split("-")[0].strip()
                    # Extract state (between last comma and "Metro Area")
                    state = full_name.split(",")[-1].replace("Metro Area", "").replace("Micro Area", "").strip()

                    results.append({
                        "cbsa_code": row[cbsa_idx],
                        "name": city_name,
                        "state": state,
                        "population": int(row[pop_idx]),
                        "full_name": full_name
                    })
                except (ValueError, IndexError) as e:
                    logger.warning(f"Error parsing row {row}: {e}")
                    continue

            logger.info(f"Fetched population data for {len(results)} metros")
            return results

        except Exception as e:
            logger.error(f"Error fetching metro population: {e}")
            raise

    def get_cbsa_metadata(self) -> Dict[str, Dict[str, Any]]:
        """
        Get CBSA (Core-Based Statistical Area) metadata

        Returns:
            Dictionary mapping CBSA codes to metadata (name, state, coordinates)
        """
        # Note: Census API doesn't provide coordinates directly
        # For coordinates, we'd need to geocode or use a separate dataset
        # For now, we'll return population data
        metros = self.get_metro_population()
        return {
            metro["cbsa_code"]: {
                "name": metro["name"],
                "state": metro["state"],
                "population": metro["population"],
                "full_name": metro["full_name"]
            }
            for metro in metros
        }
