"""
EPA AirNow API client for air quality data

API Documentation: https://docs.airnowapi.org/
Get API key: https://docs.airnowapi.org/account/request/
"""
import os
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from .base import BaseAPIClient

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class EPAAPIClient(BaseAPIClient):
    """Client for EPA AirNow Air Quality API"""

    BASE_URL = "https://www.airnowapi.org"

    def __init__(self):
        api_key = os.getenv("AIRNOW_API_KEY")
        if not api_key:
            logger.warning("AIRNOW_API_KEY not set - air quality data will not be available")
        super().__init__(self.BASE_URL, api_key)

    def get_air_quality_by_zipcode(self, zipcode: str) -> Optional[Dict[str, Any]]:
        """
        Get current air quality for a ZIP code

        Args:
            zipcode: 5-digit ZIP code

        Returns:
            Dictionary with AQI (Air Quality Index) and other metrics
        """
        endpoint = "aq/observation/zipCode/current/"

        params = {
            "format": "application/json",
            "zipCode": zipcode,
            "distance": 25,  # Search radius in miles
            "API_KEY": self.api_key
        }

        cache_key = f"epa_aqi_zip_{zipcode}"

        try:
            data = self.get(endpoint, params, cache_key)

            if not data or len(data) == 0:
                logger.warning(f"No air quality data found for ZIP {zipcode}")
                return None

            # Find PM2.5 or Ozone measurement (primary AQI indicators)
            aqi_value = None
            category = None

            for measurement in data:
                if measurement.get("ParameterName") in ["PM2.5", "OZONE-8HR", "O3"]:
                    aqi_value = measurement.get("AQI")
                    category = measurement.get("Category", {}).get("Name")
                    break

            # If no PM2.5/Ozone, take first measurement
            if aqi_value is None and len(data) > 0:
                aqi_value = data[0].get("AQI")
                category = data[0].get("Category", {}).get("Name")

            return {
                "aqi": aqi_value,
                "category": category,
                "zipcode": zipcode,
                "raw_data": data
            }

        except Exception as e:
            logger.warning(f"Error fetching air quality for ZIP {zipcode}: {e}")
            return None

    def get_air_quality_by_latlon(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Get current air quality for coordinates

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Dictionary with AQI and other metrics
        """
        endpoint = "aq/observation/latLong/current/"

        params = {
            "format": "application/json",
            "latitude": lat,
            "longitude": lon,
            "distance": 25,
            "API_KEY": self.api_key
        }

        cache_key = f"epa_aqi_latlon_{lat}_{lon}"

        try:
            data = self.get(endpoint, params, cache_key)

            if not data or len(data) == 0:
                logger.warning(f"No air quality data found for ({lat}, {lon})")
                return None

            # Extract primary AQI
            aqi_value = None
            category = None

            for measurement in data:
                if measurement.get("ParameterName") in ["PM2.5", "OZONE-8HR", "O3"]:
                    aqi_value = measurement.get("AQI")
                    category = measurement.get("Category", {}).get("Name")
                    break

            if aqi_value is None and len(data) > 0:
                aqi_value = data[0].get("AQI")
                category = data[0].get("Category", {}).get("Name")

            return {
                "aqi": aqi_value,
                "category": category,
                "lat": lat,
                "lon": lon,
                "raw_data": data
            }

        except Exception as e:
            logger.warning(f"Error fetching air quality for ({lat}, {lon}): {e}")
            return None

    def get_forecast_by_zipcode(self, zipcode: str) -> Optional[Dict[str, Any]]:
        """
        Get air quality forecast for a ZIP code

        Args:
            zipcode: 5-digit ZIP code

        Returns:
            Dictionary with forecasted AQI
        """
        endpoint = "aq/forecast/zipCode/"

        params = {
            "format": "application/json",
            "zipCode": zipcode,
            "date": "",  # Empty for current forecast
            "distance": 25,
            "API_KEY": self.api_key
        }

        cache_key = f"epa_forecast_zip_{zipcode}"

        try:
            data = self.get(endpoint, params, cache_key)
            return data
        except Exception as e:
            logger.warning(f"Error fetching forecast for ZIP {zipcode}: {e}")
            return None
