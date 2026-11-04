/**
 * Phase 4.1 — Catalog schema validation + verification report.
 *
 * Exit 0 means the Catalog schema is valid, not that R1 home-card count or
 * embed permission is production-ready.
 */
import * as esbuild from 'esbuild'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outfile = path.join(projectRoot, 'scripts/.validate-catalog-run.mjs')

esbuild.buildSync({
  entryPoints: [path.join(projectRoot, 'scripts/validate-catalog-entry.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'silent',
})

const result = spawnSync(process.execPath, [outfile], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
})

try {
  fs.unlinkSync(outfile)
} catch {
  /* ignore */
}

process.exit(result.status ?? 1)
