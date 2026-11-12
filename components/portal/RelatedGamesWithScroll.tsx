'use client'

import { useCallback } from 'react'

import type { CatalogGame } from '@/lib/catalog/types'

import { RelatedGames } from './RelatedGames'

const DETAIL_PLAY_AREA_ID = 'detail-play-area'

export function scrollDetailPlayAreaIntoView() {
  const el = document.getElementById(DETAIL_PLAY_AREA_ID)
  if (!el) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  })
}

export interface RelatedGamesWithScrollProps {
  games: CatalogGame[]
}

export function RelatedGamesWithScroll({ games }: RelatedGamesWithScrollProps) {
  const handleRelatedActivate = useCallback(() => {
    scrollDetailPlayAreaIntoView()
  }, [])

  return <RelatedGames games={games} onRelatedActivate={handleRelatedActivate} />
}
