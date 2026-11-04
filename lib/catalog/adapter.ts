import { gameUrl, siteUrl } from '../urls/site-url'
import { ballgamesCatalog } from './instances/ballgames'
import {
  PRODUCTION_HOME_CARD_TARGET,
  type Catalog,
  type CatalogGame,
  type CatalogVerificationReport,
  type VerifiedLaunchConfig,
} from './types'
import { isLaunchVerified, isPublishedForHome, validateCatalog } from './validate'

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

export function findEmbedPermission(game: CatalogGame, catalog: Catalog) {
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
      severity: 'BLOCKED',
      message: `Production home catalog has ${publishedHome.length} verified published row(s); product target is ${PRODUCTION_HOME_CARD_TARGET.min}–${PRODUCTION_HOME_CARD_TARGET.max}. Missing rows stay draft until URL/Provider/embed are manually verified.`,
    })
  }

  const unpublished = catalog.games.filter((game) => game.publicationStatus !== 'published')
  if (unpublished.length > 0) {
    issues.push({
      code: 'UNVERIFIED_GAMES_REMAIN',
      severity: 'MANUAL REVIEW',
      message: `${unpublished.length} catalog row(s) remain draft/archived pending launch URL, provider, and embed verification: ${unpublished.map((game) => game.slug).join(', ')}`,
    })
  }

  const unknownEmbeds = catalog.embedPermissions.filter(
    (permission) => permission.status !== 'granted'
  )
  if (unknownEmbeds.length > 0) {
    issues.push({
      code: 'EMBED_PERMISSION_NOT_GRANTED',
      severity: 'BLOCKED',
      message:
        'No production iframe may be enabled until EmbedPermission.status is granted with documented evidence and CSP frame-src is verified. unknown is not granted.',
    })
  }

  const unverifiedCsp = catalog.embedPermissions.filter(
    (permission) => permission.cspFrameSrcVerified !== true
  )
  if (unverifiedCsp.length > 0) {
    issues.push({
      code: 'CSP_FRAME_SRC_NOT_VERIFIED',
      severity: 'BLOCKED',
      message:
        'CSP frame-src has not been verified on a production deployment. Phase 4.1 does not claim embed production readiness.',
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
