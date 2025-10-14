"""
Wikipedia API client for metro area population data

Uses Wikipedia as the primary source for the most current population estimates.
Wikipedia typically aggregates data from official census sources and is regularly updated.
"""
import re
import logging
from typing import Optional, Dict, Any
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class WikipediaPopulationClient:
    """Client for fetching population data from Wikipedia"""

    BASE_URL = "https://en.wikipedia.org/api/rest_v1"
    WIKI_URL = "https://en.wikipedia.org/wiki"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'LiveBetter Metro Data Bot/1.0 (Educational Project)'
        })

    def _search_metro_article(self, metro_name: str, state: str) -> Optional[str]:
        """
        Search for the Wikipedia article title for a metro area

        Args:
            metro_name: Metro area name (e.g., "Atlanta")
            state: State code (e.g., "GA")

        Returns:
            Wikipedia article title or None if not found
        """
        # Try different search patterns
        search_queries = [
            f"{metro_name} metropolitan area",
            f"{metro_name}, {state}",
            f"{metro_name}",
        ]

        for query in search_queries:
            try:
                url = "https://en.wikipedia.org/w/api.php"
                params = {
                    "action": "opensearch",
                    "search": query,
                    "limit": 5,
                    "namespace": 0,
                    "format": "json"
                }

                response = self.session.get(url, params=params, timeout=10)
                response.raise_for_status()
                results = response.json()

                if len(results) > 1 and results[1]:
                    # First result is usually the best match
                    for title in results[1]:
                        # Prefer metropolitan area articles
                        if "metropolitan" in title.lower() or metro_name.lower() in title.lower():
                            logger.info(f"Found article for {metro_name}: {title}")
                            return title
                    # Fallback to first result
                    return results[1][0]

            except Exception as e:
                logger.debug(f"Search failed for '{query}': {e}")
                continue

        logger.warning(f"No Wikipedia article found for {metro_name}, {state}")
        return None

    def _extract_population_from_infobox(self, html: str) -> Optional[Dict[str, Any]]:
        """
        Extract population from Wikipedia infobox

        Args:
            html: HTML content of Wikipedia article

        Returns:
            Dict with population and year, or None if not found
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')

            # Find the infobox
            infobox = soup.find('table', {'class': 'infobox'})
            if not infobox:
                return None

            # Look for population-related rows
            rows = infobox.find_all('tr')

            # Collect all potential population candidates
            candidates = []

            for i, row in enumerate(rows):
                cells = row.find_all(['th', 'td'])

                for cell_idx, cell in enumerate(cells):
                    cell_text = cell.get_text().strip().lower()

                    # Skip unwanted types explicitly
                    if any(skip in cell_text for skip in ['csa', 'combined statistical', 'urban area', 'density', 'city proper']):
                        continue

                    # Look for MSA, metro, or general population labels
                    is_msa = 'msa' in cell_text or 'metropolitan statistical' in cell_text
                    is_metro = 'metro' in cell_text
                    is_population = 'population' in cell_text or 'pop' in cell_text

                    if is_msa or is_metro or is_population:
                        # Look for the number in this row or adjacent cells
                        for check_cell in cells[cell_idx:]:
                            text = check_cell.get_text().strip()

                            # Extract numbers - remove commas first
                            clean_text = text.replace(',', '')
                            number_match = re.search(r'(\d{6,})', clean_text)
                            if number_match:
                                try:
                                    pop_str = number_match.group(1)
                                    population = int(pop_str)

                                    # Sanity check - metro populations should be between 50k and 25M
                                    if 50000 <= population <= 25000000:
                                        # Try to extract year
                                        year_match = re.search(r'(20\d{2})', text)
                                        year = int(year_match.group(1)) if year_match else None

                                        # Priority scoring: MSA > metro > general population
                                        priority = 3 if is_msa else (2 if is_metro else 1)

                                        candidates.append({
                                            'population': population,
                                            'year': year,
                                            'priority': priority,
                                            'label': cell_text
                                        })
                                        break  # Found number for this row, move to next

                                except (ValueError, AttributeError):
                                    continue

            # Return the highest priority candidate
            if candidates:
                best = max(candidates, key=lambda x: x['priority'])
                logger.info(f"Extracted MSA population: {best['population']:,} (year: {best['year']}) from '{best['label']}'")
                return {
                    'population': best['population'],
                    'year': best['year']
                }

            logger.warning("Could not extract population from infobox")
            return None

        except Exception as e:
            logger.error(f"Error parsing infobox: {e}")
            return None

    def get_metro_population(self, metro_name: str, state: str) -> Optional[Dict[str, Any]]:
        """
        Get population data for a metro area from Wikipedia

        Args:
            metro_name: Metro area name (e.g., "Atlanta")
            state: State code (e.g., "GA")

        Returns:
            Dict with population, year, and source, or None if not found
        """
        # Find the Wikipedia article
        article_title = self._search_metro_article(metro_name, state)
        if not article_title:
            return None

        try:
            # Fetch article HTML using Mobile Content Service API (cleaner HTML)
            url = f"{self.BASE_URL}/page/html/{article_title.replace(' ', '_')}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            # Extract population from infobox
            result = self._extract_population_from_infobox(response.text)

            if result:
                result['source'] = 'wikipedia'
                result['article_title'] = article_title
                return result

            return None

        except Exception as e:
            logger.error(f"Error fetching Wikipedia data for {metro_name}: {e}")
            return None

    def get_population_batch(self, metros: list) -> Dict[str, Dict[str, Any]]:
        """
        Get population data for multiple metros

        Args:
            metros: List of dicts with 'name' and 'state' keys

        Returns:
            Dict mapping metro identifiers to population data
        """
        results = {}

        for metro in metros:
            name = metro.get('name')
            state = metro.get('state')

            if not name or not state:
                continue

            key = f"{name}, {state}"
            data = self.get_metro_population(name, state)

            if data:
                results[key] = data

            # Be respectful with rate limiting
            import time
            time.sleep(0.5)

        return results
