'use client';

import { useState } from 'react';
import type { Metro } from '@/types';
import { ScoreBar } from './ScoreBar';

interface CityCardProps {
  metro: Metro;
  rank: number;
  onHover?: (metro: Metro | null) => void;
  isSelected?: boolean;
  onToggleSelect?: (metro: Metro) => void;
}

export function CityCard({ metro, rank, onHover, isSelected, onToggleSelect }: CityCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const totalEssentials =
    metro.essentials.rent +
    metro.essentials.utilities +
    metro.essentials.groceries +
    metro.essentials.transport;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border transform hover:-translate-y-2 hover:scale-[1.02] ${
        isSelected
          ? 'border-primary-500 dark:border-primary-400 border-2 shadow-lg'
          : 'border-gray-100 dark:border-gray-700'
      } relative`}
      onMouseEnter={() => onHover?.(metro)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Compare Button - Top Right */}
      {onToggleSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(metro);
          }}
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
            isSelected
              ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSelected ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            )}
          </svg>
          {isSelected ? 'Selected' : 'Compare'}
        </button>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-20">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold text-sm">
              #{rank}
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {metro.name}, {metro.state}
              </h3>
              {metro.population && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pop. {formatNumber(metro.population)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score Bar */}
      <ScoreBar score={metro.score} className="mb-4" />

      {/* Key Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rent</div>
          <div className="font-bold font-mono text-gray-900 dark:text-gray-100">
            {formatCurrency(metro.essentials.rent)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">DI/mo</div>
          <div className="font-bold font-mono text-gray-900 dark:text-gray-100">
            {formatCurrency(metro.discretionary_income)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">RPP</div>
          <div className="font-bold font-mono text-gray-900 dark:text-gray-100">
            {metro.rpp_index.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg py-2"
      >
        {expanded ? 'Hide' : 'Show'} breakdown
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Quality of Life Badges - Always Visible */}
      {metro.quality_of_life && (
        <div className="flex flex-wrap gap-2 mt-3">
          {metro.quality_of_life.weather_score !== undefined && metro.quality_of_life.weather_score !== null && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
              <span>☀️</span>
              <span>Weather {metro.quality_of_life.weather_score.toFixed(0)}/100</span>
            </div>
          )}
          {metro.quality_of_life.air_quality_index !== undefined && metro.quality_of_life.air_quality_index !== null && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              metro.quality_of_life.air_quality_index <= 50
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : metro.quality_of_life.air_quality_index <= 100
                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
            }`}>
              <span>🌬️</span>
              <span>AQI {metro.quality_of_life.air_quality_index.toFixed(0)}</span>
            </div>
          )}
          {metro.quality_of_life.walkability_score !== undefined && metro.quality_of_life.walkability_score !== null && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
              <span>🚶</span>
              <span>Walk {metro.quality_of_life.walkability_score.toFixed(0)}/100</span>
            </div>
          )}
        </div>
      )}

      {/* Expanded Breakdown */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Quality of Life Section */}
          {metro.quality_of_life && (
            <div className="mb-4 p-3 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Quality of Life</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {metro.quality_of_life.weather_score !== undefined && metro.quality_of_life.weather_score !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">☀️ Weather</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{metro.quality_of_life.weather_score.toFixed(0)}/100</span>
                  </div>
                )}
                {metro.quality_of_life.air_quality_index !== undefined && metro.quality_of_life.air_quality_index !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">🌬️ Air Quality</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{metro.quality_of_life.air_quality_index.toFixed(0)} AQI</span>
                  </div>
                )}
                {metro.quality_of_life.school_score !== undefined && metro.quality_of_life.school_score !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">🎓 Schools</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{metro.quality_of_life.school_score.toFixed(0)}/100</span>
                  </div>
                )}
                {metro.quality_of_life.crime_rate !== undefined && metro.quality_of_life.crime_rate !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">🛡️ Safety</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{metro.quality_of_life.crime_rate.toFixed(0)}/100k</span>
                  </div>
                )}
                {metro.quality_of_life.healthcare_score !== undefined && metro.quality_of_life.healthcare_score !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">🏥 Healthcare</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{metro.quality_of_life.healthcare_score.toFixed(0)}/100</span>
                  </div>
                )}
                {metro.quality_of_life.walkability_score !== undefined && metro.quality_of_life.walkability_score !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">🚶 Walkability</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{metro.quality_of_life.walkability_score.toFixed(0)}/100</span>
                  </div>
                )}
                {metro.quality_of_life.commute_time_mins !== undefined && metro.quality_of_life.commute_time_mins !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">🚗 Commute</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{metro.quality_of_life.commute_time_mins.toFixed(0)} min</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Monthly Costs</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Rent</span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(metro.essentials.rent)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Utilities</span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(metro.essentials.utilities)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Groceries</span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(metro.essentials.groceries)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Transport</span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(metro.essentials.transport)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700 font-semibold">
              <span className="text-gray-900 dark:text-gray-100">Total Essentials</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {formatCurrency(totalEssentials)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Adjusted Income</span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(metro.net_monthly_adjusted)}
              </span>
            </div>
          </div>

          {/* Why it ranks */}
          <div className="mt-3 space-y-1">
            {metro.discretionary_income > 2000 && (
              <div className="flex items-start gap-2 text-xs text-accent-700 dark:text-accent-400">
                <span>✓</span>
                <span>High discretionary income</span>
              </div>
            )}
            {metro.rpp_index < 1.0 && (
              <div className="flex items-start gap-2 text-xs text-accent-700 dark:text-accent-400">
                <span>✓</span>
                <span>Below-average cost of living</span>
              </div>
            )}
            {metro.rpp_index > 1.1 && (
              <div className="flex items-start gap-2 text-xs text-orange-700 dark:text-orange-400">
                <span>⚠</span>
                <span>Above-average cost of living</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
