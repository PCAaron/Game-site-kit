import { isValidIsoCalendarDate } from '../catalog/validate'
import {
  SiteConfigError,
  type OrganizationEvidence,
  type SiteInstance,
  type VerifiedOrganizationEvidence,
} from './types'

const PLACEHOLDER_HOST_RE = /(^|\.)(example\.(com|org|net)|localhost|invalid|placeholder)$/i
const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

function isHttpsAbsoluteUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  if (url.username || url.password) return false
  return true
}

function isPlaceholderUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return true
  }
  const host = url.hostname.toLowerCase()
  if (BLOCKED_HOSTS.has(host)) return true
  if (PLACEHOLDER_HOST_RE.test(host)) return true
  if (/todo|changeme|your-game|placeholder|invalid/i.test(url.href)) return true
  return false
}

function assertOrganizationEvidence(instance: SiteInstance): void {
  const record = instance.organizationEvidence as OrganizationEvidence | undefined
  if (!record) return

  if (record.status === 'unverified') {
    if ('name' in record || 'url' in record || 'evidenceUrl' in record || 'verifiedAt' in record) {
      throw new SiteConfigError(
        'SITE_ORGANIZATION_EVIDENCE_INVALID',
        'unverified organizationEvidence must not include verified-only fields'
      )
    }
    return
  }

  if (record.status !== 'verified') {
    throw new SiteConfigError(
      'SITE_ORGANIZATION_EVIDENCE_INVALID',
      'organizationEvidence.status must be verified or unverified'
    )
  }

  const verified = record as VerifiedOrganizationEvidence
  if (!verified.name?.trim()) {
    throw new SiteConfigError(
      'SITE_ORGANIZATION_EVIDENCE_INVALID',
      'verified organizationEvidence.name is required'
    )
  }
  if (!verified.url?.trim() || !isHttpsAbsoluteUrl(verified.url)) {
    throw new SiteConfigError(
      'SITE_ORGANIZATION_EVIDENCE_INVALID',
      'verified organizationEvidence.url must be an absolute https URL'
    )
  }
  if (isPlaceholderUrl(verified.url)) {
    throw new SiteConfigError(
      'SITE_ORGANIZATION_EVIDENCE_INVALID',
      'verified organizationEvidence.url must not use a placeholder host'
    )
  }
  const normalizedBrandUrl = verified.url.replace(/\/$/, '')
  const normalizedOrigin = instance.canonicalOrigin.replace(/\/$/, '')
  if (normalizedBrandUrl !== normalizedOrigin) {
    throw new SiteConfigError(
      'SITE_ORGANIZATION_EVIDENCE_URL_MISMATCH',
      'verified organizationEvidence.url must match canonicalOrigin'
    )
  }
  if (!verified.evidenceUrl?.trim() || !isHttpsAbsoluteUrl(verified.evidenceUrl)) {
    throw new SiteConfigError(
      'SITE_ORGANIZATION_EVIDENCE_INVALID',
      'verified organizationEvidence.evidenceUrl must be an absolute https URL'
    )
  }
  if (isPlaceholderUrl(verified.evidenceUrl)) {
    throw new SiteConfigError(
      'SITE_ORGANIZATION_EVIDENCE_INVALID',
      'verified organizationEvidence.evidenceUrl must not use a placeholder host'
    )
  }
  if (typeof verified.verifiedAt !== 'string' || !isValidIsoCalendarDate(verified.verifiedAt)) {
    throw new SiteConfigError(
      'SITE_ORGANIZATION_EVIDENCE_VERIFIED_AT_INVALID',
      'verified organizationEvidence.verifiedAt must be a valid YYYY-MM-DD calendar date'
    )
  }
}

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

  if (instance.organizationEvidence) {
    assertOrganizationEvidence(instance)
  }
}

/** Whether production site config has audited Organization JSON-LD eligibility. */
export function isVerifiedOrganizationEvidenceEligible(site: SiteInstance): boolean {
  return site.organizationEvidence?.status === 'verified'
}
