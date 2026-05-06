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

// 3D animated objects for each feature
function FloatingBarChart() {
  return (
    <div className="scene-3d">
      <div className="animate-float-rotate">
        <div className="flex items-end gap-1 h-16">
          <div className="w-3 bg-gradient-to-t from-white/20 to-white/60 rounded-sm animate-bar-1" />
          <div className="w-3 bg-gradient-to-t from-white/20 to-white/80 rounded-sm animate-bar-2" />
          <div className="w-3 bg-gradient-to-t from-white/20 to-white/50 rounded-sm animate-bar-3" />
          <div className="w-3 bg-gradient-to-t from-white/20 to-white/90 rounded-sm animate-bar-4" />
        </div>
      </div>
    </div>
  );
}

function FloatingLayers() {
  return (
    <div className="scene-3d">
      <div className="animate-float-slow relative w-16 h-16">
        <div className="absolute inset-x-1 top-1 h-3 bg-white/10 rounded border border-white/20 animate-layer-1" />
        <div className="absolute inset-x-2 top-5 h-3 bg-white/15 rounded border border-white/25 animate-layer-2" />
        <div className="absolute inset-x-1 top-9 h-3 bg-white/20 rounded border border-white/30 animate-layer-3" />
        <div className="absolute inset-x-3 top-[52px] h-3 bg-white/25 rounded border border-white/35 animate-layer-4" />
      </div>
    </div>
  );
}

function FloatingRing() {
  return (
    <div className="scene-3d perspective-500">
      <div className="animate-spin-tilt w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border-2 border-white/40" />
        <div className="absolute inset-2 rounded-full border border-white/20" />
        <div className="absolute inset-[18px] rounded-full bg-white/10 border border-white/30" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
      </div>
    </div>
  );
}

function FloatingGlobe() {
  return (
    <div className="scene-3d perspective-500">
      <div className="animate-spin-slow w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border border-white/30" />
        <div className="absolute inset-0 rounded-full border border-white/15" style={{ transform: 'rotateY(60deg)' }} />
        <div className="absolute inset-0 rounded-full border border-white/15" style={{ transform: 'rotateY(120deg)' }} />
        <div className="absolute top-[30%] inset-x-0 h-[1px] bg-white/20" />
        <div className="absolute top-[50%] inset-x-0 h-[1px] bg-white/25" />
        <div className="absolute top-[70%] inset-x-0 h-[1px] bg-white/20" />
      </div>
    </div>
  );
}

const FEATURES = [
  {
    object3d: <FloatingBarChart />,
    title: 'Real market data',
    body: 'Median rent from Zillow, regional price parities from the BEA, and population from the Census Bureau — not estimates.',
  },
  {
    object3d: <FloatingLayers />,
    title: 'Transparent breakdown',
    body: "See exactly how your money is split — rent, utilities, groceries, transport — and what's left over each month.",
  },
  {
    object3d: <FloatingRing />,
    title: 'Transportation modes',
    body: 'Car, public transit, or bike/walk — costs and rankings adjust for your actual commute lifestyle.',
  },
  {
    object3d: <FloatingGlobe />,
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
              {FEATURES.map(({ object3d, title, body }, i) => (
                <Reveal
                  key={title}
                  from={i % 2 === 0 ? 'left' : 'right'}
                  delay={i * 100}
                >
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 group hover:border-white/20 transition-colors h-full flex gap-5 items-start">
                    <div className="shrink-0">
                      {object3d}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 items-center">
                {/* Left: Text */}
                <div>
                  <Reveal from="bottom" className="mb-10">
                    <h2 className="font-semibold text-3xl md:text-4xl text-white mb-3">How it works</h2>
                    <p className="text-gray-400">Three steps to find where your money stretches furthest.</p>
                  </Reveal>

                  <div className="space-y-8">
                    {STEPS.map(({ n, title, body }, i) => (
                      <Reveal key={n} from="left" delay={i * 150}>
                        <div className="flex gap-5">
                          <div className="font-black text-4xl text-white/[0.08] leading-none shrink-0">{n}</div>
                          <div>
                            <h4 className="font-semibold text-white mb-1">{title}</h4>
                            <p className="text-sm text-gray-400">{body}</p>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <Reveal from="bottom" delay={300} className="mt-10">
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

                {/* Right: Video */}
                <Reveal from="right" delay={200}>
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-auto"
                    >
                      <source src="/vid/demo.mov" type="video/quicktime" />
                      <source src="/vid/demo.mov" type="video/mp4" />
                    </video>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
