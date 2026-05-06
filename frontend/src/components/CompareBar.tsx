'use client';

import { Metro } from '@/types';
import Link from 'next/link';

interface CompareBarProps {
  selectedMetros: Metro[];
  onRemove: (metroId: number) => void;
  onClear: () => void;
}

export function CompareBar({ selectedMetros, onRemove, onClear }: CompareBarProps) {
  if (selectedMetros.length === 0) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 shadow-2xl z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 overflow-x-auto">
            <div className="whitespace-nowrap">
              <span className="text-xs font-mono text-gray-400">
                {selectedMetros.length}/4
              </span>
              <span className="ml-2 text-xs text-gray-400">
                {selectedMetros.length < 2 ? '— select 1 more' : '— ready'}
              </span>
            </div>

            <div className="flex gap-2">
              {selectedMetros.map((metro) => (
                <div
                  key={metro.metro_id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm"
                >
                  <div>
                    <span className="font-medium text-white text-xs">{metro.name}, {metro.state}</span>
                    <span className="ml-2 font-mono text-[10px] text-gray-400">
                      {formatCurrency(metro.essentials.rent)}/mo
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(metro.metro_id)}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={`Remove ${metro.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Clear
            </button>
            {selectedMetros.length >= 2 && (
              <Link
                href={`/compare?data=${encodeURIComponent(JSON.stringify(selectedMetros))}`}
                className="px-5 py-2 bg-white text-black rounded font-medium text-sm transition-colors hover:bg-gray-200 whitespace-nowrap"
              >
                Compare {selectedMetros.length} cities
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
