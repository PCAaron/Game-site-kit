/**
 * Phase 4.6 — detect hardcoded R1 game detail paths in production code trees.
 * Exit 0 when no illegal hits; non-zero lists file:line and matched text.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SCAN_ROOTS = ['app', 'components', 'lib'].map((d) => path.join(projectRoot, d))

const EXACT_FILE_ALLOWLIST = new Set(
  [
    'lib/catalog/types.ts',
    'lib/seo/fixtures.ts',
    'lib/catalog/instances/ballgames.ts',
    'lib/catalog/instances/hockey-bros-detail.ts',
    'lib/catalog/instances/ballgames-portal-home-production.ts',
  ].map((p) => path.join(projectRoot, p).replace(/\\/g, '/'))
)

const PREFIX_ALLOWLIST = [
  path.join(projectRoot, 'lib/catalog/instances').replace(/\\/g, '/'),
  path.join(projectRoot, 'lib/urls').replace(/\\/g, '/'),
]

const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

const PATH_PATTERNS = [
  /(['"`])\/hockey-bros\1/g,
  /(['"`])https:\/\/ballgames\.io\/hockey-bros\1/g,
  /(['"`])https:\/\/ballgames\.io\/hockey-bros\/\1/g,
]

function isAllowedFile(absPath) {
  const normalized = absPath.replace(/\\/g, '/')
  if (EXACT_FILE_ALLOWLIST.has(normalized)) return true
  if (normalized.includes('/node_modules/')) return true
  if (PREFIX_ALLOWLIST.some((prefix) => normalized.startsWith(prefix))) return true
  return false
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

function scanFile(filePath) {
  if (isAllowedFile(filePath)) return []
  const rel = path.relative(projectRoot, filePath)
  const text = fs.readFileSync(filePath, 'utf8')
  const lines = text.split(/\r?\n/)
  const hits = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const pattern of PATH_PATTERNS) {
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(line)) !== null) {
        hits.push({ rel, line: i + 1, text: line.trim(), match: match[0] })
      }
    }
  }
  return hits
}

function runSelfNegativeCheck() {
  const fixtureBad = `const x = '/hockey-bros'`
  const fixtureGood = `gameUrl('hockey-bros')`
  let badHits = 0
  for (const pattern of PATH_PATTERNS) {
    pattern.lastIndex = 0
    if (pattern.test(fixtureBad)) badHits++
  }
  if (badHits === 0) {
    console.error('phase4.6-hardcoded-paths: negative self-check failed (bad fixture not detected)')
    process.exit(2)
  }
  for (const pattern of PATH_PATTERNS) {
    pattern.lastIndex = 0
    if (pattern.test(fixtureGood)) {
      console.error('phase4.6-hardcoded-paths: self-check false positive on gameUrl slug')
      process.exit(2)
    }
  }
}

runSelfNegativeCheck()

const files = []
for (const root of SCAN_ROOTS) walk(root, files)

const allHits = files.flatMap(scanFile)
if (allHits.length) {
  console.error('phase4.6-hardcoded-paths FAIL')
  for (const h of allHits) {
    console.error(`  ${h.rel}:${h.line} ${h.match}`)
  }
  process.exit(1)
}

console.log(
  JSON.stringify({
    tool: 'phase4.6-hardcoded-paths',
    scannedRoots: SCAN_ROOTS.map((r) => path.relative(projectRoot, r)),
    files: files.length,
    hits: 0,
  })
)
