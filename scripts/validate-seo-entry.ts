/**
 * Phase 3 deterministic SEO validation (contract + optional export artifacts).
 * Bundled by scripts/validate-seo.mjs
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

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
import { gameUrl, siteUrl } from '../lib/urls/site-url'

const STARTER_DOMAIN = 'tailwind-nextjs-starter-blog.vercel.app'
const failures: string[] = []

function check(name: string, fn: () => void): void {
  try {
    fn()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push(`${name}: ${message}`)
  }
}

// --- URL ---
check('siteUrl root', () => {
  assert.equal(siteUrl(), 'https://ballgames.io')
  assert.equal(siteUrl('/hockey-bros'), 'https://ballgames.io/hockey-bros')
})

check('gameUrl delegates to siteUrl', () => {
  assert.equal(gameUrl('hockey-bros'), siteUrl('/hockey-bros'))
  assert.throws(() => gameUrl('/hockey-bros'), SiteConfigError)
})

check('BASE_PATH ignored for canonical', () => {
  const prev = process.env.BASE_PATH
  process.env.BASE_PATH = '/Game-site-kit'
  try {
    assert.equal(siteUrl('/blog'), 'https://ballgames.io/blog')
  } finally {
    if (prev === undefined) delete process.env.BASE_PATH
    else process.env.BASE_PATH = prev
  }
})

check('canonical path output has no trailing slash', () => {
  assert.equal(siteUrl('/blog/'), 'https://ballgames.io/blog')
})

// --- Metadata ---
check('portal home requires explicit title', () => {
  assert.throws(
    () =>
      resolvePortalHomePageSeo(
        {
          pageType: 'portal_home',
          routePath: '/',
          routeExists: true,
          content: {
            ...ballgamesPortalHomeContentFixture,
            seo: { ...ballgamesPortalHomeContentFixture.seo, title: '' },
          },
        },
        ballgamesSiteInstance
      ),
    SiteConfigError
  )
})

check('canonical equals openGraph url', () => {
  const resolved = resolvePortalHomePageSeo(
    {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: true,
      content: ballgamesPortalHomeContentFixture,
    },
    ballgamesSiteInstance
  )
  assert.equal(resolved.canonical, resolved.openGraphUrl)
})

check('og image socialBanner fallback only', () => {
  const resolved = resolvePortalHomePageSeo(
    {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: true,
      content: ballgamesPortalHomeContentFixture,
    },
    ballgamesSiteInstance
  )
  assert.equal(resolved.ogImage, ballgamesSiteInstance.metadata.socialBanner)
  const meta = resolvedSeoToMetadata(resolved, ballgamesSiteInstance)
  assert.ok(meta.openGraph?.images)
})

check('site root metadata origin', () => {
  const meta = buildSiteRootMetadata(ballgamesSiteInstance)
  assert.equal(String(meta.metadataBase), 'https://ballgames.io/')
})

// --- Sitemap ---
check('production sitemap has no legacy blog routes', () => {
  const entries = buildProductionSitemap(ballgamesSiteInstance)
  for (const entry of entries) {
    assert.ok(!entry.url.includes('/blog'))
    assert.ok(!entry.url.includes('/tags'))
    assert.ok(!entry.url.includes('/projects'))
    assert.ok(!entry.url.includes('/about'))
  }
})

check('production excludes draft portal and missing game route', () => {
  assert.equal(buildProductionSitemap(ballgamesSiteInstance).length, 0)
})

check('contract exact-two fixture', () => {
  const { portal, game } = buildR1ExactTwoContractFixtures()
  assert.equal(isSitemapCandidate(portal, ballgamesSiteInstance), true)
  assert.equal(isSitemapCandidate(game, ballgamesSiteInstance), true)
  const urls = buildSitemapEntriesFromDescriptors([portal, game], ballgamesSiteInstance)
    .map((e) => e.url)
    .sort()
  assert.deepEqual(urls, ['https://ballgames.io', 'https://ballgames.io/hockey-bros'].sort())
})

check('missing route excludes game from sitemap', () => {
  const { portal, game } = buildR1ExactTwoContractFixtures()
  assert.equal(isSitemapCandidate({ ...game, routeExists: false }, ballgamesSiteInstance), false)
  const entries = buildSitemapEntriesFromDescriptors(
    [portal, { ...game, routeExists: false }],
    ballgamesSiteInstance
  )
  assert.equal(entries.length, 1)
})

check('non-indexable excluded', () => {
  const { portal } = buildR1ExactTwoContractFixtures()
  const draft = {
    ...portal,
    content: {
      ...portal.content,
      publicationStatus: 'draft' as const,
      seo: { ...portal.content.seo, indexable: false },
    },
  }
  assert.equal(isSitemapCandidate(draft, ballgamesSiteInstance), false)
})

// --- JSON-LD ---
check('json-ld parseable and forbidden fields absent', () => {
  const { portal, game } = buildR1ExactTwoContractFixtures()
  const blocks = buildPortalHomeJsonLdBlocks({
    portal,
    qualifiedGameDetail: game,
    site: ballgamesSiteInstance,
  })
  const json = serializeJsonLd(blocks)
  JSON.parse(json)
  assert.equal(json.includes('aggregateRating'), false)
  assert.equal(json.includes('Organization'), false)
  assert.equal(json.includes('SearchAction'), false)
})

check('sitemap lastmod from updatedAt only', () => {
  const { portal } = buildR1ExactTwoContractFixtures()
  const entry = buildSitemapEntriesFromDescriptors([portal], ballgamesSiteInstance)[0]
  assert.equal(entry.lastModified, portal.content.updatedAt)
})

const exportDir = process.argv.find((a) => a.startsWith('--export-dir='))?.split('=')[1]

if (exportDir) {
  const abs = path.resolve(exportDir)
  check('export dir exists', () => assert.ok(fs.existsSync(abs), `missing ${abs}`))

  check('sitemap.xml present', () => {
    const xml = fs.readFileSync(path.join(abs, 'sitemap.xml'), 'utf8')
    assert.ok(!xml.includes(STARTER_DOMAIN))
    assert.ok(!xml.includes('/blog'))
    assert.ok(!xml.includes('hockey-bros'), 'production must not fabricate /hockey-bros')
  })

  check('robots.txt uses ballgames helper urls', () => {
    const robots = fs.readFileSync(path.join(abs, 'robots.txt'), 'utf8')
    assert.ok(robots.includes('Sitemap: https://ballgames.io/sitemap.xml'))
    assert.ok(robots.includes('Host: https://ballgames.io'))
    assert.ok(!robots.includes(STARTER_DOMAIN))
  })

  check('index.html canonical and no starter domain', () => {
    const html = fs.readFileSync(path.join(abs, 'index.html'), 'utf8')
    assert.ok(!html.includes(STARTER_DOMAIN))
    assert.match(html, /rel="canonical" href="https:\/\/ballgames.io"/)
  })

  check('flat export blog.html when trailingSlash false', () => {
    assert.ok(fs.existsSync(path.join(abs, 'blog.html')))
    assert.ok(!fs.existsSync(path.join(abs, 'blog', 'index.html')))
  })

  const basePath = process.env.BASE_PATH || ''
  if (basePath) {
    check('basePath asset prefixes in index.html', () => {
      const html = fs.readFileSync(path.join(abs, 'index.html'), 'utf8')
      assert.ok(html.includes(`${basePath}/_next/`) || html.includes(`${basePath}/static/`))
    })
  }
}

if (failures.length) {
  console.error('validate-seo FAIL')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log('validate-seo PASS')
console.log(
  JSON.stringify({
    checks: 'contract' + (exportDir ? '+artifacts' : ''),
    exportDir: exportDir || null,
  })
)
