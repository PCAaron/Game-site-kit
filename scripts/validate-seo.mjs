/**
 * Phase 3 — deterministic SEO validation (see specs/phases/03-minimum-seo-foundation.md §14).
 *
 * Usage:
 *   node scripts/validate-seo.mjs
 *   node scripts/validate-seo.mjs --export-dir=out
 */
import * as esbuild from 'esbuild'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outfile = path.join(projectRoot, 'scripts/.validate-seo-run.mjs')
const exportArg = process.argv.find((a) => a.startsWith('--export-dir='))

esbuild.buildSync({
  entryPoints: [path.join(projectRoot, 'scripts/validate-seo-entry.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'silent',
})

const args = [outfile]
if (exportArg) args.push(exportArg)

const result = spawnSync(process.execPath, args, {
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
