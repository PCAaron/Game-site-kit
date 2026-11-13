/**
 * Phase 4.6 — hardcoded path scanner fixtures (P1-01).
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { runScan, scanStringForViolations } from './phase4.6-hardcoded-paths.mjs'

const FIXTURE_FILE = 'components/portal/Fixture.tsx'

const BAD_CASES = [
  ["const href = '/hockey-bros'", "case-1-single-quote"],
  ['const href = "/hockey-bros"', 'case-3-double-quote-string'],
  ['<a href="/hockey-bros">Hockey Bros</a>', 'case-3-jsx-anchor'],
  ['<Link href="/hockey-bros">Hockey Bros</Link>', 'case-4-jsx-link'],
  ["<Link href={'/hockey-bros'}>Hockey Bros</Link>", 'case-5-jsx-expr'],
  ["const href = 'https://ballgames.io/hockey-bros'", 'case-6-absolute'],
  ['const href = `/hockey-bros`', 'case-7-template'],
  ['const href = `https://ballgames.io/hockey-bros`', 'case-8-template-absolute'],
]

const GOOD_CASES = [
  ["gameUrl('hockey-bros')", 'case-9-gameUrl'],
  ["const slug = 'hockey-bros'", 'case-10-slug'],
  ['<span>Hockey Bros</span>', 'case-11-display-text'],
]

for (const [snippet, id] of BAD_CASES) {
  test(`P1-01 bad ${id}`, () => {
    const hits = scanStringForViolations(snippet, FIXTURE_FILE)
    assert.ok(hits.length > 0, `expected violation for: ${snippet}`)
  })
}

for (const [snippet, id] of GOOD_CASES) {
  test(`P1-01 good ${id}`, () => {
    const hits = scanStringForViolations(snippet, FIXTURE_FILE)
    assert.equal(hits.length, 0, `unexpected hit for: ${snippet}`)
  })
}

test('P1-01 fixtures.ts routePath slug path is allowed; new hardcoded href is not', () => {
  const allowed = scanStringForViolations(
    "export const x = { routePath: '/hockey-bros' }",
    'lib/seo/fixtures.ts'
  )
  assert.equal(allowed.length, 0)

  const blocked = scanStringForViolations(
    "export const bad = '/hockey-bros'",
    'lib/seo/fixtures.ts'
  )
  assert.ok(blocked.length > 0)
})

test('P1-01 lib/urls file is not directory-whitelisted — hardcoded path fails', () => {
  const hits = scanStringForViolations(
    "const x = '/hockey-bros'",
    'lib/urls/site-url.ts'
  )
  assert.ok(hits.length > 0)
})

test('P1-01 production tree scan exits clean', () => {
  const summary = runScan({ silent: true })
  assert.equal(summary.illegalHits, 0)
})

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isMain) {
  // node --test scripts/phase4.6-hardcoded-paths.test.mjs
}
