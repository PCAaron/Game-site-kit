import { isProductionEmbedAllowed } from '../catalog/adapter'
import type { Catalog, CatalogGame, EmbedLayout } from '../catalog/types'
import { isLaunchVerified } from '../catalog/validate'

export const DEFAULT_PLAY_TIMEOUT_MS = 8000

export type PlayPresentationMode = 'production-iframe' | 'external-only'

export interface PlayPresentation {
  mode: PlayPresentationMode
  primaryUrl: string | null
  timeoutMs: number
  gameTitle: string
  embedLayout?: EmbedLayout
}

/**
 * Home play area default game. Uses catalog.defaultPlayerGameSlug when set (Ballgames:
 * football-bros), independent of homeSort / first verified home card. Falls back to the first
 * verified launch in `homeGames` for other portal prototypes.
 */
export function pickDefaultLauncherGame(
  catalog: Catalog,
  homeGames: CatalogGame[] = []
): CatalogGame | undefined {
  const configuredSlug = catalog.defaultPlayerGameSlug
  if (configuredSlug) {
    const configured = catalog.games.find((game) => game.slug === configuredSlug)
    if (configured) {
      return configured
    }
  }
  return homeGames.find((game) => isLaunchVerified(game.launch))
}

export function resolvePlayPresentation(game: CatalogGame, catalog: Catalog): PlayPresentation {
  if (!isLaunchVerified(game.launch)) {
    return {
      mode: 'external-only',
      primaryUrl: null,
      timeoutMs: DEFAULT_PLAY_TIMEOUT_MS,
      gameTitle: game.title,
    }
  }

  const launch = game.launch
  const timeoutMs = launch.timeoutMs ?? DEFAULT_PLAY_TIMEOUT_MS
  const embedAllowed = isProductionEmbedAllowed(game, catalog)
  const iframeMode = launch.mode === 'iframe-official' || launch.mode === 'iframe-provider'

  if (embedAllowed && iframeMode) {
    return {
      mode: 'production-iframe',
      primaryUrl: launch.primaryUrl,
      timeoutMs,
      gameTitle: game.title,
      embedLayout: launch.embedLayout,
    }
  }

  return {
    mode: 'external-only',
    primaryUrl: launch.primaryUrl,
    timeoutMs,
    gameTitle: game.title,
    embedLayout: launch.embedLayout,
  }
}

/** Ignore stale iframe load events after the user switches games. */
export function shouldAcceptIframeLoadEvent(
  eventGeneration: number,
  activeGeneration: number
): boolean {
  return eventGeneration === activeGeneration
}
