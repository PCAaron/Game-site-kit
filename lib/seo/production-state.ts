import { getBallgamesCatalog } from '../catalog/adapter'
import { getBallgamesPortalHomeContent } from '../site/get-portal-home-content'
import type { SiteInstance } from '../site/types'
import type { PortalSitemapPageDescriptor } from './page-descriptors'
import { buildGameDetailPageDescriptor, getProductionRoutableGames } from './production-game-routes'
import { isAppRoutePath } from './routes'
import { buildSitemapEntriesFromDescriptors } from './sitemap-eligibility'

/** Production portal + routable game detail descriptors (Catalog adapter; no fixtures). */
export function getProductionPortalDescriptors(): PortalSitemapPageDescriptor[] {
  const descriptors: PortalSitemapPageDescriptor[] = [
    {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: isAppRoutePath('/'),
      content: getBallgamesPortalHomeContent(),
    },
  ]

  const catalog = getBallgamesCatalog()
  for (const game of getProductionRoutableGames(catalog)) {
    const gameDescriptor = buildGameDetailPageDescriptor(game)
    if (gameDescriptor) {
      descriptors.push(gameDescriptor)
    }
  }

  return descriptors
}

export function buildProductionSitemap(site: SiteInstance) {
  return buildSitemapEntriesFromDescriptors(getProductionPortalDescriptors(), site)
}
