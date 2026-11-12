import { gameUrl, siteUrl } from '../urls/site-url'
import { ballgamesCatalog } from './instances/ballgames'
import {
  PRODUCTION_HOME_CARD_TARGET,
  type Catalog,
  type CatalogGame,
  type CatalogVerificationReport,
  type VerifiedLaunchConfig,
} from './types'
import {
  collectCatalogContentQualityIssues,
  isLaunchVerified,
  isPublishedForHome,
  validateCatalog,
} from './validate'

export function getBallgamesCatalog(): Catalog {
  return ballgamesCatalog
}

export function catalogSiteUrl(path?: string): string {
  return siteUrl(path)
}

export function catalogGameCanonicalUrl(slug: string): string {
  return gameUrl(slug)
}

export function getProductionHomeCatalog(catalog: Catalog = ballgamesCatalog): CatalogGame[] {
  validateCatalog(catalog)
  return catalog.games.filter(isPublishedForHome).sort((a, b) => a.homeSort - b.homeSort)
}

/**
 * Production-eligible related grid rows: same gate as the home grid (no draft fabrication).
 * Optionally exclude the current detail slug when the spec treats self as non-related.
 */
export function getProductionRelatedCatalogGames(
  catalog: Catalog = ballgamesCatalog,
  options?: { excludeSlug?: string }
): CatalogGame[] {
  const games = getProductionHomeCatalog(catalog)
  if (!options?.excludeSlug) {
    return games
  }
  return games.filter((game) => game.slug !== options.excludeSlug)
}

export function findEmbedPermission(game: CatalogGame, catalog: Catalog) {
  if (!game.embedPermissionId) {
    return undefined
  }
  return catalog.embedPermissions.find((permission) => permission.id === game.embedPermissionId)
}

/**
 * Production iframe gate. unknown / requested / denied never pass.
 * granted without cspFrameSrcVerified also fails.
 * This does not prove a real-world license exists.
 */
export function isProductionEmbedAllowed(game: CatalogGame, catalog: Catalog): boolean {
  if (!isLaunchVerified(game.launch)) return false
  const launch: VerifiedLaunchConfig = game.launch
  if (launch.mode !== 'iframe-official' && launch.mode !== 'iframe-provider') return false

  const permission = findEmbedPermission(game, catalog)
  if (!permission) return false
  if (permission.status !== 'granted') return false
  if (permission.cspFrameSrcVerified !== true) return false
  if (permission.sourceUrl !== launch.primaryUrl) return false
  return true
}

export function buildCatalogVerificationReport(
  catalog: Catalog = ballgamesCatalog
): CatalogVerificationReport {
  validateCatalog(catalog)
  const publishedHome = getProductionHomeCatalog(catalog)
  const productionEmbedReadyCount = catalog.games.filter((game) =>
    isProductionEmbedAllowed(game, catalog)
  ).length

  const issues: CatalogVerificationReport['issues'] = []

  if (publishedHome.length < PRODUCTION_HOME_CARD_TARGET.min) {
    issues.push({
      code: 'HOME_CARD_COUNT_BELOW_TARGET',
      severity: 'INFO',
      message: `Production home catalog has ${publishedHome.length} verified published row(s); UI design target is ${PRODUCTION_HOME_CARD_TARGET.min}–${PRODUCTION_HOME_CARD_TARGET.max}. Show all eligible rows; do not fabricate catalog data to meet the target.`,
    })
  }

  issues.push(...collectCatalogContentQualityIssues(catalog))

  const unpublished = catalog.games.filter((game) => game.publicationStatus !== 'published')
  if (unpublished.length > 0) {
    issues.push({
      code: 'UNVERIFIED_GAMES_REMAIN',
      severity: 'WARNING',
      message: `${unpublished.length} catalog row(s) remain draft/archived pending launch URL verification: ${unpublished.map((game) => game.slug).join(', ')}`,
    })
  }

  const iframeGames = catalog.games.filter(
    (game) =>
      isLaunchVerified(game.launch) &&
      (game.launch.mode === 'iframe-official' || game.launch.mode === 'iframe-provider')
  )
  const embedNotProductionReady = iframeGames.some(
    (game) => !isProductionEmbedAllowed(game, catalog)
  )
  if (embedNotProductionReady) {
    issues.push({
      code: 'PRODUCTION_IFRAME_NOT_READY',
      severity: 'BLOCKED',
      message:
        'Production iframe is not enabled: requires EmbedPermission.status granted, matching sourceUrl, and deployment CSP frame-src verification. unknown/requested/denied are not granted. external-link and catalog reads are unaffected.',
    })
  }

  return {
    publishedHomeCount: publishedHome.length,
    publishedHomeTarget: PRODUCTION_HOME_CARD_TARGET,
    publishedHomeTargetMet:
      publishedHome.length >= PRODUCTION_HOME_CARD_TARGET.min &&
      publishedHome.length <= PRODUCTION_HOME_CARD_TARGET.max,
    productionEmbedReadyCount,
    issues,
  }
}
