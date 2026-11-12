import Link from '@/components/Link'

export interface BreadcrumbsProps {
  currentTitle: string
}

export function Breadcrumbs({ currentTitle }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600 dark:text-gray-400">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            Home
          </Link>
        </li>
        <li aria-hidden className="text-gray-400 select-none dark:text-gray-500">
          ›
        </li>
        <li>
          <span aria-current="page" className="font-medium text-gray-900 dark:text-gray-100">
            {currentTitle}
          </span>
        </li>
      </ol>
    </nav>
  )
}
