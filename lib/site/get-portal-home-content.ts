import { ballgamesPortalHomeContentFixture } from './instances/ballgames'
import type { PortalHomeContent } from './types'
import { validatePortalHomeContent } from './validate-portal-home-content'

/**
 * R1 ballgames PortalHome content source (`lib/site/instances/ballgames.ts`).
 * 生产路径与 SEO 管线应使用本 Reader；`ballgamesPortalHomeContentFixture` 仅保留在实例模块内供本文件与**显式标注的测试**使用，不经 `lib/site/index` 暴露。
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
