import type { Catalog, CatalogGame } from '@/lib/catalog/types'
import type { PortalHomeContent } from '@/lib/site/types'

import { Launcher } from './Launcher'
import { PortalHomeFaq } from './PortalHomeFaq'
import { PortalHomeIntro } from './PortalHomeIntro'
import { PortalHomeSeoSections } from './PortalHomeSeoSections'
/** Frozen copy — ballgames-specs-v1.2 §4 / homepage-r1.md (not SEO description). */
export const PORTAL_HOME_FROZEN_H1 = 'Ball Games'
export const PORTAL_HOME_FROZEN_SUBTITLE =
  'Pick a game and play in seconds — free, in your browser, nothing to install.'

export interface PortalHomeProps {
  portal: PortalHomeContent
  homeGames: CatalogGame[]
  catalog: Catalog
}

export function PortalHome({ portal, homeGames, catalog }: PortalHomeProps) {
  const hasEditorial =
    Boolean(portal.intro?.trim()) && Boolean(portal.sections?.length) && Boolean(portal.faq?.length)

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
      {hasEditorial ? (
        <>
          <PortalHomeIntro intro={portal.intro!} />
          <PortalHomeSeoSections sections={portal.sections!} />
          <PortalHomeFaq items={portal.faq!} />
        </>
      ) : null}
    </div>
  )
}
