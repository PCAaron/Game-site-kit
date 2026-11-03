import { SiteConfigError, type PortalHomeContent, type SiteInstance } from './types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/

function assertNonEmptySeoField(field: 'title' | 'description', value: unknown): void {
  if (typeof value !== 'string' || !value.trim()) {
    throw new SiteConfigError(
      'PORTAL_HOME_SEO_REQUIRED',
      `PortalHomeContent seo.${field} is required and must be non-empty`
    )
  }
}

export function validatePortalHomeContent(content: PortalHomeContent): void {
  const allowed: PortalHomeContent['publicationStatus'][] = ['draft', 'published', 'archived']
  if (!allowed.includes(content.publicationStatus)) {
    throw new SiteConfigError('PORTAL_HOME_STATUS_INVALID', 'publicationStatus is invalid')
  }
  if (!content.seo || typeof content.seo.indexable !== 'boolean') {
    throw new SiteConfigError('PORTAL_HOME_INDEXABLE_REQUIRED', 'seo.indexable must be a boolean')
  }

  assertNonEmptySeoField('title', content.seo.title)
  assertNonEmptySeoField('description', content.seo.description)

  if (content.seo.indexable && content.publicationStatus !== 'published') {
    throw new SiteConfigError(
      'PORTAL_HOME_INDEXABLE_REQUIRES_PUBLISHED',
      'indexable PortalHome requires publicationStatus published'
    )
  }

  if (content.updatedAt !== undefined && !ISO_DATE.test(content.updatedAt)) {
    throw new SiteConfigError(
      'PORTAL_HOME_UPDATED_AT_INVALID',
      'updatedAt must be a valid ISO-8601 date or date-time when provided'
    )
  }
}

/** Resolves OG image only; never fills missing title/description from SiteInstance. */
export function resolvePortalHomeOgImage(
  content: PortalHomeContent,
  site: SiteInstance
): string | undefined {
  validatePortalHomeContent(content)
  return content.seo.ogImage?.trim() || site.metadata.socialBanner
}
