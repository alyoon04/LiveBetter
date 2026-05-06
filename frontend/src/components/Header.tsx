'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/search', label: 'Search' },
    { href: '/methodology', label: 'Methodology' },
    { href: '/compare', label: 'Compare' },
    { href: '/results', label: 'Results' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 lg:px-16 pt-6">
      <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
          LiveBetter
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-white hover:text-gray-300'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/search"
          className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}
