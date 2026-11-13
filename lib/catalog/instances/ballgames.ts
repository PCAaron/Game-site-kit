import type { Catalog, CatalogGame, EmbedPermission, Provider } from '../types'
import { BALLGAMES_DEFAULT_PLAYER_GAME_SLUG } from '../types'
import { validateCatalog } from '../validate'
import { hockeyBrosDetail } from './hockey-bros-detail'

const HOCKEY_BROS_PRIMARY_URL = 'https://www.hockeybros.io/'
const FOOTBALL_BROS_PRIMARY_URL = 'https://footballbros.io/'

const providers: Provider[] = [
  {
    id: 'hockeybros-io',
    name: 'hockeybros.io',
    verification: 'verified',
    site: 'https://www.hockeybros.io',
    defaultEmbedPermission: 'unknown',
  },
  {
    id: 'pending-verification',
    name: 'Pending provider verification',
    verification: 'unverified',
    defaultEmbedPermission: 'unknown',
  },
]

const embedPermissions: EmbedPermission[] = [
  {
    id: 'embed-hockey-bros',
    providerId: 'hockeybros-io',
    gameSlug: 'hockey-bros',
    sourceUrl: HOCKEY_BROS_PRIMARY_URL,
    embedDomain: 'ballgames.io',
    status: 'unknown',
    permissionBasis:
      'Product spec (ballgames-specs-v1 §2-10 / §6.4) names https://www.hockeybros.io/ as the R1 default launch URL. Embed permission, commercial use, and CSP frame-src are not independently verified. unknown is not granted.',
    cspFrameSrcVerified: false,
  },
  {
    id: 'embed-pending-unverified',
    providerId: 'pending-verification',
    status: 'unknown',
    permissionBasis:
      'Shared pending record for Spec-listed launcher slugs that do not yet have a verified primaryUrl or embed grant. unknown is not granted.',
    cspFrameSrcVerified: false,
  },
]

const unverifiedDraftSlugs: Array<{ slug: string; title: string; homeSort: number }> = [
  { slug: 'basket-bros', title: 'Basket Bros', homeSort: 2 },
  { slug: 'soccer-bros', title: 'Soccer Bros', homeSort: 3 },
  { slug: 'soccer-bros-2', title: 'Soccer Bros 2', homeSort: 4 },
  { slug: 'baseball-bros', title: 'Baseball Bros', homeSort: 6 },
  { slug: 'kart-bros', title: 'Kart Bros', homeSort: 7 },
  { slug: 'wrestle-bros', title: 'Wrestle Bros', homeSort: 8 },
  { slug: 'karate-bros', title: 'Karate Bros', homeSort: 9 },
  { slug: 'math-bros', title: 'Math Bros', homeSort: 10 },
]

function draftLauncherGame(input: { slug: string; title: string; homeSort: number }): CatalogGame {
  return {
    id: input.slug,
    slug: input.slug,
    title: input.title,
    launch: { verification: 'unverified' },
    publicationStatus: 'draft',
    showOnHome: false,
    homeSort: input.homeSort,
    cardAction: 'launcher-select',
    availability: 'unknown',
  }
}

const footballBrosGame: CatalogGame = {
  id: 'football-bros',
  slug: 'football-bros',
  title: 'Football Bros',
  launch: {
    verification: 'verified',
    mode: 'iframe-official',
    primaryUrl: FOOTBALL_BROS_PRIMARY_URL,
    timeoutMs: 8000,
    embedLayout: {
      aspectRatio: '16/9',
      desktopMinHeightPx: 480,
      width: '70%',
    },
  },
  publicationStatus: 'draft',
  showOnHome: false,
  homeSort: 5,
  cardAction: 'launcher-select',
  availability: 'unknown',
  technicalEmbedVerification: {
    status: 'reported',
    sourceUrl: FOOTBALL_BROS_PRIMARY_URL,
    testedAt: '2026-11-12',
    environment: 'local-demo',
    evidenceRef:
      'ballgames-specs-v1.2 §7.4 — reported passed (local picture + controls); not independent production authorization or CSP verification',
  },
}

const hockeyBrosGame: CatalogGame = {
  id: 'hockey-bros',
  slug: 'hockey-bros',
  title: 'Hockey Bros',
  providerId: 'hockeybros-io',
  launch: {
    verification: 'verified',
    mode: 'iframe-official',
    primaryUrl: HOCKEY_BROS_PRIMARY_URL,
    timeoutMs: 8000,
    embedLayout: {
      aspectRatio: '16/9',
      desktopMinHeightPx: 480,
      width: '70%',
    },
  },
  publicationStatus: 'published',
  showOnHome: true,
  homeSort: 1,
  embedPermissionId: 'embed-hockey-bros',
  cardAction: 'navigate-to-detail',
  availability: 'unknown',
  detail: hockeyBrosDetail,
}

export const ballgamesCatalog: Catalog = {
  providers,
  embedPermissions,
  defaultPlayerGameSlug: BALLGAMES_DEFAULT_PLAYER_GAME_SLUG,
  games: [hockeyBrosGame, footballBrosGame, ...unverifiedDraftSlugs.map(draftLauncherGame)],
}

export { BALLGAMES_DEFAULT_PLAYER_GAME_SLUG }

validateCatalog(ballgamesCatalog)
