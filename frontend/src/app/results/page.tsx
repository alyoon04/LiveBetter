'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, Suspense } from 'react';
import { rankMetros } from '@/lib/api';
import type { Metro, SortField, SortDirection, RankRequest } from '@/types';
import { CityCard } from '@/components/CityCard';
import { MapView } from '@/components/MapView';
import Link from 'next/link';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [hoveredMetro, setHoveredMetro] = useState<Metro | null>(null);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showMap, setShowMap] = useState(true);

  // Parse request from URL params
  const request: RankRequest = {
    salary: parseInt(searchParams.get('salary') || '90000'),
    family_size: parseInt(searchParams.get('family_size') || '1'),
    rent_cap_pct: parseFloat(searchParams.get('rent_cap_pct') || '0.3'),
    population_min: parseInt(searchParams.get('population_min') || '0'),
    limit: parseInt(searchParams.get('limit') || '50'),
    transport_mode: (searchParams.get('transport_mode') || 'public_transit') as 'public_transit' | 'car' | 'bike_walk',
    affordability_weight: 10,
    schools_weight: 0,
    safety_weight: 0,
    weather_weight: 0,
    healthcare_weight: 0,
    walkability_weight: 0,
  };

  // Fetch rankings
  const { data, isLoading, error } = useQuery({
    queryKey: ['rankings', request],
    queryFn: () => rankMetros(request),
  });

  // Sort metros
  const sortedMetros = useMemo(() => {
    if (!data?.results) return [];

    const sorted = [...data.results];
    sorted.sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortField) {
        case 'score':
          aVal = a.score;
          bVal = b.score;
          break;
        case 'discretionary_income':
          aVal = a.discretionary_income;
          bVal = b.discretionary_income;
          break;
        case 'rent':
          aVal = a.essentials.rent;
          bVal = b.essentials.rent;
          break;
        case 'rpp_index':
          aVal = a.rpp_index;
          bVal = b.rpp_index;
          break;
        default:
          aVal = a.score;
          bVal = b.score;
      }

      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return sorted;
  }, [data, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rent' || field === 'rpp_index' ? 'asc' : 'desc');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-primary-400 opacity-20"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-primary-600"></div>
          </div>
          <div className="space-y-2 animate-in fade-in duration-700">
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Finding the best cities for you</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing cost of living data...</p>
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : 'Failed to fetch results'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Top {sortedMetros.length} U.S. cities
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Ranked for ${request.salary.toLocaleString()}/year salary
                {request.family_size > 1 && ` · ${request.family_size} people`}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-105 text-gray-700 dark:text-gray-300"
            >
              Refine Search
            </Link>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500 delay-100">
            <span className="text-sm text-gray-600 dark:text-gray-400 py-2">Sort by:</span>
            {[
              { field: 'score' as SortField, label: 'Affordability' },
              { field: 'discretionary_income' as SortField, label: 'Discretionary Income' },
              { field: 'rent' as SortField, label: 'Rent' },
              { field: 'rpp_index' as SortField, label: 'Cost of Living' },
            ].map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                  sortField === field
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {label}
                {sortField === field && (
                  <span className="ml-1 inline-block transition-transform">{sortDirection === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setShowMap(!showMap)}
              className="md:hidden px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105"
            >
              {showMap ? 'Hide' : 'Show'} Map
            </button>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City Cards List */}
          <div className="space-y-4 custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {sortedMetros.map((metro, idx) => (
              <div
                key={metro.metro_id}
                className="animate-in fade-in slide-in-from-left-4 duration-500"
                style={{
                  animationDelay: `${Math.min(idx * 50, 1000)}ms`,
                  animationFillMode: 'backwards'
                }}
              >
                <CityCard
                  metro={metro}
                  rank={idx + 1}
                  onHover={setHoveredMetro}
                />
              </div>
            ))}
          </div>

          {/* Map */}
          <div
            className={`${showMap ? 'block' : 'hidden'} md:block sticky top-4 animate-in fade-in slide-in-from-right-4 duration-700`}
            style={{ height: 'calc(100vh - 250px)' }}
          >
            <MapView metros={sortedMetros} hoveredMetro={hoveredMetro} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-primary-400 opacity-20"></div>
              <div className="relative animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-primary-600"></div>
            </div>
            <div className="space-y-2 animate-in fade-in duration-700">
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading results</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Please wait...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
