/**
 * Phase 4.6 — detect hardcoded R1 game detail paths in production code trees (AST-based).
 * Exit 0 when no illegal hits; non-zero lists file:line:column and matched text.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SCAN_ROOTS = ['app', 'components', 'lib'].map((d) => path.join(projectRoot, d))

/** Documented allowlist entries (reporting only — scanning uses expression context, not whole-file skip). */
export const ALLOWED_EXCEPTIONS = [
  { file: 'lib/seo/fixtures.ts', reason: 'R1 contract test fixtures (routePath slug data)' },
  { file: 'lib/catalog/types.ts', reason: 'R1 slug constants' },
]

const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

const SLUG_ONLY = /^hockey-bros$/
const ILLEGAL_PATH =
  /^\/hockey-bros\/?$|^https:\/\/ballgames\.io\/hockey-bros\/?$/i

const SLUG_IDENTIFIER_CALLS = new Set([
  'gameUrl',
  'findProductionRoutableGame',
  'assertValidGameSlug',
  'siteUrl',
  'catalogGameCanonicalUrl',
  'isAppRoutePath',
])

const SLUG_PROPERTY_NAMES = new Set([
  'slug',
  'gameSlug',
  'excludeSlug',
  'id',
  'embedPermissionId',
])

function normalizeRel(absPath) {
  return path.relative(projectRoot, absPath).replace(/\\/g, '/')
}

function isIllegalPathLiteral(value) {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (SLUG_ONLY.test(trimmed)) return false
  return ILLEGAL_PATH.test(trimmed)
}

function getScriptKind(filePath) {
  const ext = path.extname(filePath)
  if (ext === '.tsx' || ext === '.jsx') return ts.ScriptKind.TSX
  if (ext === '.ts') return ts.ScriptKind.TS
  if (ext === '.mjs' || ext === '.js') return ts.ScriptKind.JS
  if (ext === '.cjs') return ts.ScriptKind.JS
  return ts.ScriptKind.TSX
}

function getPropertyName(node) {
  if (ts.isIdentifier(node)) return node.text
  if (ts.isStringLiteral(node)) return node.text
  return undefined
}

function isImportSpecifier(node) {
  return (
    ts.isStringLiteral(node) &&
    node.parent &&
    ts.isImportDeclaration(node.parent.parent) &&
    node.parent.kind === ts.SyntaxKind.ImportSpecifier
  )
}

function isModuleSpecifier(node) {
  return ts.isStringLiteral(node) && ts.isImportDeclaration(node.parent)
}

function isAllowedSlugPropertyAssignment(node) {
  if (!ts.isPropertyAssignment(node.parent)) return false
  const name = getPropertyName(node.parent.name)
  if (!name || !SLUG_PROPERTY_NAMES.has(name)) return false
  return SLUG_ONLY.test(node.text)
}

function isAllowedRoutePathFixture(node, relFile) {
  if (relFile !== 'lib/seo/fixtures.ts') return false
  if (!ts.isPropertyAssignment(node.parent)) return false
  const name = getPropertyName(node.parent.name)
  return name === 'routePath' && isIllegalPathLiteral(node.text)
}

function isAllowedSlugCallArgument(node) {
  const parent = node.parent
  if (!parent) return false
  if (ts.isCallExpression(parent)) {
    const expr = parent.expression
    if (ts.isIdentifier(expr) && SLUG_IDENTIFIER_CALLS.has(expr.text)) {
      if (parent.arguments[0] === node) return SLUG_ONLY.test(node.text)
      // siteUrl('/hockey-bros') is still a hardcoded canonical path — not allowed
      if (expr.text === 'siteUrl' && parent.arguments[0] === node) return false
    }
  }
  return false
}

function isJsxHrefLiteral(node) {
  let parent = node.parent
  if (parent && ts.isJsxExpression(parent)) parent = parent.parent
  if (!parent || !ts.isJsxAttribute(parent)) return false
  const name = parent.name
  if (ts.isIdentifier(name)) return name.text === 'href' || name.text === 'to'
  return false
}

function shouldAllowLiteral(node, relFile) {
  const text = node.text
  if (!isIllegalPathLiteral(text)) return true
  if (isImportSpecifier(node) || isModuleSpecifier(node)) return true
  if (SLUG_ONLY.test(text)) return true
  if (isAllowedSlugCallArgument(node)) return true
  if (isAllowedSlugPropertyAssignment(node)) return true
  if (isAllowedRoutePathFixture(node, relFile)) return true
  // JSX text / non-path usage handled by only visiting string literals
  return false
}

function templateStaticText(node) {
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isTemplateExpression(node)) {
    if (node.templateSpans.length > 0) return null
    return node.head.text
  }
  return null
}

function scanSource(relFile, filePath, sourceText) {
  const kind = getScriptKind(filePath)
  const sf = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, kind)
  const hits = []

  function report(node, value) {
    if (!isIllegalPathLiteral(value)) return
    if (shouldAllowLiteral(node, relFile)) return
    const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf))
    hits.push({
      rel: relFile,
      line: line + 1,
      column: character + 1,
      match: value,
      reason: isJsxHrefLiteral(node)
        ? 'Hardcoded game detail path in JSX URL attribute'
        : 'Hardcoded game detail URL/path literal',
    })
  }

  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      report(node, node.text)
    } else if (ts.isTemplateExpression(node)) {
      const staticText = templateStaticText(node)
      if (staticText !== null) report(node, staticText)
      else {
        // concatenated template: check head and each span literal segment if fully static
        let combined = node.head.text
        let dynamic = false
        for (const span of node.templateSpans) {
          if (span.expression) {
            dynamic = true
            break
          }
          combined += span.literal.text
        }
        if (!dynamic) report(node, combined)
        else {
          if (isIllegalPathLiteral(node.head.text)) report(node.head, node.head.text)
          for (const span of node.templateSpans) {
            if (isIllegalPathLiteral(span.literal.text)) report(span.literal, span.literal.text)
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sf)
  return hits
}

function walk(dir, out) {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name)
    const st = fs.statSync(abs)
    if (st.isDirectory()) walk(abs, out)
    else if (SOURCE_EXT.has(path.extname(name))) out.push(abs)
  }
}

export function scanStringForViolations(sourceText, relFile = 'inline-fixture.tsx') {
  return scanSource(relFile, relFile, sourceText)
}

export function runScan({ silent = false } = {}) {
  const files = []
  for (const root of SCAN_ROOTS) walk(root, files)

  const allHits = []
  for (const abs of files) {
    const rel = normalizeRel(abs)
    const text = fs.readFileSync(abs, 'utf8')
    try {
      allHits.push(...scanSource(rel, abs, text))
    } catch (err) {
      console.error(`FAIL: could not parse ${rel}: ${err.message}`)
      process.exit(2)
    }
  }

  if (allHits.length) {
    console.error('FAIL: Hardcoded game detail URL')
    for (const h of allHits) {
      console.error(`File: ${h.rel}`)
      console.error(`Line: ${h.line}`)
      console.error(`Column: ${h.column}`)
      console.error(`Matched value: ${JSON.stringify(h.match)}`)
      console.error(`Reason: ${h.reason}`)
      console.error(`Suggested helper: gameUrl('hockey-bros')`)
      console.error('---')
    }
    process.exit(1)
  }

  const summary = {
    tool: 'phase4.6-hardcoded-paths',
    result: 'PASS',
    scannedRoots: SCAN_ROOTS.map((r) => path.relative(projectRoot, r)),
    scannedFiles: files.length,
    illegalHits: 0,
    allowlistExceptions: ALLOWED_EXCEPTIONS,
  }
  if (!silent) {
    console.log(`PASS`)
    console.log(`Scanned files: ${files.length}`)
    console.log(`Illegal hits: 0`)
    console.log(`Allowlist exceptions: ${JSON.stringify(ALLOWED_EXCEPTIONS)}`)
    console.log(JSON.stringify(summary))
  }
  return summary
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isMain && !process.argv.includes('--imported')) {
  runScan()
}
