'use client';

export default function MethodologyPage() {
  return (
    <div className="bg-black min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-semibold text-white mb-8">
          Methodology
        </h1>

        <div className="space-y-8 bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              How We Calculate Affordability
            </h2>
            <p className="text-gray-300 leading-relaxed">
              LiveBetter ranks U.S. metropolitan areas based on affordability for your specific salary
              and household size. Our scoring methodology focuses on how much discretionary income
              you'll have left after covering essential monthly expenses.
            </p>
          </section>

          {/* Formula */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              Composite Scoring System
            </h3>
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6 font-mono text-sm space-y-2">
              <div className="font-semibold text-white mb-2">Affordability Component:</div>
              <div className="text-gray-300">1. Net Monthly Income = (Salary × (1 - Tax Rate)) / 12</div>
              <div className="text-gray-300">2. Adjusted Income = Net Monthly / RPP Index</div>
              <div className="text-gray-300">3. Essentials = Rent + Utilities + Groceries + Transport</div>
              <div className="text-gray-300">4. Discretionary Income = Adjusted Income - Essentials</div>
              <div className="text-gray-300">5. Affordability Score = (DI - Min) / (Max - Min)</div>
              <div className="font-semibold text-white mt-4 mb-2">Quality of Life Components:</div>
              <div className="text-gray-300">6. QoL Scores = Normalized metrics (schools, safety, weather, etc.)</div>
              <div className="text-gray-300">7. Final Score = Weighted average of all components</div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Affordability scores are linearly normalized where -$500/month scores 0% and $6,000/month scores 100%.
              Quality of life metrics are normalized to 0-1 scale and weighted by your preferences (0-10 each).
              The final score combines all factors based on your selected priorities.
            </p>
          </section>

          {/* Data Sources */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              Data Sources
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Rent (HUD Fair Market Rents)', desc: '2-bedroom median rents from U.S. Department of Housing and Urban Development. Updated annually.' },
                { title: 'Regional Price Parities (BEA)', desc: 'Bureau of Economic Analysis RPP data adjusts for regional cost differences. Index of 1.00 = national average, 1.12 = 12% more expensive.' },
                { title: 'Taxes (Approximated)', desc: 'Effective income tax rates by state and salary band, combining federal and state taxes. For MVP, we use coarse salary bands (60k, 80k, 100k, 120k).' },
                { title: 'Utilities (EIA)', desc: 'Baseline monthly utility costs derived from Energy Information Administration data on average electricity rates and usage patterns.' },
                { title: 'Groceries (Scaled Baskets)', desc: 'Base monthly costs per person, scaled by household size and adjusted by RPP. Single: $350 groceries. Each additional person: +$150 groceries.' },
                { title: 'Transportation (Mode-Based)', desc: 'Transportation costs vary by your chosen mode and city characteristics.' },
                { title: 'Population (U.S. Census Bureau)', desc: 'Metropolitan Statistical Area (MSA) population data from official U.S. Census Bureau estimates.' },
              ].map(({ title, desc }) => (
                <div key={title}>
                  <h4 className="font-semibold text-white mb-1">{title}</h4>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              ))}
              <div className="ml-4 space-y-2 text-xs text-gray-500">
                <div>
                  <span className="font-semibold text-gray-400">Public Transit:</span> $100 + $40 per additional person, adjusted by RPP.
                  Lower costs (15% discount) in walkable, transit-rich cities (walkability &gt; 65).
                  Higher costs (30% premium) in car-dependent areas (walkability &lt; 45).
                </div>
                <div>
                  <span className="font-semibold text-gray-400">Car Owner:</span> $450 + $100 per additional person, adjusted by RPP.
                  Includes insurance, gas, maintenance, and parking. 10% penalty for long commutes (&gt; 35 min).
                </div>
                <div>
                  <span className="font-semibold text-gray-400">Bike/Walk:</span> $50 flat minimal cost (occasional rideshare/bike maintenance).
                  Cities with walkability &lt; 50 are filtered out as non-viable. 15% score boost for walkability &gt; 75.
                </div>
              </div>
            </div>
          </section>

          {/* Quality of Life Data */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              Quality of Life Metrics
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Weather Score (Open-Meteo API)', desc: 'Climate comfort score (0-100) based on temperature ranges, precipitation frequency, and sunshine hours.' },
                { label: 'Air Quality Index (EPA AirNow)', desc: 'Current air quality index from EPA AirNow API. Lower values indicate better air quality (0-50 = Good, 51-100 = Moderate, 101+ = Unhealthy).' },
                { label: 'School Quality Score', desc: 'Composite score based on standardized test performance and graduation rates in the metro area.' },
                { label: 'Safety (Crime Rate per 100k)', desc: 'Violent and property crime rates per 100,000 residents. Lower numbers indicate safer communities.' },
                { label: 'Healthcare Score', desc: 'Healthcare access and quality rating based on hospital density, quality ratings, and physician availability.' },
                { label: 'Walkability Score', desc: 'Walk Score metric measuring pedestrian-friendliness based on proximity to amenities. Scores range from 0-100.' },
                { label: 'Average Commute Time', desc: 'Mean commute time in minutes for metro area workers, from Census Bureau data.' },
              ].map(({ label, desc }) => (
                <div key={label}>
                  <h4 className="font-semibold text-white mb-1">{label}</h4>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              Limitations & Disclaimers
            </h3>
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
                <li>Data reflects 2024-2025 estimates and may not capture rapid local changes</li>
                <li>Tax calculations are simplified and do not include all deductions or credits</li>
                <li>Individual costs vary significantly based on lifestyle and specific neighborhoods</li>
                <li>Quality-of-life data availability varies by metro; some cities may have incomplete QoL metrics</li>
                <li>Healthcare, childcare, and debt payments are not factored into affordability calculations</li>
              </ul>
            </div>
          </section>

          {/* Example Calculation */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">
              Example Calculation
            </h3>
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 text-sm">
              <div className="font-semibold mb-2 text-white">
                Raleigh, NC | $90,000 salary | Family of 2
              </div>
              <div className="space-y-1 font-mono text-gray-300">
                <div>1. Net monthly: ($90,000 × 0.73) / 12 = $5,475</div>
                <div>2. Adjusted for RPP (0.95): $5,475 / 0.95 = $5,763</div>
                <div>3. Rent: $1,450, Utilities: $165</div>
                <div>4. Groceries: (350 + 150) × 0.95 = $475</div>
                <div>5. Transport (Public Transit, walkability 48): (100 + 40) × 0.95 = $133</div>
                <div>6. Essentials total: $2,223</div>
                <div>7. Discretionary: $5,763 - $2,223 = $3,540</div>
                <div>8. Score: (3540 - (-500)) / (6000 - (-500)) ≈ 0.62</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
