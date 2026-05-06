'use client';

import { FormCard } from '@/components/FormCard';

export default function SearchPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] bg-black">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3">Configure search</p>
          <h1 className="font-semibold text-4xl md:text-5xl text-white mb-4 tracking-tight">
            Find your perfect city
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Enter your salary and preferences. We'll rank every U.S. metro by how much you'll have left over each month.
          </p>
        </div>

        <FormCard />

        <p className="mt-8 text-center text-xs text-gray-500 font-mono">
          Data: Zillow (rent) · BEA (cost of living) · Census Bureau (population) · Q4 2025
        </p>
      </div>
    </div>
  );
}
