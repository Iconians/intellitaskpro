import Link from "next/link";

export function BoardPageFooter() {
  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-8 dark:border-gray-700 dark:bg-gray-800 md:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium text-gray-900 dark:text-white">
            IntelliTask Pro: All Rights Reserved
          </p>
          <p className="max-w-md">AI-powered collaboration for dev teams.</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href="/boards"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← All boards
          </Link>
        </nav>
      </div>
    </footer>
  );
}
