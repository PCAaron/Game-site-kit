import { ballgamesPortalHomeContentFixture } from './instances/ballgames'
import type { PortalHomeContent } from './types'
import { validatePortalHomeContent } from './validate-portal-home-content'

/**
 * R1 ballgames PortalHome content source (`lib/site/instances/ballgames.ts`).
 * Page routes and SEO scripts should use this reader — not deep-import the fixture.
 */
export function getBallgamesPortalHomeContent(): PortalHomeContent {
  const content = ballgamesPortalHomeContentFixture
  validatePortalHomeContent(content)
  return content
}

/** Phase 3 single active instance; multi-instance selection is out of scope. */
export function getPortalHomeContent(): PortalHomeContent {
  return getBallgamesPortalHomeContent()
}
