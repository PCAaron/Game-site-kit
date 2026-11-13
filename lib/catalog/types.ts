import type { PublicationStatus } from '../site/types'

export type { PublicationStatus }

export const PUBLICATION_STATUSES = ['draft', 'published', 'archived'] as const

export const LAUNCH_MODES = [
  'iframe-official',
  'iframe-provider',
  'external-link',
  'hosted',
] as const
export type LaunchMode = (typeof LAUNCH_MODES)[number]

export const EMBED_PERMISSION_STATUSES = ['granted', 'requested', 'unknown', 'denied'] as const
export type EmbedPermissionStatus = (typeof EMBED_PERMISSION_STATUSES)[number]

export const AVAILABILITY_STATES = [
  'available',
  'temporarily-unavailable',
  'discontinued',
  'unknown',
] as const
export type Availability = (typeof AVAILABILITY_STATES)[number]

export const CARD_ACTIONS = ['navigate-to-detail', 'launcher-select'] as const
export type CardAction = (typeof CARD_ACTIONS)[number]

export const PROVIDER_VERIFICATION_STATES = ['verified', 'unverified'] as const
export type ProviderVerification = (typeof PROVIDER_VERIFICATION_STATES)[number]

export const LAUNCH_VERIFICATION_STATES = ['verified', 'unverified'] as const
export type LaunchVerification = (typeof LAUNCH_VERIFICATION_STATES)[number]

/** R1: only this slug may have complete Game Detail content. */
export const R1_DETAIL_CONTENT_SLUG = 'hockey-bros'

/** R1: only this slug may set seo.indexable === true on a game detail. */
export const R1_INDEXABLE_GAME_SLUG = 'hockey-bros'

/** Page-level indexable default (Kit + ballgames): false until explicitly set. */
export const DEFAULT_SEO_INDEXABLE = false

export const PRODUCTION_HOME_CARD_TARGET = { min: 15, max: 20 } as const

/** Ballgames R1 homepage play area initial selection (decoupled from ItemList / home card order). */
export const BALLGAMES_DEFAULT_PLAYER_GAME_SLUG = 'football-bros' as const

export type TechnicalEmbedVerificationStatus = 'untested' | 'reported' | 'verified' | 'failed'

/** Demo-first technical embed check — independent of production EmbedPermission / CSP. */
export interface TechnicalEmbedVerification {
  status: TechnicalEmbedVerificationStatus
  sourceUrl?: string
  testedAt?: string
  browser?: string
  environment?: string
  evidenceRef?: string
}

export interface EmbedLayout {
  aspectRatio?: string
  desktopMinHeightPx?: number
  width?: string
}

export interface VerifiedLaunchConfig {
  verification: 'verified'
  mode: LaunchMode
  primaryUrl: string
  fallbackUrls?: string[]
  timeoutMs?: number
  embedLayout?: EmbedLayout
}

export interface UnverifiedLaunchConfig {
  verification: 'unverified'
}

export type LaunchConfig = VerifiedLaunchConfig | UnverifiedLaunchConfig

export interface Provider {
  id: string
  name: string
  verification: ProviderVerification
  site?: string
  defaultEmbedPermission?: EmbedPermissionStatus
}

export interface EmbedPermission {
  id: string
  providerId: string
  status: EmbedPermissionStatus
  permissionBasis: string
  gameSlug?: string
  sourceUrl?: string
  embedDomain?: string
  commercialUse?: string
  evidenceUrl?: string
  reviewedAt?: string
  /**
   * Deployment-time CSP frame-src verification.
   * Must never be inferred from status === 'granted'.
   * Phase 4.1 production data keeps this false.
   */
  cspFrameSrcVerified: boolean
}

export interface GameSeo {
  title: string
  description: string
  indexable: boolean
}

export interface GameSection {
  heading: string
  body: string
}

export interface GameFaqItem {
  q: string
  a: string
}

export interface GameControl {
  label: string
  keys: string
}

export interface GameDetailContent {
  seo: GameSeo
  intro: string
  howToPlay: string
  sections: GameSection[]
  faq: GameFaqItem[]
  controls: GameControl[]
  categories?: string[]
  tags?: string[]
  publishedAt?: string
  updatedAt?: string
}

export interface Thumbnail {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}

export interface CatalogGame {
  id: string
  slug: string
  title: string
  /** Optional; when declared must resolve to a Provider in the same Catalog. */
  providerId?: string
  launch: LaunchConfig
  publicationStatus: PublicationStatus
  showOnHome: boolean
  homeSort: number
  /** Optional; when declared must resolve and associate correctly. Not required for external-link. */
  embedPermissionId?: string
  cardAction: CardAction
  availability?: Availability
  thumbnail?: Thumbnail
  detail?: GameDetailContent
  /** Optional demo-first technical embed record; never substitutes production embed grant. */
  technicalEmbedVerification?: TechnicalEmbedVerification
}

export interface Catalog {
  providers: Provider[]
  embedPermissions: EmbedPermission[]
  games: CatalogGame[]
  /** When set, home play area defaults to this slug (instance catalog). */
  defaultPlayerGameSlug?: string
}

/** Readiness / quality severities — not the same as schema `CatalogError`. */
export type CatalogIssueSeverity = 'INFO' | 'WARNING' | 'MANUAL REVIEW' | 'BLOCKED'

export interface CatalogVerificationIssue {
  code: string
  severity: CatalogIssueSeverity
  message: string
}

export interface CatalogVerificationReport {
  publishedHomeCount: number
  publishedHomeTarget: typeof PRODUCTION_HOME_CARD_TARGET
  publishedHomeTargetMet: boolean
  productionEmbedReadyCount: number
  issues: CatalogVerificationIssue[]
}

export class CatalogError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'CatalogError'
    this.code = code
  }
}

export function createGameSeo(input: {
  title: string
  description: string
  indexable?: boolean
}): GameSeo {
  return {
    title: input.title,
    description: input.description,
    indexable: input.indexable ?? DEFAULT_SEO_INDEXABLE,
  }
}
