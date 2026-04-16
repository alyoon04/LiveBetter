'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/methodology', label: 'Methodology' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0C0C14] border-b border-[#1E1E2A]">
      {/* Accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-60" />
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={30} />
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Live<span className="text-primary-400">Better</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    isActive
                      ? 'text-white bg-[#16161F]'
                      : 'text-[#6B6B7E] hover:text-white hover:bg-[#111118]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
