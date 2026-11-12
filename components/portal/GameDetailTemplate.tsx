import { getProductionRelatedCatalogGames } from '@/lib/catalog/adapter'
import type { Catalog, CatalogGame } from '@/lib/catalog/types'

import { Breadcrumbs } from './Breadcrumbs'
import { GameDetailContent } from './GameDetailContent'
import { GameDetailPlaySection } from './GameDetailPlaySection'
import { GameFaq } from './GameFaq'
import { RelatedGamesWithScroll } from './RelatedGamesWithScroll'

export interface GameDetailTemplateProps {
  game: CatalogGame
  catalog: Catalog
}

export function GameDetailTemplate({ game, catalog }: GameDetailTemplateProps) {
  const detail = game.detail
  if (!detail) {
    throw new Error(`GameDetailTemplate: missing detail content for ${game.slug}`)
  }

  const relatedGames = getProductionRelatedCatalogGames(catalog)

  return (
    <div className="space-y-10 pt-6 pb-12 md:pt-8 md:pb-16">
      <Breadcrumbs currentTitle={game.title} />
      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-tight dark:text-gray-100">
          {game.title}
        </h1>
        <p className="text-lg leading-7 text-gray-600 dark:text-gray-300">{detail.intro}</p>
      </header>

      <GameDetailPlaySection game={game} catalog={catalog} />

      <div className="space-y-12">
        <GameDetailContent detail={detail} />
        <GameFaq items={detail.faq} />
        <RelatedGamesWithScroll games={relatedGames} />
      </div>
    </div>
  )
}
