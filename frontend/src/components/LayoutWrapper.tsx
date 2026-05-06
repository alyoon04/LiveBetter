'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1 ${isHome ? '' : 'pt-24'}`}>{children}</main>
      {!isHome && <Footer />}
    </div>
  );
}
