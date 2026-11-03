/**
 * Batch 0 — isolated static export URL probe (DEC-003-E).
 * Does not modify repo state after completion: restores next.config.js and removes out/.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const nextConfigPath = path.join(projectRoot, 'next.config.js')
const evidenceRoot = path.join(
  projectRoot,
  'docs/agent/reports/batch0-evidence'
)
const nextWrapper = path.join(projectRoot, 'scripts/next-with-init-cwd.mjs')

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
}

function readNextConfig() {
  return fs.readFileSync(nextConfigPath, 'utf8')
}

function writeNextConfig(content) {
  fs.writeFileSync(nextConfigPath, content, 'utf8')
}

function patchTrailingSlash(content, value) {
  return content.replace(
    /trailingSlash:\s*(true|false)/,
    `trailingSlash: ${value}`
  )
}

function runBuild(envExtra) {
  const env = {
    ...process.env,
    INIT_CWD: projectRoot,
    EXPORT: '1',
    UNOPTIMIZED: '1',
    ...envExtra,
  }
  if (env.BASE_PATH === '') {
    delete env.BASE_PATH
  }
  const started = Date.now()
  const result = spawnSync(process.execPath, [nextWrapper, 'build'], {
    cwd: projectRoot,
    env,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  return {
    exitCode: result.status ?? 1,
    durationMs: Date.now() - started,
    stdoutTail: (result.stdout || '').slice(-4000),
    stderrTail: (result.stderr || '').slice(-4000),
  }
}

function listOutTree(outDir, maxFiles = 80) {
  if (!fs.existsSync(outDir)) {
    return { exists: false, files: [] }
  }
  const files = []
  function walk(rel) {
    if (files.length >= maxFiles) return
    const abs = path.join(outDir, rel)
    const stat = fs.statSync(abs)
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(abs)) {
        walk(path.join(rel, name))
        if (files.length >= maxFiles) break
      }
    } else {
      files.push(rel.replace(/\\/g, '/'))
    }
  }
  walk('')
  return { exists: true, fileCount: files.length, sample: files.sort() }
}

function pickProbeFiles(outDir) {
  const candidates = [
    'index.html',
    'blog/index.html',
    'blog.html',
    'sitemap.xml',
    'robots.txt',
  ]
  const found = {}
  for (const rel of candidates) {
    const abs = path.join(outDir, rel)
    if (fs.existsSync(abs)) {
      found[rel] = fs.readFileSync(abs, 'utf8').slice(0, 12000)
    }
  }
  return found
}

function extractSignals(htmlOrXml) {
  if (!htmlOrXml) return {}
  const canonical = htmlOrXml.match(
    /<link[^>]+rel=["']canonical["'][^>]*>/i
  )?.[0]
  const ogUrl = htmlOrXml.match(
    /<meta[^>]+property=["']og:url["'][^>]*>/i
  )?.[0]
  const hrefSamples = [...htmlOrXml.matchAll(/href=["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((h) => h.startsWith('/') || h.startsWith('http'))
    .slice(0, 25)
  return { canonical, ogUrl, hrefSamples }
}

function saveScenarioEvidence(id, payload) {
  const dir = path.join(evidenceRoot, id)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'summary.json'),
    JSON.stringify(payload, null, 2),
    'utf8'
  )
  if (payload.probeFiles) {
    for (const [name, content] of Object.entries(payload.probeFiles)) {
      fs.writeFileSync(path.join(dir, name.replace(/\//g, '__')), content, 'utf8')
    }
  }
}

const scenarios = [
  {
    id: 'scenario-a-trailing-true-root',
    label: 'A: trailingSlash=true, no BASE_PATH',
    trailingSlash: true,
    basePath: undefined,
  },
  {
    id: 'scenario-b-trailing-false-root',
    label: 'B: trailingSlash=false, no BASE_PATH',
    trailingSlash: false,
    basePath: undefined,
  },
  {
    id: 'scenario-c-trailing-true-subpath',
    label: 'C: trailingSlash=true, BASE_PATH=/Game-site-kit',
    trailingSlash: true,
    basePath: '/Game-site-kit',
  },
]

const originalConfig = readNextConfig()
const originalHash = sha256(nextConfigPath)
const results = []

try {
  fs.mkdirSync(evidenceRoot, { recursive: true })
  for (const scenario of scenarios) {
    writeNextConfig(patchTrailingSlash(originalConfig, scenario.trailingSlash))
    const envExtra = {}
    if (scenario.basePath) {
      envExtra.BASE_PATH = scenario.basePath
    }
    const build = runBuild(envExtra)
    const outDir = path.join(projectRoot, 'out')
    const tree = listOutTree(outDir)
    const probeFiles = pickProbeFiles(outDir)
    const indexSignals = extractSignals(probeFiles['index.html'])
    const blogKey =
      probeFiles['blog/index.html'] != null
        ? 'blog/index.html'
        : probeFiles['blog.html']
          ? 'blog.html'
          : null
    const blogSignals = blogKey ? extractSignals(probeFiles[blogKey]) : {}
    const sitemapSignals = extractSignals(probeFiles['sitemap.xml'])

    const payload = {
      scenario: scenario.label,
      config: {
        trailingSlash: scenario.trailingSlash,
        EXPORT: '1',
        UNOPTIMIZED: '1',
        BASE_PATH: scenario.basePath ?? '(unset)',
      },
      build,
      exportTree: tree,
      indexSignals,
      blogSignals,
      sitemapSample: (probeFiles['sitemap.xml'] || '').slice(0, 2500),
      sitemapSignals,
    }
    saveScenarioEvidence(scenario.id, { ...payload, probeFiles: undefined })
    results.push({ id: scenario.id, ...payload })

    if (fs.existsSync(outDir)) {
      fs.rmSync(outDir, { recursive: true, force: true })
    }
  }
} finally {
  writeNextConfig(originalConfig)
  const restoredHash = sha256(nextConfigPath)
  const outDir = path.join(projectRoot, 'out')
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true })
  }
  fs.writeFileSync(
    path.join(evidenceRoot, 'manifest.json'),
    JSON.stringify(
      {
        originalNextConfigSha256: originalHash,
        restoredNextConfigSha256: restoredHash,
        configRestored: originalHash === restoredHash,
        nodeVersion: process.version,
        results: results.map((r) => ({
          id: r.id,
          scenario: r.scenario,
          exitCode: r.build.exitCode,
          exportTree: r.exportTree,
        })),
      },
      null,
      2
    ),
    'utf8'
  )
  if (originalHash !== restoredHash) {
    console.error('FATAL: next.config.js was not restored correctly')
    process.exit(2)
  }
}

console.log(JSON.stringify({ ok: true, results: results.map((r) => r.id) }, null, 2))
