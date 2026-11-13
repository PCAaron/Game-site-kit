'use client'

import Image from 'next/image'

import type { CatalogGame } from '@/lib/catalog/types'
import { gamePath } from '@/lib/urls/site-url'
import Link from '@/components/Link'

export type GameCardDisplayContext = 'home' | 'related'

export interface GameCardProps {
  game: CatalogGame
  onLauncherSelect?: (game: CatalogGame) => void
  displayContext?: GameCardDisplayContext
  onRelatedActivate?: (game: CatalogGame) => void
}

export function GameCard({
  game,
  onLauncherSelect,
  displayContext = 'home',
  onRelatedActivate,
}: GameCardProps) {
  const thumb = game.thumbnail

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800">
        {thumb ? (
          <Image
            src={thumb.src}
            alt={thumb.alt}
            width={thumb.width}
            height={thumb.height}
            className="h-full w-full object-cover"
            priority={thumb.priority}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-gray-500"
            aria-hidden
          >
            No preview
          </div>
        )}
      </div>
      <div className="p-3">
        {displayContext === 'related' || game.cardAction === 'launcher-select' ? (
          <button
            type="button"
            className="text-primary-600 hover:text-primary-700 focus-visible:ring-primary-500 dark:text-primary-400 w-full text-left text-base font-semibold focus:outline-none focus-visible:ring-2"
            onClick={() =>
              displayContext === 'related' ? onRelatedActivate?.(game) : onLauncherSelect?.(game)
            }
          >
            {game.title}
          </button>
        ) : (
          <Link
            href={gamePath(game.slug)}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-base font-semibold"
          >
            {game.title}
          </Link>
        )}
      </div>
    </article>
  )
}
