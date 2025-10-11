'use client';

import { useEffect, useRef } from 'react';
import type { Metro } from '@/types';

// Dynamic imports for Leaflet (client-side only)
let L: any;
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

interface MapViewProps {
  metros: Metro[];
  hoveredMetro: Metro | null;
}

export function MapView({ metros, hoveredMetro }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined' || !L) return;

    // Initialize map only once
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [39.8283, -98.5795], // Center of US
        zoom: 4,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add markers for each metro
    metros.forEach((metro) => {
      const score = metro.score;

      // Determine color based on score
      const getColor = (score: number) => {
        if (score >= 0.8) return '#10B981'; // green
        if (score >= 0.6) return '#84CC16'; // lime
        if (score >= 0.4) return '#FBBF24'; // yellow
        if (score >= 0.2) return '#FB923C'; // orange
        return '#EF4444'; // red
      };

      const color = getColor(score);

      // Create custom icon
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: all 0.2s;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([metro.coords.lat, metro.coords.lon], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<div style="font-family: Inter, sans-serif;">
            <strong>${metro.name}, ${metro.state}</strong><br/>
            <span style="font-family: 'IBM Plex Mono', monospace;">
              Affordability: ${Math.round(score * 100)}%
            </span><br/>
            <span style="font-family: 'IBM Plex Mono', monospace;">
              DI: $${Math.round(metro.discretionary_income).toLocaleString()}/mo
            </span>
          </div>`
        );

      markersRef.current.set(metro.metro_id, marker);
    });
  }, [metros]);

  // Handle hovered metro
  useEffect(() => {
    if (!hoveredMetro) return;

    const marker = markersRef.current.get(hoveredMetro.metro_id);
    if (marker && mapInstanceRef.current) {
      marker.openPopup();
      mapInstanceRef.current.setView([hoveredMetro.coords.lat, hoveredMetro.coords.lon], 7, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [hoveredMetro]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-card bg-gray-100 dark:bg-gray-800">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
