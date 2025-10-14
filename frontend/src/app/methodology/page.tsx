export default function MethodologyPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Methodology
        </h1>

        <div className="space-y-8 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How We Calculate Affordability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              LiveBetter ranks U.S. metropolitan areas based on affordability for your specific salary
              and household size. Our scoring methodology focuses on how much discretionary income
              you'll have left after covering essential monthly expenses.
            </p>
          </section>

          {/* Formula */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Affordability Score Formula
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 font-mono text-sm space-y-2">
              <div>1. Net Monthly Income = (Salary × (1 - Tax Rate)) / 12</div>
              <div>2. Adjusted Income = Net Monthly / RPP Index</div>
              <div>3. Essentials = Rent + Utilities + Groceries + Transport</div>
              <div>4. Discretionary Income = Adjusted Income - Essentials</div>
              <div>5. Score = (DI - Min) / (Max - Min)</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Scores are linearly normalized based on discretionary income, where -$500/month scores 0%
              and $6,000/month scores 100%. This provides clear differentiation between cities.
            </p>
          </section>

          {/* Data Sources */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Data Sources
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Rent (HUD Fair Market Rents)
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  2-bedroom median rents from U.S. Department of Housing and Urban Development.
                  Updated annually.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Regional Price Parities (BEA)
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Bureau of Economic Analysis RPP data adjusts for regional cost differences.
                  Index of 1.00 = national average, 1.12 = 12% more expensive.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Taxes (Approximated)
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Effective income tax rates by state and salary band, combining federal and state taxes.
                  For MVP, we use coarse salary bands (60k, 80k, 100k, 120k).
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Utilities (EIA)
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Baseline monthly utility costs derived from Energy Information Administration data
                  on average electricity rates and usage patterns.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Groceries & Transport (Scaled Baskets)
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Base monthly costs per person, scaled by household size and adjusted by RPP.
                  Single: $350 groceries + $250 transport. Each additional person: +$150 groceries, +$75 transport.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Population (U.S. Census Bureau)
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Metropolitan Statistical Area (MSA) population data from official U.S. Census Bureau estimates.
                  MSA populations include the entire metro region (city plus surrounding suburbs and counties),
                  reflecting the actual labor market and cost-of-living area where people live and work.
                </p>
              </div>
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Limitations & Disclaimers
            </h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                <li>Data reflects 2024-2025 estimates and may not capture rapid local changes</li>
                <li>Tax calculations are simplified and do not include all deductions or credits</li>
                <li>Individual costs vary significantly based on lifestyle and specific neighborhoods</li>
                <li>Quality-of-life factors (weather, safety, culture) are not included in MVP scoring</li>
                <li>Healthcare, childcare, and debt payments are not factored in</li>
              </ul>
            </div>
          </section>

          {/* Future Improvements */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Planned Enhancements
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span>Quality-of-life metrics (crime rates, schools, weather, culture)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span>More granular tax calculations with deductions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span>Healthcare and childcare cost estimates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span>User profiles and saved searches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400">•</span>
                <span>Natural language city recommendations with AI</span>
              </li>
            </ul>
          </section>

          {/* Example Calculation */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Example Calculation
            </h3>
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 text-sm">
              <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Raleigh, NC | $90,000 salary | Family of 2
              </div>
              <div className="space-y-1 font-mono text-gray-700 dark:text-gray-300">
                <div>1. Net monthly: ($90,000 × 0.73) / 12 = $5,475</div>
                <div>2. Adjusted for RPP (0.95): $5,475 / 0.95 = $5,763</div>
                <div>3. Rent: $1,450, Utilities: $165</div>
                <div>4. Groceries: (350 + 150) × 0.95 = $475</div>
                <div>5. Transport: (250 + 75) × 0.95 = $309</div>
                <div>6. Essentials total: $2,399</div>
                <div>7. Discretionary: $5,763 - $2,399 = $3,364</div>
                <div>8. Score: 1/(1+e^(-(3364-1500)/400)) ≈ 0.96</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
