"""
Base API client with rate limiting, retry logic, and caching
"""
import os
import time
import logging
import requests
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class APICache:
    """Simple file-based cache for API responses"""

    def __init__(self, cache_dir: str = ".cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.ttl_hours = int(os.getenv("CACHE_TTL_HOURS", "24"))
        self.enabled = os.getenv("CACHE_ENABLED", "true").lower() == "true"

    def _get_cache_path(self, key: str) -> Path:
        """Get cache file path for a given key"""
        return self.cache_dir / f"{key}.json"

    def get(self, key: str) -> Optional[Dict[Any, Any]]:
        """Get cached data if it exists and is not expired"""
        if not self.enabled:
            return None

        cache_path = self._get_cache_path(key)
        if not cache_path.exists():
            return None

        try:
            with open(cache_path, 'r') as f:
                cached = json.load(f)

            # Check if expired
            cached_time = datetime.fromisoformat(cached['timestamp'])
            if datetime.now() - cached_time > timedelta(hours=self.ttl_hours):
                logger.info(f"Cache expired for {key}")
                return None

            logger.info(f"Cache hit for {key}")
            return cached['data']
        except Exception as e:
            logger.warning(f"Error reading cache for {key}: {e}")
            return None

    def set(self, key: str, data: Dict[Any, Any]):
        """Cache data with timestamp"""
        if not self.enabled:
            return

        cache_path = self._get_cache_path(key)
        try:
            with open(cache_path, 'w') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'data': data
                }, f)
            logger.info(f"Cached data for {key}")
        except Exception as e:
            logger.warning(f"Error writing cache for {key}: {e}")


class RateLimiter:
    """Simple rate limiter using token bucket algorithm"""

    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.tokens = requests_per_minute
        self.last_update = time.time()

    def acquire(self):
        """Wait if necessary to respect rate limit"""
        now = time.time()
        elapsed = now - self.last_update

        # Refill tokens based on elapsed time
        self.tokens += elapsed * (self.requests_per_minute / 60.0)
        self.tokens = min(self.tokens, self.requests_per_minute)
        self.last_update = now

        if self.tokens < 1:
            sleep_time = (1 - self.tokens) / (self.requests_per_minute / 60.0)
            logger.info(f"Rate limit: sleeping for {sleep_time:.2f}s")
            time.sleep(sleep_time)
            self.tokens = 0
        else:
            self.tokens -= 1


class BaseAPIClient:
    """Base API client with common functionality"""

    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url
        self.api_key = api_key
        self.timeout = int(os.getenv("API_TIMEOUT", "30"))
        self.retry_attempts = int(os.getenv("API_RETRY_ATTEMPTS", "3"))
        self.rate_limiter = RateLimiter(
            int(os.getenv("API_RATE_LIMIT_PER_MINUTE", "60"))
        )
        self.cache = APICache()
        self.session = requests.Session()

    def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        cache_key: Optional[str] = None
    ) -> Dict[Any, Any]:
        """
        Make HTTP request with retry logic and caching

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            params: Query parameters
            cache_key: Optional cache key for this request

        Returns:
            Response data as dictionary
        """
        # Check cache first
        if cache_key:
            cached_data = self.cache.get(cache_key)
            if cached_data is not None:
                return cached_data

        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        # Add API key to params if provided
        if self.api_key and params is not None:
            params['key'] = self.api_key

        for attempt in range(self.retry_attempts):
            try:
                # Respect rate limit
                self.rate_limiter.acquire()

                logger.info(f"API request: {method} {url}")
                response = self.session.request(
                    method=method,
                    url=url,
                    params=params,
                    timeout=self.timeout
                )
                response.raise_for_status()

                data = response.json()

                # Cache successful response
                if cache_key:
                    self.cache.set(cache_key, data)

                return data

            except requests.exceptions.HTTPError as e:
                if response.status_code == 429:  # Rate limit
                    wait_time = 2 ** attempt  # Exponential backoff
                    logger.warning(f"Rate limited, waiting {wait_time}s")
                    time.sleep(wait_time)
                elif response.status_code >= 500:  # Server error
                    if attempt < self.retry_attempts - 1:
                        wait_time = 2 ** attempt
                        logger.warning(f"Server error, retrying in {wait_time}s")
                        time.sleep(wait_time)
                    else:
                        raise
                else:
                    raise

            except requests.exceptions.RequestException as e:
                if attempt < self.retry_attempts - 1:
                    wait_time = 2 ** attempt
                    logger.warning(f"Request failed, retrying in {wait_time}s: {e}")
                    time.sleep(wait_time)
                else:
                    raise

        raise Exception(f"Failed after {self.retry_attempts} attempts")

    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, cache_key: Optional[str] = None) -> Dict[Any, Any]:
        """Make GET request"""
        return self._make_request("GET", endpoint, params, cache_key)
