/**
 * Bundles Phase 4.1 Catalog contract tests and runs node:test. No new npm dependencies.
 */
import * as esbuild from 'esbuild'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outfile = path.join(projectRoot, 'scripts/.catalog-tests.mjs')

esbuild.buildSync({
  entryPoints: [path.join(projectRoot, 'scripts/catalog-test-entry.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'silent',
})

const result = spawnSync(process.execPath, ['--test', outfile], {
  cwd: projectRoot,
  stdio: 'inherit',
})

try {
  fs.unlinkSync(outfile)
} catch {
  /* ignore */
}

process.exit(result.status ?? 1)
