import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

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

  return (
    <main className="divide-y divide-gray-200 dark:divide-gray-700">
      <MinimalGameDetailShell title={game.title} slug={game.slug} />
    </main>
  )
}

/** Phase 4.2 minimal shell — full Game Detail UI is Phase 4.4. */
function MinimalGameDetailShell({ title, slug }: { title: string; slug: string }) {
  return (
    <div className="space-y-2 pt-6 pb-8 md:pt-8 md:pb-10">
      <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 dark:text-gray-100">
        {title}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400" data-route-slug={slug}>
        Game detail route (Phase 4.2 — metadata and catalog wiring only).
      </p>
    </div>
  )
}
