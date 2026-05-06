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

const TRANSPORT_OPTIONS = [
  { value: 'public_transit', label: 'Transit', hint: 'Lower costs in walkable cities' },
  { value: 'car', label: 'Car', hint: 'Includes insurance, gas & parking' },
  { value: 'bike_walk', label: 'Bike / Walk', hint: 'Minimal costs, high walkability' },
] as const;

const QOL_WEIGHTS = [
  { key: 'affordability_weight', label: 'Affordability', default: 10 },
  { key: 'schools_weight', label: 'Schools', default: 0 },
  { key: 'safety_weight', label: 'Safety', default: 0 },
  { key: 'weather_weight', label: 'Weather', default: 0 },
  { key: 'healthcare_weight', label: 'Healthcare', default: 0 },
  { key: 'walkability_weight', label: 'Walkability', default: 0 },
] as const;

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

  useEffect(() => {
    if (formData.salary !== 90000 || formData.family_size !== 1) validateForm();
  }, [formData.salary, formData.family_size]);

  useEffect(() => {
    const saved = localStorage.getItem('livebetter_searches');
    if (saved) {
      try { setSavedSearches(JSON.parse(saved)); } catch {}
    }
    const lastSearch = localStorage.getItem('livebetter_last_search');
    if (lastSearch) {
      try { setFormData(JSON.parse(lastSearch)); } catch {}
    }
  }, []);

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

  const formatNumber = (num: number) => num === 0 ? '' : num.toLocaleString('en-US');
  const parseFormattedNumber = (str: string) => str === '' ? 0 : parseInt(str.replace(/,/g, ''), 10);

  const generateSearchName = (data: RankRequest) => {
    const salaryK = Math.round(data.salary / 1000);
    const familyText = data.family_size === 1 ? 'Single' : `Family of ${data.family_size}`;
    const modeText = data.transport_mode === 'public_transit' ? 'Transit' : data.transport_mode === 'car' ? 'Car' : 'Bike/Walk';
    return `$${salaryK}k · ${familyText} · ${modeText}`;
  };

  const handleSaveSearch = () => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: generateSearchName(formData),
      timestamp: Date.now(),
      data: { ...formData },
    };
    const updated = [newSearch, ...savedSearches].slice(0, 5);
    setSavedSearches(updated);
    localStorage.setItem('livebetter_searches', JSON.stringify(updated));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setFormData(search.data);
    setShowSavedSearches(false);
  };

  const handleDeleteSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('livebetter_searches', JSON.stringify(updated));
  };

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Enter a positive number';
    else if (formData.salary < 10000) newErrors.salary = 'Must be at least $10,000';
    else if (formData.salary > 1000000) newErrors.salary = 'Must be under $1,000,000';
    if (!formData.family_size || formData.family_size < 1) newErrors.family_size = 'Must be at least 1';
    else if (formData.family_size > 10) newErrors.family_size = 'Max 10 people';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildParams = (data: RankRequest) => new URLSearchParams({
    salary: data.salary.toString(),
    family_size: data.family_size.toString(),
    rent_cap_pct: data.rent_cap_pct.toString(),
    population_min: data.population_min.toString(),
    limit: data.limit.toString(),
    transport_mode: data.transport_mode,
    affordability_weight: data.affordability_weight.toString(),
    schools_weight: data.schools_weight.toString(),
    safety_weight: data.safety_weight.toString(),
    weather_weight: data.weather_weight.toString(),
    healthcare_weight: data.healthcare_weight.toString(),
    walkability_weight: data.walkability_weight.toString(),
  });

  const handleParsedPreferences = async (parsed: RankRequest) => {
    setFormData(parsed);
    setNlSuccess(true);
    setShowNLInput(false);
    setIsSubmitting(true);
    localStorage.setItem('livebetter_last_search', JSON.stringify(parsed));
    await new Promise(r => setTimeout(r, 500));
    router.push(`/results?${buildParams(parsed)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      localStorage.setItem('livebetter_last_search', JSON.stringify(formData));
      await new Promise(r => setTimeout(r, 300));
      router.push(`/results?${buildParams(formData)}`);
    }
  };

  const selectedTransport = TRANSPORT_OPTIONS.find(o => o.value === formData.transport_mode);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          type="button"
          onClick={() => setShowNLInput(!showNLInput)}
          className={`flex items-center gap-2 text-sm font-mono transition-colors ${showNLInput ? 'text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick fill
        </button>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-mono text-white">Saved</span>
          )}
          <button
            type="button"
            onClick={handleSaveSearch}
            className="text-xs font-mono text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-white/10 rounded hover:border-white/30"
          >
            Save
          </button>

          {savedSearches.length > 0 && (
            <div className="relative saved-searches-dropdown">
              <button
                type="button"
                onClick={() => setShowSavedSearches(!showSavedSearches)}
                className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-white/10 rounded hover:border-white/30"
              >
                Recent ({savedSearches.length})
                <svg className={`w-3 h-3 transition-transform ${showSavedSearches ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSavedSearches && (
                <div className="absolute right-0 mt-1 w-72 bg-black border border-white/10 rounded shadow-2xl z-10">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Recent searches</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {savedSearches.map((search) => (
                      <button
                        key={search.id}
                        onClick={() => handleLoadSearch(search)}
                        className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/10 last:border-0 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm text-white">{search.name}</p>
                            <p className="text-[10px] font-mono text-gray-500 mt-0.5">{formatTimestamp(search.timestamp)}</p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteSearch(search.id, e)}
                            className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
      </div>

      {/* NL input */}
      {showNLInput && (
        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <NaturalLanguageInput onParsed={handleParsedPreferences} />
        </div>
      )}

      {nlSuccess && (
        <div className="px-6 py-3 bg-white/5 border-b border-white/10 text-xs font-mono text-white flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Preferences parsed — finding your cities...
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

        {/* Salary */}
        <div>
          <label htmlFor="salary" className="block text-[10px] uppercase tracking-widest text-gray-400 font-mono mb-2">
            Annual salary <span className="normal-case">(pre-tax)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">$</span>
            <input
              type="text"
              id="salary"
              value={formatNumber(formData.salary)}
              onChange={(e) => setFormData({ ...formData, salary: parseFormattedNumber(e.target.value) })}
              onFocus={(e) => e.target.select()}
              className={`w-full pl-8 pr-4 py-3 bg-white/[0.03] border rounded font-mono text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors ${
                errors.salary ? 'border-red-800' : 'border-white/10'
              }`}
              placeholder="90,000"
              inputMode="numeric"
            />
          </div>
          {errors.salary && <p className="mt-1 text-xs font-mono text-red-400">{errors.salary}</p>}
        </div>

        {/* Household size */}
        <div>
          <label htmlFor="family_size" className="block text-[10px] uppercase tracking-widest text-gray-400 font-mono mb-2">
            Household size
          </label>
          <select
            id="family_size"
            value={formData.family_size}
            onChange={(e) => setFormData({ ...formData, family_size: parseInt(e.target.value) })}
            className={`w-full px-3 py-3 bg-white/[0.03] border rounded font-mono text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer ${
              errors.family_size ? 'border-red-800' : 'border-white/10'
            }`}
          >
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={n} className="bg-black">
                {n} {n === 1 ? 'person' : 'people'}
              </option>
            ))}
          </select>
          {errors.family_size && <p className="mt-1 text-xs font-mono text-red-400">{errors.family_size}</p>}
        </div>

        {/* Transport mode */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-mono mb-2">
            Transportation mode
          </label>
          <div className="flex rounded border border-white/10 overflow-hidden">
            {TRANSPORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, transport_mode: value })}
                className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
                  formData.transport_mode === value
                    ? 'bg-white text-black font-bold'
                    : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {selectedTransport && (
            <p className="mt-1.5 text-[11px] font-mono text-gray-500">{selectedTransport.hint}</p>
          )}
        </div>

        {/* Rent cap */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="rent_cap" className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
              Max rent % of income
            </label>
            <span className="text-sm font-mono text-white">{(formData.rent_cap_pct * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            id="rent_cap"
            min="0.1" max="0.6" step="0.01"
            value={formData.rent_cap_pct}
            onChange={(e) => setFormData({ ...formData, rent_cap_pct: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] font-mono text-gray-600 mt-1">
            <span>10%</span><span>30%</span><span>60%</span>
          </div>
        </div>

        {/* City size */}
        <div>
          <label htmlFor="population_min" className="block text-[10px] uppercase tracking-widest text-gray-400 font-mono mb-2">
            Minimum city size
          </label>
          <select
            id="population_min"
            value={formData.population_min}
            onChange={(e) => setFormData({ ...formData, population_min: parseInt(e.target.value) })}
            className="w-full px-3 py-3 bg-white/[0.03] border border-white/10 rounded font-mono text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
          >
            <option value="0" className="bg-black">Any size</option>
            <option value="100000" className="bg-black">100k+</option>
            <option value="250000" className="bg-black">250k+</option>
            <option value="500000" className="bg-black">500k+</option>
            <option value="1000000" className="bg-black">1M+</option>
          </select>
        </div>

        {/* QoL weights */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-[10px] uppercase tracking-widest text-gray-400 font-mono hover:text-white transition-colors"
          >
            <span>Quality of life weights</span>
            <svg className={`w-3 h-3 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <p className="text-[11px] font-mono text-gray-500">
                Set 0–10. Higher = more weight in the final ranking.
              </p>
              {QOL_WEIGHTS.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-400">{label}</label>
                    <span className="text-xs font-mono text-white">{(formData as any)[key]}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="10" step="1"
                    value={(formData as any)[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          className={`w-full py-4 bg-white hover:bg-gray-200 text-black font-medium text-lg rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isSubmitting ? 'opacity-60' : ''}`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Ranking cities...
            </span>
          ) : (
            'Rank cities'
          )}
        </button>
      </form>
    </div>
  );
}
