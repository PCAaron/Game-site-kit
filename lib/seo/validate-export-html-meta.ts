import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'

export class ExportHtmlMetaValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExportHtmlMetaValidationError'
  }
}

function fail(message: string): never {
  throw new ExportHtmlMetaValidationError(message)
}

function getAttr(node: Element, name: string): string | undefined {
  const entry = node.properties?.[name]
  if (entry == null) return undefined
  if (Array.isArray(entry)) return entry.map(String).join(' ')
  return String(entry)
}

function textContent(node: Element): string {
  let out = ''
  visit(node, (child) => {
    if (child.type === 'text' && 'value' in child) {
      out += child.value
    }
  })
  return out.trim()
}

export type ParsedExportHtmlHead = {
  title?: string
  description?: string
  robots?: string
  canonical?: string
  openGraph: Record<string, string>
}

export function parseExportHtmlHead(html: string): ParsedExportHtmlHead {
  const tree = fromHtmlIsomorphic(html, { fragment: false }) as Root

  let head: Element | undefined
  visit(tree, (node) => {
    if (node.type === 'element' && node.tagName === 'head') {
      head = node
    }
  })
  if (!head) fail('HTML missing <head>')

  const result: ParsedExportHtmlHead = { openGraph: {} }

  visit(head, (node) => {
    if (node.type !== 'element') return

    if (node.tagName === 'title') {
      const title = textContent(node)
      if (title) result.title = title
      return
    }

    if (node.tagName === 'meta') {
      const name = getAttr(node, 'name')?.toLowerCase()
      const property = getAttr(node, 'property')?.toLowerCase()
      const content = getAttr(node, 'content')
      if (!content) return

      if (name === 'description') result.description = content
      if (name === 'robots') result.robots = content
      if (property?.startsWith('og:')) {
        result.openGraph[property.slice(3)] = content
      }
      return
    }

    if (node.tagName === 'link') {
      const rel = getAttr(node, 'rel')?.toLowerCase()
      if (rel === 'canonical') {
        const href = getAttr(node, 'href')
        if (href) result.canonical = href
      }
    }
  })

  return result
}

export type ExportHtmlMetaExpectation = {
  title?: string
  description?: string
  robots?: string
  canonical?: string
  openGraph?: Partial<{
    title: string
    description: string
    url: string
    site_name: string
    type: string
  }>
}

export function assertExportHtmlHeadMatches(
  html: string,
  expectation: ExportHtmlMetaExpectation,
  label: string
): ParsedExportHtmlHead {
  const parsed = parseExportHtmlHead(html)

  if (expectation.title !== undefined && parsed.title !== expectation.title) {
    fail(`${label}: title expected "${expectation.title}", got "${parsed.title ?? ''}"`)
  }
  if (expectation.description !== undefined && parsed.description !== expectation.description) {
    fail(
      `${label}: description expected "${expectation.description}", got "${parsed.description ?? ''}"`
    )
  }
  if (expectation.robots !== undefined && parsed.robots !== expectation.robots) {
    fail(`${label}: robots expected "${expectation.robots}", got "${parsed.robots ?? ''}"`)
  }
  if (expectation.canonical !== undefined && parsed.canonical !== expectation.canonical) {
    fail(`${label}: canonical expected "${expectation.canonical}", got "${parsed.canonical ?? ''}"`)
  }

  const og = expectation.openGraph ?? {}
  for (const [key, expected] of Object.entries(og)) {
    const actual = parsed.openGraph[key]
    if (actual !== expected) {
      fail(`${label}: og:${key} expected "${expected}", got "${actual ?? ''}"`)
    }
  }

  return parsed
}
