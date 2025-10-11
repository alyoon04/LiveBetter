"""
Tests for scoring logic
"""
import pytest
import math
from api.scoring import (
    affordability_score,
    base_groceries,
    base_transport,
    calculate_metro_affordability,
    validate_inputs
)


class TestBaseCosts:
    """Test base cost calculations"""

    def test_base_groceries_single(self):
        assert base_groceries(1) == 350.0

    def test_base_groceries_family(self):
        assert base_groceries(2) == 500.0  # 350 + 150
        assert base_groceries(4) == 800.0  # 350 + 3*150

    def test_base_transport_single(self):
        assert base_transport(1) == 250.0

    def test_base_transport_family(self):
        assert base_transport(2) == 325.0  # 250 + 75
        assert base_transport(3) == 400.0  # 250 + 2*75

    def test_invalid_family_size(self):
        with pytest.raises(ValueError):
            base_groceries(0)
        with pytest.raises(ValueError):
            base_transport(-1)


class TestAffordabilityScore:
    """Test affordability scoring function"""

    def test_score_at_center(self):
        # At $1500 DI, score should be ~0.5
        score = affordability_score(1500.0)
        assert abs(score - 0.5) < 0.01

    def test_score_high_di(self):
        # High DI should give high score
        score = affordability_score(3000.0)
        assert score > 0.9

    def test_score_low_di(self):
        # Low DI should give low score
        score = affordability_score(500.0)
        assert score < 0.1

    def test_score_negative_di(self):
        # Negative DI should give very low score
        score = affordability_score(-500.0)
        assert score < 0.01

    def test_score_range(self):
        # Score should always be between 0 and 1
        for di in range(-2000, 5000, 100):
            score = affordability_score(float(di))
            assert 0 <= score <= 1


class TestCalculateMetroAffordability:
    """Test full metro affordability calculation"""

    def test_basic_calculation(self):
        result = calculate_metro_affordability(
            salary=90000,
            family_size=1,
            rent_cap_pct=0.3,
            eff_tax_rate=0.27,
            median_rent=1450,
            utilities=170,
            rpp_index=0.95
        )

        assert 'score' in result
        assert 'discretionary_income' in result
        assert 'essentials' in result
        assert 'net_monthly_adjusted' in result

        # Basic sanity checks
        assert 0 <= result['score'] <= 1
        assert result['essentials']['rent'] >= 1450
        assert result['essentials']['utilities'] == 170

    def test_family_size_scaling(self):
        # Larger family should have higher grocery and transport costs
        single = calculate_metro_affordability(
            salary=90000, family_size=1, rent_cap_pct=0.3,
            eff_tax_rate=0.27, median_rent=1450, utilities=170, rpp_index=1.0
        )
        family = calculate_metro_affordability(
            salary=90000, family_size=3, rent_cap_pct=0.3,
            eff_tax_rate=0.27, median_rent=1450, utilities=170, rpp_index=1.0
        )

        assert family['essentials']['groceries'] > single['essentials']['groceries']
        assert family['essentials']['transport'] > single['essentials']['transport']

    def test_rpp_adjustment(self):
        # Higher RPP should reduce adjusted income
        low_rpp = calculate_metro_affordability(
            salary=90000, family_size=1, rent_cap_pct=0.3,
            eff_tax_rate=0.27, median_rent=1450, utilities=170, rpp_index=0.9
        )
        high_rpp = calculate_metro_affordability(
            salary=90000, family_size=1, rent_cap_pct=0.3,
            eff_tax_rate=0.27, median_rent=1450, utilities=170, rpp_index=1.2
        )

        assert low_rpp['net_monthly_adjusted'] > high_rpp['net_monthly_adjusted']
        assert low_rpp['score'] > high_rpp['score']

    def test_rent_cap(self):
        # Very low median rent should be capped at rent_cap_pct of income
        result = calculate_metro_affordability(
            salary=90000,
            family_size=1,
            rent_cap_pct=0.3,
            eff_tax_rate=0.27,
            median_rent=500,  # Very low
            utilities=170,
            rpp_index=1.0
        )

        net_monthly = (90000 * (1 - 0.27)) / 12
        expected_min_rent = net_monthly * 0.3

        assert result['essentials']['rent'] >= expected_min_rent


class TestValidateInputs:
    """Test input validation"""

    def test_valid_inputs(self):
        # Should not raise
        validate_inputs(salary=90000, family_size=2, rent_cap_pct=0.3)

    def test_invalid_salary_low(self):
        with pytest.raises(ValueError, match="Salary must be"):
            validate_inputs(salary=5000, family_size=1, rent_cap_pct=0.3)

    def test_invalid_salary_high(self):
        with pytest.raises(ValueError, match="Salary must be"):
            validate_inputs(salary=2000000, family_size=1, rent_cap_pct=0.3)

    def test_invalid_family_size(self):
        with pytest.raises(ValueError, match="family_size"):
            validate_inputs(salary=90000, family_size=0, rent_cap_pct=0.3)

    def test_invalid_rent_cap(self):
        with pytest.raises(ValueError, match="rent_cap_pct"):
            validate_inputs(salary=90000, family_size=1, rent_cap_pct=0.05)
        with pytest.raises(ValueError, match="rent_cap_pct"):
            validate_inputs(salary=90000, family_size=1, rent_cap_pct=0.7)


class TestScenarios:
    """End-to-end scenario tests"""

    def test_affordable_city_scenario(self):
        """Low-cost city with decent salary should score high"""
        result = calculate_metro_affordability(
            salary=80000,
            family_size=1,
            rent_cap_pct=0.3,
            eff_tax_rate=0.23,  # Low tax state
            median_rent=950,    # Low rent
            utilities=160,
            rpp_index=0.88      # Below-average costs
        )

        # Should have high discretionary income and score
        assert result['discretionary_income'] > 2000
        assert result['score'] > 0.8

    def test_expensive_city_scenario(self):
        """High-cost city with moderate salary should score lower"""
        result = calculate_metro_affordability(
            salary=80000,
            family_size=2,
            rent_cap_pct=0.3,
            eff_tax_rate=0.29,  # High tax state
            median_rent=3000,   # High rent
            utilities=200,
            rpp_index=1.28      # Much higher costs
        )

        # Should have lower discretionary income and score
        assert result['discretionary_income'] < 1000
        assert result['score'] < 0.5

    def test_salary_impact(self):
        """Higher salary should improve affordability in same city"""
        low_salary = calculate_metro_affordability(
            salary=60000, family_size=1, rent_cap_pct=0.3,
            eff_tax_rate=0.24, median_rent=1200, utilities=165, rpp_index=0.95
        )
        high_salary = calculate_metro_affordability(
            salary=120000, family_size=1, rent_cap_pct=0.3,
            eff_tax_rate=0.28, median_rent=1200, utilities=165, rpp_index=0.95
        )

        assert high_salary['discretionary_income'] > low_salary['discretionary_income']
        assert high_salary['score'] > low_salary['score']
