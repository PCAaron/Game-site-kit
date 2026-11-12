'use client'

import type { CatalogGame } from '@/lib/catalog/types'

import { GameGrid } from './GameGrid'

export interface RelatedGamesProps {
  games: CatalogGame[]
  onRelatedActivate: (game: CatalogGame) => void
}

export function RelatedGames({ games, onRelatedActivate }: RelatedGamesProps) {
  return (
    <section className="space-y-4" aria-labelledby="related-games-heading">
      <h2
        id="related-games-heading"
        className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
      >
        Related Games
      </h2>
      <GameGrid games={games} displayContext="related" onRelatedActivate={onRelatedActivate} />
    </section>
  )
}
