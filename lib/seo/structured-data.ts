import type { CatalogGame } from '../catalog/types'
import { isVerifiedFreeOfferEligible } from '../catalog/validate'
import type { ContentFaq, SiteInstance, VerifiedOrganizationEvidence } from '../site/types'
import { isVerifiedOrganizationEvidenceEligible } from '../site/validate-site-instance'
import { gameUrl, siteUrl } from '../urls/site-url'
import type { GameDetailPageDescriptor, PortalHomePageDescriptor } from './page-descriptors'
import { isSitemapCandidate } from './sitemap-eligibility'

export type JsonLdObject = Record<string, unknown>

const FORBIDDEN_KEYS = new Set(['aggregateRating', 'review', 'offers', 'potentialAction'])

const ALLOWED_OFFER_KEYS = new Set(['@type', 'price', 'priceCurrency'])

const ALLOWED_ORGANIZATION_KEYS = new Set(['@context', '@type', 'name', 'url'])

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

export function assertMinimalVerifiedOfferShape(offer: unknown): void {
  if (!offer || typeof offer !== 'object' || Array.isArray(offer)) {
    throw new Error('Offer must be a JSON object')
  }
  const o = offer as Record<string, unknown>
  if (o['@type'] !== 'Offer') {
    throw new Error('Offer @type must be Offer')
  }
  if (o.price !== '0') {
    throw new Error('Offer price must be the string "0"')
  }
  if (o.priceCurrency !== 'USD') {
    throw new Error('Offer priceCurrency must be USD')
  }
  for (const key of Object.keys(o)) {
    if (!ALLOWED_OFFER_KEYS.has(key)) {
      throw new Error(`Forbidden Offer field: ${key}`)
    }
  }
}

export function assertMinimalOrganizationShape(block: JsonLdObject): void {
  if (block['@type'] !== 'Organization') {
    throw new Error('Expected Organization block')
  }
  for (const key of Object.keys(block)) {
    if (!ALLOWED_ORGANIZATION_KEYS.has(key)) {
      throw new Error(`Forbidden Organization field: ${key}`)
    }
  }
  if (typeof block.name !== 'string' || !block.name.trim()) {
    throw new Error('Organization name is required')
  }
  if (typeof block.url !== 'string' || !block.url.trim()) {
    throw new Error('Organization url is required')
  }
}

type JsonLdSafetyContext = {
  allowVideoGameTopLevelOffer?: boolean
  allowOrganizationRoot?: boolean
}

function assertJsonLdFieldsWithContext(
  block: JsonLdObject,
  ctx: JsonLdSafetyContext,
  depth: number
): void {
  const rootType = typeof block['@type'] === 'string' ? block['@type'] : undefined
  const isVideoGameRoot = depth === 0 && rootType === 'VideoGame'
  const isOrganizationRoot = depth === 0 && rootType === 'Organization'

  for (const key of Object.keys(block)) {
    if (key === 'offers') {
      if (!(isVideoGameRoot && ctx.allowVideoGameTopLevelOffer)) {
        throw new Error(`Forbidden JSON-LD field: offers`)
      }
      assertMinimalVerifiedOfferShape(block[key])
      continue
    }
    if (FORBIDDEN_KEYS.has(key)) {
      throw new Error(`Forbidden JSON-LD field: ${key}`)
    }
    if (isOrganizationRoot && ctx.allowOrganizationRoot) {
      if (!ALLOWED_ORGANIZATION_KEYS.has(key)) {
        throw new Error(`Forbidden Organization field: ${key}`)
      }
    }

    const value = block[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      assertJsonLdFieldsWithContext(value as JsonLdObject, ctx, depth + 1)
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object') {
          assertJsonLdFieldsWithContext(item as JsonLdObject, ctx, depth + 1)
        }
      }
    }
  }
}

/** Evidence-aware JSON-LD safety for emitted blocks (export + generators). */
export function assertJsonLdBlocksMeetEvidenceContract(
  blocks: JsonLdObject[],
  input: {
    site: SiteInstance
    detailGame?: CatalogGame
    page: 'portal_home' | 'game_detail'
  }
): void {
  const orgAllowed =
    input.page === 'portal_home' && isVerifiedOrganizationEvidenceEligible(input.site)
  const orgCount = blocks.filter((b) => b['@type'] === 'Organization').length
  if (orgCount > 1) {
    throw new Error('At most one Organization JSON-LD block is allowed')
  }
  if (input.page === 'game_detail' && orgCount > 0) {
    throw new Error('Organization must not appear on game_detail JSON-LD')
  }
  if (orgCount > 0 && !orgAllowed) {
    throw new Error('Organization JSON-LD without verified organizationEvidence')
  }
  if (input.page === 'portal_home') {
    const illegalOffer = blocks.some((b) => 'offers' in b)
    if (illegalOffer) {
      throw new Error('Homepage JSON-LD must not include offers')
    }
  }

  for (const block of blocks) {
    const type = block['@type']
    if (type === 'VideoGame' && input.detailGame) {
      const allowOffer =
        input.page === 'game_detail' && isVerifiedFreeOfferEligible(input.detailGame)
      if ('offers' in block && !allowOffer) {
        throw new Error('VideoGame offers without verified freeOffer evidence')
      }
      assertJsonLdFieldsWithContext(block, { allowVideoGameTopLevelOffer: allowOffer }, 0)
      continue
    }
    if (type === 'Organization') {
      if (!orgAllowed) {
        throw new Error('Organization JSON-LD without verified organizationEvidence')
      }
      assertMinimalOrganizationShape(block)
      assertJsonLdFieldsWithContext(block, { allowOrganizationRoot: true }, 0)
      continue
    }
    assertJsonLdFieldsWithContext(block, {}, 0)
  }
}

function buildVerifiedOfferJsonLd(): JsonLdObject {
  return {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
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

export function buildOrganizationJsonLd(site: SiteInstance): JsonLdObject | undefined {
  const evidence = site.organizationEvidence
  if (evidence?.status !== 'verified') return undefined

  const verified = evidence as VerifiedOrganizationEvidence
  const block: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: verified.name.trim(),
    url: verified.url.trim(),
  }
  assertMinimalOrganizationShape(block)
  assertJsonLdFieldsWithContext(block, { allowOrganizationRoot: true }, 0)
  return block
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

  const emitOffer = isVerifiedFreeOfferEligible(game)
  if (emitOffer) {
    block.offers = buildVerifiedOfferJsonLd()
  }

  assertJsonLdFieldsWithContext(block, { allowVideoGameTopLevelOffer: emitOffer }, 0)
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
  const organization = buildOrganizationJsonLd(site)
  if (organization) blocks.push(organization)

  assertJsonLdBlocksMeetEvidenceContract(blocks, { site, page: 'portal_home' })
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

  assertJsonLdBlocksMeetEvidenceContract(blocks, { site, detailGame: game, page: 'game_detail' })
  return blocks
}

export function serializeJsonLd(blocks: JsonLdObject[]): string {
  return JSON.stringify(blocks.length === 1 ? blocks[0] : blocks)
}

/** Escape `<` for safe embedding in HTML script contexts. */
export function serializeJsonLdForHtml(blocks: JsonLdObject[]): string {
  return serializeJsonLd(blocks).replace(/</g, '\\u003c')
}
