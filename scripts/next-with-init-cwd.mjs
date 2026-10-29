/**
 * Sets INIT_CWD to the project root before invoking Next.js.
 * Replaces shell-specific `$PWD` so `yarn dev` / `yarn build` work on Windows.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const nextCommand = process.argv[2]

if (!nextCommand || !['dev', 'build', 'start'].includes(nextCommand)) {
  console.error('Usage: node scripts/next-with-init-cwd.mjs <dev|build|start>')
  process.exit(1)
}

const nextBin = require.resolve('next/dist/bin/next')
const result = spawnSync(process.execPath, [nextBin, nextCommand], {
  stdio: 'inherit',
  env: { ...process.env, INIT_CWD: projectRoot },
  cwd: projectRoot,
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(result.status === null ? 1 : result.status)
