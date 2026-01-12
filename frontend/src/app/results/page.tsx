'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, Suspense } from 'react';
import React from 'react';
import { rankMetros } from '@/lib/api';
import type { Metro, SortField, SortDirection, RankRequest } from '@/types';
import { CityCard } from '@/components/CityCard';
import { MapView } from '@/components/MapView';
import { CompareBar } from '@/components/CompareBar';
import Link from 'next/link';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [hoveredMetro, setHoveredMetro] = useState<Metro | null>(null);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [selectedMetros, setSelectedMetros] = useState<Metro[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleToggleSelect = (metro: Metro) => {
    setSelectedMetros(prev => {
      const isSelected = prev.some(m => m.metro_id === metro.metro_id);
      if (isSelected) {
        return prev.filter(m => m.metro_id !== metro.metro_id);
      } else {
        // Max 4 cities
        if (prev.length >= 4) {
          // Visual feedback: shake the compare bar or show a toast
          // For now, just prevent selection
          return prev;
        }
        return [...prev, metro];
      }
    });
  };

  const handleRemoveFromCompare = (metroId: number) => {
    setSelectedMetros(prev => prev.filter(m => m.metro_id !== metroId));
  };

  const handleClearCompare = () => {
    setSelectedMetros([]);
  };

  // Isolate scroll events between city list and page
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      // CANCEL any ongoing scroll animation on the page
      const currentScrollY = window.scrollY;
      window.scrollTo(0, currentScrollY);

      // Hide page scrollbar
      document.documentElement.style.overflow = 'hidden';
    };

    const handleMouseLeave = () => {
      // Show page scrollbar again
      document.documentElement.style.overflow = '';
    };

    const handleWheel = (e: WheelEvent) => {
      // Prevent page scroll entirely when cursor is over city list
      e.preventDefault();
      e.stopPropagation();

      // Manually scroll the container
      container.scrollTop += e.deltaY;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('wheel', handleWheel);
      // Clean up
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Parse request from URL params
  const request: RankRequest = {
    salary: parseInt(searchParams.get('salary') || '90000'),
    family_size: parseInt(searchParams.get('family_size') || '1'),
    rent_cap_pct: parseFloat(searchParams.get('rent_cap_pct') || '0.3'),
    population_min: parseInt(searchParams.get('population_min') || '0'),
    limit: parseInt(searchParams.get('limit') || '50'),
    transport_mode: (searchParams.get('transport_mode') || 'public_transit') as 'public_transit' | 'car' | 'bike_walk',
    affordability_weight: parseInt(searchParams.get('affordability_weight') || '10'),
    schools_weight: parseInt(searchParams.get('schools_weight') || '0'),
    safety_weight: parseInt(searchParams.get('safety_weight') || '0'),
    weather_weight: parseInt(searchParams.get('weather_weight') || '0'),
    healthcare_weight: parseInt(searchParams.get('healthcare_weight') || '0'),
    walkability_weight: parseInt(searchParams.get('walkability_weight') || '0'),
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
            href="/search"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen" style={{ scrollBehavior: 'auto' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Top {sortedMetros.length} U.S. cities
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-600 dark:text-gray-400">
                  Ranked for ${request.salary.toLocaleString()}/year salary
                  {request.family_size > 1 && ` · ${request.family_size} people`}
                </p>
                {data?._responseTime !== undefined && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    data._responseTime < 100
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : data._responseTime < 500
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                  }`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {data._responseTime}ms
                    {data._responseTime < 100 && ' (cached)'}
                  </span>
                )}
              </div>
            </div>
            <Link
              href="/search"
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
              { field: 'rent' as SortField, label: 'Rent' },
              { field: 'rpp_index' as SortField, label: 'Cost of Living' },
            ].map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation ${
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
          </div>

          {/* Mobile Tab Switcher */}
          <div className="md:hidden mt-4 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl inline-flex w-full animate-in fade-in slide-in-from-top-2 duration-500 delay-150">
            <button
              onClick={() => setMobileView('list')}
              className={`flex-1 px-4 py-3 min-h-[48px] rounded-lg text-sm font-medium transition-all touch-manipulation ${
                mobileView === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </span>
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`flex-1 px-4 py-3 min-h-[48px] rounded-lg text-sm font-medium transition-all touch-manipulation ${
                mobileView === 'map'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </span>
            </button>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City Cards List */}
          <div
            ref={scrollContainerRef}
            className={`space-y-4 custom-scrollbar overflow-y-auto overflow-x-hidden ${
              mobileView === 'list' ? 'block' : 'hidden'
            } md:block`}
            style={{ maxHeight: 'calc(100vh - 250px)', overscrollBehavior: 'contain' }}
          >
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
                  isSelected={selectedMetros.some(m => m.metro_id === metro.metro_id)}
                  onToggleSelect={handleToggleSelect}
                  isDisabled={selectedMetros.length >= 4 && !selectedMetros.some(m => m.metro_id === metro.metro_id)}
                />
              </div>
            ))}
          </div>

          {/* Map */}
          <div
            className={`sticky top-4 animate-in fade-in slide-in-from-right-4 duration-700 ${
              mobileView === 'map' ? 'block' : 'hidden'
            } md:block`}
            style={{ height: 'calc(100vh - 250px)' }}
          >
            <MapView metros={sortedMetros} hoveredMetro={hoveredMetro} />
          </div>
        </div>
      </div>

      {/* Comparison Bar */}
      <CompareBar
        selectedMetros={selectedMetros}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
      />
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
