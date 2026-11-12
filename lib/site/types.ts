export type PageType = 'portal_home' | 'game_detail'

export type PublicationStatus = 'draft' | 'published' | 'archived'

export type UrlPathStyle = 'no-trailing-slash'

export interface SiteInstance {
  siteId: string
  archetype: 'game-portal'
  canonicalOrigin: string
  urlPathStyle: UrlPathStyle
  defaultIndexable: false
  enabledPageTypes: PageType[]
  metadata: {
    title: string
    description: string
    language: string
    locale: string
    socialBanner?: string
  }
}

export interface ContentSection {
  heading: string
  paragraphs: string[]
}

export interface ContentFaq {
  q: string
  a: string
}

export interface PortalHomeContent {
  publicationStatus: PublicationStatus
  seo: {
    title: string
    description: string
    indexable: boolean
    ogImage?: string
  }
  /** SEO intro (after launcher grid). Required when published && indexable. */
  intro?: string
  /** Five H2 blocks in frozen order. Required when published && indexable. */
  sections?: ContentSection[]
  /** Eight FAQ items; UI and FAQPage JSON-LD share this source. */
  faq?: ContentFaq[]
  updatedAt?: string
}

export class SiteConfigError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'SiteConfigError'
    this.code = code
  }
}
