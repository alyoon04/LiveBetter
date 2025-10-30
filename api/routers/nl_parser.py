"""
Natural Language Parser Router
Converts user's natural language preferences into structured RankRequest
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
import json

router = APIRouter()

# Initialize OpenAI client
client = None

def get_openai_client():
    """Get or create OpenAI client"""
    global client
    if client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY environment variable not set"
            )
        client = OpenAI(api_key=api_key)
    return client


class NLRequest(BaseModel):
    """Natural language input from user"""
    text: str


class ParsedPreferences(BaseModel):
    """Parsed preferences matching RankRequest structure"""
    salary: int
    family_size: int
    rent_cap_pct: float
    population_min: int
    limit: int
    transport_mode: str
    affordability_weight: int
    schools_weight: int
    safety_weight: int
    weather_weight: int
    healthcare_weight: int
    walkability_weight: int


SYSTEM_PROMPT = """You are a helpful assistant that converts natural language descriptions of living preferences into structured data for a city affordability tool.

Extract the following information from the user's text and return ONLY a JSON object with these exact fields:
- salary (number, 10000-1000000): annual pre-tax salary in USD
- family_size (number, 1-10): number of people in household
- rent_cap_pct (number, 0.1-0.6): maximum rent as % of income (default 0.3)
- population_min (number, 0/100000/250000/500000/1000000): minimum city population filter
- limit (number, 1-200): max number of results (default 50)
- transport_mode (string, "public_transit"/"car"/"bike_walk"): transportation preference
- affordability_weight (number, 0-10): how much affordability matters (default 10)
- schools_weight (number, 0-10): how much school quality matters (default 0)
- safety_weight (number, 0-10): how much safety matters (default 0)
- weather_weight (number, 0-10): how much weather matters (default 0)
- healthcare_weight (number, 0-10): how much healthcare matters (default 0)
- walkability_weight (number, 0-10): how much walkability matters (default 0)

Guidelines:
- If salary is mentioned with "k" suffix, multiply by 1000 (e.g., "75k" = 75000)
- Common phrases for transport_mode:
  * "public transit", "bus", "subway", "train" → "public_transit"
  * "car", "drive", "driving" → "car"
  * "bike", "walk", "walkable" → "bike_walk"
- For weights, interpret importance levels:
  * "very important", "critical", "essential", "must have" → 9-10
  * "important", "care about" → 7-8
  * "somewhat important", "nice to have" → 4-6
  * "not important", "don't care" → 0-2
- If a weight is mentioned, set it accordingly. Otherwise use defaults.
- If family_size is described as "single", "alone", "just me" → 1
- If family mentions "spouse", "partner", "couple" → 2
- Add 1 for each child mentioned
- Default values for unmentioned fields:
  * salary: 90000
  * family_size: 1
  * rent_cap_pct: 0.3
  * population_min: 0
  * limit: 50
  * transport_mode: "public_transit"
  * all weights: keep defaults (affordability=10, others=0)

Return ONLY valid JSON, no other text."""


def parse_with_simple_rules(text: str) -> dict:
    """
    Simple rule-based parser as fallback when OpenAI is not available.
    This is a basic implementation for testing/demo purposes.
    """
    import re

    result = {
        "salary": 90000,
        "family_size": 1,
        "rent_cap_pct": 0.3,
        "population_min": 0,
        "limit": 50,
        "transport_mode": "public_transit",
        "affordability_weight": 10,
        "schools_weight": 0,
        "safety_weight": 0,
        "weather_weight": 0,
        "healthcare_weight": 0,
        "walkability_weight": 0,
    }

    text_lower = text.lower()

    # Parse salary
    salary_patterns = [
        r'\$?(\d+)k',  # "75k" or "$75k"
        r'\$(\d{5,6})',  # "$75000"
        r'make[s]?\s+\$?(\d+)k',  # "make 75k"
        r'salary[:\s]+\$?(\d+)k',  # "salary: 75k"
    ]
    for pattern in salary_patterns:
        match = re.search(pattern, text_lower)
        if match:
            val = int(match.group(1))
            result["salary"] = val * 1000 if val < 1000 else val
            break

    # Parse family size
    if "single" in text_lower or "just me" in text_lower or "alone" in text_lower:
        result["family_size"] = 1
    elif "couple" in text_lower or "partner" in text_lower or "spouse" in text_lower:
        result["family_size"] = 2

    family_match = re.search(r'family\s+(?:of\s+)?(\d+)', text_lower)
    if family_match:
        result["family_size"] = int(family_match.group(1))

    # Parse transport mode
    if any(word in text_lower for word in ["car", "drive", "driving"]):
        result["transport_mode"] = "car"
    elif any(word in text_lower for word in ["bike", "walk", "walkable"]):
        result["transport_mode"] = "bike_walk"
    elif any(word in text_lower for word in ["transit", "bus", "subway", "train"]):
        result["transport_mode"] = "public_transit"

    # Parse importance weights
    weights_map = {
        "schools": "schools_weight",
        "school": "schools_weight",
        "education": "schools_weight",
        "safety": "safety_weight",
        "safe": "safety_weight",
        "crime": "safety_weight",
        "weather": "weather_weight",
        "climate": "weather_weight",
        "healthcare": "healthcare_weight",
        "hospital": "healthcare_weight",
        "walkability": "walkability_weight",
        "walkable": "walkability_weight",
    }

    for keyword, weight_field in weights_map.items():
        if keyword in text_lower:
            # Check for importance indicators
            if any(word in text_lower for word in ["very important", "critical", "essential", "must have"]):
                result[weight_field] = 9
            elif any(word in text_lower for word in ["important", "care about", "need"]):
                result[weight_field] = 7
            elif "nice" in text_lower:
                result[weight_field] = 5

    return result


@router.post("/parse-preferences", response_model=ParsedPreferences)
async def parse_preferences(request: NLRequest):
    """
    Parse natural language preferences into structured data.

    Example inputs:
    - "I make $75k with a family of 3, I prefer public transit and care about schools"
    - "Single person, $120k salary, want walkable city with good weather"
    - "Family of 4, we make 95000, need good schools and safety, we drive"
    """
    # Check if we should use simple parser (no OpenAI key or for testing)
    use_simple_parser = os.getenv("USE_SIMPLE_NL_PARSER", "false").lower() == "true"

    if use_simple_parser:
        # Use simple rule-based parser
        try:
            parsed_data = parse_with_simple_rules(request.text)
            return ParsedPreferences(**parsed_data)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error parsing preferences with simple parser: {str(e)}"
            )

    # Use OpenAI API
    try:
        openai_client = get_openai_client()

        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.text}
            ],
            temperature=0.3,  # Lower temperature for more consistent parsing
            response_format={"type": "json_object"}
        )

        # Parse response
        parsed_text = response.choices[0].message.content
        parsed_data = json.loads(parsed_text)

        # Validate and return
        return ParsedPreferences(**parsed_data)

    except Exception as e:
        error_str = str(e)
        # If quota exceeded, try falling back to simple parser
        if "quota" in error_str.lower() or "insufficient_quota" in error_str.lower():
            try:
                parsed_data = parse_with_simple_rules(request.text)
                return ParsedPreferences(**parsed_data)
            except Exception as fallback_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"OpenAI quota exceeded and fallback parser failed: {str(fallback_error)}"
                )

        raise HTTPException(
            status_code=500,
            detail=f"Error parsing preferences: {str(e)}"
        )
