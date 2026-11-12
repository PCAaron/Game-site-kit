import type { GameFaqItem } from '@/lib/catalog/types'

export interface GameFaqProps {
  items: GameFaqItem[]
}

export function GameFaq({ items }: GameFaqProps) {
  return (
    <section className="space-y-4" aria-labelledby="game-faq-heading">
      <h2
        id="game-faq-heading"
        className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
      >
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
        {items.map((item) => (
          <details key={item.q} className="group px-4 py-3">
            <summary className="cursor-pointer list-none text-base font-semibold text-gray-900 marker:content-none dark:text-gray-100 [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
