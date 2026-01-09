import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Logo size={32} />
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              LiveBetter
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
            <p className="mb-2">Data last updated: Q4 2025</p>
            <a
              href="/methodology"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Methodology
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
