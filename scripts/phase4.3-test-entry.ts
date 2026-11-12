import './phase4.3-component-tests'

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import {
  ballgamesCatalog,
  getBallgamesCatalog,
  getProductionHomeCatalog,
  isProductionEmbedAllowed,
} from '../lib/catalog/index'
import {
  pickDefaultLauncherGame,
  resolvePlayPresentation,
  shouldAcceptIframeLoadEvent,
} from '../lib/portal/play-presentation'
import { getPortalHomeContent } from '../lib/site/get-portal-home-content'
import { gameUrl } from '../lib/urls/site-url'
import { buildProductionSitemap, getProductionPortalDescriptors } from '../lib/seo/production-state'
import { ballgamesSiteInstance } from '../lib/site/instances/ballgames'
import { resolvedSeoToMetadata } from '../lib/seo/metadata'
import { resolvePortalHomePageSeo } from '../lib/seo/resolve-page-seo'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function readProjectFile(relativePath: string): string {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

test('H01 production home catalog has one verified game and presentation is usable', () => {
  const home = getProductionHomeCatalog()
  assert.equal(home.length, 1)
  assert.equal(home[0].slug, 'hockey-bros')
  const presentation = resolvePlayPresentation(home[0], getBallgamesCatalog())
  assert.equal(presentation.mode, 'external-only')
  assert.equal(presentation.primaryUrl, 'https://www.hockeybros.io/')
})

test('H02 empty published home catalog resolves without throwing', () => {
  const empty = getProductionHomeCatalog({ ...ballgamesCatalog, games: [] })
  assert.equal(empty.length, 0)
  assert.equal(pickDefaultLauncherGame(empty), undefined)
})

test('H03 draft games are excluded from production home catalog', () => {
  const home = getProductionHomeCatalog()
  assert.equal(
    home.some((game) => game.publicationStatus !== 'published'),
    false
  )
  assert.equal(
    ballgamesCatalog.games.some(
      (game) => game.publicationStatus === 'draft' && game.showOnHome === true
    ),
    false
  )
})

test('H04 showOnHome false rows stay off home grid', () => {
  const showOnHomeFalse = ballgamesCatalog.games.filter((g) => !g.showOnHome)
  assert.ok(showOnHomeFalse.length > 0)
  const homeSlugs = new Set(getProductionHomeCatalog().map((g) => g.slug))
  for (const game of showOnHomeFalse) {
    assert.equal(homeSlugs.has(game.slug), false)
  }
})

test('H05 navigate-to-detail uses gameUrl helper path', () => {
  const hockey = getProductionHomeCatalog()[0]
  assert.equal(hockey.cardAction, 'navigate-to-detail')
  assert.equal(gameUrl(hockey.slug), 'https://ballgames.io/hockey-bros')
})

test('H07 unverified launch cannot produce iframe presentation', () => {
  const draftLike = {
    ...ballgamesCatalog.games[0],
    launch: { verification: 'unverified' as const },
  }
  const presentation = resolvePlayPresentation(draftLike, ballgamesCatalog)
  assert.equal(presentation.mode, 'external-only')
  assert.equal(presentation.primaryUrl, null)
})

test('H08 embed permission unknown blocks production iframe presentation', () => {
  const hockey = getProductionHomeCatalog()[0]
  assert.equal(isProductionEmbedAllowed(hockey, ballgamesCatalog), false)
  const presentation = resolvePlayPresentation(hockey, ballgamesCatalog)
  assert.equal(presentation.mode, 'external-only')
})

test('H09 play presentation timeout default is 8000ms', () => {
  const hockey = getProductionHomeCatalog()[0]
  const presentation = resolvePlayPresentation(hockey, ballgamesCatalog)
  assert.equal(presentation.timeoutMs, 8000)
})

test('H11 stale iframe load events are ignored', () => {
  assert.equal(shouldAcceptIframeLoadEvent(1, 2), false)
  assert.equal(shouldAcceptIframeLoadEvent(2, 2), true)
})

test('H12 external-only presentation keeps primary URL for new tab', () => {
  const hockey = getProductionHomeCatalog()[0]
  const presentation = resolvePlayPresentation(hockey, ballgamesCatalog)
  assert.equal(presentation.primaryUrl, 'https://www.hockeybros.io/')
})

test('H13 portal home SEO is indexable when published (Phase 4.5)', () => {
  const portal = getPortalHomeContent()
  assert.equal(portal.seo.indexable, true)
  const resolved = resolvePortalHomePageSeo(
    {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: true,
      content: portal,
    },
    ballgamesSiteInstance
  )
  const meta = resolvedSeoToMetadata(resolved, ballgamesSiteInstance)
  assert.deepEqual(meta.robots, { index: true, follow: true })
})

test('H14 production sitemap exact-two eligible set', () => {
  const entries = buildProductionSitemap(ballgamesSiteInstance)
  assert.equal(entries.length, 2)
  const urls = entries.map((e) => e.url).sort()
  assert.deepEqual(urls, ['https://ballgames.io', 'https://ballgames.io/hockey-bros'].sort())
  assert.equal(
    getProductionPortalDescriptors().filter((d) => d.pageType === 'portal_home').length,
    1
  )
})

test('H15 homepage no longer sources blog list', () => {
  const pageSrc = readProjectFile('app/page.tsx')
  assert.doesNotMatch(pageSrc, /allBlogs/)
  assert.doesNotMatch(pageSrc, /sortPosts/)
  assert.match(pageSrc, /getPortalHomeContent/)
  assert.match(pageSrc, /getProductionHomeCatalog/)
})
