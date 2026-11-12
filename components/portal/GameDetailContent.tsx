import type { GameControl, GameDetailContent, GameSection } from '@/lib/catalog/types'
import { DetailBodyBlocks, parseDetailBody } from '@/lib/portal/parse-detail-body'

function sectionByHeading(sections: GameSection[], heading: string): GameSection | undefined {
  return sections.find((section) => section.heading === heading)
}

function HowToPlaySection({ howToPlay }: { howToPlay: string }) {
  const paragraphs = howToPlay
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        How to Play
      </h2>
      <div className="max-w-3xl text-base leading-7 text-gray-700 dark:text-gray-300">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="mt-4 first:mt-0">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}

function ControlsSection({ section, controls }: { section: GameSection; controls: GameControl[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Controls
      </h2>
      <div className="prose dark:prose-invert max-w-3xl text-gray-700 dark:text-gray-300">
        <DetailBodyBlocks body={section.body} />
      </div>
      {controls.length > 0 ? (
        <dl className="mt-6 max-w-3xl divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
          {controls.map((control) => (
            <div
              key={control.label}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(8rem,0.35fr)_1fr]"
            >
              <dt className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {control.label}
              </dt>
              <dd className="text-sm text-gray-700 dark:text-gray-300">{control.keys}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}

function SectionBlock({ section }: { section: GameSection }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {section.heading}
      </h2>
      <div className="prose dark:prose-invert max-w-3xl text-gray-700 dark:text-gray-300">
        <DetailBodyBlocks body={section.body} />
      </div>
    </section>
  )
}

export interface GameDetailContentProps {
  detail: GameDetailContent
}

export function GameDetailContent({ detail }: GameDetailContentProps) {
  const controlsSection = sectionByHeading(detail.sections, 'Controls')
  const tipsSection = sectionByHeading(detail.sections, 'Tips for Winning')
  const aboutSection = sectionByHeading(detail.sections, 'About Hockey Bros')
  const seriesSection = sectionByHeading(detail.sections, 'The Rest of the Bros Series')

  if (!controlsSection) {
    throw new Error('GameDetailContent: Controls section is required in catalog detail.')
  }

  return (
    <div className="space-y-12">
      <HowToPlaySection howToPlay={detail.howToPlay} />
      <ControlsSection section={controlsSection} controls={detail.controls} />
      {tipsSection ? <SectionBlock section={tipsSection} /> : null}
      {aboutSection ? <SectionBlock section={aboutSection} /> : null}
      {seriesSection ? <SectionBlock section={seriesSection} /> : null}
    </div>
  )
}

/** Test helper: count h3 blocks in About section body. */
export function countAboutH3InDetail(detail: GameDetailContent): number {
  const about = sectionByHeading(detail.sections, 'About Hockey Bros')
  if (!about) return 0
  return parseDetailBody(about.body).filter((b) => b.type === 'heading3').length
}
