'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RankRequest } from '@/types';

export function FormCard() {
  const router = useRouter();
  const [formData, setFormData] = useState<RankRequest>({
    salary: 90000,
    family_size: 1,
    rent_cap_pct: 0.3,
    population_min: 0,
    limit: 50,
    affordability_weight: 10,
    schools_weight: 5,
    safety_weight: 8,
    weather_weight: 5,
    healthcare_weight: 6,
    walkability_weight: 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.salary < 10000) {
      newErrors.salary = 'Salary must be at least $10,000';
    }
    if (formData.salary > 1000000) {
      newErrors.salary = 'Salary must be less than $1,000,000';
    }
    if (formData.family_size < 1) {
      newErrors.family_size = 'Family size must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Encode form data as query params
      const params = new URLSearchParams({
        salary: formData.salary.toString(),
        family_size: formData.family_size.toString(),
        rent_cap_pct: formData.rent_cap_pct.toString(),
        population_min: formData.population_min.toString(),
        limit: formData.limit.toString(),
        affordability_weight: formData.affordability_weight.toString(),
        schools_weight: formData.schools_weight.toString(),
        safety_weight: formData.safety_weight.toString(),
        weather_weight: formData.weather_weight.toString(),
        healthcare_weight: formData.healthcare_weight.toString(),
        walkability_weight: formData.walkability_weight.toString(),
      });
      router.push(`/results?${params.toString()}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Salary Input */}
        <div>
          <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Annual Salary
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Pre-tax)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="number"
              id="salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="90000"
              min="10000"
              max="1000000"
              step="1000"
            />
          </div>
          {errors.salary && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.salary}</p>}
        </div>

        {/* Family Size */}
        <div>
          <label htmlFor="family_size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Household Size
          </label>
          <select
            id="family_size"
            value={formData.family_size}
            onChange={(e) => setFormData({ ...formData, family_size: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            {[1, 2, 3, 4, 5, 6].map((size) => (
              <option key={size} value={size}>
                {size} {size === 1 ? 'person' : 'people'}
              </option>
            ))}
          </select>
        </div>

        {/* Rent Cap Slider */}
        <div>
          <label htmlFor="rent_cap" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maximum Rent
            <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
              {(formData.rent_cap_pct * 100).toFixed(1)}% of income
            </span>
          </label>
          <input
            type="range"
            id="rent_cap"
            min="0.1"
            max="0.6"
            step="0.01"
            value={formData.rent_cap_pct}
            onChange={(e) => setFormData({ ...formData, rent_cap_pct: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>10%</span>
            <span>30%</span>
            <span>60%</span>
          </div>
        </div>

        {/* Population Filter */}
        <div>
          <label htmlFor="population_min" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum City Size
          </label>
          <select
            id="population_min"
            value={formData.population_min}
            onChange={(e) => setFormData({ ...formData, population_min: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="0">Any size</option>
            <option value="100000">100,000+</option>
            <option value="250000">250,000+</option>
            <option value="500000">500,000+</option>
            <option value="1000000">1,000,000+</option>
          </select>
        </div>

        {/* Preference Weights Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            What matters most to you?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Adjust these sliders to prioritize what's important in your ideal city
          </p>

          <div className="space-y-4">
            {/* Affordability Weight */}
            <div>
              <label htmlFor="affordability_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Affordability
                <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                  {formData.affordability_weight}/10
                </span>
              </label>
              <input
                type="range"
                id="affordability_weight"
                min="0"
                max="10"
                step="1"
                value={formData.affordability_weight}
                onChange={(e) => setFormData({ ...formData, affordability_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Schools Weight */}
            <div>
              <label htmlFor="schools_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                School Quality
                <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                  {formData.schools_weight}/10
                </span>
              </label>
              <input
                type="range"
                id="schools_weight"
                min="0"
                max="10"
                step="1"
                value={formData.schools_weight}
                onChange={(e) => setFormData({ ...formData, schools_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Safety Weight */}
            <div>
              <label htmlFor="safety_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Safety (Low Crime)
                <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                  {formData.safety_weight}/10
                </span>
              </label>
              <input
                type="range"
                id="safety_weight"
                min="0"
                max="10"
                step="1"
                value={formData.safety_weight}
                onChange={(e) => setFormData({ ...formData, safety_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Weather Weight */}
            <div>
              <label htmlFor="weather_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weather
                <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                  {formData.weather_weight}/10
                </span>
              </label>
              <input
                type="range"
                id="weather_weight"
                min="0"
                max="10"
                step="1"
                value={formData.weather_weight}
                onChange={(e) => setFormData({ ...formData, weather_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Healthcare Weight */}
            <div>
              <label htmlFor="healthcare_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Healthcare Quality
                <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                  {formData.healthcare_weight}/10
                </span>
              </label>
              <input
                type="range"
                id="healthcare_weight"
                min="0"
                max="10"
                step="1"
                value={formData.healthcare_weight}
                onChange={(e) => setFormData({ ...formData, healthcare_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Walkability Weight */}
            <div>
              <label htmlFor="walkability_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Walkability
                <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                  {formData.walkability_weight}/10
                </span>
              </label>
              <input
                type="range"
                id="walkability_weight"
                min="0"
                max="10"
                step="1"
                value={formData.walkability_weight}
                onChange={(e) => setFormData({ ...formData, walkability_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          Find Cities
        </button>
      </form>

      {/* Info text */}
      <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
        Results are based on median costs and regional price parities. Individual experiences may vary.
      </p>
    </div>
  );
}
