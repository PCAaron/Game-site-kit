import type { CatalogGame } from '../catalog/types'
import type { ContentFaq, SiteInstance } from '../site/types'
import { gameUrl, siteUrl } from '../urls/site-url'
import type { GameDetailPageDescriptor, PortalHomePageDescriptor } from './page-descriptors'
import { isSitemapCandidate } from './sitemap-eligibility'

export type JsonLdObject = Record<string, unknown>

const FORBIDDEN_KEYS = new Set(['aggregateRating', 'review', 'offers', 'potentialAction'])

export function assertNoForbiddenJsonLdFields(block: JsonLdObject): void {
  for (const key of Object.keys(block)) {
    if (FORBIDDEN_KEYS.has(key)) {
      throw new Error(`Forbidden JSON-LD field: ${key}`)
    }
    const value = block[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      assertNoForbiddenJsonLdFields(value as JsonLdObject)
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object') {
          assertNoForbiddenJsonLdFields(item as JsonLdObject)
        }
      }
    }
  }
}

export function buildWebSiteJsonLd(site: SiteInstance): JsonLdObject {
  const block: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.metadata.title,
    url: siteUrl(undefined, site),
  }
  assertNoForbiddenJsonLdFields(block)
  return block
}

export function buildFaqPageJsonLd(items: ContentFaq[]): JsonLdObject {
  const block: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
  assertNoForbiddenJsonLdFields(block)
  return block
}

export function buildItemListJsonLdForPortalHome(
  portal: PortalHomePageDescriptor,
  qualifiedGame: GameDetailPageDescriptor | undefined,
  site: SiteInstance
): JsonLdObject | undefined {
  if (!qualifiedGame || !isSitemapCandidate(qualifiedGame, site)) return undefined
  if (!qualifiedGame.listItemName?.trim()) return undefined

  const block: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: qualifiedGame.listItemName.trim(),
        url: gameUrl(qualifiedGame.slug, site),
      },
    ],
  }
  assertNoForbiddenJsonLdFields(block)
  return block
}

/** Organization requires verified evidence — not emitted in Phase 4.5. */
export function buildOrganizationJsonLd(_site: SiteInstance): undefined {
  return undefined
}

export function buildVideoGameJsonLd(
  game: CatalogGame,
  site: SiteInstance
): JsonLdObject | undefined {
  const detail = game.detail
  if (!detail?.seo.description?.trim()) return undefined

  const block: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    url: gameUrl(game.slug, site),
    description: detail.seo.description.trim(),
  }
  assertNoForbiddenJsonLdFields(block)
  return block
}

export function buildBreadcrumbListJsonLd(game: CatalogGame, site: SiteInstance): JsonLdObject {
  const block: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl(undefined, site),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: game.title,
        item: gameUrl(game.slug, site),
      },
    ],
  }
  assertNoForbiddenJsonLdFields(block)
  return block
}

export function buildPortalHomeJsonLdBlocks(input: {
  portal: PortalHomePageDescriptor
  qualifiedGameDetail?: GameDetailPageDescriptor
  site: SiteInstance
}): JsonLdObject[] {
  const { portal, qualifiedGameDetail, site } = input
  if (!portal.content.seo.indexable || portal.content.publicationStatus !== 'published') {
    return []
  }

  const blocks: JsonLdObject[] = [buildWebSiteJsonLd(site)]
  const itemList = buildItemListJsonLdForPortalHome(portal, qualifiedGameDetail, site)
  if (itemList) blocks.push(itemList)
  if (portal.content.faq?.length) {
    blocks.push(buildFaqPageJsonLd(portal.content.faq))
  }
  return blocks
}

export function buildGameDetailJsonLdBlocks(input: {
  game: CatalogGame
  site: SiteInstance
}): JsonLdObject[] {
  const { game, site } = input
  const descriptor = game.detail
  if (!descriptor || game.publicationStatus !== 'published' || !descriptor.seo.indexable) {
    return []
  }

  const blocks: JsonLdObject[] = []
  const videoGame = buildVideoGameJsonLd(game, site)
  if (videoGame) blocks.push(videoGame)
  if (descriptor.faq?.length) {
    blocks.push(buildFaqPageJsonLd(descriptor.faq))
  }
  blocks.push(buildBreadcrumbListJsonLd(game, site))
  return blocks
}

export function serializeJsonLd(blocks: JsonLdObject[]): string {
  return JSON.stringify(blocks.length === 1 ? blocks[0] : blocks)
}

/** Escape `<` for safe embedding in HTML script contexts. */
export function serializeJsonLdForHtml(blocks: JsonLdObject[]): string {
  return serializeJsonLd(blocks).replace(/</g, '\\u003c')
}
