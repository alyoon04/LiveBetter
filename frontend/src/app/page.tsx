'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { TypingAnimation } from '@/components/TypingAnimation';

// One-shot IntersectionObserver reveal — fires once when element enters viewport
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

// Wraps children with a reveal animation triggered on scroll
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
    left:   'opacity-0 -translate-x-10',
    right:  'opacity-0 translate-x-10',
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
    <div className="min-h-[calc(100vh-120px)]">

      {/* Hero */}
      <div className="relative overflow-hidden min-h-[calc(100vh-120px)] flex items-center">
        <div className="blob-teal" style={{ top: '-10%', left: '-5%' }} />
        <div className="blob-violet" style={{ bottom: '-10%', right: '-5%' }} />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0C0C14] to-transparent" />

        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <div className="fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-900 bg-primary-900/20 text-primary-400 text-xs font-mono mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            Free · No account required · Real data
          </div>

          <h1 className="fade-up fade-up-delay-1 font-display font-bold text-white leading-[1.05] tracking-tight mb-6">
            <span className="block text-5xl md:text-7xl lg:text-8xl mb-3">
              <TypingAnimation text="Find where your" speed={40} />
            </span>
            <span className="block text-5xl md:text-7xl lg:text-8xl text-primary-400">
              <TypingAnimation text="money goes further" speed={40} delay={800} />
            </span>
          </h1>

          <p className="fade-up fade-up-delay-2 text-lg md:text-xl text-[#6B6B7E] max-w-2xl mx-auto mb-10 leading-relaxed">
            Rank every U.S. metro by what you'll actually have left after rent, food,
            and getting around — based on your salary, household size, and lifestyle.
          </p>

          <div className="fade-up fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-400 hover:bg-primary-300 text-[#0C0C14] font-display font-bold text-lg rounded transition-colors shadow-glow"
            >
              Get started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/methodology" className="text-sm text-[#6B6B7E] hover:text-white transition-colors font-mono">
              How it works →
            </Link>
          </div>
        </div>
      </div>

      {/* City photo strip */}
      <div className="fade-up fade-up-delay-4 container mx-auto px-6 -mt-6 mb-0 relative z-10">
        <div className="flex gap-2 h-52">
          {['/city1.jpg', '/city2.jpg', '/city3.jpg'].map((src, i) => (
            <div key={i} className="relative flex-1 overflow-hidden rounded">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#0C0C14]/40" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0C0C14] to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-[#1E1E2A] bg-[#111118]">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {STATS.map(({ value, label }, i) => (
              <Reveal key={label} from="bottom" delay={i * 80}>
                <div className="font-display font-bold text-2xl text-white mb-1">{value}</div>
                <div className="text-xs text-[#6B6B7E] font-mono">{label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <Reveal from="bottom" className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
              Why LiveBetter?
            </h2>
            <p className="text-[#6B6B7E]">Data-driven, transparent, personalized.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map(({ icon, title, body }, i) => (
              <Reveal
                key={title}
                from={i % 2 === 0 ? 'left' : 'right'}
                delay={i * 100}
              >
                <div className="bg-[#111118] border border-[#1E1E2A] rounded p-6 group hover:border-primary-900 transition-colors h-full">
                  <div className="inline-flex items-center justify-center w-9 h-9 bg-[#16161F] border border-[#1E1E2A] rounded text-primary-400 mb-4 group-hover:border-primary-900 transition-colors">
                    {icon}
                  </div>
                  <h3 className="font-display font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-[#6B6B7E] leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-[#1E1E2A]">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto">
            <Reveal from="bottom" className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl text-white">How it works</h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map(({ n, title, body }, i) => (
                <Reveal key={n} from="left" delay={i * 150}>
                  <div className="text-left">
                    <div className="font-display font-black text-5xl text-[#1E1E2A] mb-3 leading-none">{n}</div>
                    <h4 className="font-display font-bold text-white mb-2">{title}</h4>
                    <p className="text-sm text-[#6B6B7E]">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal from="bottom" delay={300} className="text-center mt-14">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-400 hover:bg-primary-300 text-[#0C0C14] font-display font-bold rounded transition-colors"
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
  );
}
