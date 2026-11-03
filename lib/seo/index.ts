export {
  buildLegacyTemplateMetadata,
  buildSiteRootMetadata,
  resolvedSeoToMetadata,
} from './metadata'
export type {
  GameDetailPageDescriptor,
  PortalHomePageDescriptor,
  PortalSitemapPageDescriptor,
  ResolvedPageSEO,
} from './page-descriptors'
export { buildProductionSitemap, getProductionPortalDescriptors } from './production-state'
export { buildR1ExactTwoContractFixtures } from './fixtures'
export { resolvePortalHomePageSeo } from './resolve-page-seo'
export { isAppRoutePath, normalizeRoutePath } from './routes'
export { buildSitemapEntriesFromDescriptors, isSitemapCandidate } from './sitemap-eligibility'
export {
  assertNoForbiddenJsonLdFields,
  buildPortalHomeJsonLdBlocks,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from './structured-data'
