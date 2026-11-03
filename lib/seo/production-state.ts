import { ballgamesPortalHomeContentFixture } from '../site/instances/ballgames'
import type { SiteInstance } from '../site/types'
import type { PortalSitemapPageDescriptor } from './page-descriptors'
import { isAppRoutePath } from './routes'
import { buildSitemapEntriesFromDescriptors } from './sitemap-eligibility'

/** Production portal descriptors (no Phase 4 game routes yet). */
export function getProductionPortalDescriptors(): PortalSitemapPageDescriptor[] {
  return [
    {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: isAppRoutePath('/'),
      content: ballgamesPortalHomeContentFixture,
    },
  ]
}

export function buildProductionSitemap(site: SiteInstance) {
  return buildSitemapEntriesFromDescriptors(getProductionPortalDescriptors(), site)
}
