/**
 * Phase 3 deterministic SEO validation (contract + optional export artifacts).
 * Phase 4.1.3：在同管线中执行 Catalog schema + `validateCatalogSeo`（仅 `seo.indexable === true` 的游戏受完整 Detail 门禁）。
 * Bundled by scripts/validate-seo.mjs
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { getBallgamesCatalog, validateCatalog, validateCatalogSeo } from '../lib/catalog/index'
import { getPortalHomeContent } from '../lib/site/get-portal-home-content'
import { SiteConfigError, ballgamesSiteInstance } from '../lib/site/index'
import {
  buildPortalHomeJsonLdBlocks,
  buildProductionSitemap,
  buildR1ExactTwoContractFixtures,
  buildSitemapEntriesFromDescriptors,
  buildSiteRootMetadata,
  isSitemapCandidate,
  resolvePortalHomePageSeo,
  serializeJsonLd,
  serializeSitemapUrlsetXml,
  validateProductionSitemapXml,
  validateSitemapXmlUrls,
  assertExportHtmlHeadMatches,
} from '../lib/seo/index'
import { LEGACY_PAGE_ROBOTS, resolvedSeoToMetadata } from '../lib/seo/metadata'
import { gameUrl, siteUrl } from '../lib/urls/site-url'

const STARTER_DOMAIN = 'tailwind-nextjs-starter-blog.vercel.app'
const failures: string[] = []

function runCatalogSeoGate(): void {
  const catalog = getBallgamesCatalog()
  validateCatalog(catalog)
  validateCatalogSeo(catalog)
}

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

check('canonical path strict validation', () => {
  assert.equal(siteUrl('/blog'), 'https://ballgames.io/blog')
  assert.throws(() => siteUrl('/blog/'), SiteConfigError)
  assert.throws(() => siteUrl('/blog//post'), SiteConfigError)
  assert.throws(() => siteUrl('//blog'), SiteConfigError)
  assert.throws(() => siteUrl('/blog/./post'), SiteConfigError)
  assert.throws(() => siteUrl('/%2e%2e/secret'), SiteConfigError)
  assert.throws(() => siteUrl(' /blog'), SiteConfigError)
  assert.throws(() => siteUrl('/blog '), SiteConfigError)
  assert.throws(() => siteUrl('/blog\\post'), SiteConfigError)
  assert.throws(() => siteUrl('/blog%5cpost'), SiteConfigError)
  assert.throws(() => siteUrl('/blog%5Cpost'), SiteConfigError)
})

// --- Catalog + Catalog SEO（与 schema / Production Gate 分离）---
check('catalog schema + SEO indexability gate', () => {
  runCatalogSeoGate()
})

// --- Metadata ---
check('portal home requires explicit title', () => {
  const portal = getPortalHomeContent()
  assert.throws(
    () =>
      resolvePortalHomePageSeo(
        {
          pageType: 'portal_home',
          routePath: '/',
          routeExists: true,
          content: {
            ...portal,
            seo: { ...portal.seo, title: '' },
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
      content: getPortalHomeContent(),
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
      content: getPortalHomeContent(),
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

// --- Sitemap (structured XML + eligibility) ---
check('production sitemap XML matches eligibility (empty when draft portal)', () => {
  const entries = buildProductionSitemap(ballgamesSiteInstance)
  const xml = serializeSitemapUrlsetXml(entries)
  validateProductionSitemapXml(xml, ballgamesSiteInstance)
  assert.equal(entries.length, 0)
})

check('contract exact-two sitemap XML matches fixture eligibility', () => {
  const { portal, game } = buildR1ExactTwoContractFixtures()
  const entries = buildSitemapEntriesFromDescriptors([portal, game], ballgamesSiteInstance)
  const xml = serializeSitemapUrlsetXml(entries)
  validateSitemapXmlUrls(
    xml,
    entries.map((e) => e.url),
    ballgamesSiteInstance
  )
  assert.deepEqual(
    entries.map((e) => e.url).sort(),
    ['https://ballgames.io', 'https://ballgames.io/hockey-bros'].sort()
  )
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
  const site = ballgamesSiteInstance
  const legacyRobots = `${LEGACY_PAGE_ROBOTS.index ? 'index' : 'noindex'}, follow`

  check('export dir exists', () => assert.ok(fs.existsSync(abs), `missing ${abs}`))

  check('sitemap.xml structured eligibility validation', () => {
    const xml = fs.readFileSync(path.join(abs, 'sitemap.xml'), 'utf8')
    assert.ok(!xml.includes(STARTER_DOMAIN))
    validateProductionSitemapXml(xml, site)
  })

  check('robots.txt uses ballgames helper urls', () => {
    const robots = fs.readFileSync(path.join(abs, 'robots.txt'), 'utf8')
    assert.ok(robots.includes('Sitemap: https://ballgames.io/sitemap.xml'))
    assert.ok(robots.includes('Host: https://ballgames.io'))
    assert.ok(!robots.includes(STARTER_DOMAIN))
  })

  const exportHtmlPages: Array<{
    file: string
    label: string
    expectation: Parameters<typeof assertExportHtmlHeadMatches>[1]
    required: boolean
  }> = [
    {
      file: 'index.html',
      label: '/ (legacy shell)',
      required: true,
      expectation: {
        title: site.metadata.title,
        description: site.metadata.description,
        robots: legacyRobots,
        canonical: siteUrl(undefined, site),
        openGraph: {
          title: site.metadata.title,
          description: site.metadata.description,
          url: siteUrl(undefined, site),
          site_name: site.metadata.title,
          type: 'website',
        },
      },
    },
    {
      file: 'blog.html',
      label: '/blog',
      required: true,
      expectation: {
        title: `Blog | ${site.metadata.title}`,
        description: site.metadata.description,
        robots: legacyRobots,
        canonical: siteUrl('/blog', site),
        openGraph: {
          title: 'Blog',
          url: siteUrl('/blog', site),
          site_name: site.metadata.title,
          type: 'website',
        },
      },
    },
    {
      file: 'about.html',
      label: '/about',
      required: true,
      expectation: {
        title: `About | ${site.metadata.title}`,
        robots: legacyRobots,
        canonical: siteUrl('/about', site),
      },
    },
    {
      file: 'projects.html',
      label: '/projects',
      required: true,
      expectation: {
        title: `Projects | ${site.metadata.title}`,
        robots: legacyRobots,
        canonical: siteUrl('/projects', site),
      },
    },
    {
      file: 'tags.html',
      label: '/tags',
      required: true,
      expectation: {
        title: `Tags | ${site.metadata.title}`,
        robots: legacyRobots,
        canonical: siteUrl('/tags', site),
      },
    },
  ]

  for (const page of exportHtmlPages) {
    check(`export HTML head ${page.label}`, () => {
      const filePath = path.join(abs, page.file)
      if (!fs.existsSync(filePath)) {
        if (page.required) assert.fail(`missing export HTML: ${page.file}`)
        return
      }
      const html = fs.readFileSync(filePath, 'utf8')
      assert.ok(!html.includes(STARTER_DOMAIN), `${page.file} must not contain starter domain`)
      assertExportHtmlHeadMatches(html, page.expectation, page.file)
    })
  }

  check('export legacy blog post HTML robots/canonical (sample)', () => {
    const sample = path.join(abs, 'blog', 'introducing-tailwind-nextjs-starter-blog.html')
    if (!fs.existsSync(sample)) {
      console.warn('validate-seo: N/A blog post sample HTML (file missing)')
      return
    }
    const html = fs.readFileSync(sample, 'utf8')
    assertExportHtmlHeadMatches(
      html,
      {
        robots: legacyRobots,
        canonical: siteUrl('/blog/introducing-tailwind-nextjs-starter-blog', site),
      },
      'blog/introducing-tailwind-nextjs-starter-blog.html'
    )
  })

  check('export BLOCKED: hockey-bros (Phase 4 route not implemented)', () => {
    const blocked = path.join(abs, 'hockey-bros.html')
    assert.ok(!fs.existsSync(blocked), 'must not export /hockey-bros before Phase 4')
    assert.ok(!fs.existsSync(path.join(abs, 'hockey-bros', 'index.html')))
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
