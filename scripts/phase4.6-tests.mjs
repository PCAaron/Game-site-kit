/**
 * Phase 4.6 — independent integration validation runner.
 */
import * as esbuild from 'esbuild'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outfile = path.join(projectRoot, 'scripts/.phase4.6-tests.mjs')
const exportDir = process.argv.find((a) => a.startsWith('--export-dir='))?.split('=')[1] ?? 'out'

const hardcodedTests = spawnSync(
  process.execPath,
  ['--test', 'scripts/phase4.6-hardcoded-paths.test.mjs'],
  { cwd: projectRoot, stdio: 'inherit' }
)
if (hardcodedTests.status !== 0) process.exit(hardcodedTests.status ?? 1)

const hardcoded = spawnSync(
  process.execPath,
  ['scripts/phase4.6-hardcoded-paths.mjs'],
  { cwd: projectRoot, stdio: 'inherit' }
)
if (hardcoded.status !== 0) process.exit(hardcoded.status ?? 1)

await esbuild.build({
  entryPoints: [path.join(projectRoot, 'scripts/phase4.6-test-entry.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'silent',
  packages: 'external',
})

const testArgs = ['--test', outfile, `--export-dir=${exportDir}`]
const result = spawnSync(process.execPath, testArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
})

try {
  fs.unlinkSync(outfile)
} catch {
  /* ignore */
}

if (result.status !== 0) process.exit(result.status ?? 1)
console.log(JSON.stringify({ phase: '4.6', exportDir, result: 'PASS' }))
