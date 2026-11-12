import { minimalPortalHomeEditorialForTests } from '../site/portal-home-editorial-contract'
import type { PortalHomeContent } from '../site/types'
import type { GameDetailPageDescriptor, PortalHomePageDescriptor } from './page-descriptors'

/** Contract fixture: R1 exact-two when both routes exist and are eligible (Phase 3 §8.1). */
export function buildR1ExactTwoContractFixtures(): {
  portal: PortalHomePageDescriptor
  game: GameDetailPageDescriptor
} {
  const portalContent: PortalHomeContent = {
    publicationStatus: 'published',
    seo: {
      title: 'Ball Games - Play Free Browser Games | BallGames.io',
      description:
        'Play free ball games right in your browser - hockey, soccer, football, basketball and more. No download, no account, one click to start.',
      indexable: true,
    },
    updatedAt: '2026-01-15',
    ...minimalPortalHomeEditorialForTests(),
  }

  return {
    portal: {
      pageType: 'portal_home',
      routePath: '/',
      routeExists: true,
      content: portalContent,
    },
    game: {
      pageType: 'game_detail',
      slug: 'hockey-bros',
      routePath: '/hockey-bros',
      routeExists: true,
      listItemName: 'Hockey Bros',
      content: {
        publicationStatus: 'published',
        seo: {
          title: 'Hockey Bros Game - Controls, Tips, Fixes | BallGames.io',
          description: 'Play Hockey Bros in your browser with controls, tips, and fixes.',
          indexable: true,
        },
        updatedAt: '2026-01-15',
      },
    },
  }
}
