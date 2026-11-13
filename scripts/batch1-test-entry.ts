/**
 * Phase 3 Batch 1 — site URL / PortalHome 契约测试。
 * `ballgamesPortalHomeContentFixture` 仅供本测试文件构造用例，非生产读取路径。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  SiteConfigError,
  ballgamesSiteInstance,
  resolvePortalHomeOgImage,
  validatePortalHomeContent,
  validateSiteInstance,
} from '../lib/site/index'
import { ballgamesPortalHomeContentFixture } from '../lib/site/instances/ballgames'
import { gamePath, gameUrl, siteUrl } from '../lib/urls/site-url'

test('siteUrl root returns canonicalOrigin without trailing slash', () => {
  assert.equal(siteUrl(), 'https://ballgames.io')
  assert.equal(siteUrl('/'), 'https://ballgames.io')
  assert.equal(siteUrl(undefined, ballgamesSiteInstance), 'https://ballgames.io')
})

test('siteUrl game path matches R1 contract', () => {
  assert.equal(siteUrl('/hockey-bros'), 'https://ballgames.io/hockey-bros')
  assert.equal(gameUrl('hockey-bros'), 'https://ballgames.io/hockey-bros')
})

test('siteUrl ignores BASE_PATH env for canonical output', () => {
  const previous = process.env.BASE_PATH
  process.env.BASE_PATH = '/Game-site-kit'
  try {
    assert.equal(siteUrl('/blog'), 'https://ballgames.io/blog')
  } finally {
    if (previous === undefined) delete process.env.BASE_PATH
    else process.env.BASE_PATH = previous
  }
})

test('siteUrl rejects invalid canonical paths', () => {
  assert.throws(() => siteUrl('/blog?x=1'), SiteConfigError)
  assert.throws(() => siteUrl('/blog#x'), SiteConfigError)
  assert.throws(() => siteUrl('https://evil.example/x'), SiteConfigError)
  assert.throws(() => siteUrl('/../secret'), SiteConfigError)
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

test('siteUrl accepts valid canonical paths', () => {
  assert.equal(siteUrl('/blog'), 'https://ballgames.io/blog')
  assert.equal(siteUrl('/sitemap.xml'), 'https://ballgames.io/sitemap.xml')
})

test('gameUrl rejects invalid slugs', () => {
  assert.throws(() => gameUrl('/hockey-bros'), SiteConfigError)
  assert.throws(() => gameUrl('Hockey-Bros'), SiteConfigError)
  assert.throws(() => gameUrl('https://hockeybros.io'), SiteConfigError)
  assert.throws(() => gameUrl(''), SiteConfigError)
})

test('gamePath returns in-site relative paths', () => {
  assert.equal(gamePath('hockey-bros'), '/hockey-bros')
  assert.equal(gamePath('football-bros'), '/football-bros')
  assert.equal(gameUrl('hockey-bros'), 'https://ballgames.io/hockey-bros')
})

test('gamePath rejects invalid slugs', () => {
  assert.throws(() => gamePath(''), SiteConfigError)
  assert.throws(() => gamePath(' Hockey-bros '), SiteConfigError)
  assert.throws(() => gamePath('../hockey-bros'), SiteConfigError)
  assert.throws(() => gamePath('//evil.com'), SiteConfigError)
  assert.throws(() => gamePath('https://evil.com'), SiteConfigError)
  assert.throws(() => gamePath('hockey-bros?x=1'), SiteConfigError)
  assert.throws(() => gamePath('hockey-bros#play'), SiteConfigError)
  assert.throws(() => gamePath('hockey\\bros'), SiteConfigError)
  assert.throws(() => gamePath('hockey%2fbros'), SiteConfigError)
})

test('validatePortalHomeContent requires non-empty seo title and description', () => {
  validatePortalHomeContent(ballgamesPortalHomeContentFixture)
  assert.throws(
    () =>
      validatePortalHomeContent({
        publicationStatus: 'draft',
        seo: { title: '', description: 'ok', indexable: false },
      }),
    SiteConfigError
  )
  assert.throws(
    () =>
      validatePortalHomeContent({
        publicationStatus: 'draft',
        seo: { title: 'ok', description: '   ', indexable: false },
      }),
    SiteConfigError
  )
})

test('indexable portal home requires published status', () => {
  assert.throws(
    () =>
      validatePortalHomeContent({
        publicationStatus: 'draft',
        seo: { title: 'T', description: 'D', indexable: true },
      }),
    (err: unknown) =>
      err instanceof SiteConfigError && err.code === 'PORTAL_HOME_INDEXABLE_REQUIRES_PUBLISHED'
  )
})

test('resolvePortalHomeOgImage falls back to socialBanner only', () => {
  const site = {
    ...ballgamesSiteInstance,
    metadata: { ...ballgamesSiteInstance.metadata, socialBanner: '/static/og.png' },
  }
  const content = {
    ...ballgamesPortalHomeContentFixture,
    seo: { ...ballgamesPortalHomeContentFixture.seo, ogImage: undefined },
  }
  assert.equal(resolvePortalHomeOgImage(content, site), '/static/og.png')
})

test('validateSiteInstance rejects invalid canonicalOrigin', () => {
  assert.throws(
    () =>
      validateSiteInstance({
        ...ballgamesSiteInstance,
        canonicalOrigin: 'https://ballgames.io/',
      }),
    SiteConfigError
  )
})
