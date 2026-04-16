'use client';

import { FormCard } from '@/components/FormCard';

export default function SearchPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#0C0C14]">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-primary-400 uppercase tracking-widest mb-3">Configure search</p>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 tracking-tight">
            Find your perfect city
          </h1>
          <p className="text-[#6B6B7E] max-w-xl mx-auto">
            Enter your salary and preferences. We'll rank every U.S. metro by how much you'll have left over each month.
          </p>
        </div>

        <FormCard />

        <p className="mt-8 text-center text-xs text-[#6B6B7E] font-mono">
          Data: Zillow (rent) · BEA (cost of living) · Census Bureau (population) · Q4 2025
        </p>
      </div>
    </div>
  );
}
