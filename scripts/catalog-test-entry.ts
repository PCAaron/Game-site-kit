import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import {
  CatalogError,
  ballgamesCatalog,
  buildCatalogVerificationReport,
  catalogGameCanonicalUrl,
  catalogSiteUrl,
  createGameSeo,
  getBallgamesCatalog,
  getProductionHomeCatalog,
  isProductionEmbedAllowed,
  validateCatalog,
  validateCatalogSeo,
  collectDefaultPlayerGameIssues,
  type Catalog,
  type CatalogGame,
  type GameDetailContent,
} from '../lib/catalog/index'
import { gameUrl, siteUrl } from '../lib/urls/site-url'
import { getBallgamesPortalHomeContent, getPortalHomeContent } from '../lib/site/index'

/** Test-only fixture. Not production catalog data and not a verified publish set. */
const CATALOG_TEST_FIXTURE_MARK = 'CATALOG_TEST_FIXTURE_NOT_PRODUCTION'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function fixtureDetail(): GameDetailContent {
  return {
    seo: createGameSeo({
      title: 'Hockey Bros Fixture Title',
      description: 'Hockey Bros fixture description for contract tests.',
      indexable: true,
    }),
    intro: 'Fixture intro. Not production copy.',
    howToPlay: 'Fixture how to play. Not production copy.',
    sections: [{ heading: 'Fixture section', body: 'Fixture body.' }],
    faq: [{ q: 'Fixture question?', a: 'Fixture answer.' }],
    controls: [{ label: 'Move', keys: 'WASD' }],
  }
}

function fixtureCatalog(): Catalog {
  return {
    providers: [
      {
        id: 'hockeybros-io',
        name: 'hockeybros.io',
        verification: 'verified',
        site: 'https://www.hockeybros.io',
      },
      {
        id: 'pending-verification',
        name: 'Pending provider verification',
        verification: 'unverified',
      },
    ],
    embedPermissions: [
      {
        id: 'embed-hockey-bros',
        providerId: 'hockeybros-io',
        gameSlug: 'hockey-bros',
        sourceUrl: 'https://www.hockeybros.io/',
        status: 'unknown',
        permissionBasis: `${CATALOG_TEST_FIXTURE_MARK}: unknown embed is intentional`,
        cspFrameSrcVerified: false,
      },
      {
        id: 'embed-draft',
        providerId: 'pending-verification',
        status: 'unknown',
        permissionBasis: `${CATALOG_TEST_FIXTURE_MARK}: draft embed pending review`,
        cspFrameSrcVerified: false,
      },
    ],
    games: [
      {
        id: 'hockey-bros',
        slug: 'hockey-bros',
        title: 'Hockey Bros',
        providerId: 'hockeybros-io',
        launch: {
          verification: 'verified',
          mode: 'iframe-official',
          primaryUrl: 'https://www.hockeybros.io/',
        },
        publicationStatus: 'published',
        showOnHome: true,
        homeSort: 1,
        embedPermissionId: 'embed-hockey-bros',
        cardAction: 'navigate-to-detail',
        detail: fixtureDetail(),
      },
      {
        id: 'basket-bros',
        slug: 'basket-bros',
        title: 'Basket Bros',
        providerId: 'pending-verification',
        launch: { verification: 'unverified' },
        publicationStatus: 'draft',
        showOnHome: false,
        homeSort: 2,
        embedPermissionId: 'embed-draft',
        cardAction: 'launcher-select',
      },
    ],
  }
}

function assertCatalogError(fn: () => void, code: string): void {
  assert.throws(fn, (error: unknown) => error instanceof CatalogError && error.code === code)
}

test('valid catalog fixture passes validation', () => {
  validateCatalog(fixtureCatalog())
})

test('duplicate slug is rejected', () => {
  const catalog = fixtureCatalog()
  catalog.games[1].slug = 'hockey-bros'
  catalog.games[1].id = 'hockey-bros-dup'
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_SLUG_DUPLICATE')
})

test('illegal slug is rejected', () => {
  const catalog = fixtureCatalog()
  catalog.games[1].slug = 'Hockey-Bros'
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_SLUG_INVALID')
})

test('missing required title is rejected', () => {
  const catalog = fixtureCatalog()
  catalog.games[0].title = '   '
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_FIELD_REQUIRED')
})

test('illegal publicationStatus is rejected', () => {
  const catalog = fixtureCatalog()
  catalog.games[0].publicationStatus = 'live' as CatalogGame['publicationStatus']
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_PUBLICATION_STATUS_INVALID')
})

test('indexable defaults to false', () => {
  const seo = createGameSeo({ title: 'Title', description: 'Description' })
  assert.equal(seo.indexable, false)
})

test('non hockey-bros cannot be R1 indexable detail', () => {
  const catalog = fixtureCatalog()
  catalog.embedPermissions.push({
    id: 'embed-basket-bros-fixture',
    providerId: 'hockeybros-io',
    gameSlug: 'basket-bros',
    sourceUrl: 'https://www.hockeybros.io/',
    status: 'unknown',
    permissionBasis: `${CATALOG_TEST_FIXTURE_MARK}: indexable negative case`,
    cspFrameSrcVerified: false,
  })
  catalog.games[1].publicationStatus = 'published'
  catalog.games[1].showOnHome = true
  catalog.games[1].providerId = 'hockeybros-io'
  catalog.games[1].embedPermissionId = 'embed-basket-bros-fixture'
  catalog.games[1].launch = {
    verification: 'verified',
    mode: 'external-link',
    primaryUrl: 'https://www.hockeybros.io/',
  }
  catalog.games[1].detail = {
    ...fixtureDetail(),
    seo: createGameSeo({
      title: 'Basket Bros',
      description: 'Should not be indexable in R1.',
      indexable: true,
    }),
  }
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_INDEXABLE_NOT_ALLOWED')
})

test('non hockey-bros cannot have R1 complete detail content', () => {
  const catalog = fixtureCatalog()
  catalog.games[1].detail = fixtureDetail()
  catalog.games[1].detail.seo.indexable = false
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_DETAIL_NOT_ALLOWED')
})

test('unverified records are excluded from the production home catalog', () => {
  const catalog = fixtureCatalog()
  const home = getProductionHomeCatalog(catalog)
  assert.deepEqual(
    home.map((game) => game.slug),
    ['hockey-bros']
  )
  assert.equal(
    home.some(
      (game) => game.publicationStatus !== 'published' || game.launch.verification !== 'verified'
    ),
    false
  )
})

test('draft showOnHome is rejected', () => {
  const catalog = fixtureCatalog()
  catalog.games[1].showOnHome = true
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_SHOW_ON_HOME_REQUIRES_PUBLISHED')
})

test('EmbedPermission unknown fails production embed admission', () => {
  const catalog = fixtureCatalog()
  const hockey = catalog.games[0]
  assert.equal(hockey.embedPermissionId, 'embed-hockey-bros')
  assert.equal(catalog.embedPermissions[0].status, 'unknown')
  assert.equal(isProductionEmbedAllowed(hockey, catalog), false)
})

test('granted embed without CSP verification still fails production embed admission', () => {
  const catalog = fixtureCatalog()
  catalog.embedPermissions[0].status = 'granted'
  catalog.embedPermissions[0].cspFrameSrcVerified = false
  catalog.embedPermissions[0].permissionBasis = `${CATALOG_TEST_FIXTURE_MARK}: granted without CSP`
  assert.equal(isProductionEmbedAllowed(catalog.games[0], catalog), false)
})

test('granted embed with matching CSP verification passes only on fixtures', () => {
  const catalog = fixtureCatalog()
  catalog.embedPermissions[0].status = 'granted'
  catalog.embedPermissions[0].cspFrameSrcVerified = true
  catalog.embedPermissions[0].permissionBasis = `${CATALOG_TEST_FIXTURE_MARK}: synthetic grant for gate test`
  assert.equal(isProductionEmbedAllowed(catalog.games[0], catalog), true)
})

test('unverified launch cannot be marked published', () => {
  const catalog = fixtureCatalog()
  catalog.games[0].launch = { verification: 'unverified' }
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_PUBLISHED_REQUIRES_VERIFIED_LAUNCH')
})

test('placeholder launch URL cannot be published', () => {
  const catalog = fixtureCatalog()
  delete catalog.games[0].embedPermissionId
  catalog.games[0].launch = {
    verification: 'verified',
    mode: 'external-link',
    primaryUrl: 'https://example.com/game',
  }
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_LAUNCH_URL_PLACEHOLDER')
})

test('catalog site URLs use existing helpers and are not stored on records', () => {
  const catalog = fixtureCatalog()
  validateCatalog(catalog)
  assert.equal(catalogGameCanonicalUrl('hockey-bros'), gameUrl('hockey-bros'))
  assert.equal(catalogGameCanonicalUrl('hockey-bros'), 'https://ballgames.io/hockey-bros')
  assert.equal(catalogSiteUrl(), siteUrl())
  assert.equal(catalogSiteUrl(), 'https://ballgames.io')
  assert.equal('canonical' in catalog.games[0], false)
  assert.equal('canonicalUrl' in catalog.games[0], false)

  const withCanonical = clone(catalog)
  Object.assign(withCanonical.games[0], { canonical: 'https://ballgames.io/hockey-bros' })
  assertCatalogError(() => validateCatalog(withCanonical), 'CATALOG_CANONICAL_URL_FORBIDDEN')
})

test('football-bros reported demo does not bypass production embed gate', () => {
  const catalog = getBallgamesCatalog()
  const football = catalog.games.find((game) => game.slug === 'football-bros')
  assert.ok(football)
  assert.equal(catalog.defaultPlayerGameSlug, 'football-bros')
  assert.equal(football.technicalEmbedVerification?.status, 'reported')
  assert.equal(isProductionEmbedAllowed(football!, catalog), false)
})

test('production ballgames catalog validates and keeps unverified rows out of home', () => {
  validateCatalog(getBallgamesCatalog())
  const home = getProductionHomeCatalog()
  assert.deepEqual(
    home.map((game) => game.slug),
    ['hockey-bros']
  )
  assert.equal(home[0].launch.verification, 'verified')
  assert.equal(isProductionEmbedAllowed(home[0], ballgamesCatalog), false)
  assert.equal(
    ballgamesCatalog.games
      .filter((game) => game.detail)
      .map((game) => game.slug)
      .join(','),
    'hockey-bros'
  )
  assert.equal(
    ballgamesCatalog.games.some((game) => game.slug === CATALOG_TEST_FIXTURE_MARK),
    false
  )
})

test('production verification report records readiness without blocking schema', () => {
  const report = buildCatalogVerificationReport()
  assert.equal(report.publishedHomeCount, 1)
  assert.equal(report.publishedHomeTargetMet, false)
  assert.equal(report.productionEmbedReadyCount, 0)
  assert.equal(
    report.issues.some(
      (issue) => issue.code === 'HOME_CARD_COUNT_BELOW_TARGET' && issue.severity === 'INFO'
    ),
    true
  )
  assert.equal(
    report.issues.some(
      (issue) => issue.code === 'PRODUCTION_IFRAME_NOT_READY' && issue.severity === 'BLOCKED'
    ),
    true
  )
})

test('C01 external-link without provider passes schema', () => {
  const catalog = fixtureCatalog()
  catalog.games.push({
    id: 'ext-no-provider',
    slug: 'ext-no-provider',
    title: 'External No Provider',
    launch: {
      verification: 'verified',
      mode: 'external-link',
      primaryUrl: 'https://www.hockeybros.io/',
    },
    publicationStatus: 'published',
    showOnHome: false,
    homeSort: 99,
    cardAction: 'launcher-select',
  })
  validateCatalog(catalog)
})

test('C02 external-link without embedPermission passes schema', () => {
  const catalog = fixtureCatalog()
  const game = catalog.games[0]
  delete game.embedPermissionId
  game.launch = {
    verification: 'verified',
    mode: 'external-link',
    primaryUrl: 'https://www.hockeybros.io/',
  }
  validateCatalog(catalog)
})

test('C03 declared missing provider fails schema', () => {
  const catalog = fixtureCatalog()
  catalog.games[0].providerId = 'missing-provider'
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_PROVIDER_MISSING')
})

test('C04 declared missing embedPermission fails schema', () => {
  const catalog = fixtureCatalog()
  catalog.games[0].embedPermissionId = 'missing-embed'
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_EMBED_PERMISSION_MISSING')
})

test('C05 game and embedPermission provider mismatch fails schema', () => {
  const catalog = fixtureCatalog()
  catalog.embedPermissions.push({
    id: 'embed-wrong-provider',
    providerId: 'pending-verification',
    gameSlug: 'hockey-bros',
    sourceUrl: 'https://www.hockeybros.io/',
    status: 'unknown',
    permissionBasis: `${CATALOG_TEST_FIXTURE_MARK}: provider mismatch case`,
    cspFrameSrcVerified: false,
  })
  catalog.games[0].embedPermissionId = 'embed-wrong-provider'
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_EMBED_PROVIDER_MISMATCH')
})

test('C06 embedPermission gameSlug mismatch fails schema', () => {
  const catalog = fixtureCatalog()
  catalog.embedPermissions[0].gameSlug = 'wrong-slug'
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_EMBED_GAME_MISMATCH')
})

test('C07 iframe legal config with unknown permission allows catalog read', () => {
  const catalog = fixtureCatalog()
  validateCatalog(catalog)
  assert.equal(isProductionEmbedAllowed(catalog.games[0], catalog), false)
})

test('C08 granted embed without CSP blocks production iframe only', () => {
  const catalog = fixtureCatalog()
  catalog.embedPermissions[0].status = 'granted'
  catalog.embedPermissions[0].permissionBasis = `${CATALOG_TEST_FIXTURE_MARK}: granted no CSP`
  validateCatalog(catalog)
  assert.equal(isProductionEmbedAllowed(catalog.games[0], catalog), false)
})

test('C09 published indexable false with incomplete detail passes schema', () => {
  const catalog = fixtureCatalog()
  catalog.games[0].detail = {
    seo: createGameSeo({
      title: 'Partial',
      description: 'Partial detail',
      indexable: false,
    }),
    intro: 'Only intro',
    howToPlay: '',
    sections: [],
    faq: [],
    controls: [],
  }
  validateCatalog(catalog)
})

test('C10 published indexable true with incomplete detail fails SEO validation', () => {
  const catalog = fixtureCatalog()
  catalog.games[0].detail = {
    seo: createGameSeo({
      title: 'Indexable incomplete',
      description: 'Should fail SEO layer',
      indexable: true,
    }),
    intro: 'Only intro',
    howToPlay: '',
    sections: [],
    faq: [],
    controls: [],
  }
  validateCatalog(catalog)
  assertCatalogError(() => validateCatalogSeo(catalog), 'CATALOG_INDEXABLE_REQUIRES_DETAIL')
})

test('C11 home count below target is INFO in readiness report', () => {
  const report = buildCatalogVerificationReport(fixtureCatalog())
  const issue = report.issues.find((item) => item.code === 'HOME_CARD_COUNT_BELOW_TARGET')
  assert.ok(issue)
  assert.equal(issue.severity, 'INFO')
})

test('C12 home count in target range has no below-target INFO', () => {
  const catalog = fixtureCatalog()
  for (let i = 2; i <= 15; i += 1) {
    catalog.games.push({
      id: `home-game-${i}`,
      slug: `home-game-${i}`,
      title: `Home Game ${i}`,
      launch: {
        verification: 'verified',
        mode: 'external-link',
        primaryUrl: 'https://www.hockeybros.io/',
      },
      publicationStatus: 'published',
      showOnHome: true,
      homeSort: i,
      cardAction: 'launcher-select',
    })
  }
  validateCatalog(catalog)
  const report = buildCatalogVerificationReport(catalog)
  assert.equal(report.publishedHomeTargetMet, true)
  assert.equal(
    report.issues.some((item) => item.code === 'HOME_CARD_COUNT_BELOW_TARGET'),
    false
  )
})

test('C13 home game without provider remains eligible', () => {
  const catalog = fixtureCatalog()
  const game = catalog.games[0]
  delete game.providerId
  validateCatalog(catalog)
  const home = getProductionHomeCatalog(catalog)
  assert.deepEqual(
    home.map((row) => row.slug),
    ['hockey-bros']
  )
})

test('C14 PortalHome content is readable via site reader', () => {
  const content = getBallgamesPortalHomeContent()
  assert.equal(content.publicationStatus, 'published')
  assert.equal(content.seo.indexable, true)
  assert.equal(getPortalHomeContent().seo.title, content.seo.title)
})

test('C15 PortalHome reader is separate from Catalog adapter', () => {
  const catalog = getBallgamesCatalog()
  const portal = getPortalHomeContent()
  validateCatalog(catalog)
  assert.notEqual(portal.seo.title, catalog.games[0]?.title)
  assert.equal(typeof portal.seo.title, 'string')
})

test('C16 validate-seo entry shape: schema then catalog SEO gate', () => {
  const path = fileURLToPath(new URL('./validate-seo-entry.ts', import.meta.url))
  const source = readFileSync(path, 'utf8')
  assert.ok(source.includes('validateCatalog('))
  assert.ok(source.includes('validateCatalogSeo('))
})

test('CAT-N01 defaultPlayerGameSlug unknown slug fails schema', () => {
  const catalog = fixtureCatalog()
  catalog.defaultPlayerGameSlug = 'not-in-catalog'
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_DEFAULT_PLAYER_UNKNOWN')
})

test('CAT-N02 default player without verified launch emits WARNING', () => {
  const catalog = clone(fixtureCatalog())
  catalog.defaultPlayerGameSlug = 'basket-bros'
  catalog.games[1].launch = { verification: 'unverified' }
  validateCatalog(catalog)
  const issues = collectDefaultPlayerGameIssues(catalog)
  assert.ok(issues.some((i) => i.code === 'CATALOG_DEFAULT_PLAYER_LAUNCH_UNVERIFIED'))
})

test('CAT-N03 default player discontinued emits WARNING', () => {
  const catalog = clone(getBallgamesCatalog())
  const football = catalog.games.find((g) => g.slug === 'football-bros')!
  football.availability = 'discontinued'
  validateCatalog(catalog)
  const issues = collectDefaultPlayerGameIssues(catalog)
  assert.ok(issues.some((i) => i.code === 'CATALOG_DEFAULT_PLAYER_DISCONTINUED'))
})

test('CAT-N04 illegal technical embed status fails schema', () => {
  const catalog = clone(getBallgamesCatalog())
  const football = catalog.games.find((g) => g.slug === 'football-bros')!
  football.technicalEmbedVerification = {
    status: 'bogus' as 'reported',
    evidenceRef: 'x',
  }
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_TECH_EMBED_STATUS_INVALID')
})

test('CAT-N05 illegal technical testedAt fails schema', () => {
  const catalog = clone(getBallgamesCatalog())
  const football = catalog.games.find((g) => g.slug === 'football-bros')!
  football.technicalEmbedVerification = {
    status: 'reported',
    testedAt: 'not-a-date',
  }
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_TECH_EMBED_TESTED_AT_INVALID')
})

test('CAT-N06 technical sourceUrl mismatch fails schema', () => {
  const catalog = clone(getBallgamesCatalog())
  const football = catalog.games.find((g) => g.slug === 'football-bros')!
  football.technicalEmbedVerification = {
    status: 'reported',
    sourceUrl: 'https://example.com/wrong',
  }
  assertCatalogError(() => validateCatalog(catalog), 'CATALOG_TECH_EMBED_SOURCE_URL_MISMATCH')
})

test('CAT-N07 reported demo with unknown permission still blocks production iframe', () => {
  const catalog = getBallgamesCatalog()
  const football = catalog.games.find((g) => g.slug === 'football-bros')!
  assert.equal(football.technicalEmbedVerification?.status, 'reported')
  assert.equal(isProductionEmbedAllowed(football, catalog), false)
})

test('CAT-N08 catalog game without technical embed record still validates', () => {
  const catalog = clone(fixtureCatalog())
  validateCatalog(catalog)
})
