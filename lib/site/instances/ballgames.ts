import type { PortalHomeContent, SiteInstance } from '../types'
import { validateSiteInstance } from '../validate-site-instance'

export const ballgamesSiteInstance: SiteInstance = {
  siteId: 'ballgames',
  archetype: 'game-portal',
  canonicalOrigin: 'https://ballgames.io',
  urlPathStyle: 'no-trailing-slash',
  defaultIndexable: false,
  enabledPageTypes: ['portal_home', 'game_detail'],
  metadata: {
    title: 'BallGames.io',
    description:
      'Play free ball games in your browser — hockey, soccer, football, basketball and more.',
    language: 'en',
    locale: 'en-US',
    socialBanner: '/static/images/twitter-card.png',
  },
}

validateSiteInstance(ballgamesSiteInstance)

/** R1 portal home SEO fields from ballgames-specs-v1 §5.1 (content integration is Phase 4). */
export const ballgamesPortalHomeContentFixture: PortalHomeContent = {
  publicationStatus: 'draft',
  seo: {
    title: 'Ball Games - Play Free Browser Games | BallGames.io',
    description:
      'Play free ball games right in your browser - hockey, soccer, football, basketball and more. No download, no account, one click to start.',
    indexable: false,
  },
}
