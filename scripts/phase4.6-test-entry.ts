/**
 * Phase 4.6 — static export artifact validation (P46-01 …).
 * Requires `out/` from `EXPORT=1 UNOPTIMIZED=1 yarn build`.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

import { hockeyBrosDetail } from '../lib/catalog/instances/hockey-bros-detail'
import { getPortalHomeContent } from '../lib/site/get-portal-home-content'
import { ballgamesSiteInstance } from '../lib/site/index'
import { PORTAL_HOME_SECTION_HEADINGS } from '../lib/site/portal-home-editorial-contract'
import {
  assertNoForbiddenJsonLdFields,
  buildGameDetailJsonLdBlocks,
  buildGameDetailPageDescriptor,
  buildPortalHomeJsonLdBlocks,
  findProductionRoutableGame,
  serializeSitemapUrlsetXml,
} from '../lib/seo/index'
import { assertExportHtmlHeadMatches } from '../lib/seo/validate-export-html-meta'
import {
  parseSitemapUrlsetXml,
  SitemapXmlValidationError,
  validateProductionSitemapXml,
  validateSitemapXmlUrls,
} from '../lib/seo/validate-sitemap-xml'
import { buildR1ExactTwoContractFixtures } from '../lib/seo/fixtures'
import { LEGACY_PAGE_ROBOTS } from '../lib/seo/metadata'
import { gameUrl, siteUrl } from '../lib/urls/site-url'

const exportDirArg = process.argv.find((a) => a.startsWith('--export-dir='))
const exportDir = exportDirArg
  ? path.resolve(exportDirArg.split('=')[1] ?? 'out')
  : path.resolve('out')

const STARTER_DOMAIN = 'tailwind-nextjs-starter-blog.vercel.app'
const EXPECTED_SITEMAP_URLS = ['https://ballgames.io', 'https://ballgames.io/hockey-bros'].sort()

function readExport(name: string): string {
  const filePath = path.join(exportDir, name)
  assert.ok(fs.existsSync(filePath), `missing export artifact: ${name}`)
  return fs.readFileSync(filePath, 'utf8')
}

function parseJsonLdScripts(html: string): Record<string, unknown>[] {
  const tree = fromHtmlIsomorphic(html, { fragment: false }) as Root
  const blocks: Record<string, unknown>[] = []
  visit(tree, (node) => {
    if (node.type !== 'element') return
    const el = node as Element
    if (el.tagName !== 'script') return
    const type = String(el.properties?.type ?? '')
    if (type !== 'application/ld+json') return
    let raw = ''
    visit(el, (child) => {
      if (child.type === 'text' && 'value' in child) raw += child.value
    })
    const parsed = JSON.parse(raw.trim()) as Record<string, unknown> | Record<string, unknown>[]
    if (Array.isArray(parsed)) blocks.push(...parsed)
    else blocks.push(parsed)
  })
  return blocks
}

function normalizeWs(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function extractVisibleFaq(html: string): Array<{ q: string; a: string }> {
  const tree = fromHtmlIsomorphic(html, { fragment: false }) as Root
  const items: Array<{ q: string; a: string }> = []
  visit(tree, (node) => {
    if (node.type !== 'element') return
    const el = node as Element
    if (el.tagName !== 'details') return
    let summaryText = ''
    let answerText = ''
    let inSummary = false
    visit(el, (child) => {
      if (child.type !== 'element') return
      const c = child as Element
      if (c.tagName === 'summary') inSummary = true
      else if (inSummary && c.tagName === 'p') {
        inSummary = false
      }
    })
    visit(el, (child) => {
      if (child.type === 'element') {
        const c = child as Element
        if (c.tagName === 'summary') {
          let t = ''
          visit(c, (n) => {
            if (n.type === 'text' && 'value' in n) t += n.value
          })
          summaryText = normalizeWs(t)
        }
        if (c.tagName === 'p' && summaryText) {
          let t = ''
          visit(c, (n) => {
            if (n.type === 'text' && 'value' in n) t += n.value
          })
          if (t.trim()) answerText = normalizeWs(t)
        }
      }
    })
    if (summaryText && answerText) items.push({ q: summaryText, a: answerText })
  })
  return items
}

function headingTexts(html: string, level: 1 | 2): string[] {
  const tree = fromHtmlIsomorphic(html, { fragment: false }) as Root
  const out: string[] = []
  visit(tree, (node) => {
    if (node.type !== 'element') return
    const el = node as Element
    if (el.tagName !== `h${level}`) return
    let text = ''
    visit(el, (child) => {
      if (child.type === 'text' && 'value' in child) text += child.value
    })
    out.push(normalizeWs(text))
  })
  return out
}

test('P46-01 export directory and required flat HTML artifacts', () => {
  assert.ok(fs.existsSync(exportDir), `export dir missing: ${exportDir}`)
  for (const file of ['index.html', 'hockey-bros.html', 'sitemap.xml', 'robots.txt']) {
    assert.ok(fs.existsSync(path.join(exportDir, file)), file)
  }
  assert.ok(!fs.existsSync(path.join(exportDir, 'hockey-bros', 'index.html')))
})

test('P46-02 production sitemap.xml exact-two from disk', () => {
  const xml = readExport('sitemap.xml')
  assert.ok(!xml.includes(STARTER_DOMAIN))
  const { urls } = parseSitemapUrlsetXml(xml)
  assert.deepEqual([...urls].sort(), EXPECTED_SITEMAP_URLS)
  validateProductionSitemapXml(xml, ballgamesSiteInstance)
})

test('P46-03 sitemap negative fixtures still reject bad XML', () => {
  const site = ballgamesSiteInstance
  const ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
  const oneUrl = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${ns}"><url><loc>https://ballgames.io</loc></url></urlset>`
  assert.throws(() => validateProductionSitemapXml(oneUrl, site), SitemapXmlValidationError)

  const three = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${ns}"><url><loc>https://ballgames.io</loc></url><url><loc>https://ballgames.io/hockey-bros</loc></url><url><loc>https://ballgames.io/blog</loc></url></urlset>`
  assert.throws(() => validateProductionSitemapXml(three, site), SitemapXmlValidationError)

  const dup = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${ns}"><url><loc>https://ballgames.io</loc></url><url><loc>https://ballgames.io</loc></url></urlset>`
  assert.throws(() => validateSitemapXmlUrls(dup, ['https://ballgames.io'], site), SitemapXmlValidationError)

  const legacy = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="${ns}"><url><loc>https://ballgames.io/blog</loc></url></urlset>`
  assert.throws(
    () => validateSitemapXmlUrls(legacy, ['https://ballgames.io/blog'], site),
    SitemapXmlValidationError
  )
})

test('P46-04 robots.txt host and sitemap', () => {
  const robots = readExport('robots.txt')
  assert.ok(robots.includes('Sitemap: https://ballgames.io/sitemap.xml'))
  assert.ok(robots.includes('Host: https://ballgames.io'))
  assert.equal(robots.includes('Disallow: /search'), false)
})

test('P46-05 portal home metadata from index.html', () => {
  const portal = getPortalHomeContent()
  const html = readExport('index.html')
  assert.ok(!html.includes(STARTER_DOMAIN))
  assertExportHtmlHeadMatches(
    html,
    {
      title: portal.seo.title,
      description: portal.seo.description,
      canonical: siteUrl(),
      robots: 'index, follow',
      openGraph: {
        title: portal.seo.title,
        description: portal.seo.description,
        url: siteUrl(),
      },
    },
    'index.html'
  )
  assert.equal(html.includes('name="keywords"'), false)
})

test('P46-06 hockey-bros detail metadata from export HTML', () => {
  const html = readExport('hockey-bros.html')
  const game = findProductionRoutableGame('hockey-bros')
  assert.ok(game)
  assertExportHtmlHeadMatches(
    html,
    {
      title: hockeyBrosDetail.seo.title,
      description: hockeyBrosDetail.seo.description,
      canonical: gameUrl('hockey-bros'),
      robots: 'index, follow',
      openGraph: {
        url: gameUrl('hockey-bros'),
      },
    },
    'hockey-bros.html'
  )
})

test('P46-07 legacy export pages remain noindex follow', () => {
  const legacyRobots = `${LEGACY_PAGE_ROBOTS.index ? 'index' : 'noindex'}, follow`
  for (const page of ['blog.html', 'about.html', 'projects.html', 'tags.html']) {
    const html = readExport(page)
    assertExportHtmlHeadMatches(html, { robots: legacyRobots }, page)
  }
})

test('P46-08 homepage JSON-LD types and FAQ parity', () => {
  const html = readExport('index.html')
  const blocks = parseJsonLdScripts(html)
  const types = blocks.map((b) => b['@type']).sort()
  assert.ok(types.includes('WebSite'))
  assert.ok(types.includes('ItemList'))
  assert.ok(types.includes('FAQPage'))
  assert.equal(types.includes('Organization'), false)

  const webSite = blocks.find((b) => b['@type'] === 'WebSite')!
  assert.equal(webSite.name, 'BallGames.io')
  assert.equal(webSite.url, siteUrl())
  assert.equal('potentialAction' in webSite, false)

  const itemList = blocks.find((b) => b['@type'] === 'ItemList')!
  const elements = itemList.itemListElement as Array<{ name: string; url: string }>
  assert.equal(elements.length, 1)
  assert.equal(elements[0].name, 'Hockey Bros')
  assert.equal(elements[0].url, gameUrl('hockey-bros'))

  const portal = getPortalHomeContent()
  const { portal: descriptor, game } = buildR1ExactTwoContractFixtures()
  const expectedBlocks = buildPortalHomeJsonLdBlocks({
    portal: { ...descriptor, content: portal },
    qualifiedGameDetail: game,
    site: ballgamesSiteInstance,
  })
  for (const block of expectedBlocks) assertNoForbiddenJsonLdFields(block)

  const faqBlock = blocks.find((b) => b['@type'] === 'FAQPage')!
  const entities = faqBlock.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>
  assert.equal(entities.length, 8)

  const visible = extractVisibleFaq(html)
  assert.equal(visible.length, 8)
  for (let i = 0; i < 8; i++) {
    assert.equal(entities[i].name, visible[i].q)
    assert.equal(entities[i].acceptedAnswer.text, visible[i].a)
  }
})

test('P46-09 detail JSON-LD types breadcrumb and FAQ parity', () => {
  const html = readExport('hockey-bros.html')
  const blocks = parseJsonLdScripts(html)
  const types = blocks.map((b) => b['@type']).sort()
  assert.ok(types.includes('VideoGame'))
  assert.ok(types.includes('FAQPage'))
  assert.ok(types.includes('BreadcrumbList'))

  const game = findProductionRoutableGame('hockey-bros')!
  const descriptor = buildGameDetailPageDescriptor(game)
  assert.ok(descriptor)
  const expected = buildGameDetailJsonLdBlocks({ game, site: ballgamesSiteInstance })
  for (const block of expected) assertNoForbiddenJsonLdFields(block)

  const video = blocks.find((b) => b['@type'] === 'VideoGame')!
  assert.equal(video.name, game.title)
  assert.equal(video.url, gameUrl('hockey-bros'))
  assert.equal('aggregateRating' in video, false)
  assert.equal('offers' in video, false)

  const faqBlock = blocks.find((b) => b['@type'] === 'FAQPage')!
  const entities = faqBlock.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>
  assert.equal(entities.length, 7)
  const visible = extractVisibleFaq(html)
  assert.equal(visible.length, 7)
  for (let i = 0; i < 7; i++) {
    assert.equal(entities[i].name, visible[i].q)
    assert.equal(entities[i].acceptedAnswer.text, visible[i].a)
  }

  const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList')!
  const items = crumbs.itemListElement as Array<{ name: string; item: string }>
  assert.equal(items.length, 2)
  assert.equal(items[0].name, 'Home')
  assert.equal(items[0].item, siteUrl())
  assert.equal(items[1].name, 'Hockey Bros')
  assert.equal(items[1].item, gameUrl('hockey-bros'))
})

test('P46-10 homepage structure H1 H2 and SEO phrase gate', () => {
  const html = readExport('index.html')
  const h1s = headingTexts(html, 1)
  assert.deepEqual(h1s.filter((t) => t === 'Ball Games'), ['Ball Games'])
  assert.equal(h1s.length, 1)
  const h2s = headingTexts(html, 2)
  assert.deepEqual(h2s, [...PORTAL_HOME_SECTION_HEADINGS])
  const portal = getPortalHomeContent()
  const seoBody = [portal.intro ?? '', ...(portal.sections ?? []).flatMap((s) => s.paragraphs)]
    .join(' ')
    .toLowerCase()
  assert.equal(seoBody.includes('hockey bros'), false, 'SEO body block (intro + 5×H2) must exclude hockey bros')
})

test('P46-11 detail page single H1', () => {
  const html = readExport('hockey-bros.html')
  const h1s = headingTexts(html, 1)
  assert.equal(h1s.length, 1)
  assert.equal(h1s[0], 'Hockey Bros')
})

test('P46-12 export sitemap lastmod format when present', () => {
  const xml = readExport('sitemap.xml')
  const { urls } = parseSitemapUrlsetXml(xml)
  assert.deepEqual(urls.sort(), EXPECTED_SITEMAP_URLS)
  const portal = getPortalHomeContent()
  assert.ok(portal.updatedAt)
  assert.ok(xml.includes(portal.updatedAt))
  const entries = buildR1ExactTwoContractFixtures()
  const serialized = serializeSitemapUrlsetXml([
    { url: siteUrl(), lastModified: portal.updatedAt! },
    { url: gameUrl('hockey-bros') },
  ])
  validateProductionSitemapXml(serialized, ballgamesSiteInstance)
  void entries
})
