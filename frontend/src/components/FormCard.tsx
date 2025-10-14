'use client';

import { useState, useEffect } from 'react';
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
    schools_weight: 0,
    safety_weight: 0,
    weather_weight: 0,
    healthcare_weight: 0,
    walkability_weight: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      });
      router.push(`/results?${params.toString()}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-8 max-w-2xl mx-auto backdrop-blur-sm border border-gray-200 dark:border-gray-700">
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
