import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  SiteConfigError,
  ballgamesPortalHomeContentFixture,
  ballgamesSiteInstance,
} from '../lib/site/index'
import {
  buildPortalHomeJsonLdBlocks,
  buildProductionSitemap,
  buildR1ExactTwoContractFixtures,
  buildSitemapEntriesFromDescriptors,
  buildSiteRootMetadata,
  isSitemapCandidate,
  resolvePortalHomePageSeo,
  serializeJsonLd,
} from '../lib/seo/index'
import { resolvedSeoToMetadata } from '../lib/seo/metadata'
import { siteUrl } from '../lib/urls/site-url'

test('resolvePortalHomePageSeo uses content title and matching canonical/og url', () => {
  const descriptor = {
    pageType: 'portal_home' as const,
    routePath: '/' as const,
    routeExists: true,
    content: ballgamesPortalHomeContentFixture,
  }
  const resolved = resolvePortalHomePageSeo(descriptor, ballgamesSiteInstance)
  assert.equal(resolved.canonical, 'https://ballgames.io')
  assert.equal(resolved.openGraphUrl, resolved.canonical)
  assert.equal(resolved.title, ballgamesPortalHomeContentFixture.seo.title)
})

test('resolvePortalHomePageSeo throws when title missing', () => {
  assert.throws(
    () =>
      resolvePortalHomePageSeo(
        {
          pageType: 'portal_home',
          routePath: '/',
          routeExists: true,
          content: {
            ...ballgamesPortalHomeContentFixture,
            seo: { ...ballgamesPortalHomeContentFixture.seo, title: '  ' },
          },
        },
        ballgamesSiteInstance
      ),
    SiteConfigError
  )
})

test('og image falls back only to socialBanner', () => {
  const descriptor = {
    pageType: 'portal_home' as const,
    routePath: '/' as const,
    routeExists: true,
    content: ballgamesPortalHomeContentFixture,
  }
  const resolved = resolvePortalHomePageSeo(descriptor, ballgamesSiteInstance)
  assert.equal(resolved.ogImage, ballgamesSiteInstance.metadata.socialBanner)
  const meta = resolvedSeoToMetadata(resolved, ballgamesSiteInstance)
  assert.ok(meta.openGraph?.images)
})

test('production sitemap excludes draft portal and missing hockey-bros route', () => {
  const entries = buildProductionSitemap(ballgamesSiteInstance)
  assert.equal(entries.length, 0)
})

test('contract fixture yields exact-two URLs when routes exist', () => {
  const { portal, game } = buildR1ExactTwoContractFixtures()
  assert.equal(isSitemapCandidate(portal, ballgamesSiteInstance), true)
  assert.equal(isSitemapCandidate(game, ballgamesSiteInstance), true)
  const entries = buildSitemapEntriesFromDescriptors([portal, game], ballgamesSiteInstance)
  const urls = entries.map((e) => e.url).sort()
  assert.deepEqual(urls, ['https://ballgames.io', 'https://ballgames.io/hockey-bros'].sort())
})

test('missing route excludes game detail from sitemap', () => {
  const { portal, game } = buildR1ExactTwoContractFixtures()
  const missingRoute = { ...game, routeExists: false }
  assert.equal(isSitemapCandidate(missingRoute, ballgamesSiteInstance), false)
  const entries = buildSitemapEntriesFromDescriptors([portal, missingRoute], ballgamesSiteInstance)
  assert.equal(entries.length, 1)
  assert.equal(entries[0].url, siteUrl())
})

test('JSON-LD parses and omits Organization and SearchAction', () => {
  const { portal, game } = buildR1ExactTwoContractFixtures()
  const blocks = buildPortalHomeJsonLdBlocks({
    portal,
    qualifiedGameDetail: game,
    site: ballgamesSiteInstance,
  })
  const parsed = JSON.parse(serializeJsonLd(blocks))
  const serialized = JSON.stringify(parsed)
  assert.ok(serialized.includes('WebSite'))
  assert.ok(serialized.includes('ItemList'))
  assert.equal(serialized.includes('Organization'), false)
  assert.equal(serialized.includes('SearchAction'), false)
  assert.equal(serialized.includes('aggregateRating'), false)
})

test('sitemap lastmod uses PortalHomeContent.updatedAt only when present', () => {
  const { portal } = buildR1ExactTwoContractFixtures()
  const entries = buildSitemapEntriesFromDescriptors([portal], ballgamesSiteInstance)
  assert.equal(entries[0].lastModified, '2026-01-15')
})

test('site root metadata uses ballgames origin not starter', () => {
  const meta = buildSiteRootMetadata(ballgamesSiteInstance)
  assert.equal(String(meta.metadataBase), 'https://ballgames.io/')
  const robots = meta.robots
  assert.equal(
    typeof robots === 'object' && robots !== null && 'index' in robots && robots.index,
    false
  )
})
