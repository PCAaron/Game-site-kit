import type { CatalogGame } from '@/lib/catalog/types'

import { GameCard } from './GameCard'

export interface GameGridProps {
  games: CatalogGame[]
  onLauncherSelect?: (game: CatalogGame) => void
}

export function GameGrid({ games, onLauncherSelect }: GameGridProps) {
  if (games.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
        No verified games are available on the home grid yet. Check back after more launches are
        published.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {games.map((game) => (
        <li key={game.id}>
          <GameCard game={game} onLauncherSelect={onLauncherSelect} />
        </li>
      ))}
    </ul>
  )
}
