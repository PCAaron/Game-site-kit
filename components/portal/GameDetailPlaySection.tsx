'use client'

import type { Catalog, CatalogGame } from '@/lib/catalog/types'

import { DetailAdSlots } from './DetailAdSlots'
import { DetailPlayArea } from './DetailPlayArea'

export interface GameDetailPlaySectionProps {
  game: CatalogGame
  catalog: Catalog
}

export function GameDetailPlaySection({ game, catalog }: GameDetailPlaySectionProps) {
  return (
    <div className="space-y-6">
      <DetailPlayArea game={game} catalog={catalog} />
      <DetailAdSlots />
    </div>
  )
}
