import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-semibold text-white">
            LiveBetter
          </span>
          <div className="flex items-center gap-6 text-sm text-gray-400">
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
