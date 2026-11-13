import assert from 'node:assert/strict'
import { afterEach, mock, test } from 'node:test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'

import { Breadcrumbs } from '../components/portal/Breadcrumbs'
import { GameCard } from '../components/portal/GameCard'
import { GameDetailContent, countAboutH3InDetail } from '../components/portal/GameDetailContent'
import { GameDetailTemplate } from '../components/portal/GameDetailTemplate'
import { GameFaq } from '../components/portal/GameFaq'
import { RelatedGames } from '../components/portal/RelatedGames'
import { scrollDetailPlayAreaIntoView } from '../components/portal/RelatedGamesWithScroll'
import {
  ballgamesCatalog,
  getBallgamesCatalog,
  getProductionHomeCatalog,
  getProductionRelatedCatalogGames,
  type Catalog,
  type CatalogGame,
} from '../lib/catalog/index'
import { hockeyBrosDetail } from '../lib/catalog/instances/hockey-bros-detail'
import { parseDetailBody } from '../lib/portal/parse-detail-body'
import { resolvePlayPresentation } from '../lib/portal/play-presentation'
import { findProductionRoutableGame } from '../lib/seo'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const FROZEN_SUBTITLE = 'One small rink, short matches, and nothing to install.'

afterEach(() => {
  cleanup()
})

const hockeyGame = findProductionRoutableGame('hockey-bros')
assert.ok(hockeyGame?.detail)

const PHASE44_TEST_FIXTURE_MARK = 'PHASE44_TEST_FIXTURE_NOT_PRODUCTION'

function minimalPublishedGame(
  overrides: Partial<CatalogGame> & Pick<CatalogGame, 'id' | 'slug' | 'title' | 'cardAction'>
): CatalogGame {
  return {
    publicationStatus: 'published',
    showOnHome: true,
    homeSort: 0,
    availability: 'available',
    launch: {
      verification: 'verified',
      mode: 'external-link',
      primaryUrl: `https://ballgames.io/${PHASE44_TEST_FIXTURE_MARK}/${overrides.slug}`,
    },
    thumbnail: undefined,
    seo: { indexable: false },
    embedPermissionId: undefined,
    providerId: undefined,
    relatedGameIds: [],
    ...overrides,
  } as CatalogGame
}

const relatedPeerGame = minimalPublishedGame({
  id: 'phase44-related-peer',
  slug: 'phase44-related-peer',
  title: 'Phase 44 Related Peer',
  cardAction: 'launcher-select',
  homeSort: 50,
})

const multiRelatedCatalog: Catalog = {
  ...ballgamesCatalog,
  games: [...ballgamesCatalog.games, relatedPeerGame],
}

test('D01 GameDetailTemplate renders hockey-bros detail shell', () => {
  render(<GameDetailTemplate game={hockeyGame!} catalog={getBallgamesCatalog()} />)
  assert.ok(screen.getByRole('heading', { level: 1, name: 'Hockey Bros' }))
  assert.equal(screen.queryByText(/Phase 4\.2/i), null)
})

test('D02 H1 and subtitle match frozen spec intro', () => {
  render(<GameDetailTemplate game={hockeyGame!} catalog={getBallgamesCatalog()} />)
  assert.equal(screen.getAllByRole('heading', { level: 1 }).length, 1)
  assert.ok(screen.getByText(FROZEN_SUBTITLE))
  assert.equal(hockeyGame!.detail!.intro, FROZEN_SUBTITLE)
})

test('D03 Breadcrumbs are Home and current page only', () => {
  render(<Breadcrumbs currentTitle="Hockey Bros" />)
  const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
  const items = within(nav).getAllByRole('listitem')
  assert.equal(items.length, 2)
  assert.equal(within(nav).getByRole('link', { name: 'Home' }).getAttribute('href'), '/')
  assert.ok(within(nav).getByText('Hockey Bros'))
})

test('D04 detail page has exactly one game play area section', () => {
  render(<GameDetailTemplate game={hockeyGame!} catalog={getBallgamesCatalog()} />)
  assert.equal(document.querySelectorAll('section[aria-label="Play Hockey Bros"]').length, 1)
})

test('D05 unknown embed cannot use production iframe on detail', () => {
  const presentation = resolvePlayPresentation(hockeyGame!, getBallgamesCatalog())
  assert.equal(presentation.mode, 'external-only')
})

test('D06 external-only new tab link is available on detail play frame', () => {
  render(<GameDetailTemplate game={hockeyGame!} catalog={getBallgamesCatalog()} />)
  const link = screen.getByRole('link', { name: 'Open game in new tab' })
  assert.equal(link.getAttribute('href'), 'https://www.hockeybros.io/')
})

test('D07 five main H2 sections exist in order', () => {
  render(<GameDetailContent detail={hockeyBrosDetail} />)
  const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
  assert.deepEqual(headings, [
    'How to Play',
    'Controls',
    'Tips for Winning',
    'About Hockey Bros',
    'The Rest of the Bros Series',
  ])
})

test('D08 About Hockey Bros renders two H3 titles', () => {
  render(<GameDetailContent detail={hockeyBrosDetail} />)
  const aboutSection = screen.getByRole('heading', {
    level: 2,
    name: 'About Hockey Bros',
  }).parentElement!
  const h3s = within(aboutSection).getAllByRole('heading', { level: 3 })
  assert.equal(h3s.length, 2)
  assert.equal(h3s[0]?.textContent, 'Hockey Bros unblocked, on a school laptop')
  assert.equal(h3s[1]?.textContent, 'Why it is worth a tab')
  assert.equal(countAboutH3InDetail(hockeyBrosDetail), 2)
})

test('D09 Bros Series list has five items', () => {
  render(<GameDetailContent detail={hockeyBrosDetail} />)
  const seriesHeading = screen.getByRole('heading', {
    level: 2,
    name: 'The Rest of the Bros Series',
  })
  const section = seriesHeading.parentElement!
  const items = within(section).getAllByRole('listitem')
  assert.equal(items.length, 5)
})

test('D10 Controls section includes control keys without duplicate under play frame', () => {
  render(<GameDetailTemplate game={hockeyGame!} catalog={getBallgamesCatalog()} />)
  assert.ok(screen.getByText('Pass, shoot, or check'))
  const playSection = document.getElementById('detail-play-area')!
  assert.equal(within(playSection).queryByText('Pass, shoot, or check'), null)
})

test('D11 FAQ renders seven expandable details', () => {
  render(<GameFaq items={hockeyBrosDetail.faq} />)
  assert.equal(hockeyBrosDetail.faq.length, 7)
  const details = document.querySelectorAll('details')
  assert.equal(details.length, 7)
  assert.ok(screen.getByText(hockeyBrosDetail.faq[0]!.q))
  assert.ok(screen.getByText(hockeyBrosDetail.faq[0]!.a))
})

test('D12 RelatedGames cards are buttons even for navigate-to-detail', () => {
  const related = getProductionRelatedCatalogGames()
  render(<RelatedGames games={related} onRelatedActivate={mock.fn()} />)
  const buttons = screen.getAllByRole('button')
  assert.equal(buttons.length, related.length)
  assert.equal(screen.queryByRole('link', { name: hockeyGame!.title }), null)
})

test('D13 RelatedGames click scrolls play area into view when related is non-empty', () => {
  const scrollIntoView = mock.fn()
  render(<GameDetailTemplate game={hockeyGame!} catalog={multiRelatedCatalog} />)
  const playArea = document.getElementById('detail-play-area')!
  playArea.scrollIntoView = scrollIntoView
  fireEvent.click(screen.getByRole('button', { name: relatedPeerGame.title }))
  assert.equal(scrollIntoView.mock.callCount(), 1)
  assert.deepEqual(scrollIntoView.mock.calls[0]?.arguments[0], {
    behavior: 'smooth',
    block: 'start',
  })
})

test('D14 scroll helper does not change window location', () => {
  const original = window.location.href
  const el = document.createElement('section')
  el.id = 'detail-play-area'
  el.scrollIntoView = mock.fn()
  document.body.appendChild(el)
  scrollDetailPlayAreaIntoView()
  assert.equal(window.location.href, original)
  document.body.removeChild(el)
})

test('D15 Related click does not add iframe', () => {
  render(<GameDetailTemplate game={hockeyGame!} catalog={multiRelatedCatalog} />)
  assert.equal(document.querySelectorAll('iframe').length, 0)
  fireEvent.click(screen.getByRole('button', { name: relatedPeerGame.title }))
  assert.equal(document.querySelectorAll('iframe').length, 0)
})

test('D17 draft games never enter production related catalog', () => {
  const related = getProductionRelatedCatalogGames()
  assert.equal(
    related.every((g) => g.publicationStatus === 'published' && g.showOnHome),
    true
  )
  assert.equal(
    ballgamesCatalog.games.some((g) => g.publicationStatus === 'draft' && related.includes(g)),
    false
  )
})

test('D18 related catalog count reflects real data only', () => {
  const catalog = getBallgamesCatalog()
  const home = getProductionHomeCatalog(catalog)
  const related = getProductionRelatedCatalogGames(catalog, { excludeSlug: 'hockey-bros' })
  assert.equal(related.length, 0)
  assert.equal(home.length, 1)
  assert.ok(home.length < 12, 'INFO: related count below design target without fabrication')
})

test('D19 detail route page still uses SEO resolver and template', () => {
  const pageSrc = readFileSync(path.join(projectRoot, 'app/[slug]/page.tsx'), 'utf8')
  assert.match(pageSrc, /resolveGameDetailPageSeo/)
  assert.match(pageSrc, /GameDetailTemplate/)
  assert.doesNotMatch(pageSrc, /MinimalGameDetailShell/)
})

test('D20 parseDetailBody preserves list semantics for bros series', () => {
  const series = hockeyBrosDetail.sections.find((s) => s.heading === 'The Rest of the Bros Series')
  assert.ok(series)
  const blocks = parseDetailBody(series.body)
  const list = blocks.find((b) => b.type === 'list')
  assert.ok(list && list.type === 'list')
  assert.equal(list.items.length, 5)
})

test('D21 excludeSlug removes current game from production related list', () => {
  const related = getProductionRelatedCatalogGames(multiRelatedCatalog, {
    excludeSlug: 'hockey-bros',
  })
  assert.ok(!related.some((g) => g.slug === 'hockey-bros'))
  assert.ok(related.some((g) => g.slug === relatedPeerGame.slug))
})

test('D22 R1 detail hides Related section when no peers remain', () => {
  render(<GameDetailTemplate game={hockeyGame!} catalog={getBallgamesCatalog()} />)
  assert.equal(screen.queryByRole('heading', { name: 'Related Games' }), null)
  assert.equal(document.querySelectorAll('[aria-labelledby="related-games-heading"]').length, 0)
  assert.ok(document.getElementById('detail-play-area'))
  assert.ok(screen.getByRole('heading', { name: 'How to Play' }))
  assert.equal(screen.getAllByRole('heading', { level: 1 }).length, 1)
  assert.ok(screen.getByRole('navigation', { name: 'Breadcrumb' }))
  assert.equal(hockeyBrosDetail.faq.length, 7)
  assert.equal(document.querySelectorAll('details').length, 7)
})

test('D23 non-empty Related excludes current game and uses buttons only', () => {
  render(<GameDetailTemplate game={hockeyGame!} catalog={multiRelatedCatalog} />)
  assert.ok(screen.getByRole('heading', { name: 'Related Games' }))
  assert.equal(screen.queryByRole('button', { name: hockeyGame!.title }), null)
  const buttons = screen.getAllByRole('button', { name: relatedPeerGame.title })
  assert.equal(buttons.length, 1)
  assert.equal(screen.queryByRole('link', { name: relatedPeerGame.title }), null)
  assert.match(relatedPeerGame.slug, /^phase44-/, PHASE44_TEST_FIXTURE_MARK)
})

test('D24 Related click scrolls #detail-play-area without navigation', () => {
  const scrollIntoView = mock.fn()
  const originalHref = window.location.href
  render(<GameDetailTemplate game={hockeyGame!} catalog={multiRelatedCatalog} />)
  const playArea = document.getElementById('detail-play-area')!
  playArea.scrollIntoView = scrollIntoView
  fireEvent.click(screen.getByRole('button', { name: relatedPeerGame.title }))
  assert.equal(scrollIntoView.mock.callCount(), 1)
  assert.equal(playArea.id, 'detail-play-area')
  assert.equal(window.location.href, originalHref)
  assert.equal(window.location.hash, '')
  assert.equal(document.querySelectorAll('iframe').length, 0)
})

test('D25 scrollDetailPlayAreaIntoView honors prefers-reduced-motion', () => {
  const el = document.createElement('section')
  el.id = 'detail-play-area'
  const scrollIntoView = mock.fn()
  el.scrollIntoView = scrollIntoView
  document.body.appendChild(el)

  const originalMatchMedia = window.matchMedia
  window.matchMedia = ((query: string) =>
    ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia

  scrollDetailPlayAreaIntoView()
  assert.deepEqual(scrollIntoView.mock.calls[0]?.arguments[0], { behavior: 'auto', block: 'start' })

  window.matchMedia = ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia

  scrollDetailPlayAreaIntoView()
  assert.deepEqual(scrollIntoView.mock.calls[1]?.arguments[0], {
    behavior: 'smooth',
    block: 'start',
  })

  window.matchMedia = originalMatchMedia
  document.body.removeChild(el)
})

test('D26 home GameCard behaviors unchanged by Related policy', () => {
  render(<GameCard game={hockeyGame!} displayContext="home" />)
  const homeLink = screen.getByRole('link', { name: 'Hockey Bros' })
  assert.equal(homeLink.getAttribute('href'), '/hockey-bros')

  const launcherGame = minimalPublishedGame({
    id: 'phase44-launcher',
    slug: 'phase44-launcher',
    title: 'Phase 44 Launcher',
    cardAction: 'launcher-select',
    homeSort: 60,
  })
  const onSelect = mock.fn()
  cleanup()
  render(<GameCard game={launcherGame} displayContext="home" onLauncherSelect={onSelect} />)
  fireEvent.click(screen.getByRole('button', { name: launcherGame.title }))
  assert.equal(onSelect.mock.callCount(), 1)
})
