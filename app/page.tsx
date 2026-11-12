import type { Metadata } from 'next'

import { JsonLd } from '@/components/seo/JsonLd'
import { PortalHome } from '@/components/portal/PortalHome'
import { getBallgamesCatalog, getProductionHomeCatalog } from '@/lib/catalog'
import {
  buildGameDetailPageDescriptor,
  buildPortalHomeJsonLdBlocks,
  findProductionRoutableGame,
  resolvePortalHomePageSeo,
  resolvedSeoToMetadata,
} from '@/lib/seo'
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
  const site = getSiteInstance()
  const portal = getPortalHomeContent()
  const catalog = getBallgamesCatalog()
  const homeGames = getProductionHomeCatalog(catalog)
  const hockey = findProductionRoutableGame('hockey-bros', catalog)
  const gameDescriptor = hockey ? buildGameDetailPageDescriptor(hockey) : undefined
  const jsonLdBlocks = buildPortalHomeJsonLdBlocks({
    portal: {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: isAppRoutePath('/'),
      content: portal,
    },
    qualifiedGameDetail: gameDescriptor,
    site,
  })

  return (
    <>
      <JsonLd blocks={jsonLdBlocks} />
      <PortalHome portal={portal} homeGames={homeGames} catalog={catalog} />
    </>
  )
}
