import { assertValidGameSlug } from '../urls/site-url'
import { SiteConfigError } from '../site/types'
import {
  AVAILABILITY_STATES,
  CARD_ACTIONS,
  CatalogError,
  DEFAULT_SEO_INDEXABLE,
  EMBED_PERMISSION_STATUSES,
  LAUNCH_MODES,
  PUBLICATION_STATUSES,
  R1_DETAIL_CONTENT_SLUG,
  R1_INDEXABLE_GAME_SLUG,
  type Availability,
  type Catalog,
  type CatalogGame,
  type EmbedPermission,
  type GameDetailContent,
  type LaunchConfig,
  TECHNICAL_EMBED_VERIFICATION_STATUSES,
  type CatalogVerificationIssue,
  type FreeOfferEvidence,
  type Provider,
  type PublicationStatus,
  type TechnicalEmbedVerification,
  type VerifiedFreeOffer,
} from './types'

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])
const RESERVED_ROOT_LABELS = new Set([
  'example',
  'test',
  'invalid',
  'localhost',
  'placeholder',
  'example.com',
  'example.org',
  'example.net',
])
const RESERVED_HOST_SUFFIXES = [
  '.example',
  '.test',
  '.invalid',
  '.localhost',
  '.example.com',
  '.example.org',
  '.example.net',
] as const

/** Reject IANA / documentation reserved hosts (exact label or delegated suffix). */
export function isReservedHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (BLOCKED_HOSTS.has(host)) return true
  if (RESERVED_ROOT_LABELS.has(host)) return true
  for (const suffix of RESERVED_HOST_SUFFIXES) {
    if (host.endsWith(suffix)) return true
  }
  return false
}

function fail(code: string, message: string): never {
  throw new CatalogError(code, message)
}

function assertNonEmpty(value: unknown, code: string, message: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    fail(code, message)
  }
}

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
  if (isReservedHost(host)) return true
  if (/todo|changeme|your-game|placeholder|invalid/i.test(url.href)) return true
  return false
}

function assertValidHttpsUrl(value: string, code: string, label: string): void {
  if (!isHttpsAbsoluteUrl(value)) {
    fail(code, `${label} must be an absolute https URL`)
  }
  if (isPlaceholderUrl(value)) {
    const placeholderCode =
      code === 'CATALOG_LAUNCH_URL_INVALID' ? 'CATALOG_LAUNCH_URL_PLACEHOLDER' : code
    fail(placeholderCode, `${label} must not use a placeholder or fictitious host`)
  }
}

function assertPublicationStatus(status: unknown): asserts status is PublicationStatus {
  if (typeof status !== 'string' || !PUBLICATION_STATUSES.includes(status as PublicationStatus)) {
    fail(
      'CATALOG_PUBLICATION_STATUS_INVALID',
      'publicationStatus must be draft, published, or archived'
    )
  }
}

function hasCompleteDetail(detail: GameDetailContent | undefined): detail is GameDetailContent {
  if (!detail) return false
  return (
    typeof detail.intro === 'string' &&
    detail.intro.trim().length > 0 &&
    typeof detail.howToPlay === 'string' &&
    detail.howToPlay.trim().length > 0 &&
    Array.isArray(detail.sections) &&
    detail.sections.length > 0 &&
    Array.isArray(detail.faq) &&
    detail.faq.length > 0 &&
    Array.isArray(detail.controls) &&
    detail.controls.length > 0
  )
}

function assertLaunch(game: CatalogGame): void {
  const launch = game.launch
  if (!launch || (launch.verification !== 'verified' && launch.verification !== 'unverified')) {
    fail('CATALOG_FIELD_REQUIRED', `${game.slug}: launch.verification is required`)
  }

  if (launch.verification === 'unverified') {
    if ('primaryUrl' in launch && launch.primaryUrl) {
      fail(
        'CATALOG_UNVERIFIED_LAUNCH_HAS_URL',
        `${game.slug}: unverified launch must not record a primaryUrl`
      )
    }
    return
  }

  if (!LAUNCH_MODES.includes(launch.mode)) {
    fail('CATALOG_LAUNCH_MODE_INVALID', `${game.slug}: launch.mode is invalid`)
  }
  assertNonEmpty(
    launch.primaryUrl,
    'CATALOG_FIELD_REQUIRED',
    `${game.slug}: launch.primaryUrl is required`
  )
  assertValidHttpsUrl(
    launch.primaryUrl,
    'CATALOG_LAUNCH_URL_INVALID',
    `${game.slug}: launch.primaryUrl`
  )
}

function assertProvider(provider: Provider): void {
  assertNonEmpty(provider.id, 'CATALOG_FIELD_REQUIRED', 'provider.id is required')
  assertNonEmpty(
    provider.name,
    'CATALOG_FIELD_REQUIRED',
    `provider ${provider.id}: name is required`
  )
  if (provider.verification !== 'verified' && provider.verification !== 'unverified') {
    fail(
      'CATALOG_PROVIDER_VERIFICATION_INVALID',
      `provider ${provider.id}: verification is invalid`
    )
  }
  if (provider.verification === 'verified') {
    assertNonEmpty(
      provider.site,
      'CATALOG_PROVIDER_SITE_REQUIRED',
      `provider ${provider.id}: verified provider requires site`
    )
    assertValidHttpsUrl(
      provider.site,
      'CATALOG_PROVIDER_SITE_INVALID',
      `provider ${provider.id}: site`
    )
  }
  if (
    provider.defaultEmbedPermission !== undefined &&
    !EMBED_PERMISSION_STATUSES.includes(provider.defaultEmbedPermission)
  ) {
    fail(
      'CATALOG_EMBED_STATUS_INVALID',
      `provider ${provider.id}: defaultEmbedPermission is invalid`
    )
  }
}

function assertEmbedPermission(permission: EmbedPermission, catalog: Catalog): void {
  assertNonEmpty(permission.id, 'CATALOG_FIELD_REQUIRED', 'embedPermission.id is required')
  assertNonEmpty(
    permission.providerId,
    'CATALOG_FIELD_REQUIRED',
    `embedPermission ${permission.id}: providerId is required`
  )
  if (!catalog.providers.some((provider) => provider.id === permission.providerId)) {
    fail(
      'CATALOG_EMBED_PROVIDER_MISSING',
      `embedPermission ${permission.id}: providerId ${permission.providerId} does not exist`
    )
  }
  if (!EMBED_PERMISSION_STATUSES.includes(permission.status)) {
    fail('CATALOG_EMBED_STATUS_INVALID', `embedPermission ${permission.id}: status is invalid`)
  }
  assertNonEmpty(
    permission.permissionBasis,
    'CATALOG_FIELD_REQUIRED',
    `embedPermission ${permission.id}: permissionBasis is required`
  )
  if (typeof permission.cspFrameSrcVerified !== 'boolean') {
    fail(
      'CATALOG_EMBED_CSP_FLAG_REQUIRED',
      `embedPermission ${permission.id}: cspFrameSrcVerified must be a boolean`
    )
  }
  if (permission.status === 'granted' && !permission.permissionBasis.trim()) {
    fail(
      'CATALOG_EMBED_GRANTED_WITHOUT_BASIS',
      `embedPermission ${permission.id}: granted requires a non-empty permissionBasis`
    )
  }
  if (permission.sourceUrl) {
    assertValidHttpsUrl(
      permission.sourceUrl,
      'CATALOG_EMBED_SOURCE_URL_INVALID',
      `embedPermission ${permission.id}: sourceUrl`
    )
  }
}

function assertDetailSchema(game: CatalogGame): void {
  const detail = game.detail
  if (game.slug !== R1_DETAIL_CONTENT_SLUG) {
    if (detail?.seo?.indexable === true) {
      fail(
        'CATALOG_INDEXABLE_NOT_ALLOWED',
        `${game.slug}: R1 only ${R1_INDEXABLE_GAME_SLUG} may set seo.indexable true`
      )
    }
    if (detail) {
      fail(
        'CATALOG_DETAIL_NOT_ALLOWED',
        `${game.slug}: R1 launcher-only games must not include Game Detail content`
      )
    }
    return
  }

  if (!detail) {
    return
  }

  const seo = detail.seo
  if (!seo) {
    fail('CATALOG_FIELD_REQUIRED', `${game.slug}: detail.seo is required when detail is present`)
  }
  assertNonEmpty(seo.title, 'CATALOG_FIELD_REQUIRED', `${game.slug}: detail.seo.title is required`)
  assertNonEmpty(
    seo.description,
    'CATALOG_FIELD_REQUIRED',
    `${game.slug}: detail.seo.description is required`
  )
  if (typeof seo.indexable !== 'boolean') {
    fail('CATALOG_INDEXABLE_REQUIRED', `${game.slug}: detail.seo.indexable must be a boolean`)
  }
  if ('canonical' in seo) {
    fail(
      'CATALOG_CANONICAL_URL_FORBIDDEN',
      `${game.slug}: in-site canonical URL must not be stored on Catalog data; use gameUrl(slug)`
    )
  }
  if (seo.indexable === true && game.slug !== R1_INDEXABLE_GAME_SLUG) {
    fail(
      'CATALOG_INDEXABLE_NOT_ALLOWED',
      `${game.slug}: R1 only ${R1_INDEXABLE_GAME_SLUG} may set seo.indexable true`
    )
  }
}

function assertGameOptionalAssociations(game: CatalogGame, catalog: Catalog): void {
  if (game.providerId !== undefined) {
    assertNonEmpty(
      game.providerId,
      'CATALOG_FIELD_REQUIRED',
      `${game.slug}: providerId must be non-empty when declared`
    )
    if (!catalog.providers.some((item) => item.id === game.providerId)) {
      fail('CATALOG_PROVIDER_MISSING', `${game.slug}: providerId ${game.providerId} does not exist`)
    }
  }

  if (game.embedPermissionId === undefined) {
    return
  }

  assertNonEmpty(
    game.embedPermissionId,
    'CATALOG_FIELD_REQUIRED',
    `${game.slug}: embedPermissionId must be non-empty when declared`
  )

  const permission = catalog.embedPermissions.find((item) => item.id === game.embedPermissionId)
  if (!permission) {
    fail(
      'CATALOG_EMBED_PERMISSION_MISSING',
      `${game.slug}: embedPermissionId ${game.embedPermissionId} does not exist`
    )
  }

  if (permission.gameSlug && permission.gameSlug !== game.slug) {
    fail('CATALOG_EMBED_GAME_MISMATCH', `${game.slug}: embed permission gameSlug does not match`)
  }

  if (game.providerId && permission.providerId !== game.providerId) {
    fail(
      'CATALOG_EMBED_PROVIDER_MISMATCH',
      `${game.slug}: embedPermission providerId ${permission.providerId} does not match game providerId ${game.providerId}`
    )
  }

  if (permission.sourceUrl && isLaunchVerified(game.launch)) {
    if (permission.sourceUrl !== game.launch.primaryUrl) {
      fail(
        'CATALOG_EMBED_SOURCE_URL_MISMATCH',
        `${game.slug}: embedPermission sourceUrl must match verified launch.primaryUrl when both are set`
      )
    }
  }
}

function assertR1CardAction(game: CatalogGame): void {
  if (!CARD_ACTIONS.includes(game.cardAction)) {
    fail('CATALOG_CARD_ACTION_INVALID', `${game.slug}: cardAction is invalid`)
  }
  if (game.slug === R1_DETAIL_CONTENT_SLUG) {
    if (game.cardAction !== 'navigate-to-detail') {
      fail('CATALOG_CARD_ACTION_INVALID', `${game.slug}: R1 cardAction must be navigate-to-detail`)
    }
    return
  }
  if (game.cardAction !== 'launcher-select') {
    fail(
      'CATALOG_CARD_ACTION_INVALID',
      `${game.slug}: R1 launcher-only cardAction must be launcher-select`
    )
  }
}

export function isLaunchVerified(
  launch: LaunchConfig
): launch is Extract<LaunchConfig, { verification: 'verified' }> {
  return launch.verification === 'verified'
}

/** JSON-LD Offer eligibility — full verified freeOffer + verified launch (throws on malformed verified). */
export function isVerifiedFreeOfferEligible(game: CatalogGame): boolean {
  if (!game.freeOffer) return false
  if (game.freeOffer.status === 'unverified') return false
  assertFreeOfferEvidence(game)
  return game.freeOffer.status === 'verified' && isLaunchVerified(game.launch)
}

export function isPublishedForHome(game: CatalogGame): boolean {
  return game.publicationStatus === 'published' && game.showOnHome === true
}

export function validateGame(game: CatalogGame, catalog: Catalog): void {
  assertNonEmpty(game.id, 'CATALOG_FIELD_REQUIRED', 'game.id is required')
  assertNonEmpty(game.slug, 'CATALOG_FIELD_REQUIRED', 'game.slug is required')
  try {
    assertValidGameSlug(game.slug)
  } catch (error) {
    if (error instanceof SiteConfigError) {
      fail('CATALOG_SLUG_INVALID', `${game.slug}: ${error.message}`)
    }
    throw error
  }
  if ('canonical' in game || 'canonicalUrl' in game || 'siteUrl' in game) {
    fail(
      'CATALOG_CANONICAL_URL_FORBIDDEN',
      `${game.slug}: in-site canonical URL must not be stored on Catalog data; use gameUrl(slug) / siteUrl()`
    )
  }
  assertNonEmpty(game.title, 'CATALOG_FIELD_REQUIRED', `${game.slug}: title is required`)
  assertPublicationStatus(game.publicationStatus)

  if (typeof game.showOnHome !== 'boolean') {
    fail('CATALOG_FIELD_REQUIRED', `${game.slug}: showOnHome must be a boolean`)
  }
  if (typeof game.homeSort !== 'number' || !Number.isFinite(game.homeSort)) {
    fail('CATALOG_FIELD_REQUIRED', `${game.slug}: homeSort must be a number`)
  }
  if (
    game.availability !== undefined &&
    !AVAILABILITY_STATES.includes(game.availability as Availability)
  ) {
    fail('CATALOG_AVAILABILITY_INVALID', `${game.slug}: availability is invalid`)
  }

  assertGameOptionalAssociations(game, catalog)
  assertLaunch(game)
  assertR1CardAction(game)
  assertDetailSchema(game)
  if (game.technicalEmbedVerification) {
    assertTechnicalEmbedVerification(game)
  }
  if (game.freeOffer) {
    assertFreeOfferEvidence(game)
  }

  if (game.publicationStatus === 'published') {
    if (!isLaunchVerified(game.launch)) {
      fail(
        'CATALOG_PUBLISHED_REQUIRES_VERIFIED_LAUNCH',
        `${game.slug}: published games require a verified launch.primaryUrl and mode`
      )
    }
  }

  if (game.showOnHome && game.publicationStatus !== 'published') {
    fail(
      'CATALOG_SHOW_ON_HOME_REQUIRES_PUBLISHED',
      `${game.slug}: unverified or unpublished games must not set showOnHome true`
    )
  }
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Strict YYYY-MM-DD calendar date (UTC); rejects invalid dates like 2026-02-30. */
export function isValidIsoCalendarDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const utc = new Date(Date.UTC(year, month - 1, day))
  return (
    utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day
  )
}

function assertFreeOfferEvidence(game: CatalogGame): void {
  const record = game.freeOffer as FreeOfferEvidence | undefined
  if (!record) return

  if (record.status === 'unverified') {
    if (
      'price' in record ||
      'priceCurrency' in record ||
      'evidenceUrl' in record ||
      'verifiedAt' in record ||
      'sourceUrl' in record
    ) {
      fail(
        'CATALOG_FREE_OFFER_INVALID',
        `${game.slug}: unverified freeOffer must not include verified-only fields`
      )
    }
    return
  }

  if (record.status !== 'verified') {
    fail(
      'CATALOG_FREE_OFFER_INVALID',
      `${game.slug}: freeOffer.status must be verified or unverified`
    )
  }

  const verified = record as VerifiedFreeOffer
  if (verified.price !== '0') {
    fail(
      'CATALOG_FREE_OFFER_INVALID',
      `${game.slug}: verified freeOffer.price must be the string "0"`
    )
  }
  if (verified.priceCurrency !== 'USD') {
    fail('CATALOG_FREE_OFFER_INVALID', `${game.slug}: verified freeOffer.priceCurrency must be USD`)
  }
  assertNonEmpty(
    verified.evidenceUrl,
    'CATALOG_FREE_OFFER_EVIDENCE_INVALID',
    `${game.slug}: verified freeOffer.evidenceUrl is required`
  )
  assertValidHttpsUrl(
    verified.evidenceUrl,
    'CATALOG_FREE_OFFER_EVIDENCE_INVALID',
    `${game.slug}: freeOffer.evidenceUrl`
  )
  if (typeof verified.verifiedAt !== 'string' || !isValidIsoCalendarDate(verified.verifiedAt)) {
    fail(
      'CATALOG_FREE_OFFER_VERIFIED_AT_INVALID',
      `${game.slug}: verified freeOffer.verifiedAt must be a valid YYYY-MM-DD calendar date`
    )
  }
  assertNonEmpty(
    verified.sourceUrl,
    'CATALOG_FREE_OFFER_INVALID',
    `${game.slug}: verified freeOffer.sourceUrl is required`
  )
  assertValidHttpsUrl(
    verified.sourceUrl,
    'CATALOG_FREE_OFFER_INVALID',
    `${game.slug}: freeOffer.sourceUrl`
  )
  if (!isLaunchVerified(game.launch)) {
    fail(
      'CATALOG_FREE_OFFER_INVALID',
      `${game.slug}: verified freeOffer requires a verified launch.primaryUrl`
    )
  }
  if (verified.sourceUrl !== game.launch.primaryUrl) {
    fail(
      'CATALOG_FREE_OFFER_SOURCE_MISMATCH',
      `${game.slug}: freeOffer.sourceUrl must match launch.primaryUrl`
    )
  }
}

function assertTechnicalEmbedVerification(game: CatalogGame): void {
  const record = game.technicalEmbedVerification as TechnicalEmbedVerification
  if (
    typeof record.status !== 'string' ||
    !TECHNICAL_EMBED_VERIFICATION_STATUSES.includes(
      record.status as (typeof TECHNICAL_EMBED_VERIFICATION_STATUSES)[number]
    )
  ) {
    fail(
      'CATALOG_TECH_EMBED_STATUS_INVALID',
      `${game.slug}: technicalEmbedVerification.status must be one of ${TECHNICAL_EMBED_VERIFICATION_STATUSES.join(', ')}`
    )
  }

  if (record.testedAt !== undefined) {
    if (typeof record.testedAt !== 'string' || !isValidIsoCalendarDate(record.testedAt)) {
      fail(
        'CATALOG_TECH_EMBED_TESTED_AT_INVALID',
        `${game.slug}: technicalEmbedVerification.testedAt must be a valid YYYY-MM-DD calendar date`
      )
    }
  }

  if (record.sourceUrl !== undefined && record.sourceUrl !== '') {
    if (!isHttpsAbsoluteUrl(record.sourceUrl)) {
      fail(
        'CATALOG_TECH_EMBED_SOURCE_URL_INVALID',
        `${game.slug}: technicalEmbedVerification.sourceUrl must be absolute https`
      )
    }
    if (isLaunchVerified(game.launch) && record.sourceUrl !== game.launch.primaryUrl) {
      fail(
        'CATALOG_TECH_EMBED_SOURCE_URL_MISMATCH',
        `${game.slug}: technicalEmbedVerification.sourceUrl must match verified launch.primaryUrl`
      )
    }
  }

  if (record.status === 'verified') {
    if (typeof record.evidenceRef !== 'string' || !record.evidenceRef.trim()) {
      fail(
        'CATALOG_TECH_EMBED_EVIDENCE_REQUIRED',
        `${game.slug}: technicalEmbedVerification.status verified requires a non-empty evidenceRef`
      )
    }
  }
}

/** Runtime readiness warnings for defaultPlayerGameSlug — schema hard errors stay in validateCatalog. */
export function collectDefaultPlayerGameIssues(catalog: Catalog): CatalogVerificationIssue[] {
  const slug = catalog.defaultPlayerGameSlug
  if (!slug) {
    return []
  }
  const game = catalog.games.find((row) => row.slug === slug)
  if (!game) {
    return []
  }

  const issues: CatalogVerificationIssue[] = []

  if (!isLaunchVerified(game.launch)) {
    issues.push({
      code: 'CATALOG_DEFAULT_PLAYER_LAUNCH_UNVERIFIED',
      severity: 'WARNING',
      message: `${slug}: default player launch is not verified; home play area must use safe external-only presentation`,
    })
  }

  if (game.availability === 'discontinued') {
    issues.push({
      code: 'CATALOG_DEFAULT_PLAYER_DISCONTINUED',
      severity: 'WARNING',
      message: `${slug}: default player availability is discontinued`,
    })
  }

  if (isLaunchVerified(game.launch)) {
    if (game.launch.verification === 'verified' && !game.launch.primaryUrl?.trim()) {
      issues.push({
        code: 'CATALOG_DEFAULT_PLAYER_NO_LAUNCH_URL',
        severity: 'WARNING',
        message: `${slug}: default player has no usable launch primaryUrl`,
      })
    }
  }

  return issues
}

export function validateCatalog(catalog: Catalog): void {
  if (!catalog || !Array.isArray(catalog.providers) || !Array.isArray(catalog.games)) {
    fail('CATALOG_FIELD_REQUIRED', 'catalog providers and games are required')
  }
  if (!Array.isArray(catalog.embedPermissions)) {
    fail('CATALOG_FIELD_REQUIRED', 'catalog embedPermissions is required')
  }

  const providerIds = new Set<string>()
  for (const provider of catalog.providers) {
    if (providerIds.has(provider.id)) {
      fail('CATALOG_PROVIDER_DUPLICATE', `duplicate provider id: ${provider.id}`)
    }
    providerIds.add(provider.id)
    assertProvider(provider)
  }

  const permissionIds = new Set<string>()
  for (const permission of catalog.embedPermissions) {
    if (permissionIds.has(permission.id)) {
      fail('CATALOG_EMBED_PERMISSION_DUPLICATE', `duplicate embedPermission id: ${permission.id}`)
    }
    permissionIds.add(permission.id)
    assertEmbedPermission(permission, catalog)
  }

  const slugs = new Set<string>()
  const ids = new Set<string>()
  for (const game of catalog.games) {
    if (ids.has(game.id)) {
      fail('CATALOG_GAME_ID_DUPLICATE', `duplicate game id: ${game.id}`)
    }
    ids.add(game.id)
    if (slugs.has(game.slug)) {
      fail('CATALOG_SLUG_DUPLICATE', `duplicate game slug: ${game.slug}`)
    }
    slugs.add(game.slug)
    validateGame(game, catalog)
  }

  if (catalog.defaultPlayerGameSlug !== undefined) {
    const defaultSlug = catalog.defaultPlayerGameSlug
    if (typeof defaultSlug !== 'string' || !defaultSlug.length) {
      fail('CATALOG_DEFAULT_PLAYER_INVALID', 'defaultPlayerGameSlug must be a non-empty string')
    }
    try {
      assertValidGameSlug(defaultSlug)
    } catch (error) {
      if (error instanceof SiteConfigError) {
        fail('CATALOG_DEFAULT_PLAYER_INVALID', `defaultPlayerGameSlug: ${error.message}`)
      }
      throw error
    }
    if (!slugs.has(defaultSlug)) {
      fail(
        'CATALOG_DEFAULT_PLAYER_UNKNOWN',
        `defaultPlayerGameSlug ${defaultSlug} does not match any catalog game`
      )
    }
  }
}

/** SEO / indexability layer — separate from schema validation. */
export function validateGameSeoIndexability(game: CatalogGame): void {
  const detail = game.detail
  if (!detail?.seo?.indexable) {
    return
  }

  if (game.publicationStatus !== 'published') {
    fail(
      'CATALOG_INDEXABLE_REQUIRES_PUBLISHED',
      `${game.slug}: seo.indexable true requires publicationStatus published`
    )
  }

  if (!hasCompleteDetail(detail)) {
    fail(
      'CATALOG_INDEXABLE_REQUIRES_DETAIL',
      `${game.slug}: seo.indexable true requires complete Game Detail content (intro, howToPlay, sections, faq, controls)`
    )
  }
}

export function validateCatalogSeo(catalog: Catalog): void {
  for (const game of catalog.games) {
    validateGameSeoIndexability(game)
  }
}

/** Editorial / content quality — warnings only; does not block schema validation. */
export function collectCatalogContentQualityIssues(catalog: Catalog): CatalogVerificationIssue[] {
  const issues: CatalogVerificationIssue[] = []

  for (const game of catalog.games) {
    if (game.publicationStatus !== 'published') {
      continue
    }
    if (game.slug !== R1_DETAIL_CONTENT_SLUG) {
      continue
    }
    if (game.detail?.seo?.indexable === true) {
      continue
    }
    if (game.detail && !hasCompleteDetail(game.detail)) {
      issues.push({
        code: 'CATALOG_DETAIL_INCOMPLETE',
        severity: 'WARNING',
        message: `${game.slug}: published game has partial Detail content; complete intro, howToPlay, sections, faq, and controls before indexable SEO or editorial sign-off.`,
      })
    }
  }

  return issues
}

export { DEFAULT_SEO_INDEXABLE }
