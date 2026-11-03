/**
 * Known static app routes for route-existence checks (Phase 4 adds game detail paths).
 */
const STATIC_APP_ROUTES = new Set(['/', '/blog', '/about', '/projects', '/tags'])

export function normalizeRoutePath(routePath: string): string {
  if (!routePath || routePath === '/') return '/'
  return routePath.startsWith('/') ? routePath : `/${routePath}`
}

export function isAppRoutePath(routePath: string): boolean {
  const path = normalizeRoutePath(routePath)
  if (path === '/hockey-bros') return false
  if (STATIC_APP_ROUTES.has(path)) return true
  if (/^\/blog\/[^/]+/.test(path)) return true
  if (/^\/tags\/[^/]+/.test(path)) return true
  return false
}
