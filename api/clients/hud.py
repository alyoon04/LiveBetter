"""
HUD (Department of Housing and Urban Development) API client for Fair Market Rents

API Documentation: https://www.huduser.gov/portal/dataset/fmr-api.html
No API key required for public access
"""
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from .base import BaseAPIClient

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class HUDAPIClient(BaseAPIClient):
    """Client for HUD Fair Market Rent API"""

    BASE_URL = "https://www.huduser.gov/hudapi/public"

    def __init__(self):
        # HUD API requires a token but it's freely available
        super().__init__(self.BASE_URL, api_key=None)

    def get_fmr_by_cbsa(self, cbsa_code: str, year: Optional[int] = None) -> Dict[str, Any]:
        """
        Get Fair Market Rent data for a specific CBSA

        Args:
            cbsa_code: 5-digit CBSA code
            year: Fiscal year (defaults to latest)

        Returns:
            Dictionary with FMR data including rent for different bedroom sizes
        """
        endpoint = f"fmr/listcounties/{cbsa_code}"

        params = {}
        if year:
            params['year'] = year

        cache_key = f"hud_fmr_{cbsa_code}_{year or 'latest'}"

        try:
            data = self.get(endpoint, params, cache_key)
            return data
        except Exception as e:
            logger.error(f"Error fetching FMR for CBSA {cbsa_code}: {e}")
            raise

    def get_fmr_for_metros(self, cbsa_codes: List[str], year: Optional[int] = None) -> Dict[str, Dict[str, Any]]:
        """
        Get Fair Market Rent data for multiple metros

        Args:
            cbsa_codes: List of CBSA codes
            year: Fiscal year (defaults to latest)

        Returns:
            Dictionary mapping CBSA codes to FMR data
        """
        results = {}
        for cbsa_code in cbsa_codes:
            try:
                fmr_data = self.get_fmr_by_cbsa(cbsa_code, year)

                # Extract 2-bedroom rent (typical metric)
                # HUD response format varies, need to handle different structures
                if isinstance(fmr_data, dict):
                    # Look for bedroom 2 FMR
                    rent_2br = None

                    # Try different possible response structures
                    if 'data' in fmr_data and 'basicdata' in fmr_data['data']:
                        basic_data = fmr_data['data']['basicdata']
                        if isinstance(basic_data, list) and len(basic_data) > 0:
                            rent_2br = basic_data[0].get('Rent_2br') or basic_data[0].get('fmr_2')
                    elif 'basicdata' in fmr_data:
                        rent_2br = fmr_data['basicdata'].get('Rent_2br') or fmr_data['basicdata'].get('fmr_2')
                    elif 'fmr_2' in fmr_data:
                        rent_2br = fmr_data['fmr_2']

                    if rent_2br:
                        results[cbsa_code] = {
                            "cbsa_code": cbsa_code,
                            "median_rent_2br": float(rent_2br),
                            "year": year,
                            "raw_data": fmr_data
                        }
                    else:
                        logger.warning(f"No 2BR rent found for CBSA {cbsa_code}")

            except Exception as e:
                logger.warning(f"Error fetching FMR for {cbsa_code}: {e}")
                continue

        logger.info(f"Fetched FMR data for {len(results)}/{len(cbsa_codes)} metros")
        return results

    def get_state_fmr_data(self, state_code: str, year: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get Fair Market Rent data for all areas in a state

        Args:
            state_code: 2-letter state code (e.g., 'CA', 'TX')
            year: Fiscal year (defaults to latest)

        Returns:
            List of FMR data for all areas in the state
        """
        endpoint = f"fmr/state/{state_code}"

        params = {}
        if year:
            params['year'] = year

        cache_key = f"hud_state_fmr_{state_code}_{year or 'latest'}"

        try:
            data = self.get(endpoint, params, cache_key)
            return data.get('data', []) if isinstance(data, dict) else []
        except Exception as e:
            logger.error(f"Error fetching state FMR for {state_code}: {e}")
            raise
