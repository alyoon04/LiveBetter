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
  isDisabled?: boolean;
}

export function CityCard({ metro, rank, onHover, isSelected, onToggleSelect, isDisabled }: CityCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatNumber = (num: number | null) =>
    num === null ? 'N/A' : new Intl.NumberFormat('en-US').format(num);

  const totalEssentials =
    metro.essentials.rent +
    metro.essentials.utilities +
    metro.essentials.groceries +
    metro.essentials.transport;

  return (
    <div
      className={`relative bg-[#111118] border-l-2 border border-[#1E1E2A] rounded overflow-hidden transition-all duration-200 ${
        isSelected
          ? 'border-l-primary-400 shadow-glow-sm'
          : 'hover:border-l-primary-400/40 hover:bg-[#13131C]'
      }`}
      onMouseEnter={() => onHover?.(metro)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Ghost rank number */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[80px] font-display font-black leading-none text-[#16161F] select-none pointer-events-none">
        {rank}
      </div>

      <div className="p-4 relative">
        {/* Top row: rank + name + compare button */}
        <div className="flex items-start justify-between mb-3 pr-16">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-primary-400 uppercase tracking-widest">#{rank}</span>
              {metro.population && (
                <span className="text-[10px] text-[#6B6B7E] font-mono">
                  · {(metro.population / 1_000_000).toFixed(1)}M pop
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-lg text-white leading-tight">{metro.name}</h3>
            <p className="text-sm text-[#6B6B7E]">{metro.state}</p>
          </div>

          {onToggleSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled || isSelected) onToggleSelect(metro);
              }}
              disabled={isDisabled && !isSelected}
              title={isDisabled && !isSelected ? 'Max 4 cities for comparison' : ''}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-primary-400 text-[#0C0C14] font-bold'
                  : isDisabled
                  ? 'bg-[#1E1E2A] text-[#3D3D52] cursor-not-allowed'
                  : 'bg-[#16161F] text-[#6B6B7E] hover:text-white hover:bg-[#1E1E2A] border border-[#1E1E2A]'
              }`}
            >
              {isSelected ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Compare
                </>
              )}
            </button>
          )}
        </div>

        {/* Score bar */}
        <ScoreBar score={metro.score} className="mb-3" />

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#0C0C14] px-3 py-2 rounded border border-[#1E1E2A]">
            <div className="text-[9px] uppercase tracking-widest text-[#6B6B7E] mb-1">Rent/mo</div>
            <div className="font-mono font-semibold text-sm text-white">{formatCurrency(metro.essentials.rent)}</div>
          </div>
          <div className="bg-[#0C0C14] px-3 py-2 rounded border border-[#1E1E2A]">
            <div className="text-[9px] uppercase tracking-widest text-[#6B6B7E] mb-1">Disc. income</div>
            <div className="font-mono font-semibold text-sm text-primary-400">{formatCurrency(metro.discretionary_income)}</div>
          </div>
          <div className="bg-[#0C0C14] px-3 py-2 rounded border border-[#1E1E2A]">
            <div className="text-[9px] uppercase tracking-widest text-[#6B6B7E] mb-1">Cost index</div>
            <div className="font-mono font-semibold text-sm text-white">{metro.rpp_index.toFixed(2)}</div>
          </div>
        </div>

        {/* QoL badges */}
        {metro.quality_of_life && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {metro.quality_of_life.weather_score != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#16161F] border border-[#1E1E2A] rounded text-[10px] text-[#6B6B7E]">
                ☀ <span className="font-mono">{metro.quality_of_life.weather_score.toFixed(0)}</span>
              </span>
            )}
            {metro.quality_of_life.air_quality_index != null && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-[#16161F] border rounded text-[10px] font-mono ${
                metro.quality_of_life.air_quality_index <= 50 ? 'border-primary-900 text-primary-400' :
                metro.quality_of_life.air_quality_index <= 100 ? 'border-yellow-900 text-yellow-500' : 'border-orange-900 text-orange-400'
              }`}>
                AQI {metro.quality_of_life.air_quality_index.toFixed(0)}
              </span>
            )}
            {metro.quality_of_life.walkability_score != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#16161F] border border-[#1E1E2A] rounded text-[10px] text-[#6B6B7E]">
                Walk <span className="font-mono">{metro.quality_of_life.walkability_score.toFixed(0)}</span>
              </span>
            )}
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[11px] text-[#6B6B7E] hover:text-primary-400 transition-colors font-mono"
        >
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? 'less' : 'breakdown'}
        </button>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#1E1E2A] space-y-4">
            {/* QoL detail */}
            {metro.quality_of_life && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#6B6B7E] mb-2">Quality of life</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {metro.quality_of_life.weather_score != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B6B7E]">Weather</span>
                      <span className="font-mono text-white">{metro.quality_of_life.weather_score.toFixed(0)}/100</span>
                    </div>
                  )}
                  {metro.quality_of_life.air_quality_index != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B6B7E]">Air quality</span>
                      <span className="font-mono text-white">{metro.quality_of_life.air_quality_index.toFixed(0)} AQI</span>
                    </div>
                  )}
                  {metro.quality_of_life.school_score != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B6B7E]">Schools</span>
                      <span className="font-mono text-white">{metro.quality_of_life.school_score.toFixed(0)}/100</span>
                    </div>
                  )}
                  {metro.quality_of_life.crime_rate != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B6B7E]">Crime rate</span>
                      <span className="font-mono text-white">{metro.quality_of_life.crime_rate.toFixed(0)}/100k</span>
                    </div>
                  )}
                  {metro.quality_of_life.healthcare_score != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B6B7E]">Healthcare</span>
                      <span className="font-mono text-white">{metro.quality_of_life.healthcare_score.toFixed(0)}/100</span>
                    </div>
                  )}
                  {metro.quality_of_life.walkability_score != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B6B7E]">Walkability</span>
                      <span className="font-mono text-white">{metro.quality_of_life.walkability_score.toFixed(0)}/100</span>
                    </div>
                  )}
                  {metro.quality_of_life.commute_time_mins != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B6B7E]">Commute</span>
                      <span className="font-mono text-white">{metro.quality_of_life.commute_time_mins.toFixed(0)} min</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cost breakdown */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#6B6B7E] mb-2">Monthly costs</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Rent', value: metro.essentials.rent },
                  { label: 'Utilities', value: metro.essentials.utilities },
                  { label: 'Groceries', value: metro.essentials.groceries },
                  { label: 'Transport', value: metro.essentials.transport },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-[#6B6B7E]">{label}</span>
                    <span className="font-mono text-white">{formatCurrency(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs pt-1.5 border-t border-[#1E1E2A]">
                  <span className="text-white font-medium">Total</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(totalEssentials)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6B7E]">Adjusted income</span>
                  <span className="font-mono text-[#6B6B7E]">{formatCurrency(metro.net_monthly_adjusted)}/mo</span>
                </div>
              </div>
            </div>

            {/* Signals */}
            <div className="flex flex-wrap gap-1.5">
              {metro.discretionary_income > 2000 && (
                <span className="text-[10px] px-2 py-0.5 bg-primary-900/30 text-primary-400 border border-primary-900 rounded font-mono">
                  high discretionary
                </span>
              )}
              {metro.rpp_index < 1.0 && (
                <span className="text-[10px] px-2 py-0.5 bg-primary-900/30 text-primary-400 border border-primary-900 rounded font-mono">
                  below avg cost
                </span>
              )}
              {metro.rpp_index > 1.1 && (
                <span className="text-[10px] px-2 py-0.5 bg-orange-900/20 text-orange-400 border border-orange-900 rounded font-mono">
                  above avg cost
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
