export {
  LEGACY_PAGE_ROBOTS,
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
export {
  buildGameDetailPageDescriptor,
  findProductionRoutableGame,
  getProductionRoutableGameSlugs,
  getProductionRoutableGames,
  isCatalogGameRoutableAsDetail,
  isProductionGameDetailRoutePath,
} from './production-game-routes'
export { buildR1ExactTwoContractFixtures } from './fixtures'
export { resolveGameDetailPageSeo, resolvePortalHomePageSeo } from './resolve-page-seo'
export { isAppRoutePath, normalizeRoutePath } from './routes'
export { buildSitemapEntriesFromDescriptors, isSitemapCandidate } from './sitemap-eligibility'
export { assertExportHtmlHeadMatches, parseExportHtmlHead } from './validate-export-html-meta'
export type { ExportHtmlMetaExpectation, ParsedExportHtmlHead } from './validate-export-html-meta'
export {
  parseSitemapUrlsetXml,
  serializeSitemapUrlsetXml,
  validateProductionSitemapXml,
  validateSitemapXmlUrls,
} from './validate-sitemap-xml'
export { SitemapXmlValidationError } from './validate-sitemap-xml'
export {
  assertNoForbiddenJsonLdFields,
  buildPortalHomeJsonLdBlocks,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from './structured-data'
