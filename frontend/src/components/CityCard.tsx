'use client';

import { useState } from 'react';
import type { Metro } from '@/types';
import { ScoreBar } from './ScoreBar';

interface CityCardProps {
  metro: Metro;
  rank: number;
  onHover?: (metro: Metro | null) => void;
}

export function CityCard({ metro, rank, onHover }: CityCardProps) {
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
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 p-6 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1"
      onMouseEnter={() => onHover?.(metro)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
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
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rent</div>
          <div className="font-bold font-mono text-gray-900 dark:text-gray-100">
            {formatCurrency(metro.essentials.rent)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">DI/mo</div>
          <div className="font-bold font-mono text-gray-900 dark:text-gray-100">
            {formatCurrency(metro.discretionary_income)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">RPP</div>
          <div className="font-bold font-mono text-gray-900 dark:text-gray-100">
            {metro.rpp_index.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Quality of Life Badges */}
      {metro.quality_of_life && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {metro.quality_of_life.school_score !== undefined && (
              <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-xs">
                <span>📚</span>
                <span className="text-gray-700 dark:text-gray-300">Schools:</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  {metro.quality_of_life.school_score.toFixed(0)}
                </span>
              </div>
            )}
            {metro.quality_of_life.crime_rate !== undefined && (
              <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full text-xs">
                <span>🛡️</span>
                <span className="text-gray-700 dark:text-gray-300">Crime:</span>
                <span className="font-bold text-green-700 dark:text-green-300">
                  {metro.quality_of_life.crime_rate.toFixed(0)}/100k
                </span>
              </div>
            )}
            {metro.quality_of_life.weather_score !== undefined && (
              <div className="inline-flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full text-xs">
                <span>☀️</span>
                <span className="text-gray-700 dark:text-gray-300">Weather:</span>
                <span className="font-bold text-yellow-700 dark:text-yellow-300">
                  {metro.quality_of_life.weather_score.toFixed(0)}
                </span>
              </div>
            )}
            {metro.quality_of_life.healthcare_score !== undefined && (
              <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full text-xs">
                <span>🏥</span>
                <span className="text-gray-700 dark:text-gray-300">Healthcare:</span>
                <span className="font-bold text-red-700 dark:text-red-300">
                  {metro.quality_of_life.healthcare_score.toFixed(0)}
                </span>
              </div>
            )}
            {metro.quality_of_life.walkability_score !== undefined && (
              <div className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full text-xs">
                <span>🚶</span>
                <span className="text-gray-700 dark:text-gray-300">Walkability:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {metro.quality_of_life.walkability_score.toFixed(0)}
                </span>
              </div>
            )}
            {metro.quality_of_life.commute_time_mins !== undefined && (
              <div className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-full text-xs">
                <span>🚗</span>
                <span className="text-gray-700 dark:text-gray-300">Commute:</span>
                <span className="font-bold text-orange-700 dark:text-orange-300">
                  {metro.quality_of_life.commute_time_mins.toFixed(0)}m
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
      >
        {expanded ? 'Hide' : 'Show'} breakdown
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Breakdown */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="space-y-2">
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
