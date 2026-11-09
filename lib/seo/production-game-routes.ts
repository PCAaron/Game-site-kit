import { getBallgamesCatalog } from '../catalog/adapter'
import type { CatalogGame } from '../catalog/types'
import type { GameDetailPageDescriptor } from './page-descriptors'

function normalizePath(routePath: string): string {
  if (!routePath || routePath === '/') return '/'
  return routePath.startsWith('/') ? routePath : `/${routePath}`
}

/**
 * R1 game detail routes: published catalog rows with navigate-to-detail and Game Detail content.
 * Launcher-only / draft rows are excluded from static generation and route-exists checks.
 */
export function isCatalogGameRoutableAsDetail(game: CatalogGame): boolean {
  if (game.publicationStatus !== 'published') return false
  if (game.cardAction !== 'navigate-to-detail') return false
  if (!game.detail?.seo) return false
  return true
}

export function getProductionRoutableGames(catalog = getBallgamesCatalog()): CatalogGame[] {
  return catalog.games.filter(isCatalogGameRoutableAsDetail)
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
  if (!isCatalogGameRoutableAsDetail(game) || !game.detail) {
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
