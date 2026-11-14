import {
  SiteConfigError,
  type ContentFaq,
  type ContentSection,
  type PortalHomeContent,
} from './types'

/** Frozen H2 order — ballgames-specs-v1.2 §4 / homepage-r1.md */
export const PORTAL_HOME_SECTION_HEADINGS = [
  'Free Online Ball Games',
  'No Download, Play in the Browser',
  'Unblocked at School or Work',
  'Two-Player Ball Games',
  'How to Play',
] as const

export function assertPortalHomeEditorialContract(content: PortalHomeContent): void {
  if (content.publicationStatus !== 'published' || !content.seo.indexable) {
    return
  }

  if (!content.intro?.trim()) {
    throw new SiteConfigError(
      'PORTAL_HOME_INTRO_REQUIRED',
      'Published indexable PortalHome requires intro'
    )
  }

  const sections = content.sections
  if (!sections || sections.length !== PORTAL_HOME_SECTION_HEADINGS.length) {
    throw new SiteConfigError(
      'PORTAL_HOME_SECTIONS_COUNT',
      `Published indexable PortalHome requires exactly ${PORTAL_HOME_SECTION_HEADINGS.length} content sections`
    )
  }

  PORTAL_HOME_SECTION_HEADINGS.forEach((heading, index) => {
    const section = sections[index]
    if (!section || section.heading !== heading) {
      throw new SiteConfigError(
        'PORTAL_HOME_SECTION_HEADING',
        `Section ${index + 1} heading must be "${heading}"`
      )
    }
    if (!section.paragraphs?.length || section.paragraphs.some((p) => !p.trim())) {
      throw new SiteConfigError(
        'PORTAL_HOME_SECTION_BODY',
        `Section "${heading}" requires non-empty paragraphs`
      )
    }
  })

  const faq = content.faq
  if (!faq || faq.length !== 8) {
    throw new SiteConfigError(
      'PORTAL_HOME_FAQ_COUNT',
      'Published indexable PortalHome requires exactly 8 FAQ items'
    )
  }

  faq.forEach((item, index) => {
    assertFaqItem(item, index)
  })
}

function assertFaqItem(item: ContentFaq, index: number): void {
  if (!item.q?.trim() || !item.a?.trim()) {
    throw new SiteConfigError(
      'PORTAL_HOME_FAQ_ITEM',
      `FAQ item ${index + 1} requires non-empty q and a`
    )
  }
}

/** Minimal editorial payload for contract tests (not production copy). */
export function minimalPortalHomeEditorialForTests(): Pick<
  PortalHomeContent,
  'intro' | 'sections' | 'faq'
> {
  const sections: ContentSection[] = PORTAL_HOME_SECTION_HEADINGS.map((heading) => ({
    heading,
    paragraphs: [`Contract placeholder for ${heading}.`],
  }))
  const faq: ContentFaq[] = [
    { q: 'Contract FAQ 1?', a: 'Answer one.' },
    { q: 'Contract FAQ 2?', a: 'Answer two.' },
    { q: 'Contract FAQ 3?', a: 'Answer three.' },
    { q: 'Contract FAQ 4?', a: 'Answer four.' },
    { q: 'Contract FAQ 5?', a: 'Answer five.' },
    { q: 'Contract FAQ 6?', a: 'Answer six.' },
    { q: 'Contract FAQ 7?', a: 'Answer seven.' },
    { q: 'Contract FAQ 8?', a: 'Answer eight.' },
  ]
  return {
    intro: 'Contract intro for portal home editorial validation.',
    sections,
    faq,
  }
}
