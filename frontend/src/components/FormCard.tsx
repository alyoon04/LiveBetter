'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { RankRequest } from '@/types';
import { NaturalLanguageInput } from './NaturalLanguageInput';

export function FormCard() {
  const router = useRouter();
  const [formData, setFormData] = useState<RankRequest>({
    salary: 90000,
    family_size: 1,
    rent_cap_pct: 0.3,
    population_min: 0,
    limit: 50,
    transport_mode: 'public_transit',
    affordability_weight: 10,
    schools_weight: 0,
    safety_weight: 0,
    weather_weight: 0,
    healthcare_weight: 0,
    walkability_weight: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNLInput, setShowNLInput] = useState(true);
  const [nlSuccess, setNlSuccess] = useState(false);

  const handleParsedPreferences = async (parsed: RankRequest) => {
    setFormData(parsed);
    setNlSuccess(true);
    setShowNLInput(false);
    setIsSubmitting(true);

    // Brief delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    // Encode form data as query params and navigate to results
    const params = new URLSearchParams({
      salary: parsed.salary.toString(),
      family_size: parsed.family_size.toString(),
      rent_cap_pct: parsed.rent_cap_pct.toString(),
      population_min: parsed.population_min.toString(),
      limit: parsed.limit.toString(),
      transport_mode: parsed.transport_mode,
      affordability_weight: parsed.affordability_weight.toString(),
      schools_weight: parsed.schools_weight.toString(),
      safety_weight: parsed.safety_weight.toString(),
      weather_weight: parsed.weather_weight.toString(),
      healthcare_weight: parsed.healthcare_weight.toString(),
      walkability_weight: parsed.walkability_weight.toString(),
    });
    router.push(`/results?${params.toString()}`);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);

      // Brief delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      // Encode form data as query params
      const params = new URLSearchParams({
        salary: formData.salary.toString(),
        family_size: formData.family_size.toString(),
        rent_cap_pct: formData.rent_cap_pct.toString(),
        population_min: formData.population_min.toString(),
        limit: formData.limit.toString(),
        transport_mode: formData.transport_mode,
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-8 max-w-2xl mx-auto backdrop-blur-sm border border-gray-200 dark:border-gray-700">
      {/* Natural Language Input Section - Collapsible */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setShowNLInput(!showNLInput)}
          className="w-full flex items-center justify-between text-left mb-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Quick Start: Describe Your Preferences
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showNLInput ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showNLInput && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <NaturalLanguageInput onParsed={handleParsedPreferences} />
          </div>
        )}

        {nlSuccess && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Preferences parsed! Finding your ideal cities...
            </p>
          </div>
        )}

        {!showNLInput && !nlSuccess && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Or fill out the form manually below
          </p>
        )}
      </div>

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
              value={formData.salary === 0 ? '' : formData.salary}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                setFormData({ ...formData, salary: value });
              }}
              onFocus={(e) => e.target.select()}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-primary-400 dark:hover:border-primary-500"
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map((size) => (
              <option key={size} value={size}>
                {size} {size === 1 ? 'person' : 'people'}
              </option>
            ))}
          </select>
        </div>

        {/* Transportation Mode */}
        <div>
          <label htmlFor="transport_mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transportation Mode
          </label>
          <select
            id="transport_mode"
            value={formData.transport_mode}
            onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value as 'public_transit' | 'car' | 'bike_walk' })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer"
          >
            <option value="public_transit">Public Transit User</option>
            <option value="car">Car Owner</option>
            <option value="bike_walk">Bike/Walk Primarily</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.transport_mode === 'public_transit' && 'Lower costs in walkable, transit-rich cities'}
            {formData.transport_mode === 'car' && 'Includes insurance, gas, maintenance, and parking'}
            {formData.transport_mode === 'bike_walk' && 'Minimal costs, prioritizes highly walkable cities'}
          </p>
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer"
          >
            <option value="0">Any size</option>
            <option value="100000">100,000+</option>
            <option value="250000">250,000+</option>
            <option value="500000">500,000+</option>
            <option value="1000000">1,000,000+</option>
          </select>
        </div>

        {/* Quality of Life Preferences - Collapsible */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <span>Quality of Life Priorities</span>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Adjust how much each factor matters to you (0-10). Higher weights prioritize that factor in rankings.
              </p>

              {/* Affordability Weight */}
              <div>
                <label htmlFor="affordability_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">💰</span>
                  Affordability
                  <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                    {formData.affordability_weight}
                  </span>
                </label>
                <input
                  type="range"
                  id="affordability_weight"
                  min="0"
                  max="10"
                  step="1"
                  value={formData.affordability_weight}
                  onChange={(e) => setFormData({ ...formData, affordability_weight: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Not important</span>
                  <span>Very important</span>
                </div>
              </div>

              {/* Schools Weight */}
              <div>
                <label htmlFor="schools_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">🎓</span>
                  School Quality
                  <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                    {formData.schools_weight}
                  </span>
                </label>
                <input
                  type="range"
                  id="schools_weight"
                  min="0"
                  max="10"
                  step="1"
                  value={formData.schools_weight}
                  onChange={(e) => setFormData({ ...formData, schools_weight: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Safety Weight */}
              <div>
                <label htmlFor="safety_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">🛡️</span>
                  Safety
                  <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                    {formData.safety_weight}
                  </span>
                </label>
                <input
                  type="range"
                  id="safety_weight"
                  min="0"
                  max="10"
                  step="1"
                  value={formData.safety_weight}
                  onChange={(e) => setFormData({ ...formData, safety_weight: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Weather Weight */}
              <div>
                <label htmlFor="weather_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">☀️</span>
                  Weather
                  <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                    {formData.weather_weight}
                  </span>
                </label>
                <input
                  type="range"
                  id="weather_weight"
                  min="0"
                  max="10"
                  step="1"
                  value={formData.weather_weight}
                  onChange={(e) => setFormData({ ...formData, weather_weight: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Healthcare Weight */}
              <div>
                <label htmlFor="healthcare_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">🏥</span>
                  Healthcare
                  <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                    {formData.healthcare_weight}
                  </span>
                </label>
                <input
                  type="range"
                  id="healthcare_weight"
                  min="0"
                  max="10"
                  step="1"
                  value={formData.healthcare_weight}
                  onChange={(e) => setFormData({ ...formData, healthcare_weight: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Walkability Weight */}
              <div>
                <label htmlFor="walkability_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">🚶</span>
                  Walkability
                  <span className="ml-2 text-sm font-mono text-primary-600 dark:text-primary-400">
                    {formData.walkability_weight}
                  </span>
                </label>
                <input
                  type="range"
                  id="walkability_weight"
                  min="0"
                  max="10"
                  step="1"
                  value={formData.walkability_weight}
                  onChange={(e) => setFormData({ ...formData, walkability_weight: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group ${
              isSubmitting ? 'animate-pulse' : ''
            }`}
          >
            <span className="relative z-10">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Find Cities'
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
      </form>

      {/* Info text */}
      <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
        Rankings based on real market rent data (Zillow), regional cost-of-living indices, and after-tax income calculations.
      </p>
    </div>
  );
}
