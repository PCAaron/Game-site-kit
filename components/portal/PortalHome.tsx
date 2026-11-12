import type { Catalog, CatalogGame } from '@/lib/catalog/types'
import type { PortalHomeContent } from '@/lib/site/types'

import { Launcher } from './Launcher'

/** Frozen copy — ballgames-specs-v1 §5.2 (not SEO description). */
export const PORTAL_HOME_FROZEN_H1 = 'Ball Games'
export const PORTAL_HOME_FROZEN_SUBTITLE =
  'Pick a game and it starts — hockey, soccer, football, basketball, free in your browser.'

export interface PortalHomeProps {
  portal: PortalHomeContent
  homeGames: CatalogGame[]
  catalog: Catalog
}

export function PortalHome({ portal: _portal, homeGames, catalog }: PortalHomeProps) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <section className="space-y-4 pt-6 pb-10 md:pt-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
          {PORTAL_HOME_FROZEN_H1}
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-300">
          {PORTAL_HOME_FROZEN_SUBTITLE}
        </p>
      </section>
      <section className="py-10">
        <Launcher homeGames={homeGames} catalog={catalog} />
      </section>
    </div>
  )
}
