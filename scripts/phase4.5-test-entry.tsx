/**
 * Phase 4.5 — Content / SEO integration tests (P45-01 … P45-20).
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { afterEach, test } from 'node:test'
import { cleanup, render, screen } from '@testing-library/react'

afterEach(() => cleanup())

import { PortalHome, PORTAL_HOME_FROZEN_SUBTITLE } from '../components/portal/PortalHome'
import { getBallgamesCatalog, isProductionEmbedAllowed } from '../lib/catalog'
import { hockeyBrosDetail } from '../lib/catalog/instances/hockey-bros-detail'
import {
  assertNoForbiddenJsonLdFields,
  buildFaqPageJsonLd,
  buildGameDetailJsonLdBlocks,
  buildPortalHomeJsonLdBlocks,
  buildProductionSitemap,
  findProductionRoutableGame,
  isSitemapCandidate,
  LEGACY_PAGE_ROBOTS,
  resolvePortalHomePageSeo,
  serializeJsonLd,
  serializeJsonLdForHtml,
} from '../lib/seo'
import { isAppRoutePath } from '../lib/seo/routes'
import { buildR1ExactTwoContractFixtures } from '../lib/seo/fixtures'
import { PORTAL_HOME_SECTION_HEADINGS } from '../lib/site/portal-home-editorial-contract'
import { ballgamesPortalHomeContent, ballgamesSiteInstance } from '../lib/site/instances/ballgames'
import { getPortalHomeContent } from '../lib/site/get-portal-home-content'
import { assertPortalHomeEditorialContract } from '../lib/site/portal-home-editorial-contract'
import { countWords } from './phase4.5-word-count-lib'
import { siteUrl } from '../lib/urls/site-url'

const FROZEN_PORTAL_INTRO =
  'Every game on this page runs inside the tab you already have open. No installer, no sign-up, no launcher asking for an update. We collect ball games — hockey, soccer, American football, basketball, baseball, and the odd car-with-a-ball hybrid — and put them behind one click. If it needs a download, it is not on this site.'

function portalSeoBodyText(): string {
  const portal = getPortalHomeContent()
  const parts = [portal.intro ?? '', ...(portal.sections ?? []).flatMap((s) => s.paragraphs)]
  return parts.join(' ').toLowerCase()
}

test('P45-01 PortalHome renders single H1', () => {
  const catalog = getBallgamesCatalog()
  const { container } = render(
    <PortalHome portal={getPortalHomeContent()} homeGames={[]} catalog={catalog} />
  )
  assert.equal(container.querySelectorAll('h1').length, 1)
})

test('P45-02 frozen subtitle remains paragraph', () => {
  render(
    <PortalHome portal={getPortalHomeContent()} homeGames={[]} catalog={getBallgamesCatalog()} />
  )
  const subtitle = screen.getByText(PORTAL_HOME_FROZEN_SUBTITLE)
  assert.equal(subtitle.tagName, 'P')
})

test('P45-03 five H2 headings in frozen order', () => {
  render(
    <PortalHome portal={getPortalHomeContent()} homeGames={[]} catalog={getBallgamesCatalog()} />
  )
  const headings = screen.getAllByRole('heading', { level: 2 }).map((el) => el.textContent)
  assert.deepEqual(headings, [...PORTAL_HOME_SECTION_HEADINGS])
})

test('P45-04 eight FAQ details visible', () => {
  const portal = getPortalHomeContent()
  render(<PortalHome portal={portal} homeGames={[]} catalog={getBallgamesCatalog()} />)
  assert.equal(portal.faq?.length, 8)
  for (const item of portal.faq!) {
    assert.ok(screen.getByText(item.q))
  }
})

test('P45-05 FAQ UI matches JSON-LD source', () => {
  const portal = getPortalHomeContent()
  const { portal: descriptor } = buildR1ExactTwoContractFixtures()
  const merged = { ...descriptor, content: portal }
  const faqBlock = buildPortalHomeJsonLdBlocks({
    portal: merged,
    qualifiedGameDetail: buildR1ExactTwoContractFixtures().game,
    site: ballgamesSiteInstance,
  }).find((b) => b['@type'] === 'FAQPage')
  assert.ok(faqBlock)
  const entities = faqBlock!.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>
  assert.equal(entities.length, 8)
  for (let i = 0; i < 8; i++) {
    assert.equal(entities[i].name, portal.faq![i].q)
    assert.equal(entities[i].acceptedAnswer.text, portal.faq![i].a)
  }
})

test('P45-06 SEO body excludes hockey bros phrase', () => {
  const body = portalSeoBodyText()
  assert.equal(body.includes('hockey bros'), false)
})

test('P45-07 portal published and indexable', () => {
  const portal = getPortalHomeContent()
  assert.equal(portal.publicationStatus, 'published')
  assert.equal(portal.seo.indexable, true)
})

test('P45-08 homepage metadata matches frozen TDK', () => {
  const resolved = resolvePortalHomePageSeo(
    {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: true,
      content: getPortalHomeContent(),
    },
    ballgamesSiteInstance
  )
  assert.equal(resolved.title, ballgamesPortalHomeContent.seo.title)
  assert.equal(resolved.description, ballgamesPortalHomeContent.seo.description)
})

test('P45-09 homepage canonical has no trailing slash', () => {
  const resolved = resolvePortalHomePageSeo(
    {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: true,
      content: getPortalHomeContent(),
    },
    ballgamesSiteInstance
  )
  assert.equal(resolved.canonical, 'https://ballgames.io')
})

test('P45-10 production sitemap exact-two', () => {
  const entries = buildProductionSitemap(ballgamesSiteInstance)
  assert.equal(entries.length, 2)
  const urls = entries.map((e) => e.url).sort()
  assert.deepEqual(urls, ['https://ballgames.io', 'https://ballgames.io/hockey-bros'].sort())
})

test('P45-11 draft portal excluded from sitemap negatives', () => {
  const draftPortal = {
    pageType: 'portal_home' as const,
    routePath: '/' as const,
    routeExists: true,
    content: {
      ...getPortalHomeContent(),
      publicationStatus: 'draft' as const,
      seo: { ...getPortalHomeContent().seo, indexable: false },
    },
  }
  assert.equal(buildProductionSitemap(ballgamesSiteInstance).length, 2)
  assert.equal(isSitemapCandidate(draftPortal, ballgamesSiteInstance), false)
})

test('P45-12 ItemList only Hockey Bros', () => {
  const game = findProductionRoutableGame('hockey-bros')!
  const blocks = buildPortalHomeJsonLdBlocks({
    portal: {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: isAppRoutePath('/'),
      content: getPortalHomeContent(),
    },
    qualifiedGameDetail: {
      pageType: 'game_detail',
      slug: 'hockey-bros',
      routePath: '/hockey-bros',
      routeExists: true,
      listItemName: game.title,
      content: { publicationStatus: 'published', seo: game.detail!.seo },
    },
    site: ballgamesSiteInstance,
  })
  const itemList = blocks.find((b) => b['@type'] === 'ItemList') as {
    itemListElement: Array<{ name: string; url: string }>
  }
  assert.equal(itemList.itemListElement.length, 1)
  assert.equal(itemList.itemListElement[0].name, 'Hockey Bros')
})

test('P45-13 WebSite JSON-LD has no SearchAction', () => {
  const json = serializeJsonLd(
    buildPortalHomeJsonLdBlocks({
      portal: {
        pageType: 'portal_home',
        routePath: '/',
        routeExists: true,
        content: getPortalHomeContent(),
      },
      qualifiedGameDetail: buildR1ExactTwoContractFixtures().game,
      site: ballgamesSiteInstance,
    })
  )
  assert.equal(json.includes('SearchAction'), false)
  assert.equal(json.includes('potentialAction'), false)
})

test('P45-14 VideoGame JSON-LD omits forbidden rating fields', () => {
  const game = findProductionRoutableGame('hockey-bros')!
  const blocks = buildGameDetailJsonLdBlocks({ game, site: ballgamesSiteInstance })
  const serialized = JSON.stringify(blocks)
  assert.equal(serialized.includes('aggregateRating'), false)
  assert.equal(serialized.includes('review'), false)
})

test('P45-15 detail FAQPage seven items match catalog', () => {
  const game = findProductionRoutableGame('hockey-bros')!
  assert.equal(hockeyBrosDetail.faq.length, 7)
  const faqLd = buildFaqPageJsonLd(hockeyBrosDetail.faq)
  const entities = faqLd.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>
  assert.equal(entities.length, 7)
  for (let i = 0; i < 7; i++) {
    assert.equal(entities[i].name, hockeyBrosDetail.faq[i].q)
    assert.equal(entities[i].acceptedAnswer.text, hockeyBrosDetail.faq[i].a)
  }
})

test('P45-16 BreadcrumbList URLs use helpers', () => {
  const game = findProductionRoutableGame('hockey-bros')!
  const blocks = buildGameDetailJsonLdBlocks({ game, site: ballgamesSiteInstance })
  const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList') as {
    itemListElement: Array<{ name: string; item: string }>
  }
  assert.equal(crumbs.itemListElement[0].item, siteUrl())
  assert.equal(crumbs.itemListElement[1].name, 'Hockey Bros')
})

test('P45-17 forbidden JSON-LD fields rejected', () => {
  assert.throws(
    () =>
      assertNoForbiddenJsonLdFields({
        '@type': 'VideoGame',
        aggregateRating: { ratingValue: 5 },
      }),
    /Forbidden JSON-LD field: aggregateRating/
  )
})

test('P45-18 JSON-LD script escapes angle brackets', () => {
  const payload = serializeJsonLdForHtml([
    {
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: '</script><script>alert(1)</script>',
    },
  ])
  assert.ok(!payload.includes('</script>'))
  assert.ok(payload.includes('\\u003c/script'))
})

test('P45-19 legacy metadata remains noindex follow', () => {
  assert.deepEqual(LEGACY_PAGE_ROBOTS, { index: false, follow: true })
})

test('P45-20 homepage still wires production catalog', () => {
  const src = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8')
  assert.match(src, /getProductionHomeCatalog/)
  assert.doesNotMatch(src, /allBlogs/)
})

test('P45-21 content stats separate intro, five H2 paragraphs, and FAQ (no 950 hard gate)', () => {
  const portal = getPortalHomeContent()
  const intro = countWords(portal.intro ?? '')
  const fiveH2 = countWords((portal.sections ?? []).flatMap((s) => s.paragraphs).join(' '))
  const faq = countWords((portal.faq ?? []).flatMap((f) => [f.q, f.a]).join(' '))
  assert.ok(intro > 0)
  assert.ok(fiveH2 > 0)
  assert.ok(faq > 0)
  assert.equal(portal.faq?.length, 8)
  assert.equal(
    countWords([portal.intro ?? '', ...(portal.sections ?? []).flatMap((s) => s.paragraphs)].join(' ')),
    intro + fiveH2
  )
})

test('P45-22 frozen intro matches product spec section 5.4 verbatim', () => {
  const portal = getPortalHomeContent()
  assert.equal(portal.intro?.trim(), FROZEN_PORTAL_INTRO)
})

test('P45-23 production embed gate remains closed for hockey-bros', () => {
  const catalog = getBallgamesCatalog()
  const hockey = catalog.games.find((g) => g.slug === 'hockey-bros')
  assert.ok(hockey)
  assert.equal(isProductionEmbedAllowed(hockey!, catalog), false)
})

test('P45-24 published portal home passes frozen editorial contract', () => {
  assertPortalHomeEditorialContract(getPortalHomeContent())
})
