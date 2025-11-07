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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-primary-600 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Compare ({selectedMetros.length})
            </span>
            <div className="flex gap-2 flex-1">
              {selectedMetros.map((metro) => (
                <div
                  key={metro.metro_id}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium whitespace-nowrap"
                >
                  <span>{metro.name}, {metro.state}</span>
                  <button
                    onClick={() => onRemove(metro.metro_id)}
                    className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
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
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Compare Cities
              </Link>
            )}
          </div>
        </div>
        {selectedMetros.length < 2 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Select at least 2 cities to compare (max 4)
          </p>
        )}
      </div>
    </div>
  );
}
