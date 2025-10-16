'use client';

import { FormCard } from '@/components/FormCard';
import { TypingAnimation } from '@/components/TypingAnimation';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-primary-100 via-primary-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-700 min-h-[calc(100vh-180px)]">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 min-h-[3.5rem]">
            <TypingAnimation
              text="Find the best city to live in for your budget"
              speed={40}
            />
          </h1>
          <div className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter your salary and lifestyle preferences to discover where your money goes further
          </div>
        </div>

        {/* Form */}
        <FormCard />

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all hover:scale-110 hover:rotate-3">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Data-Driven Rankings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on real median costs and regional price parities
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all hover:scale-110 hover:rotate-3">
              <svg className="w-6 h-6 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Transparent Breakdown</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See exactly how rent, groceries, utilities, and transport add up
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all hover:scale-110 hover:rotate-3">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Interactive Map</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore results visually with an interactive map view
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
