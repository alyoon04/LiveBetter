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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-primary-600 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {selectedMetros.length}/4 Selected
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedMetros.length < 2 ? 'Select at least 2 cities' : 'Ready to compare'}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-1 pl-4 border-l border-gray-200 dark:border-gray-700">
              {selectedMetros.map((metro) => (
                <div
                  key={metro.metro_id}
                  className="group relative inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium whitespace-nowrap hover:shadow-md transition-all border border-primary-200 dark:border-primary-700"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{metro.name}, {metro.state}</span>
                    <span className="text-xs opacity-75">
                      {formatCurrency(metro.essentials.rent)}/mo · Score: {metro.score.toFixed(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(metro.metro_id)}
                    className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors hover:scale-110"
                    aria-label={`Remove ${metro.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
            {selectedMetros.length >= 2 && (
              <Link
                href={`/compare?data=${encodeURIComponent(JSON.stringify(selectedMetros))}`}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare Cities ({selectedMetros.length})
              </Link>
            )}
          </div>
        </div>
        {selectedMetros.length === 1 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Select at least one more city to enable comparison (max 4 total)</span>
          </div>
        )}
        {selectedMetros.length === 4 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Maximum cities selected. Remove one to select a different city.</span>
          </div>
        )}
      </div>
    </div>
  );
}
