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
      if (isSelected) return prev.filter(m => m.metro_id !== metro.metro_id);
      if (prev.length >= 4) return prev;
      return [...prev, metro];
    });
  };

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleMouseEnter = () => {
      const currentScrollY = window.scrollY;
      window.scrollTo(0, currentScrollY);
      document.documentElement.style.overflow = 'hidden';
    };
    const handleMouseLeave = () => { document.documentElement.style.overflow = ''; };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.scrollTop += e.deltaY;
    };
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('wheel', handleWheel);
      document.documentElement.style.overflow = '';
    };
  }, []);

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['rankings', request],
    queryFn: () => rankMetros(request),
  });

  const sortedMetros = useMemo(() => {
    if (!data?.results) return [];
    const sorted = [...data.results];
    sorted.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortField) {
        case 'score': aVal = a.score; bVal = b.score; break;
        case 'discretionary_income': aVal = a.discretionary_income; bVal = b.discretionary_income; break;
        case 'rent': aVal = a.essentials.rent; bVal = b.essentials.rent; break;
        case 'rpp_index': aVal = a.rpp_index; bVal = b.rpp_index; break;
        default: aVal = a.score; bVal = b.score;
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
      <div className="min-h-screen flex items-center justify-center bg-[#0C0C14]">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-primary-400 opacity-20" />
            <div className="relative animate-spin rounded-full h-12 w-12 border-t border-b border-primary-400" />
          </div>
          <p className="font-display font-bold text-white mb-1">Ranking cities</p>
          <p className="text-sm font-mono text-[#6B6B7E]">Analyzing cost of living data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0C14]">
        <div className="text-center max-w-md">
          <h2 className="font-display font-bold text-2xl text-white mb-2">Something went wrong</h2>
          <p className="text-[#6B6B7E] text-sm mb-6 font-mono">
            {error instanceof Error ? error.message : 'Failed to fetch results'}
          </p>
          <Link href="/search" className="inline-block px-6 py-3 bg-primary-400 hover:bg-primary-300 text-[#0C0C14] font-display font-bold rounded transition-colors">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  const SORT_OPTIONS: { field: SortField; label: string }[] = [
    { field: 'score', label: 'Score' },
    { field: 'rent', label: 'Rent' },
    { field: 'rpp_index', label: 'Cost index' },
  ];

  return (
    <div className="bg-[#0C0C14] min-h-screen" style={{ scrollBehavior: 'auto' }}>
      <div className="container mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-display font-bold text-2xl text-white">
                {sortedMetros.length} cities ranked
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-sm text-[#6B6B7E] font-mono">
                  ${request.salary.toLocaleString()}/yr
                  {request.family_size > 1 && ` · ${request.family_size} people`}
                  {' · '}{request.transport_mode === 'public_transit' ? 'transit' : request.transport_mode === 'car' ? 'car' : 'bike/walk'}
                </p>
                {data?._responseTime !== undefined && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    data._responseTime < 100
                      ? 'border-primary-900 text-primary-400'
                      : 'border-[#1E1E2A] text-[#6B6B7E]'
                  }`}>
                    {data._responseTime}ms{data._responseTime < 100 ? ' cached' : ''}
                  </span>
                )}
              </div>
            </div>
            <Link
              href="/search"
              className="px-4 py-2 border border-[#1E1E2A] rounded text-sm text-[#6B6B7E] hover:text-white hover:border-[#6B6B7E] transition-colors font-mono"
            >
              Refine
            </Link>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#6B6B7E]">Sort:</span>
            {SORT_OPTIONS.map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                  sortField === field
                    ? 'bg-primary-400 text-[#0C0C14] font-bold'
                    : 'bg-[#111118] border border-[#1E1E2A] text-[#6B6B7E] hover:text-white hover:border-[#6B6B7E]'
                }`}
              >
                {label}
                {sortField === field && (
                  <span className="ml-1">{sortDirection === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile tab switcher */}
          <div className="md:hidden mt-3 flex bg-[#111118] border border-[#1E1E2A] rounded overflow-hidden">
            {(['list', 'map'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setMobileView(view)}
                className={`flex-1 py-2.5 text-sm font-display font-medium transition-colors capitalize ${
                  mobileView === view ? 'bg-primary-400 text-[#0C0C14]' : 'text-[#6B6B7E]'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City list */}
          <div
            ref={scrollContainerRef}
            className={`space-y-2 custom-scrollbar overflow-y-auto overflow-x-hidden ${
              mobileView === 'list' ? 'block' : 'hidden'
            } md:block`}
            style={{ maxHeight: 'calc(100vh - 220px)', overscrollBehavior: 'contain' }}
          >
            {sortedMetros.map((metro, idx) => (
              <CityCard
                key={metro.metro_id}
                metro={metro}
                rank={idx + 1}
                onHover={setHoveredMetro}
                isSelected={selectedMetros.some(m => m.metro_id === metro.metro_id)}
                onToggleSelect={handleToggleSelect}
                isDisabled={selectedMetros.length >= 4 && !selectedMetros.some(m => m.metro_id === metro.metro_id)}
              />
            ))}
          </div>

          {/* Map */}
          <div
            className={`sticky top-4 ${mobileView === 'map' ? 'block' : 'hidden'} md:block`}
            style={{ height: 'calc(100vh - 220px)' }}
          >
            <MapView metros={sortedMetros} hoveredMetro={hoveredMetro} />
          </div>
        </div>
      </div>

      <CompareBar
        selectedMetros={selectedMetros}
        onRemove={(id) => setSelectedMetros(prev => prev.filter(m => m.metro_id !== id))}
        onClear={() => setSelectedMetros([])}
      />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0C0C14]">
          <div className="animate-spin rounded-full h-10 w-10 border-t border-b border-primary-400" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
