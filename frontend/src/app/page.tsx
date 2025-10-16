'use client';

import Link from 'next/link';
import { TypingAnimation } from '@/components/TypingAnimation';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-primary-100 via-primary-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 min-h-[calc(100vh-180px)]">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 min-h-[4rem]">
            <TypingAnimation
              text="Find your perfect city"
              speed={50}
            />
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Discover which U.S. cities offer the best affordability based on your salary,
            household size, and transportation preferences
          </p>

          <Link
            href="/search"
            className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            Start Looking
          </Link>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Free • No account required • Real data from Zillow, BEA, and Census Bureau
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card hover:shadow-xl transition-all transform hover:scale-105 animate-slide-left delay-200">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mb-6 transition-all hover:rotate-6">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Real Market Data</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Rankings based on actual median rent prices from Zillow, regional price parities from the Bureau of Economic Analysis,
              and up-to-date population data from the Census Bureau
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card hover:shadow-xl transition-all transform hover:scale-105 animate-slide-left delay-400">
            <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900 rounded-xl flex items-center justify-center mb-6 transition-all hover:rotate-6">
              <svg className="w-8 h-8 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Transparent Breakdown</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              See exactly how your money is allocated across rent, utilities, groceries, and transportation.
              Know your discretionary income after essential expenses in each city
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card hover:shadow-xl transition-all transform hover:scale-105 animate-slide-left delay-600">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-6 transition-all hover:rotate-6">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Transportation Modes</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Customize rankings based on your lifestyle: public transit user, car owner, or bike/walk enthusiast.
              Cities are adjusted for walkability and transit quality
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-24 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Enter Your Details</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tell us your salary, household size, and transportation preference
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Get Ranked Results</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See cities ranked by affordability with detailed cost breakdowns
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
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
