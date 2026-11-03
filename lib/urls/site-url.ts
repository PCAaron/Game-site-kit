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

/** Reject before trim, URL parsing, or path normalization. */
function assertPathRawInput(path: string): void {
  if (path !== path.trim()) {
    invalidPath('canonical path must not have leading or trailing whitespace')
  }
  if (path.includes('\\')) {
    invalidPath('canonical path must not contain backslashes')
  }
  if (/%5c/i.test(path)) {
    invalidPath('canonical path must not contain encoded backslashes')
  }
}

/**
 * Validates canonical path input without trim (Phase 3 §7.1).
 * Caller must run assertPathRawInput first.
 */
function assertValidCanonicalPath(path: string): string {
  if (!path.startsWith('/')) {
    invalidPath('canonical path must start with /')
  }
  if (path.startsWith('//')) {
    invalidPath('canonical path must not be protocol-relative or contain duplicate slashes')
  }
  if (path.includes('//')) {
    invalidPath('canonical path must not contain duplicate slashes')
  }
  if (path.length > 1 && path.endsWith('/')) {
    invalidPath('canonical path must not have a trailing slash')
  }

  const segments = path.slice(1).split('/')
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
    if (decoded.includes('/') || decoded.includes('\\')) {
      invalidPath('canonical path must not contain encoded path separators')
    }
  }

  return path
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

  assertPathRawInput(path)
  const pathname = assertValidCanonicalPath(path)
  return `${origin}${pathname}`
}

/**
 * Canonical portal URL for a game detail slug (not third-party launchUrl).
 */
export function gameUrl(slug: string, instance?: SiteInstance): string {
  if (typeof slug !== 'string' || !slug.length) {
    throw new SiteConfigError('GAME_SLUG_INVALID', 'slug must be a non-empty string')
  }
  if (slug !== slug.trim()) {
    throw new SiteConfigError(
      'GAME_SLUG_INVALID',
      'slug must not have leading or trailing whitespace'
    )
  }
  if (slug.includes('\\') || /%5c/i.test(slug)) {
    throw new SiteConfigError('GAME_SLUG_INVALID', 'slug must not contain backslashes')
  }
  if (slug.includes('/') || slug.includes('?') || slug.includes('#')) {
    throw new SiteConfigError(
      'GAME_SLUG_INVALID',
      'slug must not contain path separators, query, or hash'
    )
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(slug)) {
    throw new SiteConfigError('GAME_SLUG_INVALID', 'slug must not be an absolute URL')
  }
  if (!GAME_SLUG_PATTERN.test(slug)) {
    throw new SiteConfigError(
      'GAME_SLUG_INVALID',
      'slug must be lowercase kebab-case alphanumeric segments'
    )
  }
  return siteUrl(`/${slug}`, instance)
}

export function assertValidGameSlug(slug: string): void {
  gameUrl(slug)
}
