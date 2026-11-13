'use client'

import { useCallback, useMemo, useState } from 'react'

import type { Catalog, CatalogGame } from '@/lib/catalog/types'
import { pickDefaultLauncherGame, resolvePlayPresentation } from '@/lib/portal/play-presentation'

import { GameGrid } from './GameGrid'
import { PlayFrame } from './PlayFrame'

export interface LauncherProps {
  homeGames: CatalogGame[]
  catalog: Catalog
}

export function Launcher({ homeGames, catalog }: LauncherProps) {
  const defaultGame = useMemo(
    () => pickDefaultLauncherGame(catalog, homeGames),
    [catalog, homeGames]
  )
  const [selectedGame, setSelectedGame] = useState<CatalogGame | undefined>(defaultGame)
  const [loadGeneration, setLoadGeneration] = useState(0)

  const activeGame = selectedGame ?? defaultGame

  const presentation = useMemo(() => {
    if (!activeGame) {
      return null
    }
    return resolvePlayPresentation(activeGame, catalog)
  }, [activeGame, catalog])

  const handleLauncherSelect = useCallback((game: CatalogGame) => {
    if (game.cardAction !== 'launcher-select') return
    setSelectedGame(game)
    setLoadGeneration((g) => g + 1)
  }, [])

  return (
    <div className="space-y-10">
      {presentation && activeGame ? (
        <PlayFrame presentation={presentation} loadGeneration={loadGeneration} />
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No verified launch is configured for the home play area.
        </p>
      )}
      <p
        id="home-game-grid-label"
        className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
      >
        Games
      </p>
      <div aria-labelledby="home-game-grid-label">
        <GameGrid games={homeGames} onLauncherSelect={handleLauncherSelect} />
      </div>
    </div>
  )
}
