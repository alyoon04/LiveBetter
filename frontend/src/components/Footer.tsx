export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <p>Data last updated: Q4 2025</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
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
