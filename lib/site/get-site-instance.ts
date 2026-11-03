import { ballgamesSiteInstance } from './instances/ballgames'
import type { SiteInstance } from './types'

/** Phase 3 single active instance; multi-instance selection is out of scope. */
export function getSiteInstance(): SiteInstance {
  return ballgamesSiteInstance
}
