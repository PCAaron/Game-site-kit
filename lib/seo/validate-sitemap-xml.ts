import { XMLParser, XMLValidator } from 'fast-xml-parser'

import type { SiteInstance } from '../site/types'
import { buildProductionSitemap } from './production-state'

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
const ALLOWED_URL_CHILD_KEYS = new Set(['loc', 'lastmod', 'changefreq', 'priority'])

export class SitemapXmlValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SitemapXmlValidationError'
  }
}

function fail(message: string): never {
  throw new SitemapXmlValidationError(message)
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function locText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  fail('loc must be text content')
}

function parseXmlDocument(xml: string): Record<string, unknown> {
  const trimmed = xml.replace(/^\uFEFF/, '').trim()
  if (!trimmed.length) fail('sitemap XML is empty')

  const validation = XMLValidator.validate(trimmed, {
    allowBooleanAttributes: true,
  })
  if (validation !== true) {
    const msg =
      typeof validation === 'object' && validation !== null && 'err' in validation
        ? String((validation as { err: { msg?: string } }).err.msg ?? 'invalid XML')
        : 'invalid XML'
    fail(msg)
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true,
    processEntities: true,
  })

  let doc: unknown
  try {
    doc = parser.parse(trimmed)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    fail(`XML parse failed: ${message}`)
  }

  return asRecord(doc, 'document')
}

function readUrlset(doc: Record<string, unknown>): Record<string, unknown> {
  const rootKeys = Object.keys(doc).filter((k) => k !== '?xml')
  if (rootKeys.length !== 1 || rootKeys[0] !== 'urlset') {
    fail(`root element must be urlset (found: ${rootKeys.join(', ') || 'none'})`)
  }
  return asRecord(doc.urlset, 'urlset')
}

function readUrlsetNamespace(urlset: Record<string, unknown>): void {
  const xmlns = urlset['@_xmlns']
  if (typeof xmlns !== 'string' || xmlns !== SITEMAP_NS) {
    fail(`urlset must declare xmlns="${SITEMAP_NS}"`)
  }
}

function readUrlEntries(urlset: Record<string, unknown>): Record<string, unknown>[] {
  const raw = urlset.url
  if (raw === undefined) return []
  if (Array.isArray(raw)) {
    return raw.map((entry, i) => asRecord(entry, `url[${i}]`))
  }
  return [asRecord(raw, 'url')]
}

function readLocFromUrl(urlNode: Record<string, unknown>): string {
  const keys = Object.keys(urlNode).filter((k) => !k.startsWith('@_'))
  for (const key of keys) {
    if (!ALLOWED_URL_CHILD_KEYS.has(key)) {
      fail(`unexpected element <${key}> inside <url>`)
    }
  }
  if (!('loc' in urlNode)) {
    fail('each <url> must contain a <loc>')
  }
  const locCount =
    urlNode.loc === undefined ? 0 : Array.isArray(urlNode.loc) ? urlNode.loc.length : 1
  if (locCount !== 1) {
    fail(`each <url> must contain exactly one <loc> (found ${locCount})`)
  }
  return locText(urlNode.loc)
}

/**
 * Parse a sitemap 0.9 urlset document into loc URLs (full XML structure validation).
 */
export function parseSitemapUrlsetXml(xml: string): { urls: string[] } {
  const doc = parseXmlDocument(xml)
  const urlset = readUrlset(doc)
  readUrlsetNamespace(urlset)

  const urlsetKeys = Object.keys(urlset).filter((k) => !k.startsWith('@_') && k !== 'url')
  if (urlsetKeys.length) {
    fail(`unexpected children under urlset: ${urlsetKeys.join(', ')}`)
  }

  const entries = readUrlEntries(urlset)
  const urls = entries.map((entry) => readLocFromUrl(entry))
  return { urls }
}

function assertCanonicalSitemapUrl(url: string, site: SiteInstance): void {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    fail(`sitemap URL is not absolute: ${url}`)
  }

  const origin = site.canonicalOrigin.replace(/\/+$/, '')
  if (`${parsed.protocol}//${parsed.host}` !== origin) {
    fail(`sitemap URL origin must be ${origin}: ${url}`)
  }

  const path = parsed.pathname
  if (path !== '/' && path.endsWith('/')) {
    fail(`sitemap URL must not have trailing slash: ${url}`)
  }
  if (path.includes('//')) {
    fail(`sitemap URL path must not contain duplicate slashes: ${url}`)
  }

  const legacyPrefixes = ['/blog', '/tags', '/projects', '/about']
  for (const prefix of legacyPrefixes) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      fail(`legacy route must not appear in production sitemap: ${url}`)
    }
  }
}

/**
 * Validate sitemap XML structure and URL set against an explicit eligibility-derived list.
 */
export function validateSitemapXmlUrls(
  xml: string,
  expectedUrls: string[],
  site: SiteInstance
): void {
  const { urls } = parseSitemapUrlsetXml(xml)
  const expected = [...expectedUrls].sort()
  const actual = [...urls].sort()

  if (actual.length !== expected.length) {
    fail(
      `sitemap URL count ${actual.length} !== expected ${expected.length} (expected: ${expected.join(', ') || '(empty)'})`
    )
  }

  const seen = new Set<string>()
  for (const url of urls) {
    if (seen.has(url)) fail(`duplicate sitemap URL: ${url}`)
    seen.add(url)
    assertCanonicalSitemapUrl(url, site)
  }

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      fail(
        `sitemap URL set mismatch: got ${actual.join(', ') || '(empty)'}; expected ${expected.join(', ') || '(empty)'}`
      )
    }
  }
}

/**
 * Validate exported or generated sitemap XML against production eligibility (not robots/noindex strings).
 */
export function validateProductionSitemapXml(xml: string, site: SiteInstance): void {
  const expected = buildProductionSitemap(site).map((e) => e.url)
  validateSitemapXmlUrls(xml, expected, site)
}

/** Serialize production entries to urlset XML for contract tests (matches Next sitemap shape). */
export function serializeSitemapUrlsetXml(
  entries: Array<{ url: string; lastModified?: string }>
): string {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', `<urlset xmlns="${SITEMAP_NS}">`]
  for (const entry of entries) {
    lines.push('  <url>')
    lines.push(`    <loc>${entry.url.replace(/&/g, '&amp;')}</loc>`)
    if (entry.lastModified) {
      lines.push(`    <lastmod>${entry.lastModified}</lastmod>`)
    }
    lines.push('  </url>')
  }
  lines.push('</urlset>')
  return lines.join('\n')
}
