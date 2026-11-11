import type { Metadata } from 'next'
import type { SiteInstance } from '../site/types'
import { siteUrl } from '../urls/site-url'
import type { ResolvedPageSEO } from './page-descriptors'

/** ballgames R1 legacy template routes (ADR DEC-003-F): noindex, follow — independent of sitemap eligibility. */
export const LEGACY_PAGE_ROBOTS = { index: false as const, follow: true as const }

export function buildSiteRootMetadata(site: SiteInstance): Metadata {
  const metadataBase = new URL(site.canonicalOrigin)
  const socialBanner = site.metadata.socialBanner

  return {
    metadataBase,
    title: {
      default: site.metadata.title,
      template: `%s | ${site.metadata.title}`,
    },
    description: site.metadata.description,
    openGraph: {
      title: site.metadata.title,
      description: site.metadata.description,
      url: siteUrl(undefined, site),
      siteName: site.metadata.title,
      locale: site.metadata.locale.replace('-', '_'),
      type: 'website',
      ...(socialBanner ? { images: [socialBanner] } : {}),
    },
    alternates: {
      canonical: siteUrl(undefined, site),
      types: {
        'application/rss+xml': `${siteUrl(undefined, site)}/feed.xml`,
      },
    },
    // DEC-003-F: layout default matches defaultIndexable until Phase 4 portal home overrides `/`.
    robots: LEGACY_PAGE_ROBOTS,
  }
}

export function resolvedSeoToMetadata(resolved: ResolvedPageSEO, site: SiteInstance): Metadata {
  const images = resolved.ogImage
    ? [resolved.ogImage]
    : site.metadata.socialBanner
      ? [site.metadata.socialBanner]
      : []

  return {
    // Contract titles already include branding; absolute bypasses root layout title.template.
    title: { absolute: resolved.title },
    description: resolved.description,
    alternates: {
      canonical: resolved.canonical,
    },
    openGraph: {
      title: resolved.title,
      description: resolved.description,
      url: resolved.openGraphUrl,
      siteName: site.metadata.title,
      locale: site.metadata.locale.replace('-', '_'),
      type: 'website',
      ...(images.length ? { images } : {}),
    },
    robots: resolved.indexable ? { index: true, follow: true } : { index: false, follow: true },
  }
}

export function buildLegacyTemplateMetadata(input: {
  title: string
  description?: string
  canonicalPath: string
  site: SiteInstance
  ogImage?: string
}): Metadata {
  const canonical = siteUrl(input.canonicalPath, input.site)
  const description = input.description?.trim() || input.site.metadata.description
  const images = input.ogImage
    ? [input.ogImage]
    : input.site.metadata.socialBanner
      ? [input.site.metadata.socialBanner]
      : []

  return {
    title: input.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: input.title,
      description,
      url: canonical,
      siteName: input.site.metadata.title,
      locale: input.site.metadata.locale.replace('-', '_'),
      type: 'website',
      ...(images.length ? { images } : {}),
    },
    robots: LEGACY_PAGE_ROBOTS,
  }
}
