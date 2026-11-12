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
import { ballgamesCatalog } from '../lib/catalog/index'
import { gameUrl } from '../lib/urls/site-url'

function minimalPublishedGame(overrides: Partial<CatalogGame> & Pick<CatalogGame, 'id' | 'slug' | 'title' | 'cardAction'>): CatalogGame {
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

test('T01 GameCard navigate-to-detail renders Link with gameUrl(slug)', () => {
  const onSelect = mock.fn()
  render(<GameCard game={hockeyDetail} onLauncherSelect={onSelect} />)
  const link = screen.getByRole('link', { name: hockeyDetail.title })
  assert.equal(link.getAttribute('href'), gameUrl(hockeyDetail.slug))
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

test('H16 portal home frozen H1 and subtitle markup', () => {
  assert.equal(PORTAL_HOME_FROZEN_H1, 'Ball Games')
  assert.equal(
    PORTAL_HOME_FROZEN_SUBTITLE,
    'Pick a game and it starts — hockey, soccer, football, basketball, free in your browser.'
  )
})
