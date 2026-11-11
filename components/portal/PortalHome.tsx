import type { Catalog, CatalogGame } from '@/lib/catalog/types'
import type { PortalHomeContent } from '@/lib/site/types'

import { Launcher } from './Launcher'

export interface PortalHomeProps {
  portal: PortalHomeContent
  homeGames: CatalogGame[]
  catalog: Catalog
}

export function PortalHome({ portal, homeGames, catalog }: PortalHomeProps) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <section className="space-y-4 pt-6 pb-10 md:pt-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
          Free Ball Games Online
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-300">
          {portal.seo.description}
        </p>
      </section>
      <section className="py-10">
        <Launcher homeGames={homeGames} catalog={catalog} />
      </section>
    </div>
  )
}
