import type { ContentSection } from '@/lib/site/types'

export interface PortalHomeSeoSectionsProps {
  sections: ContentSection[]
}

export function PortalHomeSeoSections({ sections }: PortalHomeSeoSectionsProps) {
  return (
    <section className="max-w-3xl space-y-10 py-10">
      {sections.map((section) => (
        <article key={section.heading} className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {section.heading}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="text-base leading-7 text-gray-700 dark:text-gray-300"
            >
              {paragraph}
            </p>
          ))}
        </article>
      ))}
    </section>
  )
}
