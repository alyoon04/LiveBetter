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
