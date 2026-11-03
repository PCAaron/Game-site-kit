import { getSiteInstance } from '../site/get-site-instance'
import { SiteConfigError, type SiteInstance } from '../site/types'

const GAME_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function resolveSiteInstance(instance?: SiteInstance): SiteInstance {
  return instance ?? getSiteInstance()
}

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '')
}

function invalidPath(message: string): never {
  throw new SiteConfigError('SITE_URL_PATH_INVALID', message)
}

/**
 * Validates canonical path input before any silent normalization (Phase 3 §7.1).
 * Returns the path unchanged when valid (single leading slash, no trailing slash on non-root).
 */
function assertValidCanonicalPath(path: string): string {
  const trimmed = path.trim()

  if (!trimmed.startsWith('/')) {
    invalidPath('canonical path must start with /')
  }
  if (trimmed.startsWith('//')) {
    invalidPath('canonical path must not be protocol-relative or contain duplicate slashes')
  }
  if (trimmed.includes('//')) {
    invalidPath('canonical path must not contain duplicate slashes')
  }
  if (trimmed.length > 1 && trimmed.endsWith('/')) {
    invalidPath('canonical path must not have a trailing slash')
  }

  const segments = trimmed.slice(1).split('/')
  for (const segment of segments) {
    if (segment === '') {
      invalidPath('canonical path must not contain empty segments')
    }
    if (segment === '.' || segment === '..') {
      invalidPath('canonical path must not contain . or .. segments')
    }

    let decoded: string
    try {
      decoded = decodeURIComponent(segment)
    } catch {
      invalidPath('canonical path segment is not validly percent-encoded')
    }
    if (decoded === '.' || decoded === '..') {
      invalidPath('canonical path must not contain . or .. segments')
    }
    if (decoded.includes('/')) {
      invalidPath('canonical path must not contain encoded path separators')
    }
  }

  return trimmed
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
    invalidPath('canonical path must not include query or hash')
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)) {
    invalidPath('canonical path must not be an absolute URL')
  }

  const pathname = assertValidCanonicalPath(path)
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
