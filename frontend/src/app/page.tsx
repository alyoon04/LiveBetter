'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TypingAnimation } from '@/components/TypingAnimation';

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    // Observe all feature blocks
    const featureBlocks = document.querySelectorAll('.feature-block');
    featureBlocks.forEach((block) => observer.observe(block));

    // Observe "How It Works" steps
    const howItWorksSteps = document.querySelectorAll('.how-it-works-step');
    howItWorksSteps.forEach((step) => observer.observe(step));

    // Handle timeline line scroll progress
    const timelineLine = document.querySelector('.timeline-line');
    const updateTimelineLine = () => {
      if (!timelineLine) return;

      const rect = timelineLine.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const timelineTop = rect.top;
      const timelineHeight = rect.height;

      // Calculate how much of the timeline should be visible
      const scrollProgress = Math.max(0, Math.min(1,
        (windowHeight - timelineTop) / (windowHeight + timelineHeight)
      ));

      (timelineLine as HTMLElement).style.transform = `scaleY(${scrollProgress})`;
    };

    // Update on scroll
    window.addEventListener('scroll', updateTimelineLine);
    updateTimelineLine(); // Initial call

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateTimelineLine);
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-180px)]">
      {/* Hero Section with City Images Background */}
      <div className="relative overflow-hidden min-h-[600px] md:min-h-[700px]">
        {/* Background - 3 City Images */}
        <div className="absolute inset-0 grid grid-cols-3 gap-2">
          {/* City Image 1 */}
          <div className="relative w-full h-full border-r-4 border-white dark:border-gray-800">
            <img
              src="/city1.jpg"
              alt="City 1"
              className="w-full h-full object-cover"
            />
          </div>

          {/* City Image 2 */}
          <div className="relative w-full h-full border-r-4 border-white dark:border-gray-800">
            <img
              src="/city2.jpg"
              alt="City 2"
              className="w-full h-full object-cover"
            />
          </div>

          {/* City Image 3 */}
          <div className="relative w-full h-full">
            <img
              src="/city3.jpg"
              alt="City 3"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/40"></div>

        {/* Gradient fade to bottom for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white dark:to-gray-800"></div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 h-full flex items-center">
          <div className="text-center mb-24 md:mb-32 max-w-4xl mx-auto w-full">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 h-[4.5rem] md:h-[5.5rem] flex items-center justify-center">
            <TypingAnimation
              text="Find your perfect city"
              speed={50}
            />
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 dark:text-gray-300 mb-8 leading-relaxed">
            Discover which U.S. cities offer the best value based on your salary,
            household size, and lifestyle priorities—from affordability to weather, schools, and walkability
          </p>

          <Link
            href="/search"
            className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            Start Looking
          </Link>

          <p className="mt-6 text-sm text-gray-100 dark:text-gray-300">
            Free • No account required • Real data from Zillow, BEA, and Census Bureau
          </p>
        </div>
      </div>
      </div>

      {/* Section Caption/Divider */}
      <div className="bg-white dark:bg-gray-800 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 min-h-[2.5rem]">
              <TypingAnimation
                text="Why LiveBetter?"
                speed={50}
              />
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Data-driven insights to help you make the best relocation decision
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights - Timeline */}
      <div className="bg-gradient-to-b from-white via-primary-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto relative">
            {/* Vertical connecting line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary-300 dark:via-primary-700 to-transparent hidden md:block timeline-line"></div>

            {/* Feature 1 - Left aligned */}
            <div className="relative mb-20 feature-block" data-direction="left">
              <div className="md:w-1/2 md:pr-12 text-left md:text-right feature-content">
                <h3 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                  Real Market Data
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Rankings based on actual median rent prices from Zillow, regional price parities from the Bureau of Economic Analysis,
                  and up-to-date population data from the Census Bureau
                </p>
              </div>
              {/* Timeline dot */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary-600 dark:bg-primary-400 rounded-full border-4 border-white dark:border-gray-900 hidden md:block timeline-dot"></div>
            </div>

            {/* Feature 2 - Right aligned */}
            <div className="relative mb-20 feature-block" data-direction="right">
              <div className="md:w-1/2 md:ml-auto md:pl-12 text-left feature-content">
                <h3 className="text-3xl font-bold text-accent-600 dark:text-accent-400 mb-4">
                  Transparent Breakdown
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  See exactly how your money is allocated across rent, utilities, groceries, and transportation.
                  Know your discretionary income after essential expenses in each city
                </p>
              </div>
              {/* Timeline dot */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent-600 dark:bg-accent-400 rounded-full border-4 border-white dark:border-gray-900 hidden md:block timeline-dot"></div>
            </div>

            {/* Feature 3 - Left aligned */}
            <div className="relative mb-20 feature-block" data-direction="left">
              <div className="md:w-1/2 md:pr-12 text-left md:text-right feature-content">
                <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                  Transportation Modes
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Customize rankings based on your lifestyle: public transit user, car owner, or bike/walk enthusiast.
                  Cities are adjusted for walkability and transit quality
                </p>
              </div>
              {/* Timeline dot */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full border-4 border-white dark:border-gray-900 hidden md:block timeline-dot"></div>
            </div>

            {/* Feature 4 - Right aligned */}
            <div className="relative feature-block" data-direction="right">
              <div className="md:w-1/2 md:ml-auto md:pl-12 text-left feature-content">
                <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                  Quality of Life Factors
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Prioritize what matters most to you: weather, school quality, safety, healthcare, walkability, and air quality.
                  Customize weights to create your personalized ranking
                </p>
              </div>
              {/* Timeline dot */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full border-4 border-white dark:border-gray-900 hidden md:block timeline-dot"></div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-24 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="flex flex-col items-center text-center how-it-works-step">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Enter Your Details</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tell us your salary, household size, and transportation preference
              </p>
            </div>

            <div className="flex flex-col items-center text-center how-it-works-step">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Get Ranked Results</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See cities ranked by affordability with detailed cost breakdowns
              </p>
            </div>

            <div className="flex flex-col items-center text-center how-it-works-step">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Explore & Compare</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View results on an interactive map and sort by different metrics
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/search"
              className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
