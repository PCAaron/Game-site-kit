export type {
  PageType,
  PortalHomeContent,
  PublicationStatus,
  SiteInstance,
  UrlPathStyle,
} from './types'
export { SiteConfigError } from './types'
export { getSiteInstance } from './get-site-instance'
export { getBallgamesPortalHomeContent, getPortalHomeContent } from './get-portal-home-content'
/** R1 ballgames 站点配置；页面与 SEO 应通过 `getSiteInstance()` / `get-portal-home-content` 读取。 */
export { ballgamesSiteInstance } from './instances/ballgames'
export { validatePortalHomeContent, resolvePortalHomeOgImage } from './validate-portal-home-content'
export { validateSiteInstance } from './validate-site-instance'
