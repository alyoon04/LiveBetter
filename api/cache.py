"""
Redis caching layer for LiveBetter API

Provides high-performance caching with automatic cache warming,
invalidation, and fallback to in-memory caching if Redis unavailable.
"""
import os
import json
import logging
import hashlib
from typing import Optional, Any, Callable
from datetime import timedelta
from functools import wraps

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None

logger = logging.getLogger(__name__)


class CacheService:
    """
    Intelligent caching service with Redis backend and in-memory fallback.

    Features:
    - Automatic Redis connection with fallback
    - Cache key generation from function arguments
    - TTL support per cache entry
    - Cache warming for frequently accessed data
    - Selective cache invalidation
    """

    def __init__(self):
        self.enabled = os.getenv("REDIS_ENABLED", "true").lower() == "true"
        self.redis_client: Optional[Any] = None
        self.in_memory_cache: dict = {}
        self.default_ttl = int(os.getenv("CACHE_TTL_HOURS", "24")) * 3600  # Convert to seconds

        if self.enabled and REDIS_AVAILABLE:
            try:
                self.redis_client = redis.Redis(
                    host=os.getenv("REDIS_HOST", "localhost"),
                    port=int(os.getenv("REDIS_PORT", "6379")),
                    db=int(os.getenv("REDIS_DB", "0")),
                    password=os.getenv("REDIS_PASSWORD") or None,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                # Test connection
                self.redis_client.ping()
                logger.info("Redis cache initialized successfully")
            except Exception as e:
                logger.warning(f"Redis connection failed, using in-memory cache: {e}")
                self.redis_client = None
        else:
            if not self.enabled:
                logger.info("Redis caching disabled via config")
            elif not REDIS_AVAILABLE:
                logger.warning("Redis library not installed, using in-memory cache")

    def _generate_cache_key(self, prefix: str, **kwargs) -> str:
        """
        Generate a deterministic cache key from prefix and kwargs.

        Args:
            prefix: Cache key prefix (e.g., 'rank', 'metros', 'health')
            **kwargs: Key-value pairs to include in cache key

        Returns:
            Cache key string
        """
        # Sort kwargs for consistent key generation
        sorted_items = sorted(kwargs.items())
        key_data = json.dumps(sorted_items, sort_keys=True)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()[:12]
        return f"livebetter:{prefix}:{key_hash}"

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found
        """
        if not self.enabled:
            return None

        try:
            if self.redis_client:
                value = self.redis_client.get(key)
                if value:
                    logger.debug(f"Redis cache hit: {key}")
                    return json.loads(value)
            else:
                # Fallback to in-memory cache
                if key in self.in_memory_cache:
                    logger.debug(f"Memory cache hit: {key}")
                    return self.in_memory_cache[key]
        except Exception as e:
            logger.error(f"Cache get error for {key}: {e}")

        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set value in cache with TTL.

        Args:
            key: Cache key
            value: Value to cache (must be JSON serializable)
            ttl: Time to live in seconds (default: 24 hours)

        Returns:
            True if successful, False otherwise
        """
        if not self.enabled:
            return False

        ttl = ttl or self.default_ttl

        try:
            serialized = json.dumps(value)

            if self.redis_client:
                self.redis_client.setex(key, ttl, serialized)
                logger.debug(f"Redis cache set: {key} (TTL: {ttl}s)")
                return True
            else:
                # Fallback to in-memory cache (no TTL in simple implementation)
                self.in_memory_cache[key] = value
                logger.debug(f"Memory cache set: {key}")
                return True
        except Exception as e:
            logger.error(f"Cache set error for {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        """
        Delete value from cache.

        Args:
            key: Cache key

        Returns:
            True if deleted, False otherwise
        """
        if not self.enabled:
            return False

        try:
            if self.redis_client:
                deleted = self.redis_client.delete(key)
                logger.info(f"Redis cache delete: {key} (deleted: {deleted})")
                return bool(deleted)
            else:
                if key in self.in_memory_cache:
                    del self.in_memory_cache[key]
                    logger.info(f"Memory cache delete: {key}")
                    return True
        except Exception as e:
            logger.error(f"Cache delete error for {key}: {e}")

        return False

    def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching a pattern (Redis only).

        Args:
            pattern: Redis key pattern (e.g., 'livebetter:rank:*')

        Returns:
            Number of keys deleted
        """
        if not self.enabled or not self.redis_client:
            return 0

        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                deleted = self.redis_client.delete(*keys)
                logger.info(f"Cache pattern delete: {pattern} ({deleted} keys)")
                return deleted
        except Exception as e:
            logger.error(f"Cache pattern delete error for {pattern}: {e}")

        return 0

    def invalidate_all(self) -> bool:
        """
        Invalidate all cache entries.

        Returns:
            True if successful
        """
        try:
            if self.redis_client:
                # Delete all LiveBetter keys
                deleted = self.delete_pattern("livebetter:*")
                logger.info(f"Cache invalidated: {deleted} keys deleted")
                return True
            else:
                self.in_memory_cache.clear()
                logger.info("Memory cache cleared")
                return True
        except Exception as e:
            logger.error(f"Cache invalidate error: {e}")
            return False

    def warm_cache(self, key: str, value_fn: Callable[[], Any], ttl: Optional[int] = None) -> Any:
        """
        Warm cache by executing value_fn if cache miss.

        Args:
            key: Cache key
            value_fn: Function to call if cache miss
            ttl: Time to live in seconds

        Returns:
            Cached or computed value
        """
        # Try to get from cache first
        cached = self.get(key)
        if cached is not None:
            return cached

        # Cache miss - compute value
        logger.info(f"Cache warming: {key}")
        value = value_fn()

        # Store in cache
        self.set(key, value, ttl)

        return value

    def health_check(self) -> dict:
        """
        Check cache health status.

        Returns:
            Dictionary with health information
        """
        if not self.enabled:
            return {
                "status": "disabled",
                "backend": "none"
            }

        try:
            if self.redis_client:
                self.redis_client.ping()
                info = self.redis_client.info("stats")
                return {
                    "status": "healthy",
                    "backend": "redis",
                    "host": os.getenv("REDIS_HOST", "localhost"),
                    "total_connections": info.get("total_connections_received", 0),
                    "keys": self.redis_client.dbsize()
                }
            else:
                return {
                    "status": "healthy",
                    "backend": "memory",
                    "keys": len(self.in_memory_cache)
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "backend": "redis" if self.redis_client else "memory",
                "error": str(e)
            }


# Global cache instance
cache = CacheService()


def cached(prefix: str, ttl: Optional[int] = None):
    """
    Decorator for caching function results.

    Usage:
        @cached("metros", ttl=3600)
        def get_metros(state: str):
            # expensive operation
            return data

    Args:
        prefix: Cache key prefix
        ttl: Time to live in seconds (optional)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function arguments
            cache_key = cache._generate_cache_key(prefix, args=args, kwargs=kwargs)

            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result

            # Cache miss - execute function
            result = func(*args, **kwargs)

            # Store in cache
            cache.set(cache_key, result, ttl)

            return result

        return wrapper
    return decorator
