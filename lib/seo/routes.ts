/**
 * Production portal route existence (Phase 4.2). Legacy Blog/About/Projects routes are not portal app routes.
 */
import { isProductionGameDetailRoutePath } from './production-game-routes'

export function normalizeRoutePath(routePath: string): string {
  if (!routePath || routePath === '/') return '/'
  return routePath.startsWith('/') ? routePath : `/${routePath}`
}

export function isAppRoutePath(routePath: string): boolean {
  const path = normalizeRoutePath(routePath)
  if (path === '/') return true
  return isProductionGameDetailRoutePath(path)
}
