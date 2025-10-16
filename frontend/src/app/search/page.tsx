'use client';

import { FormCard } from '@/components/FormCard';

export default function SearchPage() {
  return (
    <div className="bg-gradient-to-b from-primary-100 via-primary-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 min-h-[calc(100vh-180px)]">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Find Your Perfect City
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter your details below to discover which U.S. cities offer the best affordability for your lifestyle
          </p>
        </div>

        {/* Form */}
        <FormCard />

        {/* Info Section */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Our rankings consider real market rent data, regional cost-of-living indices,
            transportation preferences, and after-tax income calculations to give you accurate,
            personalized results.
          </p>
        </div>
      </div>
    </div>
  );
}
