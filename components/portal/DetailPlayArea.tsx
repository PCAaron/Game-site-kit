'use client'

import { useMemo } from 'react'

import type { Catalog, CatalogGame } from '@/lib/catalog/types'
import { resolvePlayPresentation } from '@/lib/portal/play-presentation'

import { PlayFrame } from './PlayFrame'

export interface DetailPlayAreaProps {
  game: CatalogGame
  catalog: Catalog
}

export function DetailPlayArea({ game, catalog }: DetailPlayAreaProps) {
  const loadGeneration = 0

  const presentation = useMemo(() => resolvePlayPresentation(game, catalog), [game, catalog])

  return (
    <section
      id="detail-play-area"
      aria-label={`Play ${game.title}`}
      className="scroll-mt-20 space-y-3"
    >
      <h2 className="sr-only">Play {game.title}</h2>
      <PlayFrame presentation={presentation} loadGeneration={loadGeneration} />
    </section>
  )
}
