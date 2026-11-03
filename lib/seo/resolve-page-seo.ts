import {
  validatePortalHomeContent,
  resolvePortalHomeOgImage,
} from '../site/validate-portal-home-content'
import type { SiteInstance } from '../site/types'
import { siteUrl } from '../urls/site-url'
import type { PortalHomePageDescriptor, ResolvedPageSEO } from './page-descriptors'

export function resolvePortalHomePageSeo(
  descriptor: PortalHomePageDescriptor,
  site: SiteInstance
): ResolvedPageSEO {
  validatePortalHomeContent(descriptor.content)
  const canonical = siteUrl(undefined, site)
  const ogImage = resolvePortalHomeOgImage(descriptor.content, site)

  return {
    title: descriptor.content.seo.title.trim(),
    description: descriptor.content.seo.description.trim(),
    canonical,
    openGraphUrl: canonical,
    ogImage,
    indexable: descriptor.content.seo.indexable,
    updatedAt: descriptor.content.updatedAt,
  }
}
