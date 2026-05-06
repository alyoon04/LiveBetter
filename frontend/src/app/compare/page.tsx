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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center max-w-md">
          <h2 className="font-semibold text-2xl text-white mb-2">No cities selected</h2>
          <p className="text-gray-400 text-sm mb-6 font-mono">Select cities from the results page to compare.</p>
          <Link href="/search" className="inline-block px-6 py-3 bg-white text-black font-medium rounded transition-colors hover:bg-gray-200">
            Start new search
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

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-semibold text-2xl text-white">City comparison</h1>
            <Link href="/search" className="px-4 py-2 border border-white/10 rounded text-sm text-gray-400 hover:text-white hover:border-white/30 transition-colors font-mono">
              New search
            </Link>
          </div>
          <p className="text-sm font-mono text-gray-400">
            {metros.length} {metros.length === 1 ? 'city' : 'cities'}
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${metros.length}, minmax(0, 1fr))` }}>
          {metros.map((metro) => (
            <div
              key={metro.metro_id}
              className="bg-white/[0.03] border border-white/10 rounded p-5 border-l-2 border-l-white"
            >
              <h2 className="font-semibold text-xl text-white mb-0.5">{metro.name}</h2>
              <p className="text-sm text-gray-400 mb-3">{metro.state}</p>
              {metro.population && (
                <p className="text-xs font-mono text-gray-500 mb-3">
                  {formatNumber(metro.population)} pop
                </p>
              )}
              <ScoreBar score={metro.score} />
            </div>
          ))}
        </div>

        {/* Affordability Metrics */}
        <div className="mt-5">
          <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-500 mb-3">Affordability</h3>
          <div className="bg-white/[0.03] border border-white/10 rounded overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-white/10">
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
        <div className="mt-5">
          <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-500 mb-3">Monthly Costs</h3>
          <div className="bg-white/[0.03] border border-white/10 rounded overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-white/10">
                <ComparisonRow label="Rent" metros={metros} getValue={(m) => m.essentials.rent} format={formatCurrency} highlightMax={false} getMaxValue={() => getMinValue('essentials.rent')} />
                <ComparisonRow label="Utilities" metros={metros} getValue={(m) => m.essentials.utilities} format={formatCurrency} highlightMax={false} getMaxValue={() => getMinValue('essentials.utilities')} />
                <ComparisonRow label="Groceries" metros={metros} getValue={(m) => m.essentials.groceries} format={formatCurrency} highlightMax={false} getMaxValue={() => getMinValue('essentials.groceries')} />
                <ComparisonRow label="Transportation" metros={metros} getValue={(m) => m.essentials.transport} format={formatCurrency} highlightMax={false} getMaxValue={() => getMinValue('essentials.transport')} />
                <ComparisonRow
                  label="Total Essentials"
                  metros={metros}
                  getValue={(m) => m.essentials.rent + m.essentials.utilities + m.essentials.groceries + m.essentials.transport}
                  format={formatCurrency}
                  highlightMax={false}
                  getMaxValue={() => Math.min(...metros.map(m => m.essentials.rent + m.essentials.utilities + m.essentials.groceries + m.essentials.transport))}
                  className="font-bold"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality of Life */}
        {metros.some(m => m.quality_of_life) && (
          <div className="mt-5">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-500 mb-3">Quality of Life</h3>
            <div className="bg-white/[0.03] border border-white/10 rounded overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-white/10">
                  {metros.some(m => m.quality_of_life?.weather_score) && (
                    <ComparisonRow label="Weather Score" metros={metros} getValue={(m) => m.quality_of_life?.weather_score || 0} format={(v) => `${v.toFixed(0)}/100`} highlightMax={true} getMaxValue={() => getMaxValue('quality_of_life.weather_score')} />
                  )}
                  {metros.some(m => m.quality_of_life?.air_quality_index) && (
                    <ComparisonRow label="Air Quality (AQI)" metros={metros} getValue={(m) => m.quality_of_life?.air_quality_index || 0} format={(v) => v.toFixed(0)} highlightMax={false} getMaxValue={() => getMinValue('quality_of_life.air_quality_index')} description="Lower is better" />
                  )}
                  {metros.some(m => m.quality_of_life?.school_score) && (
                    <ComparisonRow label="School Score" metros={metros} getValue={(m) => m.quality_of_life?.school_score || 0} format={(v) => `${v.toFixed(0)}/100`} highlightMax={true} getMaxValue={() => getMaxValue('quality_of_life.school_score')} />
                  )}
                  {metros.some(m => m.quality_of_life?.crime_rate) && (
                    <ComparisonRow label="Crime Rate" metros={metros} getValue={(m) => m.quality_of_life?.crime_rate || 0} format={(v) => `${v.toFixed(0)}/100k`} highlightMax={false} getMaxValue={() => getMinValue('quality_of_life.crime_rate')} description="Lower is better" />
                  )}
                  {metros.some(m => m.quality_of_life?.healthcare_score) && (
                    <ComparisonRow label="Healthcare Score" metros={metros} getValue={(m) => m.quality_of_life?.healthcare_score || 0} format={(v) => `${v.toFixed(0)}/100`} highlightMax={true} getMaxValue={() => getMaxValue('quality_of_life.healthcare_score')} />
                  )}
                  {metros.some(m => m.quality_of_life?.walkability_score) && (
                    <ComparisonRow label="Walkability Score" metros={metros} getValue={(m) => m.quality_of_life?.walkability_score || 0} format={(v) => `${v.toFixed(0)}/100`} highlightMax={true} getMaxValue={() => getMaxValue('quality_of_life.walkability_score')} />
                  )}
                  {metros.some(m => m.quality_of_life?.commute_time_mins) && (
                    <ComparisonRow label="Avg Commute Time" metros={metros} getValue={(m) => m.quality_of_life?.commute_time_mins || 0} format={(v) => `${v.toFixed(0)} min`} highlightMax={false} getMaxValue={() => getMinValue('quality_of_life.commute_time_mins')} description="Lower is better" />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Visual Comparison Bars */}
        <div className="mt-5">
          <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-500 mb-3">Visual Comparison</h3>
          <div className="space-y-6">
            <MetricBarChart label="Discretionary Income" metros={metros} getValue={(m) => m.discretionary_income} format={formatCurrency} />
            <MetricBarChart label="Monthly Rent" metros={metros} getValue={(m) => m.essentials.rent} format={formatCurrency} />
            <MetricBarChart label="Total Monthly Costs" metros={metros} getValue={(m) => m.essentials.rent + m.essentials.utilities + m.essentials.groceries + m.essentials.transport} format={formatCurrency} />
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
  getMaxValue,
  suffix = '',
  description,
  className = '',
}: ComparisonRowProps) {
  const bestValue = getMaxValue();

  return (
    <tr className="border-b border-white/10 last:border-0 hover:bg-white/[0.02] transition-colors">
      <td className="px-5 py-3">
        <div className="text-sm text-white">{label}</div>
        {description && (
          <div className="text-[10px] font-mono text-gray-500 mt-0.5">{description}</div>
        )}
      </td>
      {metros.map((metro) => {
        const value = getValue(metro);
        const isBest = value === bestValue;
        return (
          <td key={metro.metro_id} className={`px-5 py-3 ${className}`}>
            <div className={`text-right font-mono text-sm ${isBest ? 'text-white font-bold' : 'text-gray-400'}`}>
              {format(value)}
              {suffix && <span className="text-xs ml-1 text-gray-500">{suffix}</span>}
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
}

function MetricBarChart({ label, metros, getValue, format }: MetricBarChartProps) {
  const maxValue = Math.max(...metros.map(getValue));

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded p-5">
      <h4 className="font-semibold text-white mb-4">{label}</h4>
      <div className="space-y-4">
        {metros.map((metro) => {
          const value = getValue(metro);
          const percentage = (value / maxValue) * 100;
          return (
            <div key={metro.metro_id}>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-gray-400">{metro.name}, {metro.state}</span>
                <span className="text-sm font-mono font-bold text-white">{format(value)}</span>
              </div>
              <div className="w-full bg-white/5 h-1">
                <div
                  className="bg-white h-1 transition-all duration-500 ease-out"
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
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-10 w-10 border-t border-b border-white" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
