import type { PortalHomeContent, SiteInstance } from '../types'
import { validateSiteInstance } from '../validate-site-instance'
import { ballgamesPortalHomeProductionEditorial } from './ballgames-portal-home-production'

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

/** R1 production Portal Home content — ballgames-specs-v1.2 §4 / homepage-r1.md. */
export const ballgamesPortalHomeContent: PortalHomeContent = {
  publicationStatus: 'published',
  seo: {
    title: 'Ball Games | Free Online Sports Games, No Download',
    description:
      'Play free online ball games right in your browser — soccer, basketball, rink battles and more. No downloads, no sign-ups, no installs.',
    indexable: true,
  },
  updatedAt: '2026-11-14',
  ...ballgamesPortalHomeProductionEditorial,
}

/** @deprecated Use ballgamesPortalHomeContent — kept for explicit test imports during migration. */
export const ballgamesPortalHomeContentFixture = ballgamesPortalHomeContent
