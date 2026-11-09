import {
  validatePortalHomeContent,
  resolvePortalHomeOgImage,
} from '../site/validate-portal-home-content'
import { SiteConfigError, type SiteInstance } from '../site/types'
import { gameUrl, siteUrl } from '../urls/site-url'
import type {
  GameDetailPageDescriptor,
  PortalHomePageDescriptor,
  ResolvedPageSEO,
} from './page-descriptors'

function assertNonEmptyGameSeoField(
  field: 'title' | 'description',
  value: unknown,
  slug: string
): void {
  if (typeof value !== 'string' || !value.trim()) {
    throw new SiteConfigError(
      'GAME_DETAIL_SEO_REQUIRED',
      `Game Detail seo.${field} is required for ${slug}`
    )
  }
}

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

export function resolveGameDetailPageSeo(
  descriptor: GameDetailPageDescriptor,
  site: SiteInstance
): ResolvedPageSEO {
  const { content } = descriptor
  assertNonEmptyGameSeoField('title', content.seo.title, descriptor.slug)
  assertNonEmptyGameSeoField('description', content.seo.description, descriptor.slug)

  const canonical = gameUrl(descriptor.slug, site)
  const ogImage = site.metadata.socialBanner

  return {
    title: content.seo.title.trim(),
    description: content.seo.description.trim(),
    canonical,
    openGraphUrl: canonical,
    ogImage,
    indexable: content.seo.indexable,
    updatedAt: content.updatedAt,
  }
}
