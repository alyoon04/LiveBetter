'use client';

import { useEffect, useState } from 'react';

interface Pin {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  isTop: boolean;
}

export function AnimatedMapBackground() {
  const [mounted, setMounted] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);

  useEffect(() => {
    setMounted(true);

    // Generate pin positions
    const generatedPins: Pin[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (i * 17.3) % 90 + 5, // Spread across width
      y: (i * 23.7) % 80 + 10, // Spread across height
      size: i < 5 ? 1.2 : 0.8, // First 5 are larger (top cities)
      delay: i * 0.15,
      duration: 2 + (i * 0.3) % 2,
      isTop: i < 5, // Mark top 5 cities
    }));

    setPins(generatedPins);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Gradient for top city pins */}
          <linearGradient id="topPinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
          </linearGradient>

          {/* Gradient for regular pins */}
          <linearGradient id="regularPinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6b7280" stopOpacity="0.8" />
          </linearGradient>

          {/* Glow filter for top pins */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Map pins */}
        {pins.map((pin) => (
          <g key={pin.id} opacity="0" style={{
            animation: `fadeInPin 0.6s ease-out ${pin.delay}s forwards`,
          }}>
            {/* Pulsing circle for top cities */}
            {pin.isTop && (
              <circle
                cx={pin.x}
                cy={pin.y}
                r="0"
                fill="none"
                stroke="#ef4444"
                strokeWidth="0.15"
                opacity="0.6"
                style={{
                  animation: `pulsePing ${pin.duration}s ease-in-out infinite`,
                  animationDelay: `${pin.delay}s`,
                }}
              />
            )}

            {/* Pin shadow */}
            <ellipse
              cx={pin.x}
              cy={pin.y + pin.size * 3.2}
              rx={pin.size * 0.8}
              ry={pin.size * 0.3}
              fill="rgba(0,0,0,0.2)"
              opacity="0.4"
            />

            {/* Pin body */}
            <g filter={pin.isTop ? 'url(#glow)' : 'none'}>
              {/* Pin circle top */}
              <circle
                cx={pin.x}
                cy={pin.y}
                r={pin.size * 1.5}
                fill={pin.isTop ? 'url(#topPinGradient)' : 'url(#regularPinGradient)'}
                stroke="white"
                strokeWidth="0.2"
              />

              {/* Pin point */}
              <path
                d={`M ${pin.x} ${pin.y + pin.size * 1.2}
                    L ${pin.x - pin.size * 0.8} ${pin.y + pin.size * 3}
                    L ${pin.x + pin.size * 0.8} ${pin.y + pin.size * 3} Z`}
                fill={pin.isTop ? 'url(#topPinGradient)' : 'url(#regularPinGradient)'}
                stroke="white"
                strokeWidth="0.15"
              />

              {/* Inner dot */}
              <circle
                cx={pin.x}
                cy={pin.y}
                r={pin.size * 0.6}
                fill="white"
                opacity="0.9"
              />

              {/* Ranking number for top cities */}
              {pin.isTop && (
                <text
                  x={pin.x}
                  y={pin.y + pin.size * 0.4}
                  fontSize={pin.size * 1.2}
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {pin.id + 1}
                </text>
              )}
            </g>

            {/* Subtle bounce animation */}
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0,0; 0,${-pin.size * 0.3}; 0,0`}
              dur={`${pin.duration}s`}
              begin={`${pin.delay}s`}
              repeatCount="indefinite"
            />
          </g>
        ))}
      </svg>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-gray-950/50 pointer-events-none" />

      <style jsx>{`
        @keyframes fadeInPin {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulsePing {
          0%, 100% {
            r: 0;
            opacity: 0.6;
          }
          50% {
            r: 3;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
