import { validatePortalHomeContent } from '../site/validate-portal-home-content'
import type { SiteInstance } from '../site/types'
import { gameUrl, siteUrl } from '../urls/site-url'
import type { PortalSitemapPageDescriptor } from './page-descriptors'
import { assertPageTypeEnabled } from './page-descriptors'

function hasValidPortalHomeStructure(descriptor: PortalSitemapPageDescriptor): boolean {
  if (descriptor.pageType === 'portal_home') {
    validatePortalHomeContent(descriptor.content)
    return true
  }
  const { content } = descriptor
  if (!content.seo.title?.trim() || !content.seo.description?.trim()) return false
  if (typeof content.seo.indexable !== 'boolean') return false
  return true
}

function canonicalForDescriptor(
  descriptor: PortalSitemapPageDescriptor,
  site: SiteInstance
): string {
  if (descriptor.pageType === 'portal_home') {
    return siteUrl(undefined, site)
  }
  return gameUrl(descriptor.slug, site)
}

/** SitemapCandidate predicate (Phase 3 §6.3). */
export function isSitemapCandidate(
  descriptor: PortalSitemapPageDescriptor,
  site: SiteInstance
): boolean {
  try {
    assertPageTypeEnabled(site, descriptor.pageType)
  } catch {
    return false
  }

  const { content } = descriptor
  if (content.publicationStatus !== 'published') return false
  if (!content.seo.indexable) return false
  if (!descriptor.routeExists) return false
  if (!hasValidPortalHomeStructure(descriptor)) return false

  const canonical = canonicalForDescriptor(descriptor, site)
  if (!canonical.startsWith(site.canonicalOrigin)) return false

  return true
}

export function buildSitemapEntriesFromDescriptors(
  descriptors: PortalSitemapPageDescriptor[],
  site: SiteInstance
): Array<{ url: string; lastModified?: string }> {
  const entries: Array<{ url: string; lastModified?: string }> = []

  for (const descriptor of descriptors) {
    if (!isSitemapCandidate(descriptor, site)) continue
    const url =
      descriptor.pageType === 'portal_home'
        ? siteUrl(undefined, site)
        : gameUrl(descriptor.slug, site)
    entries.push({
      url,
      lastModified: descriptor.content.updatedAt,
    })
  }

  return entries
}
