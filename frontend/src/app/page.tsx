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

const TOTAL_FRAMES = 240;

// Each card: unique corner position + scroll threshold
// top-left, top-right, bottom-left, bottom-right
const CARD_POSITIONS = [
  { top: '15vh', left: '3vw', right: 'auto', from: 'left' },
  { top: '15vh', left: 'auto', right: '3vw', from: 'right' },
  { top: 'auto', bottom: '8vh', left: '3vw', right: 'auto', from: 'left' },
  { top: 'auto', bottom: '8vh', left: 'auto', right: '3vw', from: 'right' },
] as const;

const CARD_THRESHOLDS = [0.2, 0.4, 0.6, 0.8];

// Mini 3D animated icons for each feature card
function MiniBarChart() {
  return (
    <div className="flex items-end gap-[3px] h-5">
      <div className="w-1 bg-white/60 rounded-sm animate-[miniBar1_2.5s_ease-in-out_infinite]" />
      <div className="w-1 bg-white/80 rounded-sm animate-[miniBar2_2.5s_ease-in-out_infinite_0.2s]" />
      <div className="w-1 bg-white/50 rounded-sm animate-[miniBar3_2.5s_ease-in-out_infinite_0.4s]" />
      <div className="w-1 bg-white/90 rounded-sm animate-[miniBar4_2.5s_ease-in-out_infinite_0.6s]" />
    </div>
  );
}

function MiniLayers() {
  return (
    <div className="relative w-5 h-5">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-white/30 rounded animate-[miniLayer_3s_ease-in-out_infinite]" />
      <div className="absolute inset-x-0.5 top-[6px] h-[3px] bg-white/45 rounded animate-[miniLayer_3s_ease-in-out_infinite_0.3s]" />
      <div className="absolute inset-x-0 top-[12px] h-[3px] bg-white/60 rounded animate-[miniLayer_3s_ease-in-out_infinite_0.6s]" />
      <div className="absolute inset-x-0.5 top-[17px] h-[3px] bg-white/40 rounded animate-[miniLayer_3s_ease-in-out_infinite_0.9s]" />
    </div>
  );
}

function MiniRing() {
  return (
    <div className="w-5 h-5 relative animate-[miniSpin_6s_linear_infinite]" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg)' }}>
      <div className="absolute inset-0 rounded-full border border-white/40" />
      <div className="absolute inset-1 rounded-full border border-white/20" />
      <div className="absolute inset-[6px] rounded-full bg-white/15" />
    </div>
  );
}

function MiniGlobe() {
  return (
    <div className="w-5 h-5 relative animate-[miniSpin_8s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }}>
      <div className="absolute inset-0 rounded-full border border-white/30" />
      <div className="absolute inset-0 rounded-full border border-white/15" style={{ transform: 'rotateY(60deg)' }} />
      <div className="absolute top-[40%] inset-x-0 h-[1px] bg-white/25" />
      <div className="absolute top-[60%] inset-x-0 h-[1px] bg-white/20" />
    </div>
  );
}

const MINI_ICONS = [<MiniBarChart />, <MiniLayers />, <MiniRing />, <MiniGlobe />];

function FeaturesScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[index];
    if (!img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  };

  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/ani/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setLoaded(true);
          drawFrame(0);
        }
      };
      images.push(img);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / scrollable));
      setProgress(p);

      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(p * TOTAL_FRAMES));
      if (frameIndex !== frameRef.current) {
        frameRef.current = frameIndex;
        drawFrame(frameIndex);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loaded]);

  const getCardProgress = (i: number) => {
    const threshold = CARD_THRESHOLDS[i];
    return Math.max(0, Math.min(1, (progress - threshold) / 0.1));
  };

  return (
    <div ref={sectionRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Heading */}
        <div
          className="absolute top-[16vh] left-0 right-0 text-center z-20"
          style={{
            opacity: Math.min(1, progress * 5),
            transform: `translateY(${Math.max(0, (1 - progress * 5)) * 30}px)`,
          }}
        >
          <h2 className="font-semibold text-3xl md:text-4xl text-white mb-3">
            Why LiveBetter?
          </h2>
          <p className="text-gray-400">Data-driven, transparent, personalized.</p>
        </div>

        {/* Centered 3D animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-[15vh]">
          <div className="w-full max-w-5xl px-6">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
                maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
              }}
            />
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Cards — each in its own corner, scroll-driven */}
        {FEATURES.map(({ title, body }, i) => {
          const cp = getCardProgress(i);
          const pos = CARD_POSITIONS[i];
          const slideX = pos.from === 'left' ? (1 - cp) * -120 : (1 - cp) * 120;

          return (
            <div
              key={title}
              className="absolute w-72 lg:w-80 xl:w-96 z-10"
              style={{
                top: pos.top,
                bottom: 'bottom' in pos ? pos.bottom : 'auto',
                left: pos.left,
                right: pos.right,
                opacity: cp,
                transform: `translateX(${slideX}px)`,
              }}
            >
              <div className="liquid-glass border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
                <div className="inline-flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded text-white mb-3 perspective-500">
                  {MINI_ICONS[i]}
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: 'Real market data',
    body: 'Median rent from Zillow, regional price parities from the BEA, and population from the Census Bureau — not estimates.',
  },
  {
    title: 'Transparent breakdown',
    body: "See exactly how your money is split — rent, utilities, groceries, transport — and what's left over each month.",
  },
  {
    title: 'Transportation modes',
    body: 'Car, public transit, or bike/walk — costs and rankings adjust for your actual commute lifestyle.',
  },
  {
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

        {/* Features — scroll-driven 3D animation with cards */}
        <FeaturesScrollSection />

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
