import { getSiteInstance } from '../site/get-site-instance'
import { SiteConfigError, type SiteInstance } from '../site/types'

const GAME_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function resolveSiteInstance(instance?: SiteInstance): SiteInstance {
  return instance ?? getSiteInstance()
}

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '')
}

/**
 * Canonical absolute URL for the active site instance.
 * Does not read next.config trailingSlash or BASE_PATH — canonical uses canonicalOrigin only.
 */
export function siteUrl(path?: string, instance?: SiteInstance): string {
  const site = resolveSiteInstance(instance)
  const origin = normalizeOrigin(site.canonicalOrigin)

  if (path === undefined || path === '' || path === '/') {
    return origin
  }

  if (typeof path !== 'string') {
    throw new SiteConfigError('SITE_URL_PATH_INVALID', 'path must be a string')
  }
  if (path.includes('?') || path.includes('#')) {
    throw new SiteConfigError(
      'SITE_URL_PATH_INVALID',
      'canonical path must not include query or hash'
    )
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)) {
    throw new SiteConfigError('SITE_URL_PATH_INVALID', 'canonical path must not be an absolute URL')
  }

  let normalized = path.trim()
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }

  const segments = normalized.split('/').filter((segment) => segment.length > 0)
  for (const segment of segments) {
    if (segment === '..') {
      throw new SiteConfigError(
        'SITE_URL_PATH_INVALID',
        'canonical path must not contain .. segments'
      )
    }
  }

  const pathname = `/${segments.join('/')}`
  return `${origin}${pathname}`
}

/**
 * Canonical portal URL for a game detail slug (not third-party launchUrl).
 */
export function gameUrl(slug: string, instance?: SiteInstance): string {
  if (typeof slug !== 'string' || !slug.trim()) {
    throw new SiteConfigError('GAME_SLUG_INVALID', 'slug must be a non-empty string')
  }
  const trimmed = slug.trim()
  if (trimmed.includes('/') || trimmed.includes('?') || trimmed.includes('#')) {
    throw new SiteConfigError(
      'GAME_SLUG_INVALID',
      'slug must not contain path separators, query, or hash'
    )
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    throw new SiteConfigError('GAME_SLUG_INVALID', 'slug must not be an absolute URL')
  }
  if (!GAME_SLUG_PATTERN.test(trimmed)) {
    throw new SiteConfigError(
      'GAME_SLUG_INVALID',
      'slug must be lowercase kebab-case alphanumeric segments'
    )
  }
  return siteUrl(`/${trimmed}`, instance)
}

export function assertValidGameSlug(slug: string): void {
  gameUrl(slug)
}
