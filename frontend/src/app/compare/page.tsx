'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import React from 'react';
import type { Metro } from '@/types';
import Link from 'next/link';
import { ScoreBar } from '@/components/ScoreBar';

function CompareContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');

  const metros = useMemo<Metro[] | null>(() => {
    if (!dataParam) return null;
    try {
      const decoded = decodeURIComponent(dataParam);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to parse metro data:', error);
      return null;
    }
  }, [dataParam]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (!metros || metros.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No cities selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please select cities from the results page to compare.
          </p>
          <Link
            href="/search"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Start New Search
          </Link>
        </div>
      </div>
    );
  }

  const getMaxValue = (key: keyof Metro | string): number => {
    return Math.max(
      ...metros.map(m => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          return (m as any)[parent]?.[child] || 0;
        }
        return (m as any)[key] || 0;
      })
    );
  };

  const getMinValue = (key: keyof Metro | string): number => {
    return Math.min(
      ...metros.map(m => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          return (m as any)[parent]?.[child] || 0;
        }
        return (m as any)[key] || 0;
      })
    );
  };

  const isHighlighted = (metro: Metro, key: keyof Metro | string, highlightMax: boolean): boolean => {
    const value = key.includes('.')
      ? (metro as any)[key.split('.')[0]]?.[key.split('.')[1]]
      : (metro as any)[key];

    return highlightMax
      ? value === getMaxValue(key)
      : value === getMinValue(key);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              City Comparison
            </h1>
            <Link
              href="/search"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300"
            >
              New Search
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Comparing {metros.length} {metros.length === 1 ? 'city' : 'cities'}
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${metros.length}, minmax(0, 1fr))` }}>
          {/* City Headers */}
          {metros.map((metro) => (
            <div
              key={metro.metro_id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {metro.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{metro.state}</p>
              {metro.population && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Population: {formatNumber(metro.population)}
                </p>
              )}
              <ScoreBar score={metro.score} className="mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Overall Score: {metro.score.toFixed(1)}
              </p>
            </div>
          ))}
        </div>

        {/* Affordability Metrics */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Affordability</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <ComparisonRow
                  label="Affordability Score"
                  metros={metros}
                  getValue={(m) => m.affordability_score}
                  format={(v) => v.toFixed(1)}
                  highlightMax={true}
                  getMaxValue={() => getMaxValue('affordability_score')}
                />
                <ComparisonRow
                  label="Discretionary Income"
                  metros={metros}
                  getValue={(m) => m.discretionary_income}
                  format={formatCurrency}
                  highlightMax={true}
                  getMaxValue={() => getMaxValue('discretionary_income')}
                  suffix="/month"
                />
                <ComparisonRow
                  label="Adjusted Monthly Income"
                  metros={metros}
                  getValue={(m) => m.net_monthly_adjusted}
                  format={formatCurrency}
                  highlightMax={true}
                  getMaxValue={() => getMaxValue('net_monthly_adjusted')}
                />
                <ComparisonRow
                  label="Cost of Living (RPP)"
                  metros={metros}
                  getValue={(m) => m.rpp_index}
                  format={(v) => v.toFixed(2)}
                  highlightMax={false}
                  getMaxValue={() => getMinValue('rpp_index')}
                  description="Lower is better"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Housing & Living Costs */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Monthly Costs</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <ComparisonRow
                  label="Rent"
                  metros={metros}
                  getValue={(m) => m.essentials.rent}
                  format={formatCurrency}
                  highlightMax={false}
                  getMaxValue={() => getMinValue('essentials.rent')}
                />
                <ComparisonRow
                  label="Utilities"
                  metros={metros}
                  getValue={(m) => m.essentials.utilities}
                  format={formatCurrency}
                  highlightMax={false}
                  getMaxValue={() => getMinValue('essentials.utilities')}
                />
                <ComparisonRow
                  label="Groceries"
                  metros={metros}
                  getValue={(m) => m.essentials.groceries}
                  format={formatCurrency}
                  highlightMax={false}
                  getMaxValue={() => getMinValue('essentials.groceries')}
                />
                <ComparisonRow
                  label="Transportation"
                  metros={metros}
                  getValue={(m) => m.essentials.transport}
                  format={formatCurrency}
                  highlightMax={false}
                  getMaxValue={() => getMinValue('essentials.transport')}
                />
                <ComparisonRow
                  label="Total Essentials"
                  metros={metros}
                  getValue={(m) =>
                    m.essentials.rent +
                    m.essentials.utilities +
                    m.essentials.groceries +
                    m.essentials.transport
                  }
                  format={formatCurrency}
                  highlightMax={false}
                  getMaxValue={() =>
                    Math.min(
                      ...metros.map(
                        m =>
                          m.essentials.rent +
                          m.essentials.utilities +
                          m.essentials.groceries +
                          m.essentials.transport
                      )
                    )
                  }
                  className="font-bold"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality of Life */}
        {metros.some(m => m.quality_of_life) && (
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quality of Life</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {metros.some(m => m.quality_of_life?.weather_score) && (
                    <ComparisonRow
                      label="☀️ Weather Score"
                      metros={metros}
                      getValue={(m) => m.quality_of_life?.weather_score || 0}
                      format={(v) => `${v.toFixed(0)}/100`}
                      highlightMax={true}
                      getMaxValue={() => getMaxValue('quality_of_life.weather_score')}
                    />
                  )}
                  {metros.some(m => m.quality_of_life?.air_quality_index) && (
                    <ComparisonRow
                      label="🌬️ Air Quality (AQI)"
                      metros={metros}
                      getValue={(m) => m.quality_of_life?.air_quality_index || 0}
                      format={(v) => v.toFixed(0)}
                      highlightMax={false}
                      getMaxValue={() => getMinValue('quality_of_life.air_quality_index')}
                      description="Lower is better"
                    />
                  )}
                  {metros.some(m => m.quality_of_life?.school_score) && (
                    <ComparisonRow
                      label="🎓 School Score"
                      metros={metros}
                      getValue={(m) => m.quality_of_life?.school_score || 0}
                      format={(v) => `${v.toFixed(0)}/100`}
                      highlightMax={true}
                      getMaxValue={() => getMaxValue('quality_of_life.school_score')}
                    />
                  )}
                  {metros.some(m => m.quality_of_life?.crime_rate) && (
                    <ComparisonRow
                      label="🛡️ Crime Rate"
                      metros={metros}
                      getValue={(m) => m.quality_of_life?.crime_rate || 0}
                      format={(v) => `${v.toFixed(0)}/100k`}
                      highlightMax={false}
                      getMaxValue={() => getMinValue('quality_of_life.crime_rate')}
                      description="Lower is better"
                    />
                  )}
                  {metros.some(m => m.quality_of_life?.healthcare_score) && (
                    <ComparisonRow
                      label="🏥 Healthcare Score"
                      metros={metros}
                      getValue={(m) => m.quality_of_life?.healthcare_score || 0}
                      format={(v) => `${v.toFixed(0)}/100`}
                      highlightMax={true}
                      getMaxValue={() => getMaxValue('quality_of_life.healthcare_score')}
                    />
                  )}
                  {metros.some(m => m.quality_of_life?.walkability_score) && (
                    <ComparisonRow
                      label="🚶 Walkability Score"
                      metros={metros}
                      getValue={(m) => m.quality_of_life?.walkability_score || 0}
                      format={(v) => `${v.toFixed(0)}/100`}
                      highlightMax={true}
                      getMaxValue={() => getMaxValue('quality_of_life.walkability_score')}
                    />
                  )}
                  {metros.some(m => m.quality_of_life?.commute_time_mins) && (
                    <ComparisonRow
                      label="🚗 Avg Commute Time"
                      metros={metros}
                      getValue={(m) => m.quality_of_life?.commute_time_mins || 0}
                      format={(v) => `${v.toFixed(0)} min`}
                      highlightMax={false}
                      getMaxValue={() => getMinValue('quality_of_life.commute_time_mins')}
                      description="Lower is better"
                    />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Visual Comparison Bars */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Visual Comparison</h3>
          <div className="space-y-6">
            <MetricBarChart
              label="Discretionary Income"
              metros={metros}
              getValue={(m) => m.discretionary_income}
              format={formatCurrency}
              color="bg-green-500"
            />
            <MetricBarChart
              label="Monthly Rent"
              metros={metros}
              getValue={(m) => m.essentials.rent}
              format={formatCurrency}
              color="bg-blue-500"
            />
            <MetricBarChart
              label="Total Monthly Costs"
              metros={metros}
              getValue={(m) =>
                m.essentials.rent +
                m.essentials.utilities +
                m.essentials.groceries +
                m.essentials.transport
              }
              format={formatCurrency}
              color="bg-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  metros: Metro[];
  getValue: (metro: Metro) => number;
  format: (value: number) => string;
  highlightMax: boolean;
  getMaxValue: () => number;
  suffix?: string;
  description?: string;
  className?: string;
}

function ComparisonRow({
  label,
  metros,
  getValue,
  format,
  highlightMax,
  getMaxValue,
  suffix = '',
  description,
  className = '',
}: ComparisonRowProps) {
  const bestValue = getMaxValue();

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900 dark:text-gray-100">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>
        )}
      </td>
      {metros.map((metro) => {
        const value = getValue(metro);
        const isBest = value === bestValue;
        return (
          <td key={metro.metro_id} className={`px-6 py-4 ${className}`}>
            <div
              className={`text-right font-mono ${
                isBest
                  ? 'text-primary-600 dark:text-primary-400 font-bold'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {format(value)}
              {suffix && <span className="text-xs ml-1">{suffix}</span>}
              {isBest && <span className="ml-2">⭐</span>}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

interface MetricBarChartProps {
  label: string;
  metros: Metro[];
  getValue: (metro: Metro) => number;
  format: (value: number) => string;
  color: string;
}

function MetricBarChart({ label, metros, getValue, format, color }: MetricBarChartProps) {
  const maxValue = Math.max(...metros.map(getValue));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{label}</h4>
      <div className="space-y-4">
        {metros.map((metro) => {
          const value = getValue(metro);
          const percentage = (value / maxValue) * 100;
          return (
            <div key={metro.metro_id}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metro.name}, {metro.state}
                </span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                  {format(value)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`${color} h-3 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-primary-400 opacity-20"></div>
              <div className="relative animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-primary-600"></div>
            </div>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading...</p>
          </div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
