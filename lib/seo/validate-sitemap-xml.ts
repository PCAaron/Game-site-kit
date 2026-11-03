import type { SiteInstance } from '../site/types'
import { buildProductionSitemap } from './production-state'

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'

export class SitemapXmlValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SitemapXmlValidationError'
  }
}

function fail(message: string): never {
  throw new SitemapXmlValidationError(message)
}

/** Decode minimal XML entities in sitemap loc values. */
function decodeXmlText(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()
}

/**
 * Parse a sitemap 0.9 urlset document into loc URLs.
 * Intentionally scoped to urlset/loc (not a general XML parser).
 */
export function parseSitemapUrlsetXml(xml: string): { urls: string[] } {
  const trimmed = xml.replace(/^\uFEFF/, '').trim()
  if (!trimmed.length) fail('sitemap XML is empty')

  if (!/^<\?xml[\s\S]*?\?>\s*<urlset/i.test(trimmed) && !/^<urlset/i.test(trimmed)) {
    fail('sitemap must start with xml declaration + urlset or urlset root')
  }

  const urlsetOpen = trimmed.match(/<urlset\b([^>]*)>/i)
  if (!urlsetOpen) fail('missing <urlset> root element')

  const attrs = urlsetOpen[1]
  if (!/\bxmlns\s*=\s*["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/i.test(attrs)) {
    fail(`urlset must declare xmlns="${SITEMAP_NS}"`)
  }

  const inner = trimmed.slice(urlsetOpen.index! + urlsetOpen[0].length)
  const closeIdx = inner.search(/<\/urlset>/i)
  if (closeIdx === -1) fail('missing </urlset> closing tag')
  const body = inner.slice(0, closeIdx)
  const afterClose = inner.slice(closeIdx + '</urlset>'.length).trim()
  if (afterClose.length) fail('unexpected content after </urlset>')

  const urlBlocks = [...body.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)]
  const urls: string[] = []

  for (const block of urlBlocks) {
    const locMatches = [...block[1].matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
    if (locMatches.length !== 1) {
      fail(`each <url> must contain exactly one <loc> (found ${locMatches.length})`)
    }
    const raw = decodeXmlText(locMatches[0][1])
    if (!raw || raw.includes('<')) fail('invalid <loc> value')
    urls.push(raw)
  }

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
