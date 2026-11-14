import assert from 'node:assert/strict'
import { afterEach, mock, test } from 'node:test'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'

afterEach(() => {
  cleanup()
  mock.timers.reset()
})

function enableDomFakeTimers() {
  mock.timers.enable({ apis: ['setTimeout'] })
  window.setTimeout = globalThis.setTimeout.bind(globalThis) as typeof window.setTimeout
  window.clearTimeout = globalThis.clearTimeout.bind(globalThis) as typeof window.clearTimeout
}

function tickFakeTimers(ms: number) {
  act(() => {
    mock.timers.tick(ms)
  })
}

import { GameCard } from '../components/portal/GameCard'
import { Launcher } from '../components/portal/Launcher'
import { PlayFrame } from '../components/portal/PlayFrame'
import { PORTAL_HOME_FROZEN_H1, PORTAL_HOME_FROZEN_SUBTITLE } from '../components/portal/PortalHome'
import type { Catalog, CatalogGame } from '../lib/catalog/types'
import { DEFAULT_PLAY_TIMEOUT_MS, type PlayPresentation } from '../lib/portal/play-presentation'
import {
  ballgamesCatalog,
  getBallgamesCatalog,
  getProductionHomeCatalog,
  isProductionEmbedAllowed,
} from '../lib/catalog/index'
import { gamePath } from '../lib/urls/site-url'

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
      primaryUrl: `https://example.com/${overrides.slug}`,
    },
    thumbnail: undefined,
    seo: { indexable: false },
    embedPermissionId: undefined,
    providerId: undefined,
    relatedGameIds: [],
    ...overrides,
  } as CatalogGame
}

const hockeyDetail = ballgamesCatalog.games[0]

const launcherGameA = minimalPublishedGame({
  id: 'test-a',
  slug: 'test-game-a',
  title: 'Test Game A',
  cardAction: 'launcher-select',
  homeSort: 10,
})

const launcherGameB = minimalPublishedGame({
  id: 'test-b',
  slug: 'test-game-b',
  title: 'Test Game B',
  cardAction: 'launcher-select',
  homeSort: 20,
  launch: {
    verification: 'verified',
    mode: 'external-link',
    primaryUrl: 'https://example.com/test-game-b',
  },
})

const testCatalog: Catalog = {
  ...ballgamesCatalog,
  games: [launcherGameA, launcherGameB, hockeyDetail],
}

const iframePresentation: PlayPresentation = {
  mode: 'production-iframe',
  primaryUrl: 'https://embed.example.com/game',
  timeoutMs: DEFAULT_PLAY_TIMEOUT_MS,
  gameTitle: 'Embed Test',
}

test('T01 GameCard navigate-to-detail renders Link with gamePath(slug)', () => {
  const onSelect = mock.fn()
  render(<GameCard game={hockeyDetail} onLauncherSelect={onSelect} />)
  const link = screen.getByRole('link', { name: hockeyDetail.title })
  assert.equal(link.getAttribute('href'), gamePath(hockeyDetail.slug))
})

test('T01 GameCard launcher-select button invokes selection callback', () => {
  const onSelect = mock.fn()
  render(<GameCard game={launcherGameA} onLauncherSelect={onSelect} />)
  fireEvent.click(screen.getByRole('button', { name: launcherGameA.title }))
  assert.equal(onSelect.mock.callCount(), 1)
  assert.equal(onSelect.mock.calls[0]?.arguments[0]?.slug, launcherGameA.slug)
})

test('T02 Launcher default pick, switch game, generation bump, single PlayFrame', () => {
  render(<Launcher homeGames={[launcherGameA, launcherGameB]} catalog={testCatalog} />)
  assert.equal(screen.getByRole('status').textContent, 'Test Game A')
  assert.equal(document.querySelectorAll('section[aria-label="Game play area"]').length, 1)
  fireEvent.click(screen.getByRole('button', { name: launcherGameB.title }))
  assert.equal(screen.getByRole('status').textContent, 'Test Game B')
  assert.equal(document.querySelectorAll('iframe').length, 0)
})

test('T07 external-only does not render production iframe', () => {
  const external: PlayPresentation = {
    mode: 'external-only',
    primaryUrl: 'https://www.hockeybros.io/',
    timeoutMs: DEFAULT_PLAY_TIMEOUT_MS,
    gameTitle: 'Hockey Bros',
  }
  render(<PlayFrame presentation={external} loadGeneration={0} />)
  assert.equal(document.querySelector('iframe'), null)
  const link = screen.getByRole('link', { name: 'Open game in new tab' })
  assert.equal(link.getAttribute('href'), external.primaryUrl)
  assert.equal(link.getAttribute('target'), '_blank')
  assert.match(link.getAttribute('rel') ?? '', /noopener/)
  assert.match(link.getAttribute('rel') ?? '', /noreferrer/)
})

test('T03 PlayFrame starts loading, onLoad is loaded-event not ready, timeout after 8s', () => {
  enableDomFakeTimers()
  render(<PlayFrame presentation={iframePresentation} loadGeneration={0} />)
  assert.ok(screen.getByText('Loading game…'))
  const iframe = document.querySelector('iframe')!
  fireEvent.load(iframe)
  assert.equal(screen.queryByText('Loading game…'), null)
  assert.equal(
    screen.queryByText(/taking longer than usual/i),
    null,
    'timeout must not show before 8s'
  )
  tickFakeTimers(7999)
  assert.equal(screen.queryByText(/taking longer than usual/i), null)
  tickFakeTimers(1)
  assert.ok(screen.getByText(/taking longer than usual/i))
  assert.ok(screen.getAllByRole('link', { name: 'Open game in new tab' }).length >= 1)
})

test('T04 timeout at 8000ms; external link remains after timeout', () => {
  enableDomFakeTimers()
  render(<PlayFrame presentation={iframePresentation} loadGeneration={0} />)
  const iframe = document.querySelector('iframe')!
  fireEvent.load(iframe)
  tickFakeTimers(8000)
  const links = screen.getAllByRole('link', { name: 'Open game in new tab' })
  assert.ok(links.length >= 1)
  for (const link of links) {
    assert.equal(link.getAttribute('href'), iframePresentation.primaryUrl)
    assert.equal(link.getAttribute('target'), '_blank')
  }
})

test('T05 stale iframe load and timeout do not affect newer generation', () => {
  enableDomFakeTimers()
  const presentationB: PlayPresentation = {
    ...iframePresentation,
    primaryUrl: 'https://embed.example.com/other',
    gameTitle: 'Other Game',
  }
  const { rerender } = render(<PlayFrame presentation={iframePresentation} loadGeneration={1} />)
  const iframeGen1 = document.querySelector('iframe')!

  tickFakeTimers(3000)
  rerender(<PlayFrame presentation={presentationB} loadGeneration={2} />)
  assert.ok(screen.getByText('Loading game…'))

  fireEvent.load(iframeGen1)
  assert.ok(screen.getByText('Loading game…'), 'stale load must not clear loading for gen 2')

  tickFakeTimers(7999)
  assert.equal(screen.queryByText(/taking longer than usual/i), null)
  tickFakeTimers(1)
  assert.ok(screen.getByText(/taking longer than usual/i))
  const iframeGen2 = document.querySelector('iframe')!
  assert.equal(iframeGen2.getAttribute('src'), presentationB.primaryUrl)
})

test('T06 switching games clears prior timeout (no early timeout for new game)', () => {
  enableDomFakeTimers()
  const { rerender } = render(<PlayFrame presentation={iframePresentation} loadGeneration={1} />)
  tickFakeTimers(7000)
  rerender(
    <PlayFrame presentation={{ ...iframePresentation, gameTitle: 'Next' }} loadGeneration={2} />
  )
  assert.ok(screen.getByText('Loading game…'))
  tickFakeTimers(5000)
  assert.equal(screen.queryByText(/taking longer than usual/i), null)
  tickFakeTimers(3000)
  assert.ok(screen.getByText(/taking longer than usual/i))
})

test('PLAY-01 Launcher default presentation title is Football Bros', () => {
  const catalog = getBallgamesCatalog()
  const home = getProductionHomeCatalog(catalog)
  render(<Launcher homeGames={home} catalog={catalog} />)
  assert.equal(screen.getByRole('status').textContent, 'Football Bros')
  assert.equal(document.querySelectorAll('iframe').length, 0)
  const football = catalog.games.find((g) => g.slug === 'football-bros')!
  assert.equal(isProductionEmbedAllowed(football, catalog), false)
})

const CATALOG_TEST_FIXTURE_MARK = 'CATALOG_TEST_FIXTURE_NOT_PRODUCTION'

function buildGrantedIframeLauncherCatalog(): Catalog {
  return {
    providers: [{ id: 'prov-fixture', name: 'Fixture Provider', verification: 'verified' }],
    embedPermissions: [
      {
        id: 'embed-fixture-a',
        providerId: 'prov-fixture',
        gameSlug: 'fixture-game-a',
        sourceUrl: 'https://embed.example.com/a',
        status: 'granted',
        permissionBasis: `${CATALOG_TEST_FIXTURE_MARK}: granted iframe A`,
        cspFrameSrcVerified: true,
      },
      {
        id: 'embed-fixture-b',
        providerId: 'prov-fixture',
        gameSlug: 'fixture-game-b',
        sourceUrl: 'https://embed.example.com/b',
        status: 'granted',
        permissionBasis: `${CATALOG_TEST_FIXTURE_MARK}: granted iframe B`,
        cspFrameSrcVerified: true,
      },
    ],
    games: [
      {
        id: 'fixture-game-a',
        slug: 'fixture-game-a',
        title: 'Fixture Game A',
        providerId: 'prov-fixture',
        launch: {
          verification: 'verified',
          mode: 'iframe-official',
          primaryUrl: 'https://embed.example.com/a',
        },
        publicationStatus: 'published',
        showOnHome: true,
        homeSort: 1,
        embedPermissionId: 'embed-fixture-a',
        cardAction: 'launcher-select',
      },
      {
        id: 'fixture-game-b',
        slug: 'fixture-game-b',
        title: 'Fixture Game B',
        providerId: 'prov-fixture',
        launch: {
          verification: 'verified',
          mode: 'iframe-official',
          primaryUrl: 'https://embed.example.com/b',
        },
        publicationStatus: 'published',
        showOnHome: true,
        homeSort: 2,
        embedPermissionId: 'embed-fixture-b',
        cardAction: 'launcher-select',
      },
    ],
    defaultPlayerGameSlug: 'fixture-game-a',
  }
}

test('PLAY-02 dual granted fixture: switch A→B keeps single player iframe', () => {
  enableDomFakeTimers()
  const catalog = buildGrantedIframeLauncherCatalog()
  const homeGames = catalog.games
  render(<Launcher homeGames={homeGames} catalog={catalog} />)

  assert.equal(screen.getByRole('status').textContent, 'Fixture Game A')
  assert.equal(document.querySelectorAll('iframe').length, 1)
  const iframeA = document.querySelector('iframe#player')!
  assert.equal(iframeA.getAttribute('src'), 'https://embed.example.com/a')

  const pathnameBefore = window.location.pathname
  const hashBefore = window.location.hash

  fireEvent.click(screen.getByRole('button', { name: 'Fixture Game B' }))

  assert.equal(window.location.pathname, pathnameBefore)
  assert.equal(window.location.hash, hashBefore)
  assert.equal(screen.getByRole('status').textContent, 'Fixture Game B')
  assert.equal(document.querySelectorAll('iframe').length, 1)
  const iframeB = document.querySelector('iframe#player')!
  assert.equal(iframeB.getAttribute('src'), 'https://embed.example.com/b')

  fireEvent.load(iframeA)
  assert.equal(screen.getByRole('status').textContent, 'Fixture Game B')
  assert.ok(screen.getByText('Loading game…'))

  tickFakeTimers(8000)
  const fallback = screen.getByText(/taking longer than usual/i).parentElement!
  const link = fallback.querySelector('a[href="https://embed.example.com/b"]')
  assert.ok(link)
  assert.equal(link?.getAttribute('target'), '_blank')
  assert.match(link?.getAttribute('rel') ?? '', /noopener/)
  assert.match(link?.getAttribute('rel') ?? '', /noreferrer/)
})

test('PLAY-N01 ungranted fixture-game-b does not mount iframe when selected', () => {
  const catalog = buildGrantedIframeLauncherCatalog()
  catalog.embedPermissions[1] = {
    ...catalog.embedPermissions[1]!,
    status: 'unknown',
    permissionBasis: `${CATALOG_TEST_FIXTURE_MARK}: ungranted B`,
    cspFrameSrcVerified: false,
  }
  render(<Launcher homeGames={catalog.games} catalog={catalog} />)
  fireEvent.click(screen.getByRole('button', { name: 'Fixture Game B' }))
  assert.equal(document.querySelector('iframe'), null)
  assert.equal(screen.getByRole('status').textContent, 'Fixture Game B')
})

test('PLAY-04 granted fixture renders exactly one iframe with id player', () => {
  const catalog: Catalog = {
    providers: [{ id: 'prov-a', name: 'Prov A', verification: 'verified' }],
    embedPermissions: [
      {
        id: 'embed-a',
        providerId: 'prov-a',
        gameSlug: 'fixture-a',
        sourceUrl: 'https://embed.example.com/a',
        status: 'granted',
        permissionBasis: 'CATALOG_TEST_FIXTURE_NOT_PRODUCTION: granted iframe A',
        cspFrameSrcVerified: true,
      },
    ],
    games: [
      {
        id: 'fixture-a',
        slug: 'fixture-a',
        title: 'Fixture A',
        providerId: 'prov-a',
        launch: {
          verification: 'verified',
          mode: 'iframe-official',
          primaryUrl: 'https://embed.example.com/a',
        },
        publicationStatus: 'published',
        showOnHome: true,
        homeSort: 1,
        embedPermissionId: 'embed-a',
        cardAction: 'launcher-select',
      },
    ],
    defaultPlayerGameSlug: 'fixture-a',
  }
  render(<Launcher homeGames={[catalog.games[0]]} catalog={catalog} />)
  assert.equal(document.querySelectorAll('iframe').length, 1)
  assert.equal(document.querySelector('iframe#player')?.getAttribute('src'), 'https://embed.example.com/a')
})

test('H16 portal home frozen H1 and subtitle markup', () => {
  assert.equal(PORTAL_HOME_FROZEN_H1, 'Ball Games')
  assert.equal(
    PORTAL_HOME_FROZEN_SUBTITLE,
    'Pick a game and play in seconds — free, in your browser, nothing to install.'
  )
})
