"""
Affordability scoring logic for LiveBetter
"""
import math

# Base monthly costs (for single person, scaled by family size and RPP)
GROCERIES_BASE_SINGLE = 350.0  # Base groceries for 1 person
GROCERIES_PER_ADDITIONAL = 150.0  # Additional per person

TRANSPORT_BASE_SINGLE = 250.0  # Base transport for 1 person
TRANSPORT_PER_ADDITIONAL = 75.0  # Additional per person

# Sigmoid parameters for affordability score
SIGMOID_CENTER = 1500.0  # Discretionary income at which score = 0.5
SIGMOID_SLOPE = 400.0  # Controls steepness of the curve


def base_groceries(family_size: int) -> float:
    """Calculate base monthly grocery cost before RPP adjustment"""
    if family_size <= 0:
        raise ValueError("family_size must be >= 1")
    return GROCERIES_BASE_SINGLE + (family_size - 1) * GROCERIES_PER_ADDITIONAL


def base_transport(family_size: int) -> float:
    """Calculate base monthly transport cost before RPP adjustment"""
    if family_size <= 0:
        raise ValueError("family_size must be >= 1")
    return TRANSPORT_BASE_SINGLE + (family_size - 1) * TRANSPORT_PER_ADDITIONAL


def affordability_score(discretionary_income: float) -> float:
    """
    Calculate affordability score using sigmoid function.

    Score ranges from 0 (unaffordable) to 1 (very affordable).
    Center point at $1,500 discretionary income yields score of 0.5.

    Args:
        discretionary_income: Monthly discretionary income after essentials

    Returns:
        Score between 0 and 1
    """
    exponent = -(discretionary_income - SIGMOID_CENTER) / SIGMOID_SLOPE
    return 1.0 / (1.0 + math.exp(exponent))


def calculate_metro_affordability(
    salary: float,
    family_size: int,
    rent_cap_pct: float,
    eff_tax_rate: float,
    median_rent: float,
    utilities: float,
    rpp_index: float
) -> dict:
    """
    Calculate full affordability metrics for a metro.

    Args:
        salary: Annual pre-tax salary
        family_size: Number of people in household
        rent_cap_pct: Maximum rent as percentage of monthly net income
        eff_tax_rate: Effective tax rate (0-1)
        median_rent: Monthly median rent for metro
        utilities: Monthly utilities cost
        rpp_index: Regional Price Parity index (1.0 = national average)

    Returns:
        Dictionary with all calculated metrics
    """
    # 1. Calculate net monthly income
    net_monthly = (salary * (1.0 - eff_tax_rate)) / 12.0

    # 2. Calculate essentials
    # Rent: use median, but cap at rent_cap_pct of income
    rent = max(float(median_rent), net_monthly * rent_cap_pct)

    # Groceries and transport: base amount scaled by family size and RPP
    groceries = base_groceries(family_size) * rpp_index
    transport = base_transport(family_size) * rpp_index

    # Total essentials
    essentials = rent + utilities + groceries + transport

    # 3. Adjust income for regional price parity
    # Higher RPP means lower purchasing power, so divide by RPP
    adj_net_monthly = net_monthly / rpp_index

    # 4. Calculate discretionary income
    discretionary_income = adj_net_monthly - essentials

    # 5. Calculate affordability score
    score = affordability_score(discretionary_income)

    return {
        "score": round(score, 4),
        "discretionary_income": round(discretionary_income, 2),
        "essentials": {
            "rent": round(rent, 2),
            "utilities": round(utilities, 2),
            "groceries": round(groceries, 2),
            "transport": round(transport, 2)
        },
        "net_monthly_adjusted": round(adj_net_monthly, 2),
        "total_essentials": round(essentials, 2)
    }


def validate_inputs(salary: float, family_size: int, rent_cap_pct: float):
    """Validate scoring inputs"""
    if salary < 10000 or salary > 1000000:
        raise ValueError("Salary must be between $10,000 and $1,000,000")
    if family_size < 1:
        raise ValueError("family_size must be >= 1")
    if rent_cap_pct < 0.1 or rent_cap_pct > 0.6:
        raise ValueError("rent_cap_pct must be between 0.1 and 0.6")


def normalize_qol_metric(value: float, min_val: float, max_val: float, inverse: bool = False) -> float:
    """
    Normalize a quality of life metric to 0-1 scale.

    Args:
        value: The raw metric value
        min_val: Minimum expected value
        max_val: Maximum expected value
        inverse: If True, lower values are better (e.g., crime rate)

    Returns:
        Normalized score between 0 and 1
    """
    if value is None:
        return 0.5  # Neutral score if data missing

    # Convert to float if it's a Decimal (from PostgreSQL)
    value = float(value)

    # Clamp value to range
    clamped = max(min_val, min(max_val, value))

    # Normalize to 0-1
    if max_val == min_val:
        normalized = 0.5
    else:
        normalized = (clamped - min_val) / (max_val - min_val)

    # Invert if lower is better
    if inverse:
        normalized = 1.0 - normalized

    return normalized


def calculate_qol_scores(qol_data: dict) -> dict:
    """
    Calculate normalized QOL component scores.

    Args:
        qol_data: Dictionary with raw QOL metrics

    Returns:
        Dictionary with normalized scores (0-1)
    """
    if not qol_data:
        return {}

    return {
        "school_score": normalize_qol_metric(qol_data.get("school_score"), 0, 100, inverse=False),
        "safety_score": normalize_qol_metric(qol_data.get("crime_rate"), 200, 800, inverse=True),  # Lower crime is better
        "weather_score": normalize_qol_metric(qol_data.get("weather_score"), 0, 100, inverse=False),
        "healthcare_score": normalize_qol_metric(qol_data.get("healthcare_score"), 0, 100, inverse=False),
        "walkability_score": normalize_qol_metric(qol_data.get("walkability_score"), 0, 100, inverse=False),
    }


def calculate_composite_score(
    affordability_score: float,
    qol_scores: dict,
    weights: dict
) -> float:
    """
    Calculate weighted composite score from affordability and QOL metrics.

    Args:
        affordability_score: Affordability component score (0-1)
        qol_scores: Dictionary with normalized QOL scores
        weights: Dictionary with user preference weights

    Returns:
        Weighted composite score (0-1)
    """
    # Extract weights with defaults
    w_affordability = weights.get("affordability_weight", 10)
    w_schools = weights.get("schools_weight", 5)
    w_safety = weights.get("safety_weight", 8)
    w_weather = weights.get("weather_weight", 5)
    w_healthcare = weights.get("healthcare_weight", 6)
    w_walkability = weights.get("walkability_weight", 3)

    # Calculate total weight for normalization
    total_weight = (
        w_affordability + w_schools + w_safety +
        w_weather + w_healthcare + w_walkability
    )

    # If no QOL data available, return just affordability score
    if not qol_scores:
        return affordability_score

    # Calculate weighted sum
    weighted_sum = (
        affordability_score * w_affordability +
        qol_scores.get("school_score", 0.5) * w_schools +
        qol_scores.get("safety_score", 0.5) * w_safety +
        qol_scores.get("weather_score", 0.5) * w_weather +
        qol_scores.get("healthcare_score", 0.5) * w_healthcare +
        qol_scores.get("walkability_score", 0.5) * w_walkability
    )

    # Normalize by total weight
    if total_weight > 0:
        return weighted_sum / total_weight
    else:
        return affordability_score
