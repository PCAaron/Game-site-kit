import type { PageType, PortalHomeContent, PublicationStatus, SiteInstance } from '../site/types'

export interface PortalHomePageDescriptor {
  pageType: 'portal_home'
  routePath: '/'
  routeExists: boolean
  content: PortalHomeContent
}

export interface GameDetailPageDescriptor {
  pageType: 'game_detail'
  slug: string
  routePath: string
  routeExists: boolean
  /** Display name for ItemList when explicitly provided (not inferred from slug). */
  listItemName?: string
  content: {
    publicationStatus: PublicationStatus
    seo: {
      title: string
      description: string
      indexable: boolean
      ogImage?: string
    }
    updatedAt?: string
  }
}

export type PortalSitemapPageDescriptor = PortalHomePageDescriptor | GameDetailPageDescriptor

export interface ResolvedPageSEO {
  title: string
  description: string
  canonical: string
  openGraphUrl: string
  ogImage?: string
  indexable: boolean
  updatedAt?: string
}

export function assertPageTypeEnabled(site: SiteInstance, pageType: PageType): void {
  if (!site.enabledPageTypes.includes(pageType)) {
    throw new Error(`Page type ${pageType} is not enabled for site ${site.siteId}`)
  }
}
