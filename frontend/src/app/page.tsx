'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

// FadeIn component
function FadeIn({
  children,
  delay = 0,
  duration = 1000,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

// AnimatedHeading component
function AnimatedHeading({
  text,
  initialDelay = 200,
  charDelay = 30,
}: {
  text: string;
  initialDelay?: number;
  charDelay?: number;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), initialDelay);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, lineIndex) => {
        const lineLength = line.length;
        return (
          <span key={lineIndex} className="block">
            {line.split('').map((char, charIndex) => {
              const delay = (lineIndex * lines[0].length * charDelay) + (charIndex * charDelay);
              return (
                <span
                  key={`${lineIndex}-${charIndex}`}
                  className="inline-block transition-all duration-500"
                  style={{
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'translateX(0)' : 'translateX(-18px)',
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
}

// One-shot IntersectionObserver reveal
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

function Reveal({
  children,
  from = 'bottom',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  from?: 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}) {
  const [ref, inView] = useInView();

  const base = 'transition-all duration-700 ease-out';
  const hidden = {
    bottom: 'opacity-0 translate-y-6',
    left: 'opacity-0 -translate-x-10',
    right: 'opacity-0 translate-x-10',
  }[from];
  const visible = 'opacity-100 translate-y-0 translate-x-0';

  return (
    <div
      ref={ref}
      className={`${base} ${inView ? visible : hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Real market data',
    body: 'Median rent from Zillow, regional price parities from the BEA, and population from the Census Bureau — not estimates.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Transparent breakdown',
    body: "See exactly how your money is split — rent, utilities, groceries, transport — and what's left over each month.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Transportation modes',
    body: 'Car, public transit, or bike/walk — costs and rankings adjust for your actual commute lifestyle.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Quality of life factors',
    body: 'Weight what matters to you — weather, schools, safety, healthcare, walkability, air quality — to get your own ranking.',
  },
];

const STEPS = [
  { n: '01', title: 'Enter your details', body: 'Salary, household size, and how you get around.' },
  { n: '02', title: 'Get ranked results', body: 'Every U.S. metro ranked by discretionary income.' },
  { n: '03', title: 'Explore & compare', body: 'Interactive map, side-by-side comparisons, detailed breakdowns.' },
];

const STATS = [
  { value: '300+', label: 'Metro areas ranked' },
  { value: 'Zillow', label: 'Real rent data source' },
  { value: 'BEA', label: 'Cost-of-living index' },
];

export default function Home() {
  return (
    <div className="bg-black text-white">
      {/* Hero Section - Full viewport */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
            type="video/mp4"
          />
        </video>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
            <div className="lg:grid lg:grid-cols-2 lg:items-end">
              {/* Left Column */}
              <div>
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  <AnimatedHeading text={"Find where your\nmoney goes further."} />
                </h1>

                <FadeIn delay={800} duration={1000}>
                  <p className="text-base md:text-lg text-gray-300 mb-5">
                    Rank every U.S. metro by what you'll actually have left after rent, food, and getting around.
                  </p>
                </FadeIn>

                <FadeIn delay={1200} duration={1000}>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/search"
                      className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/methodology"
                      className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors"
                    >
                      Explore Now
                    </Link>
                  </div>
                </FadeIn>
              </div>

              {/* Right Column */}
              <FadeIn delay={1400} duration={1000} className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                  <span className="text-lg md:text-xl lg:text-2xl font-light">
                    Search. Compare. Decide.
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>

      {/* Below-the-fold content */}
      <div className="bg-black text-white">
        {/* Stats bar */}
        <div className="border-y border-white/10 bg-white/[0.02]">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
              {STATS.map(({ value, label }, i) => (
                <Reveal key={label} from="bottom" delay={i * 80}>
                  <div className="font-semibold text-2xl text-white mb-1">{value}</div>
                  <div className="text-xs text-gray-500 font-mono">{label}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <Reveal from="bottom" className="text-center mb-14">
              <h2 className="font-semibold text-3xl md:text-4xl text-white mb-3">
                Why LiveBetter?
              </h2>
              <p className="text-gray-400">Data-driven, transparent, personalized.</p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES.map(({ icon, title, body }, i) => (
                <Reveal
                  key={title}
                  from={i % 2 === 0 ? 'left' : 'right'}
                  delay={i * 100}
                >
                  <div className="bg-white/[0.03] border border-white/10 rounded p-6 group hover:border-white/20 transition-colors h-full">
                    <div className="inline-flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded text-white mb-4 group-hover:border-white/20 transition-colors">
                      {icon}
                    </div>
                    <h3 className="font-semibold text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-3xl mx-auto">
              <Reveal from="bottom" className="text-center mb-12">
                <h2 className="font-semibold text-3xl text-white">How it works</h2>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {STEPS.map(({ n, title, body }, i) => (
                  <Reveal key={n} from="left" delay={i * 150}>
                    <div className="text-left">
                      <div className="font-black text-5xl text-white/[0.06] mb-3 leading-none">{n}</div>
                      <h4 className="font-semibold text-white mb-2">{title}</h4>
                      <p className="text-sm text-gray-400">{body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal from="bottom" delay={300} className="text-center mt-14">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-200 text-black font-medium rounded transition-colors"
                >
                  Start ranking
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
