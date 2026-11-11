/**
 * Phase 3 Batch 2 — SEO / sitemap / JSON-LD 契约测试。
 * `ballgamesPortalHomeContentFixture` 仅供本文件构造 descriptor，非生产 Reader 路径。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { SiteConfigError, ballgamesSiteInstance } from '../lib/site/index'
import { ballgamesPortalHomeContentFixture } from '../lib/site/instances/ballgames'
import {
  buildGameDetailPageDescriptor,
  buildPortalHomeJsonLdBlocks,
  buildLegacyTemplateMetadata,
  buildProductionSitemap,
  buildR1ExactTwoContractFixtures,
  buildSitemapEntriesFromDescriptors,
  buildSiteRootMetadata,
  findProductionRoutableGame,
  getProductionPortalDescriptors,
  getProductionRoutableGameSlugs,
  isAppRoutePath,
  isSitemapCandidate,
  LEGACY_PAGE_ROBOTS,
  resolveGameDetailPageSeo,
  resolvePortalHomePageSeo,
  serializeJsonLd,
  parseSitemapUrlsetXml,
  serializeSitemapUrlsetXml,
  SitemapXmlValidationError,
  validateProductionSitemapXml,
  validateSitemapXmlUrls,
  parseExportHtmlHead,
} from '../lib/seo/index'
import { getBallgamesCatalog } from '../lib/catalog/adapter'
import { hockeyBrosDetail } from '../lib/catalog/instances/hockey-bros-detail'
import { createGameSeo, type Catalog, type CatalogGame } from '../lib/catalog/types'
import { resolvedSeoToMetadata } from '../lib/seo/metadata'
import {
  getProductionRoutableGames,
  isCatalogGameRoutableAsDetail,
  isProductionRoutableGameDetail,
} from '../lib/seo/production-game-routes'
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

test('production sitemap excludes draft portal but includes published indexable game when routed', () => {
  const entries = buildProductionSitemap(ballgamesSiteInstance)
  assert.equal(entries.length, 1)
  assert.equal(entries[0].url, 'https://ballgames.io/hockey-bros')
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
  assert.deepEqual(meta.robots, LEGACY_PAGE_ROBOTS)
})

test('legacy template metadata uses LEGACY_PAGE_ROBOTS (DEC-003-F)', () => {
  const meta = buildLegacyTemplateMetadata({
    title: 'Blog',
    canonicalPath: '/blog',
    site: ballgamesSiteInstance,
  })
  assert.deepEqual(meta.robots, LEGACY_PAGE_ROBOTS)
  assert.equal(meta.alternates?.canonical, siteUrl('/blog'))
})

test('portal indexable metadata is independent of legacy robots', () => {
  const { portal } = buildR1ExactTwoContractFixtures()
  const resolved = resolvePortalHomePageSeo(portal, ballgamesSiteInstance)
  const meta = resolvedSeoToMetadata(resolved, ballgamesSiteInstance)
  assert.deepEqual(meta.robots, { index: true, follow: true })
  assert.notDeepEqual(meta.robots, LEGACY_PAGE_ROBOTS)
})

test('parseSitemapUrlsetXml validates empty urlset document', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`
  const parsed = parseSitemapUrlsetXml(xml)
  assert.deepEqual(parsed.urls, [])
})

test('validateProductionSitemapXml matches serialized production entries', () => {
  const entries = buildProductionSitemap(ballgamesSiteInstance)
  const xml = serializeSitemapUrlsetXml(entries)
  validateProductionSitemapXml(xml, ballgamesSiteInstance)
})

test('validateSitemapXmlUrls enforces exact-two contract fixture', () => {
  const { portal, game } = buildR1ExactTwoContractFixtures()
  const entries = buildSitemapEntriesFromDescriptors([portal, game], ballgamesSiteInstance)
  const xml = serializeSitemapUrlsetXml(entries)
  validateSitemapXmlUrls(
    xml,
    entries.map((e) => e.url),
    ballgamesSiteInstance
  )
})

test('parseExportHtmlHead reads metadata from HTML head', () => {
  const html = `<!DOCTYPE html><html><head>
<title>BallGames.io</title>
<meta name="description" content="Play free ball games"/>
<meta name="robots" content="noindex, follow"/>
<link rel="canonical" href="https://ballgames.io"/>
<meta property="og:title" content="BallGames.io"/>
<meta property="og:url" content="https://ballgames.io"/>
</head><body></body></html>`
  const head = parseExportHtmlHead(html)
  assert.equal(head.title, 'BallGames.io')
  assert.equal(head.robots, 'noindex, follow')
  assert.equal(head.canonical, 'https://ballgames.io')
  assert.equal(head.openGraph.title, 'BallGames.io')
})

test('parseSitemapUrlsetXml rejects malformed XML structure', () => {
  const throws = (xml: string) =>
    assert.throws(() => parseSitemapUrlsetXml(xml), SitemapXmlValidationError)

  throws(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://ballgames.io</loc>`
  )
  throws(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
  )
  throws(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>`
  )
  throws(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://example.com/wrong"></urlset>`)
  throws(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>a</loc><loc>b</loc></url></urlset>`
  )
  throws(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><evil/><loc>https://ballgames.io</loc></url></urlset>`
  )
  throws(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>foo&bar</loc></url></urlset>`
  )
})

test('parseSitemapUrlsetXml strict structure: attributes and optional fields', () => {
  const ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
  const head = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${ns}">`
  const tail = `</urlset>`
  const throws = (xml: string) =>
    assert.throws(() => parseSitemapUrlsetXml(xml), SitemapXmlValidationError)

  throws(`${head.replace('>', ' invalidAttribute>')}${tail}`)
  throws(`${head.replace('>', ' data-unknown="x">')}${tail}`)
  throws(`${head}<url data-unknown="x"><loc>https://ballgames.io</loc></url>${tail}`)
  throws(
    `${head}<url><loc>https://ballgames.io</loc><lastmod>2026-01-15</lastmod><lastmod>2026-01-16</lastmod></url>${tail}`
  )
  throws(
    `${head}<url><loc>https://ballgames.io</loc><changefreq>daily</changefreq><changefreq>weekly</changefreq></url>${tail}`
  )
  throws(
    `${head}<url><loc>https://ballgames.io</loc><priority>0.5</priority><priority>0.8</priority></url>${tail}`
  )
  throws(`${head}<url><loc>https://ballgames.io</loc><changefreq>often</changefreq></url>${tail}`)
  throws(`${head}<url><loc>https://ballgames.io</loc><priority>-0.1</priority></url>${tail}`)
  throws(`${head}<url><loc>https://ballgames.io</loc><priority>1.5</priority></url>${tail}`)
  throws(`${head}<url><loc>https://ballgames.io</loc><lastmod>2026-13-40</lastmod></url>${tail}`)

  const withOptional = parseSitemapUrlsetXml(
    `${head}<url><loc>https://ballgames.io</loc><lastmod>2026-01-15T12:00:00Z</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>${tail}`
  )
  assert.deepEqual(withOptional.urls, ['https://ballgames.io'])

  const xmlnsOnly = parseSitemapUrlsetXml(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${ns}"></urlset>`
  )
  assert.deepEqual(xmlnsOnly.urls, [])
})

test('parseSitemapUrlsetXml priority and lastmod value boundaries', () => {
  const ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
  const head = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${ns}">`
  const tail = `</urlset>`
  const urlOpen = `<url><loc>https://ballgames.io</loc>`
  const urlClose = `</url>`
  const throws = (inner: string) =>
    assert.throws(
      () => parseSitemapUrlsetXml(`${head}${urlOpen}${inner}${urlClose}${tail}`),
      SitemapXmlValidationError
    )
  const accepts = (inner: string) => {
    const parsed = parseSitemapUrlsetXml(`${head}${urlOpen}${inner}${urlClose}${tail}`)
    assert.deepEqual(parsed.urls, ['https://ballgames.io'])
  }

  throws('<priority></priority>')
  throws('<priority>   </priority>')
  throws('<priority>1.5</priority>')
  accepts('<priority>0.5</priority>')

  throws('<lastmod>2026-01-15T99:99:99Z</lastmod>')
  throws('<lastmod>2026-01-15T12:99:00Z</lastmod>')
  throws('<lastmod>2026-01-15T12:30:99Z</lastmod>')
  throws('<lastmod>2026-01-15T12:30:45+99:99</lastmod>')
  throws('<lastmod>2026-02-30</lastmod>')

  accepts('<lastmod>2026-01-15T12:30:45Z</lastmod>')
  accepts('<lastmod>2026-01-15T12:30:45+05:30</lastmod>')
  accepts('<lastmod>2026-01-15T12:30:45.123Z</lastmod>')
})

test('parseSitemapUrlsetXml lastmod W3C datetime compatibility', () => {
  const ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
  const head = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${ns}">`
  const tail = `</urlset>`
  const urlOpen = `<url><loc>https://ballgames.io</loc>`
  const urlClose = `</url>`
  const wrap = (lastmod: string) => `${head}${urlOpen}${lastmod}${urlClose}${tail}`
  const throws = (lastmod: string) =>
    assert.throws(() => parseSitemapUrlsetXml(wrap(lastmod)), SitemapXmlValidationError)
  const accepts = (lastmod: string) => {
    const parsed = parseSitemapUrlsetXml(wrap(lastmod))
    assert.deepEqual(parsed.urls, ['https://ballgames.io'])
  }

  accepts('<lastmod>2026-01-15</lastmod>')
  accepts('<lastmod>2026-01-15T12:30:45Z</lastmod>')
  accepts('<lastmod>2026-01-15T12:30:45+08:00</lastmod>')
  accepts('<lastmod>2026-01-15T12:30:45.123Z</lastmod>')
  accepts('<lastmod>2026-01-15T12:30:45</lastmod>')

  throws('<lastmod>2026-02-30</lastmod>')
  throws('<lastmod>2026-01-15T25:30:45Z</lastmod>')
  throws('<lastmod>2026-01-15T12:60:45Z</lastmod>')
  throws('<lastmod>2026-01-15T12:30:60Z</lastmod>')
  throws('<lastmod>2026-01-15T12:30:45+25:00</lastmod>')
  throws('<lastmod>2026-01-15T12:30:45+08:60</lastmod>')
})

test('validateSitemapXmlUrls rejects illegal loc URLs', () => {
  const base = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
  assert.throws(
    () =>
      validateSitemapXmlUrls(
        `${base}<url><loc>https://evil.example/x</loc></url></urlset>`,
        ['https://evil.example/x'],
        ballgamesSiteInstance
      ),
    SitemapXmlValidationError
  )
  assert.throws(
    () =>
      validateSitemapXmlUrls(
        `${base}<url><loc>https://ballgames.io/blog</loc></url></urlset>`,
        ['https://ballgames.io/blog'],
        ballgamesSiteInstance
      ),
    SitemapXmlValidationError
  )
})

test('Phase 4.2 R01–R04: isAppRoutePath portal vs blog vs unknown game', () => {
  assert.equal(isAppRoutePath('/'), true)
  assert.equal(isAppRoutePath('/hockey-bros'), true)
  assert.equal(isAppRoutePath('/blog'), false)
  assert.equal(isAppRoutePath('/blog/example-post'), false)
  assert.equal(isAppRoutePath('/soccer-bros'), false)
  assert.equal(isAppRoutePath('/not-a-game'), false)
})

test('Phase 4.2 R05–R06: production game descriptor and static params slugs', () => {
  const game = findProductionRoutableGame('hockey-bros')
  assert.ok(game)
  const descriptor = buildGameDetailPageDescriptor(game!)
  assert.equal(descriptor?.pageType, 'game_detail')
  assert.equal(descriptor?.routeExists, true)
  const slugs = getProductionRoutableGameSlugs()
  assert.deepEqual(slugs, ['hockey-bros'])
})

test('Phase 4.2 R07: unknown slug is not routable from catalog', () => {
  assert.equal(findProductionRoutableGame('unknown-slug'), undefined)
})

test('Phase 4.2 M01–M05: game detail metadata from catalog SEO', () => {
  const game = findProductionRoutableGame('hockey-bros')!
  const descriptor = buildGameDetailPageDescriptor(game)!
  const resolved = resolveGameDetailPageSeo(descriptor, ballgamesSiteInstance)
  assert.equal(resolved.title, hockeyBrosDetail.seo.title)
  assert.equal(resolved.description, hockeyBrosDetail.seo.description)
  assert.equal(resolved.canonical, 'https://ballgames.io/hockey-bros')
  assert.equal(findProductionRoutableGame('soccer-bros'), undefined)
})

test('Phase 4.2 production descriptors include game detail from adapter', () => {
  const descriptors = getProductionPortalDescriptors()
  const gameDescriptors = descriptors.filter((d) => d.pageType === 'game_detail')
  assert.equal(gameDescriptors.length, 1)
  assert.equal(gameDescriptors[0].slug, 'hockey-bros')
  assert.equal(
    getBallgamesCatalog().games.some((g) => g.slug === 'hockey-bros'),
    true
  )
})

/** Mirrors root layout `title.template` applying to string child titles (Next.js Metadata API). */
function documentTitleWithSiteTemplate(meta: { title?: unknown }, siteTitle: string): string {
  const t = meta.title
  if (t && typeof t === 'object' && 'absolute' in t && typeof (t as { absolute: string }).absolute === 'string') {
    return (t as { absolute: string }).absolute
  }
  if (typeof t === 'string') {
    return `${t} | ${siteTitle}`
  }
  throw new Error('unsupported metadata title shape in test')
}

function minimalDetailFixtureGame(overrides: Partial<CatalogGame>): CatalogGame {
  return {
    id: 'fixture-game',
    slug: 'soccer-bros',
    title: 'Soccer Bros',
    launch: { verification: 'verified', mode: 'external-link', primaryUrl: 'https://example.com/' },
    publicationStatus: 'published',
    showOnHome: false,
    homeSort: 99,
    cardAction: 'navigate-to-detail',
    detail: {
      seo: createGameSeo({ title: 'Soccer', description: 'Soccer fixture detail for routing tests' }),
      intro: 'intro',
      howToPlay: 'how',
      sections: [{ heading: 'H', body: 'b' }],
      faq: [{ q: 'q', a: 'a' }],
      controls: [{ label: 'Move', keys: 'WASD' }],
    },
    ...overrides,
  }
}

test('Phase 4.2.1 P1-01: resolvedSeoToMetadata uses absolute title (no template duplication)', () => {
  const game = findProductionRoutableGame('hockey-bros')!
  const descriptor = buildGameDetailPageDescriptor(game)!
  const resolved = resolveGameDetailPageSeo(descriptor, ballgamesSiteInstance)
  const meta = resolvedSeoToMetadata(resolved, ballgamesSiteInstance)
  assert.ok(meta.title && typeof meta.title === 'object' && 'absolute' in meta.title)
  assert.equal((meta.title as { absolute: string }).absolute, hockeyBrosDetail.seo.title)
  const docTitle = documentTitleWithSiteTemplate(meta, ballgamesSiteInstance.metadata.title)
  assert.equal(docTitle, hockeyBrosDetail.seo.title)
  assert.ok(!docTitle.endsWith('| BallGames.io | BallGames.io'))
})

test('Phase 4.2.1: legacy blog metadata still uses string title for layout template', () => {
  const meta = buildLegacyTemplateMetadata({
    title: 'Blog',
    canonicalPath: '/blog',
    site: ballgamesSiteInstance,
  })
  assert.equal(meta.title, 'Blog')
  assert.equal(documentTitleWithSiteTemplate(meta, ballgamesSiteInstance.metadata.title), 'Blog | BallGames.io')
})

test('Phase 4.2.1 P1-02: R1 allowlist excludes unpublished-approved fixture slug', () => {
  const catalog: Catalog = {
    providers: [],
    embedPermissions: [],
    games: [
      minimalDetailFixtureGame({ slug: 'soccer-bros', publicationStatus: 'published' }),
      minimalDetailFixtureGame({
        slug: 'hockey-bros',
        id: 'hockey-bros-draft',
        publicationStatus: 'draft',
      }),
    ],
  }
  const soccer = catalog.games[0]
  const hockeyDraft = catalog.games[1]
  assert.equal(isCatalogGameRoutableAsDetail(soccer), true)
  assert.equal(isProductionRoutableGameDetail(soccer), false)
  assert.equal(isCatalogGameRoutableAsDetail(hockeyDraft), false)
  assert.equal(getProductionRoutableGames(catalog).length, 0)
})

test('Phase 4.2.1 P1-02: launcher-only game never production-routable', () => {
  const game = minimalDetailFixtureGame({
    slug: 'basket-bros',
    cardAction: 'launcher-select',
  })
  assert.equal(isCatalogGameRoutableAsDetail(game), false)
  assert.equal(isProductionRoutableGameDetail(game), false)
})

test('validateSitemapXmlUrls rejects duplicate loc across url entries', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ballgames.io</loc></url>
  <url><loc>https://ballgames.io</loc></url>
</urlset>`
  assert.throws(
    () => validateSitemapXmlUrls(xml, ['https://ballgames.io'], ballgamesSiteInstance),
    SitemapXmlValidationError
  )
})
