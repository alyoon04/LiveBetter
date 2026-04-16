import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-[#1E1E2A] bg-[#0C0C14] mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Logo size={24} />
            <span className="font-display font-bold text-white">
              Live<span className="text-primary-400">Better</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#6B6B7E]">
            <span>Data: Q4 2025 · Zillow, BEA, Census</span>
            <Link href="/methodology" className="hover:text-white transition-colors">
              Methodology
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
