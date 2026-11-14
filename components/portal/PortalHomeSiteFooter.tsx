import Link from '@/components/Link'

/** Ballgames R1 portal home footer — homepage-r1.md §6; no Hockey Bros link. */
export function PortalHomeSiteFooter() {
  return (
    <footer className="border-t border-gray-200 py-10 dark:border-gray-700">
      <nav
        className="mb-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400"
        aria-label="Site footer"
      >
        <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 font-medium">
          Ball Games
        </Link>
        <span aria-hidden>・</span>
        <Link
          href="/about"
          className="hover:text-primary-600 dark:hover:text-primary-400 font-medium"
        >
          About
        </Link>
      </nav>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        © 2026 BallGames.io · Launched November 2026
      </p>
    </footer>
  )
}
