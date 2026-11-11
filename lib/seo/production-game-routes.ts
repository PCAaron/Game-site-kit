import { getBallgamesCatalog } from '../catalog/adapter'
import { R1_DETAIL_CONTENT_SLUG, type CatalogGame } from '../catalog/types'
import type { GameDetailPageDescriptor } from './page-descriptors'

function normalizePath(routePath: string): string {
  if (!routePath || routePath === '/') return '/'
  return routePath.startsWith('/') ? routePath : `/${routePath}`
}

/**
 * Catalog capability: published row with navigate-to-detail and Game Detail SEO payload.
 * Does not imply the instance has approved a production detail route for the slug.
 */
export function isCatalogGameRoutableAsDetail(game: CatalogGame): boolean {
  if (game.publicationStatus !== 'published') return false
  if (game.cardAction !== 'navigate-to-detail') return false
  if (!game.detail?.seo) return false
  return true
}

/** R1 instance-approved game detail slugs (reuses catalog R1_DETAIL_CONTENT_SLUG). */
export function isR1ApprovedGameDetailRouteSlug(slug: string): boolean {
  return slug === R1_DETAIL_CONTENT_SLUG
}

/**
 * Production game detail route: catalog detail capability + current R1 route allowlist.
 */
export function isProductionRoutableGameDetail(game: CatalogGame): boolean {
  return isCatalogGameRoutableAsDetail(game) && isR1ApprovedGameDetailRouteSlug(game.slug)
}

export function getProductionRoutableGames(catalog = getBallgamesCatalog()): CatalogGame[] {
  return catalog.games.filter(isProductionRoutableGameDetail)
}

export function getProductionRoutableGameSlugs(catalog = getBallgamesCatalog()): string[] {
  return getProductionRoutableGames(catalog).map((game) => game.slug)
}

export function findProductionRoutableGame(
  slug: string,
  catalog = getBallgamesCatalog()
): CatalogGame | undefined {
  return getProductionRoutableGames(catalog).find((game) => game.slug === slug)
}

export function isProductionGameDetailRoutePath(routePath: string): boolean {
  const path = normalizePath(routePath)
  if (path === '/') return false
  const slug = path.slice(1)
  if (!slug.length || slug.includes('/')) return false
  return getProductionRoutableGameSlugs().includes(slug)
}

export function buildGameDetailPageDescriptor(
  game: CatalogGame
): GameDetailPageDescriptor | undefined {
  if (!isProductionRoutableGameDetail(game) || !game.detail) {
    return undefined
  }
  const routePath = `/${game.slug}`
  return {
    pageType: 'game_detail',
    slug: game.slug,
    routePath,
    routeExists: isProductionGameDetailRoutePath(routePath),
    listItemName: game.title,
    content: {
      publicationStatus: game.publicationStatus,
      seo: game.detail.seo,
      updatedAt: game.detail.updatedAt,
    },
  }
}
