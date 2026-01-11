'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { RankRequest } from '@/types';
import { NaturalLanguageInput } from './NaturalLanguageInput';

interface SavedSearch {
  id: string;
  name: string;
  timestamp: number;
  data: RankRequest;
}

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
  const [showNLInput, setShowNLInput] = useState(false);
  const [nlSuccess, setNlSuccess] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Real-time validation effect
  useEffect(() => {
    // Only validate if user has started interacting with form
    if (formData.salary !== 90000 || formData.family_size !== 1) {
      validateForm();
    }
  }, [formData.salary, formData.family_size]);

  const handleParsedPreferences = async (parsed: RankRequest) => {
    setFormData(parsed);
    setNlSuccess(true);
    setShowNLInput(false);
    setIsSubmitting(true);

    // Save as last search
    localStorage.setItem('livebetter_last_search', JSON.stringify(parsed));

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

  // Load saved searches and last search from localStorage on mount
  useEffect(() => {
    // Load saved searches
    const saved = localStorage.getItem('livebetter_searches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved searches:', e);
      }
    }

    // Load last search parameters
    const lastSearch = localStorage.getItem('livebetter_last_search');
    if (lastSearch) {
      try {
        const parsed = JSON.parse(lastSearch);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse last search:', e);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSavedSearches && !target.closest('.saved-searches-dropdown')) {
        setShowSavedSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSavedSearches]);

  // Format number with commas
  const formatNumber = (num: number): string => {
    if (num === 0) return '';
    return num.toLocaleString('en-US');
  };

  // Parse formatted number string to integer
  const parseFormattedNumber = (str: string): number => {
    if (str === '') return 0;
    return parseInt(str.replace(/,/g, ''), 10);
  };

  // Generate a descriptive name for the search
  const generateSearchName = (data: RankRequest): string => {
    const salaryK = Math.round(data.salary / 1000);
    const familyText = data.family_size === 1 ? 'Single' : `Family of ${data.family_size}`;
    const modeText = data.transport_mode === 'public_transit' ? 'Transit' :
                     data.transport_mode === 'car' ? 'Car' : 'Bike/Walk';
    return `$${salaryK}k ${familyText} · ${modeText}`;
  };

  // Save current search
  const handleSaveSearch = () => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: generateSearchName(formData),
      timestamp: Date.now(),
      data: { ...formData },
    };

    const updatedSearches = [newSearch, ...savedSearches].slice(0, 5); // Keep max 5
    setSavedSearches(updatedSearches);
    localStorage.setItem('livebetter_searches', JSON.stringify(updatedSearches));

    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Load a saved search
  const handleLoadSearch = (search: SavedSearch) => {
    setFormData(search.data);
    setShowSavedSearches(false);
  };

  // Delete a saved search
  const handleDeleteSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSearches = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updatedSearches);
    localStorage.setItem('livebetter_searches', JSON.stringify(updatedSearches));
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Salary validation
    if (!formData.salary || formData.salary <= 0) {
      newErrors.salary = 'Salary must be a positive number';
    } else if (formData.salary < 10000) {
      newErrors.salary = 'Salary must be at least $10,000';
    } else if (formData.salary > 1000000) {
      newErrors.salary = 'Salary must be less than $1,000,000';
    } else if (isNaN(formData.salary)) {
      newErrors.salary = 'Please enter a valid number';
    }

    // Family size validation
    if (!formData.family_size || formData.family_size < 1) {
      newErrors.family_size = 'Household size must be at least 1';
    } else if (formData.family_size > 10) {
      newErrors.family_size = 'Household size must be 10 or fewer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);

      // Save as last search
      localStorage.setItem('livebetter_last_search', JSON.stringify(formData));

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
      {/* Save/Load Controls */}
      <div className="mb-6 flex gap-2 justify-end">
        {/* Save Search Button */}
        <button
          type="button"
          onClick={handleSaveSearch}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Save Search
        </button>

        {/* Load Search Dropdown */}
        {savedSearches.length > 0 && (
          <div className="relative saved-searches-dropdown">
            <button
              type="button"
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Recent ({savedSearches.length})
              <svg className={`w-4 h-4 transition-transform ${showSavedSearches ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showSavedSearches && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2">RECENT SEARCHES</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {savedSearches.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleLoadSearch(search)}
                      className="w-full text-left px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {search.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatTimestamp(search.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSearch(search.id, e)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Success Message */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Search saved successfully!
          </p>
        </div>
      )}

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
              type="text"
              id="salary"
              value={formatNumber(formData.salary)}
              onChange={(e) => {
                const value = parseFormattedNumber(e.target.value);
                setFormData({ ...formData, salary: value });
              }}
              onFocus={(e) => e.target.select()}
              className={`w-full pl-8 pr-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                errors.salary
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
              }`}
              placeholder="90,000"
              inputMode="numeric"
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
            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer ${
              errors.family_size ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
              <option key={size} value={size}>
                {size} {size === 1 ? 'person' : 'people'}
              </option>
            ))}
          </select>
          {errors.family_size && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.family_size}</p>}
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
            disabled={isSubmitting || Object.keys(errors).length > 0}
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
