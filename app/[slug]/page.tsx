import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { GameDetailTemplate } from '@/components/portal/GameDetailTemplate'
import { getBallgamesCatalog } from '@/lib/catalog'
import { getSiteInstance } from '@/lib/site/get-site-instance'
import {
  buildGameDetailPageDescriptor,
  findProductionRoutableGame,
  getProductionRoutableGameSlugs,
  resolveGameDetailPageSeo,
  resolvedSeoToMetadata,
} from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return getProductionRoutableGameSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | undefined> {
  const { slug } = await props.params
  const game = findProductionRoutableGame(slug)
  if (!game) {
    return undefined
  }

  const descriptor = buildGameDetailPageDescriptor(game)
  if (!descriptor) {
    return undefined
  }

  const site = getSiteInstance()
  const resolved = resolveGameDetailPageSeo(descriptor, site)
  return resolvedSeoToMetadata(resolved, site)
}

export default async function GameDetailRoutePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const game = findProductionRoutableGame(slug)
  if (!game) {
    notFound()
  }

  const catalog = getBallgamesCatalog()

  return (
    <main className="divide-y divide-gray-200 dark:divide-gray-700">
      <GameDetailTemplate game={game} catalog={catalog} />
    </main>
  )
}
