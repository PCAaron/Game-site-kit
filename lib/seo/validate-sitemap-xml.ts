import { XMLParser, XMLValidator } from 'fast-xml-parser'

import type { SiteInstance } from '../site/types'
import { buildProductionSitemap } from './production-state'

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
const ALLOWED_URL_CHILD_KEYS = new Set(['loc', 'lastmod', 'changefreq', 'priority'])
const URLSET_ALLOWED_ATTRS = new Set(['@_xmlns'])
const URL_ALLOWED_ATTRS = new Set<string>()
const CHANGEFREQ_VALUES = new Set([
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
])

const XML_PARSE_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: true,
} as const

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
  return textValue(value, 'loc')
}

function textValue(value: unknown, label: string): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  if (value !== null && typeof value === 'object' && !Array.isArray(value) && '#text' in value) {
    return textValue((value as Record<string, unknown>)['#text'], label)
  }
  fail(`${label} must be text content`)
}

function elementCount(value: unknown): number {
  if (value === undefined) return 0
  if (Array.isArray(value)) return value.length
  return 1
}

function assertTextElementNoAttributes(value: unknown, label: string): void {
  if (value === undefined) return
  const items = Array.isArray(value) ? value : [value]
  for (const item of items) {
    if (item !== null && typeof item === 'object') {
      for (const key of Object.keys(item as Record<string, unknown>)) {
        if (key.startsWith('@_')) {
          fail(`unexpected attribute on ${label}: ${key.slice(2)}`)
        }
      }
    }
  }
}

function assertAllowedAttributes(
  node: Record<string, unknown>,
  allowed: Set<string>,
  label: string
): void {
  for (const key of Object.keys(node)) {
    if (!key.startsWith('@_')) continue
    if (!allowed.has(key)) {
      fail(`unexpected attribute on ${label}: ${key.slice(2)}`)
    }
  }
}

function validateLastmod(value: unknown): void {
  if (value === undefined) return
  if (elementCount(value) > 1) fail('each <url> must contain at most one <lastmod>')
  const text = textValue(value, 'lastmod')
  if (
    !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})?)?$/.test(text)
  ) {
    fail('lastmod must be W3C Datetime compatible')
  }
  const [y, m, d] = text.slice(0, 10).split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== m || dt.getUTCDate() !== d) {
    fail('lastmod date is invalid')
  }
}

function validateChangefreq(value: unknown): void {
  if (value === undefined) return
  if (elementCount(value) > 1) fail('each <url> must contain at most one <changefreq>')
  const text = textValue(value, 'changefreq')
  if (!CHANGEFREQ_VALUES.has(text)) {
    fail('changefreq must be one of always, hourly, daily, weekly, monthly, yearly, never')
  }
}

function validatePriority(value: unknown): void {
  if (value === undefined) return
  if (elementCount(value) > 1) fail('each <url> must contain at most one <priority>')
  const text = textValue(value, 'priority')
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0 || n > 1) {
    fail('priority must be a number from 0.0 to 1.0')
  }
}

function parseXmlDocument(xml: string): Record<string, unknown> {
  const trimmed = xml.replace(/^\uFEFF/, '').trim()
  if (!trimmed.length) fail('sitemap XML is empty')

  const validation = XMLValidator.validate(trimmed, {})
  if (validation !== true) {
    const msg =
      typeof validation === 'object' && validation !== null && 'err' in validation
        ? String((validation as { err: { msg?: string } }).err.msg ?? 'invalid XML')
        : 'invalid XML'
    fail(msg)
  }

  const parser = new XMLParser(XML_PARSE_OPTIONS)

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

function validateUrlNode(urlNode: Record<string, unknown>): string {
  assertAllowedAttributes(urlNode, URL_ALLOWED_ATTRS, 'url')

  const keys = Object.keys(urlNode).filter((k) => !k.startsWith('@_'))
  for (const key of keys) {
    if (!ALLOWED_URL_CHILD_KEYS.has(key)) {
      fail(`unexpected element <${key}> inside <url>`)
    }
  }
  if (!('loc' in urlNode)) {
    fail('each <url> must contain a <loc>')
  }
  if (elementCount(urlNode.loc) !== 1) {
    fail(`each <url> must contain exactly one <loc> (found ${elementCount(urlNode.loc)})`)
  }
  assertTextElementNoAttributes(urlNode.loc, 'loc')

  assertTextElementNoAttributes(urlNode.lastmod, 'lastmod')
  validateLastmod(urlNode.lastmod)
  assertTextElementNoAttributes(urlNode.changefreq, 'changefreq')
  validateChangefreq(urlNode.changefreq)
  assertTextElementNoAttributes(urlNode.priority, 'priority')
  validatePriority(urlNode.priority)

  return locText(urlNode.loc)
}

/**
 * Parse a sitemap 0.9 urlset document into loc URLs (full XML structure validation).
 */
export function parseSitemapUrlsetXml(xml: string): { urls: string[] } {
  const doc = parseXmlDocument(xml)
  const urlset = readUrlset(doc)
  readUrlsetNamespace(urlset)
  assertAllowedAttributes(urlset, URLSET_ALLOWED_ATTRS, 'urlset')

  const urlsetKeys = Object.keys(urlset).filter((k) => !k.startsWith('@_') && k !== 'url')
  if (urlsetKeys.length) {
    fail(`unexpected children under urlset: ${urlsetKeys.join(', ')}`)
  }

  const entries = readUrlEntries(urlset)
  const urls = entries.map((entry) => validateUrlNode(entry))
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
