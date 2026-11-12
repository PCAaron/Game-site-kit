/**
 * Phase 4.5 — Content / SEO integration tests (node:test + esbuild bundle).
 */
import * as esbuild from 'esbuild'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outfile = path.join(projectRoot, 'scripts/.phase4.5-tests.mjs')

const tsconfigPathsPlugin = {
  name: 'tsconfig-paths',
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => {
      const subpath = args.path.slice(2)
      const base = path.join(projectRoot, subpath)
      const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return { path: candidate }
        }
      }
      return { path: base }
    })
  },
}

await esbuild.build({
  entryPoints: [path.join(projectRoot, 'scripts/phase4.5-test-entry.tsx')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'silent',
  jsx: 'automatic',
  loader: { '.tsx': 'tsx' },
  packages: 'external',
  alias: {
    'next/image': path.join(projectRoot, 'scripts/test-stubs/next-image.tsx'),
    'next/link': path.join(projectRoot, 'scripts/test-stubs/next-link.tsx'),
  },
  plugins: [tsconfigPathsPlugin],
})

const registerDom = pathToFileURL(path.join(projectRoot, 'scripts/phase4.3-register-dom.mjs')).href
const result = spawnSync(process.execPath, ['--import', registerDom, '--test', outfile], {
  cwd: projectRoot,
  stdio: 'inherit',
})

try {
  fs.unlinkSync(outfile)
} catch {
  /* ignore */
}

process.exit(result.status ?? 1)
