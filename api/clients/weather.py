"""
Weather/Climate API client for quality of life metrics

Uses Open-Meteo API (free, no API key required)
API Documentation: https://open-meteo.com/
"""
import logging
from typing import Dict, Any, Optional
from .base import BaseAPIClient

logger = logging.getLogger(__name__)


class WeatherAPIClient(BaseAPIClient):
    """Client for Open-Meteo weather and climate API"""

    BASE_URL = "https://api.open-meteo.com/v1"

    def __init__(self):
        # Open-Meteo doesn't require an API key
        super().__init__(self.BASE_URL, api_key=None)

    def get_climate_score(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Get forecast data and estimate a weather desirability score.

        Uses Open-Meteo forecast API to get current weather patterns
        and estimates an annual score based on the location.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Dictionary with climate metrics and weather_score (0-100)
        """
        endpoint = "forecast"

        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "forecast_days": 16,
            "timezone": "auto"
        }

        cache_key = f"weather_climate_{lat}_{lon}"

        try:
            data = self.get(endpoint, params, cache_key)

            if not data or "daily" not in data:
                logger.warning(f"No forecast data found for ({lat}, {lon})")
                return None

            daily = data["daily"]

            # Get temperature data
            temp_max = daily.get("temperature_2m_max", [])
            temp_min = daily.get("temperature_2m_min", [])
            precip = daily.get("precipitation_sum", [])

            if not temp_max or not temp_min:
                return None

            # Calculate metrics from forecast data
            avg_max = sum(temp_max) / len(temp_max)
            avg_min = sum(temp_min) / len(temp_min)
            avg_temp = (avg_max + avg_min) / 2

            overall_max = max(temp_max)
            overall_min = min(temp_min)
            temp_range = overall_max - overall_min

            # Estimate annual precipitation days
            rainy_days_in_forecast = sum(1 for p in precip if p and p > 1.0)
            estimated_annual_precip_days = (rainy_days_in_forecast / len(precip)) * 365

            # Estimate sunshine hours (inverse of rain)
            estimated_sunshine = 2500 - (estimated_annual_precip_days * 5)

            # Calculate weather score (0-100)
            weather_score = self._calculate_weather_score(
                avg_temp=avg_temp,
                temp_range=temp_range * 2,  # Extrapolate to annual range
                precip_days_per_year=estimated_annual_precip_days,
                sunshine_hours_per_year=estimated_sunshine
            )

            return {
                "weather_score": round(weather_score, 1),
                "avg_temp_c": round(avg_temp, 1),
                "avg_temp_f": round(avg_temp * 9/5 + 32, 1),
                "min_temp_c": round(overall_min, 1),
                "max_temp_c": round(overall_max, 1),
                "temp_range_c": round(temp_range, 1),
                "precip_days_per_year": round(estimated_annual_precip_days, 0),
                "sunshine_hours_per_year": round(estimated_sunshine, 0),
                "lat": lat,
                "lon": lon
            }

        except Exception as e:
            logger.warning(f"Error fetching forecast data for ({lat}, {lon}): {e}")
            return None

    def _calculate_weather_score(
        self,
        avg_temp: float,
        temp_range: float,
        precip_days_per_year: float,
        sunshine_hours_per_year: float
    ) -> float:
        """
        Calculate weather desirability score (0-100).

        Scoring factors:
        1. Temperature comfort: 65-75°F (18-24°C) is ideal
        2. Low temperature variation: Less than 40°C range is better
        3. Fewer rainy days: Less than 100 days/year is ideal
        4. More sunshine: More than 2500 hours/year is ideal

        Args:
            avg_temp: Average annual temperature (Celsius)
            temp_range: Temperature range (max - min, Celsius)
            precip_days_per_year: Days with precipitation
            sunshine_hours_per_year: Annual sunshine hours

        Returns:
            Score from 0-100 (higher is better)
        """
        score = 0.0

        # 1. Temperature comfort (40 points max)
        # Ideal range: 18-24°C (65-75°F)
        if 18 <= avg_temp <= 24:
            temp_score = 40
        elif 15 <= avg_temp < 18:
            temp_score = 40 - (18 - avg_temp) * 5
        elif 24 < avg_temp <= 27:
            temp_score = 40 - (avg_temp - 24) * 5
        elif 12 <= avg_temp < 15:
            temp_score = 25 - (15 - avg_temp) * 3
        elif 27 < avg_temp <= 30:
            temp_score = 25 - (avg_temp - 27) * 3
        else:
            # Too hot or too cold
            temp_score = max(0, 10 - abs(avg_temp - 21) * 2)

        score += temp_score

        # 2. Temperature variation (20 points max)
        # Ideal: Less than 30°C range
        if temp_range <= 30:
            variation_score = 20
        elif temp_range <= 40:
            variation_score = 20 - (temp_range - 30) * 1.5
        else:
            variation_score = max(0, 5 - (temp_range - 40) * 0.5)

        score += variation_score

        # 3. Precipitation days (20 points max)
        # Ideal: Less than 100 days/year
        if precip_days_per_year <= 100:
            precip_score = 20
        elif precip_days_per_year <= 150:
            precip_score = 20 - (precip_days_per_year - 100) * 0.3
        else:
            precip_score = max(0, 5 - (precip_days_per_year - 150) * 0.1)

        score += precip_score

        # 4. Sunshine hours (20 points max)
        # Ideal: More than 2500 hours/year
        if sunshine_hours_per_year >= 2500:
            sunshine_score = 20
        elif sunshine_hours_per_year >= 2000:
            sunshine_score = 10 + (sunshine_hours_per_year - 2000) * 0.02
        else:
            sunshine_score = max(0, sunshine_hours_per_year * 0.005)

        score += sunshine_score

        # Ensure score is in 0-100 range
        return max(0, min(100, score))

    def get_current_weather(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Get current weather conditions.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Dictionary with current weather data
        """
        endpoint = "forecast"

        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,precipitation,weather_code",
            "temperature_unit": "fahrenheit",
            "timezone": "auto"
        }

        cache_key = f"weather_current_{lat}_{lon}"

        try:
            data = self.get(endpoint, params, cache_key)

            if not data or "current" not in data:
                logger.warning(f"No current weather found for ({lat}, {lon})")
                return None

            current = data["current"]

            return {
                "temperature_f": current.get("temperature_2m"),
                "precipitation_mm": current.get("precipitation"),
                "weather_code": current.get("weather_code"),
                "time": current.get("time"),
                "lat": lat,
                "lon": lon
            }

        except Exception as e:
            logger.warning(f"Error fetching current weather for ({lat}, {lon}): {e}")
            return None
