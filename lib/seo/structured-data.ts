import type { SiteInstance } from '../site/types'
import { gameUrl, siteUrl } from '../urls/site-url'
import type { GameDetailPageDescriptor, PortalHomePageDescriptor } from './page-descriptors'
import { isSitemapCandidate } from './sitemap-eligibility'

type JsonLdObject = Record<string, unknown>

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

/** Organization requires verified evidence — not emitted in Phase 3. */
export function buildOrganizationJsonLd(_site: SiteInstance): undefined {
  return undefined
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
  return blocks
}

export function serializeJsonLd(blocks: JsonLdObject[]): string {
  return JSON.stringify(blocks.length === 1 ? blocks[0] : blocks)
}
