import type { Metadata } from 'next'

import { PortalHome } from '@/components/portal/PortalHome'
import { getBallgamesCatalog, getProductionHomeCatalog } from '@/lib/catalog'
import { resolvePortalHomePageSeo, resolvedSeoToMetadata } from '@/lib/seo'
import { isAppRoutePath } from '@/lib/seo/routes'
import { getPortalHomeContent } from '@/lib/site/get-portal-home-content'
import { getSiteInstance } from '@/lib/site/get-site-instance'

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteInstance()
  const content = getPortalHomeContent()
  const resolved = resolvePortalHomePageSeo(
    {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: isAppRoutePath('/'),
      content,
    },
    site
  )
  return resolvedSeoToMetadata(resolved, site)
}

export default function Page() {
  const portal = getPortalHomeContent()
  const catalog = getBallgamesCatalog()
  const homeGames = getProductionHomeCatalog(catalog)
  return <PortalHome portal={portal} homeGames={homeGames} catalog={catalog} />
}
