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

/** First home-grid row with a verified launch — default PlayFrame selection on `/`. */
export function pickDefaultLauncherGame(games: CatalogGame[]): CatalogGame | undefined {
  return games.find((game) => isLaunchVerified(game.launch))
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
