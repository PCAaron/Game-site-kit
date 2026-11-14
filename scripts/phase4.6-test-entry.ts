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
  assertJsonLdBlocksMeetEvidenceContract,
  assertMinimalVerifiedOfferShape,
  assertNoForbiddenJsonLdFields,
  buildGameDetailPageDescriptor,
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
    const roots = Array.isArray(parsed) ? parsed : [parsed]
    for (const root of roots) {
      blocks.push(root)
      const graph = root['@graph']
      if (Array.isArray(graph)) {
        for (const item of graph) {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            blocks.push(item as Record<string, unknown>)
          }
        }
      }
    }
  })
  return blocks
}

function jsonLdTopLevelTypes(blocks: Record<string, unknown>[]): string[] {
  return blocks
    .map((b) => b['@type'])
    .filter((t): t is string => typeof t === 'string')
}

function assertExactJsonLdTypeMultiset(blocks: Record<string, unknown>[], expected: string[]) {
  const types = jsonLdTopLevelTypes(blocks)
  assert.equal(
    types.length,
    expected.length,
    `JSON-LD type count ${types.length} !== ${expected.length}; got ${types.join(', ')}`
  )
  assert.deepEqual([...types].sort(), [...expected].sort())
}

function expectedHomeJsonLdTypes(): string[] {
  const types = ['WebSite', 'ItemList', 'FAQPage']
  if (ballgamesSiteInstance.organizationEvidence?.status === 'verified') {
    types.push('Organization')
  }
  return types
}

function assertExportJsonLdEvidenceGated(
  blocks: Record<string, unknown>[],
  page: 'portal_home' | 'game_detail'
) {
  const game = page === 'game_detail' ? findProductionRoutableGame('hockey-bros')! : undefined
  assertJsonLdBlocksMeetEvidenceContract(blocks, {
    site: ballgamesSiteInstance,
    detailGame: game,
    page,
  })
}

function elementClassTokens(el: Element): Set<string> {
  const raw = el.properties?.className
  const parts = Array.isArray(raw) ? raw.map(String) : String(raw ?? '').split(/\s+/).filter(Boolean)
  return new Set(parts)
}

function elementTextContent(el: Element): string {
  let text = ''
  visit(el, (child) => {
    if (child.type === 'text' && 'value' in child) text += child.value
  })
  return normalizeWs(text)
}

function extractPortalSeoBodyFromExportHtml(html: string): { intro: string; sectionParagraphs: string[] } {
  const tree = fromHtmlIsomorphic(html, { fragment: false }) as Root
  let intro = ''
  let seoSection: Element | undefined
  visit(tree, (node) => {
    if (node.type !== 'element') return
    const el = node as Element
    if (el.tagName !== 'section') return
    const classes = elementClassTokens(el)
    const aria = String(el.properties?.['aria-label'] ?? '')
    if (classes.has('max-w-3xl') && classes.has('py-10') && !classes.has('space-y-10') && !aria) {
      const hasH2 = Boolean(
        (() => {
          let found = false
          visit(el, (c) => {
            if (c.type === 'element' && (c as Element).tagName === 'h2') found = true
          })
          return found
        })()
      )
      if (!hasH2 && !intro) intro = elementTextContent(el)
    }
    if (classes.has('max-w-3xl') && classes.has('space-y-10') && classes.has('py-10')) {
      seoSection = el
    }
  })

  assert.ok(intro.trim().length > 0, 'export HTML missing portal intro section')
  assert.ok(seoSection, 'export HTML missing portal SEO sections block')

  const h2Order: string[] = []
  const sectionParagraphs: string[] = []
  visit(seoSection!, (node) => {
    if (node.type !== 'element') return
    const el = node as Element
    if (el.tagName === 'h2') h2Order.push(elementTextContent(el))
    if (el.tagName === 'p') sectionParagraphs.push(elementTextContent(el))
  })

  assert.deepEqual(h2Order, [...PORTAL_HOME_SECTION_HEADINGS])
  assert.ok(sectionParagraphs.length >= PORTAL_HOME_SECTION_HEADINGS.length)

  return { intro, sectionParagraphs }
}

function assertSeoBodyExcludesHockeyBrosPhrase(html: string) {
  const { intro, sectionParagraphs } = extractPortalSeoBodyFromExportHtml(html)
  const seoBody = [intro, ...sectionParagraphs].join(' ').toLowerCase()
  assert.equal(
    seoBody.includes('hockey bros'),
    false,
    'SEO body block (export intro + 5×H2 paragraphs) must exclude "hockey bros"'
  )
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
  assertExactJsonLdTypeMultiset(blocks, expectedHomeJsonLdTypes())
  assertExportJsonLdEvidenceGated(blocks, 'portal_home')

  const webSite = blocks.find((b) => b['@type'] === 'WebSite')!
  assert.equal(webSite.name, 'BallGames.io')
  assert.equal(webSite.url, siteUrl())
  assert.equal('potentialAction' in webSite, false)

  const itemList = blocks.find((b) => b['@type'] === 'ItemList')!
  const elements = itemList.itemListElement as Array<{ name: string; url: string }>
  assert.equal(elements.length, 1)
  assert.equal(elements[0].name, 'Hockey Bros')
  assert.equal(elements[0].url, gameUrl('hockey-bros'))

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
  const game = findProductionRoutableGame('hockey-bros')!
  const expectedTypes = ['VideoGame', 'FAQPage', 'BreadcrumbList']
  assertExactJsonLdTypeMultiset(blocks, expectedTypes)
  assertExportJsonLdEvidenceGated(blocks, 'game_detail')
  const descriptor = buildGameDetailPageDescriptor(game)
  assert.ok(descriptor)

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
  assertSeoBodyExcludesHockeyBrosPhrase(html)
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

test('LD-N01 duplicate WebSite types fail multiset gate', () => {
  const blocks = [
    { '@type': 'WebSite', name: 'A', url: siteUrl() },
    { '@type': 'WebSite', name: 'B', url: siteUrl() },
    { '@type': 'ItemList', itemListElement: [] },
    { '@type': 'FAQPage', mainEntity: [] },
  ]
  assert.throws(() => assertExactJsonLdTypeMultiset(blocks, ['WebSite', 'ItemList', 'FAQPage']))
})

test('LD-N02 extra Organization type fails without evidence', () => {
  const blocks = [
    { '@type': 'WebSite', url: siteUrl() },
    { '@type': 'ItemList', itemListElement: [] },
    { '@type': 'FAQPage', mainEntity: [] },
    { '@type': 'Organization', name: 'BallGames.io', url: siteUrl() },
  ]
  assert.throws(() => assertExactJsonLdTypeMultiset(blocks, expectedHomeJsonLdTypes()))
  assert.throws(() =>
    assertJsonLdBlocksMeetEvidenceContract(blocks, { site: ballgamesSiteInstance, page: 'portal_home' })
  )
})

test('ORG-N-08 export homepage without evidence rejects surprise Organization', () => {
  const blocks = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: siteUrl(),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Surprise',
      url: siteUrl(),
    },
  ]
  assert.throws(() =>
    assertJsonLdBlocksMeetEvidenceContract(blocks, { site: ballgamesSiteInstance, page: 'portal_home' })
  )
})

test('OFF-N-09 export detail rejects unevidenced offers', () => {
  const game = findProductionRoutableGame('hockey-bros')!
  const blocks = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: game.title,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ]
  assert.throws(() =>
    assertJsonLdBlocksMeetEvidenceContract(blocks, {
      site: ballgamesSiteInstance,
      detailGame: game,
      page: 'game_detail',
    })
  )
})

test('OFF-N-04 export Offer seller extension fails shape gate', () => {
  assert.throws(() =>
    assertMinimalVerifiedOfferShape({
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    })
  )
})

test('LD-N03 nested aggregateRating forbidden in export parse tree', () => {
  const block = {
    '@type': 'VideoGame',
    nested: { aggregateRating: { ratingValue: 5 } },
  }
  assert.throws(() => assertNoForbiddenJsonLdFields(block))
})

test('LD-N04 array item offers forbidden', () => {
  const block = {
    '@type': 'VideoGame',
    items: [{ offers: { price: 0 } }],
  }
  assert.throws(() => assertNoForbiddenJsonLdFields(block))
})

test('LD-N05 JSON-LD FAQ mismatch with visible FAQ fails parity check', () => {
  const html = readExport('index.html')
  const blocks = parseJsonLdScripts(html)
  const faqBlock = blocks.find((b) => b['@type'] === 'FAQPage')!
  const entities = faqBlock.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>
  const tampered = structuredClone(entities)
  tampered[0] = { ...tampered[0], name: 'Mutated question text' }
  const visible = extractVisibleFaq(html)
  assert.throws(() => {
    for (let i = 0; i < 8; i++) {
      assert.equal(tampered[i].name, visible[i].q)
    }
  })
})

test('LD-N06 extra FAQPage fails multiset', () => {
  const blocks = [
    { '@type': 'WebSite', url: siteUrl() },
    { '@type': 'ItemList', itemListElement: [] },
    { '@type': 'FAQPage', mainEntity: [] },
    { '@type': 'FAQPage', mainEntity: [] },
  ]
  assert.throws(() => assertExactJsonLdTypeMultiset(blocks, ['WebSite', 'ItemList', 'FAQPage']))
})

function homeSeoFixtureHtml(opts: { intro?: string; sectionParagraph?: string; includeCard?: boolean }) {
  const intro = opts.intro ?? 'Portal intro without banned phrase.'
  const sectionP =
    opts.sectionParagraph ??
    'Editorial section about ball games in general with no banned game names.'
  const card = opts.includeCard
    ? '<article><a href="https://ballgames.io/hockey-bros">Hockey Bros</a></article>'
    : ''
  const headings = PORTAL_HOME_SECTION_HEADINGS.map(
    (h) =>
      `<article class="space-y-4"><h2 class="text-2xl font-bold">${h}</h2><p class="text-base">${sectionP}</p></article>`
  ).join('')
  return `<!DOCTYPE html><html><body>
<div class="divide-y divide-gray-200">
<section class="py-10">${card}</section>
<section class="max-w-3xl py-10"><p class="text-base">${intro}</p></section>
<section class="max-w-3xl space-y-10 py-10">${headings}</section>
<section class="max-w-3xl py-10" aria-label="Frequently asked questions"></section>
</div>
</body></html>`
}

test('SEO-N01 intro containing hockey bros fails', () => {
  const html = homeSeoFixtureHtml({ intro: 'Try hockey bros today.' })
  assert.throws(() => assertSeoBodyExcludesHockeyBrosPhrase(html))
})

test('SEO-N02 H2 section containing Hockey Bros fails', () => {
  const html = homeSeoFixtureHtml({ sectionParagraph: 'Play Hockey Bros now.' })
  assert.throws(() => assertSeoBodyExcludesHockeyBrosPhrase(html))
})

test('SEO-N03 GameCard only — still passes phrase gate', () => {
  const html = homeSeoFixtureHtml({ includeCard: true })
  assertSeoBodyExcludesHockeyBrosPhrase(html)
})

test('SEO-N04 JSON-LD ItemList only in script — still passes', () => {
  const html = `${homeSeoFixtureHtml({})}
<script type="application/ld+json">{"@type":"ItemList","itemListElement":[{"name":"Hockey Bros"}]}</script>`
  assertSeoBodyExcludesHockeyBrosPhrase(html)
})

test('SEO-N05 missing required H2 fails extraction', () => {
  const html = `<!DOCTYPE html><html><body>
<section class="max-w-3xl py-10"><p>Intro</p></section>
<section class="max-w-3xl space-y-10 py-10">
<article><h2>Free Online Ball Games</h2><p>x</p></article>
</section>
</body></html>`
  assert.throws(() => extractPortalSeoBodyFromExportHtml(html))
})

const SKIP_PRODUCT_VISIBLE_TAGS = new Set([
  'script',
  'style',
  'noscript',
  'meta',
  'link',
  'head',
  'title',
])

const VISUALLY_HIDDEN_CLASS_TOKENS = new Set([
  'sr-only',
  'screen-reader-only',
  'visually-hidden',
  'invisible',
])

function elementHasHiddenSemantics(el: Element): boolean {
  if (el.properties?.hidden != null) return true
  const ariaHidden = el.properties?.ariaHidden ?? el.properties?.['aria-hidden']
  if (ariaHidden === true || ariaHidden === 'true') return true
  const tokens = elementClassTokens(el)
  for (const token of tokens) {
    if (VISUALLY_HIDDEN_CLASS_TOKENS.has(token)) return true
  }
  return false
}

/** Level 2 — product-visible text from SSR HTML (excludes hidden/a11y-only; not computed-style Level 3). */
function productVisibleDomText(html: string): string {
  const tree = fromHtmlIsomorphic(html, { fragment: false }) as Root
  const chunks: string[] = []

  function walk(
    node: Root | Element | import('hast').Text,
    ctx: { skip: boolean; hiddenAncestor: boolean }
  ) {
    if (node.type === 'root' || node.type === 'element') {
      const el = node.type === 'element' ? (node as Element) : undefined
      const tagSkip = el ? SKIP_PRODUCT_VISIBLE_TAGS.has(el.tagName) : false
      const hiddenHere = el ? elementHasHiddenSemantics(el) : false
      const nextCtx = {
        skip: ctx.skip || tagSkip,
        hiddenAncestor: ctx.hiddenAncestor || hiddenHere,
      }
      for (const child of node.children ?? []) {
        walk(child as Element | import('hast').Text, nextCtx)
      }
      return
    }
    if (
      !ctx.skip &&
      !ctx.hiddenAncestor &&
      node.type === 'text' &&
      'value' in node &&
      typeof node.value === 'string'
    ) {
      chunks.push(node.value)
    }
  }

  walk(tree, { skip: false, hiddenAncestor: false })
  return normalizeWs(chunks.join(' '))
}

function countFooterElements(html: string): number {
  const tree = fromHtmlIsomorphic(html, { fragment: false }) as Root
  let count = 0
  visit(tree, (node) => {
    if (node.type === 'element' && (node as Element).tagName === 'footer') count++
  })
  return count
}

function countPhraseInsensitive(text: string, phrase: string): number {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped, 'gi')
  return [...text.matchAll(re)].length
}

function firstGameCardAnchorText(html: string): string | undefined {
  const tree = fromHtmlIsomorphic(html, { fragment: false }) as Root
  let found: string | undefined
  visit(tree, (node) => {
    if (found) return
    if (node.type !== 'element') return
    const el = node as Element
    if (el.tagName !== 'article') return
    visit(el, (child) => {
      if (found) return
      if (child.type !== 'element') return
      const c = child as Element
      if (c.tagName === 'a') {
        let text = ''
        visit(c, (n) => {
          if (n.type === 'text' && 'value' in n) text += n.value
        })
        found = normalizeWs(text)
      }
    })
  })
  return found
}

test('SEO-HOME-01 product-visible hockey bros phrase count is exactly one', () => {
  const html = readExport('index.html')
  const visible = productVisibleDomText(html)
  assert.equal(countPhraseInsensitive(visible, 'hockey bros'), 1)
})

test('FOOTER-01 homepage has exactly one footer element', () => {
  const html = readExport('index.html')
  assert.equal(countFooterElements(html), 1)
})

test('FOOTER-02 export homepage excludes Tailwind Nextjs Theme link text', () => {
  const html = readExport('index.html')
  assert.equal(html.toLowerCase().includes('tailwind nextjs theme'), false)
})

test('SEO-HOME-02 first GameCard anchor text is Hockey Bros', () => {
  const html = readExport('index.html')
  assert.equal(firstGameCardAnchorText(html), 'Hockey Bros')
})

test('SEO-HOME-03 SEO body block excludes hockey bros', () => {
  assertSeoBodyExcludesHockeyBrosPhrase(readExport('index.html'))
})

test('SEO-HOME-04 footer visible text excludes hockey bros', () => {
  const html = readExport('index.html')
  const tree = fromHtmlIsomorphic(html, { fragment: false }) as Root
  let footerText = ''
  visit(tree, (node) => {
    if (node.type !== 'element') return
    const el = node as Element
    if (el.tagName !== 'footer') return
    visit(el, (child) => {
      if (child.type === 'text' && 'value' in child) footerText += child.value
    })
  })
  assert.equal(countPhraseInsensitive(normalizeWs(footerText), 'hockey bros'), 0)
})

test('SEO-HOME-05 title and description exclude Hockey Bros', () => {
  const portal = getPortalHomeContent()
  assert.equal(portal.seo.title.toLowerCase().includes('hockey bros'), false)
  assert.equal(portal.seo.description.toLowerCase().includes('hockey bros'), false)
})

test('SEO-HOME-06 sr-only phrase does not inflate product-visible hockey bros count', () => {
  const html = `${homeSeoFixtureHtml({ includeCard: true })}
<span class="sr-only">Hockey Bros</span>`
  assert.equal(countPhraseInsensitive(productVisibleDomText(html), 'hockey bros'), 1)
})

test('SEO-N06 second visible GameCard with Hockey Bros fails product-visible count', () => {
  const html = `${homeSeoFixtureHtml({ includeCard: true })}
<article><a href="/x">Hockey Bros</a></article>`
  assert.throws(() => {
    assert.equal(countPhraseInsensitive(productVisibleDomText(html), 'hockey bros'), 1)
  })
})

test('SEO-N07 footer Hockey Bros fails product-visible count gate', () => {
  const html = `${homeSeoFixtureHtml({ includeCard: true })}
<footer>About Hockey Bros</footer>`
  assert.notEqual(countPhraseInsensitive(productVisibleDomText(html), 'hockey bros'), 1)
})

test('SEO-N08 JSON-LD Hockey Bros does not add product-visible phrase count', () => {
  const html = `${homeSeoFixtureHtml({ includeCard: true })}
<script type="application/ld+json">{"name":"Hockey Bros"}</script>`
  assert.equal(countPhraseInsensitive(productVisibleDomText(html), 'hockey bros'), 1)
})

test('SEO-N09 img alt Hockey Bros does not add product-visible phrase count', () => {
  const html = `${homeSeoFixtureHtml({ includeCard: true })}
<img alt="Hockey Bros poster" src="/x.png" />`
  assert.equal(countPhraseInsensitive(productVisibleDomText(html), 'hockey bros'), 1)
})

test('SEO-N10 duplicate footer elements fails FOOTER-01 gate', () => {
  const html = `${homeSeoFixtureHtml({})}<footer>A</footer><footer>B</footer>`
  assert.equal(countFooterElements(html), 2)
})
