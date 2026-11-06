import { getBallgamesPortalHomeContent } from '../site/get-portal-home-content'
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
      content: getBallgamesPortalHomeContent(),
    },
  ]
}

export function buildProductionSitemap(site: SiteInstance) {
  return buildSitemapEntriesFromDescriptors(getProductionPortalDescriptors(), site)
}
