import { SiteConfigError, type SiteInstance } from './types'

function isAbsoluteHttpsOrigin(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  if (url.username || url.password) return false
  if (url.pathname !== '/' && url.pathname !== '') return false
  if (url.search || url.hash) return false
  if (value.endsWith('/')) return false
  return true
}

export function validateSiteInstance(instance: SiteInstance): void {
  if (!instance.siteId?.trim()) {
    throw new SiteConfigError('SITE_ID_REQUIRED', 'siteId must be a non-empty string')
  }
  if (instance.archetype !== 'game-portal') {
    throw new SiteConfigError('ARCHETYPE_INVALID', 'archetype must be game-portal for Phase 3')
  }
  if (!isAbsoluteHttpsOrigin(instance.canonicalOrigin)) {
    throw new SiteConfigError(
      'CANONICAL_ORIGIN_INVALID',
      'canonicalOrigin must be https origin without path, query, hash, or trailing slash'
    )
  }
  if (instance.urlPathStyle !== 'no-trailing-slash') {
    throw new SiteConfigError('URL_PATH_STYLE_INVALID', 'urlPathStyle must be no-trailing-slash')
  }
  if (instance.defaultIndexable !== false) {
    throw new SiteConfigError('DEFAULT_INDEXABLE_INVALID', 'defaultIndexable must be false')
  }
  if (!Array.isArray(instance.enabledPageTypes) || instance.enabledPageTypes.length === 0) {
    throw new SiteConfigError('ENABLED_PAGE_TYPES_REQUIRED', 'enabledPageTypes must be non-empty')
  }
  const meta = instance.metadata
  if (!meta?.title?.trim() || !meta?.description?.trim()) {
    throw new SiteConfigError(
      'SITE_METADATA_REQUIRED',
      'metadata.title and metadata.description must be non-empty'
    )
  }
  if (!meta.language?.trim() || !meta.locale?.trim()) {
    throw new SiteConfigError(
      'SITE_LANGUAGE_REQUIRED',
      'metadata.language and metadata.locale must be non-empty'
    )
  }
}
