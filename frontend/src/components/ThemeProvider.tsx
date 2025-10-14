'use client';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark mode is applied in layout.tsx before render
  return <>{children}</>;
}
