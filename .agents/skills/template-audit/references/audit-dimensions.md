# Audit dimensions

Apply each dimension to the **audited repository**. Not every template must support every capability — mark checks **Not Applicable** when the target project does not require them, and explain why.

Legend:

- **R** — Required check when auditing any serious adoption candidate
- **C** — Conditional (run when target or repo signals apply)
- **O** — Optional extension (label as proposed if not run)

---

## 1. Repository baseline

| Check | R/C/O | Applicability |
|---|---|---|
| Remote origin, fork relationship, default branch | R | Always |
| Exact `HEAD` commit SHA, tags, describe | R | Always |
| License file(s) present and SPDX / terms identified | R | Always |
| Reproducible checkout instructions | R | Always |
| Intentional deltas vs upstream template | C | Forks, Site Kits, vendor branches |
| Submodule / vendored assets | C | When present |

**Typical evidence:** `git log`, `LICENSE`, README fork notes, ADR or STATUS baseline tables.

---

## 2. Tech stack

| Check | R/C/O | Applicability |
|---|---|---|
| Framework and major versions (e.g. Next, React) | R | Always |
| Runtime / Node expectations (`engines`, CI, devcontainer) | R | Always |
| Package manager and lockfile | R | Always |
| TypeScript / JS mode, strictness | C | When TS present |
| Key content or UI libraries | C | When used (MDX, CMS SDK, etc.) |

**Typical evidence:** `package.json`, lockfile, CI workflow, config files.

---

## 3. Build system

| Check | R/C/O | Applicability |
|---|---|---|
| List scripts from **actual** `package.json` | R | Always |
| Production build path | R | Always |
| Lint and typecheck entry points | C | When scripts exist |
| Static export / standalone / adapter modes | C | When target deployment needs them |
| Post-build hooks (RSS, search index, sitemap generation) | C | When scripts or plugins exist |
| Automated tests | C | When script exists or target requires tests |

**Typical evidence:** Script definitions, `next.config`, workflow env vars (`EXPORT`, `BASE_PATH`), executed command results.

---

## 4. Routing

| Check | R/C/O | Applicability |
|---|---|---|
| Router mode (App vs Pages) | R | Always |
| Static vs dynamic routes, `generateStaticParams` | R | For content-heavy targets |
| Trailing slash, basePath, redirects | C | Multi-env or static hosting |
| API routes vs static export constraints | C | Export or edge-only deploy |

**Typical evidence:** `app/` or `pages/` tree, `next.config.js`, route handlers.

---

## 5. Content system

| Check | R/C/O | Applicability |
|---|---|---|
| Content source (MDX, markdown, CMS, JSON) | R | Content-driven targets |
| Schema / document types | R | When contentlayer, CMS, or typed frontmatter used |
| Build-time code generation | C | contentlayer, Velite, etc. |
| Draft / publish workflow | C | Editorial or staged publish |
| Search index generation | O | When search is in scope |

**Typical evidence:** Content config, `data/` or `content/` paths, generated output dirs (often gitignored).

---

## 6. SEO foundation

| Check | R/C/O | Applicability |
|---|---|---|
| Global metadata (`metadataBase`, title template) | R | Public sites |
| Per-page metadata pattern | R | Multi-page sites |
| Canonical strategy | R | SEO-sensitive targets |
| `robots.txt` / robots metadata | R | Indexable production |
| Sitemap generation | R | Indexable production |
| Open Graph / Twitter cards | C | Social sharing requirements |
| JSON-LD / structured data | C | Rich results requirements |
| RSS or feeds | O | When product needs feeds |

**Typical evidence:** `app/layout.tsx`, `seo.tsx` or helpers, `sitemap.ts`, `robots.ts`, page-level `generateMetadata`.

---

## 7. Extensibility

| Check | R/C/O | Applicability |
|---|---|---|
| Site-wide config isolation (`siteMetadata`, env) | R | Multi-site or white-label kits |
| Layout / component extension points | R | Custom page types |
| Coupling to demo content or single vertical | C | Always note for starters |
| Feature flags or optional modules | C | When present |

**Typical evidence:** `data/siteMetadata`, nav config, hardcoded demo paths, pliny or plugin coupling.

---

## 8. Deployment

| Check | R/C/O | Applicability |
|---|---|---|
| Documented or inferred deploy mode (Node server, static export, Vercel, Pages) | R | Always |
| Build artifacts and env vars | R | Always |
| CI/CD workflow | C | When `.github/workflows` or similar exists |
| Headers / CSP at platform vs app layer | C | Security-sensitive or static export |
| Environment-specific URL / canonical behavior | C | Staging vs production |

**Typical evidence:** Workflows, `output: 'export'`, platform config, README deploy section (cross-check with config).

---

## 9. Security and license

| Check | R/C/O | Applicability |
|---|---|---|
| OSS license obligations | R | Always |
| Bundled fonts, images, icons — production suitability | R | Always |
| Third-party scripts, analytics, comments defaults | C | Starters often ship enabled configs |
| CSP, `X-Frame-Options`, embed policy | C | Embedded games or iframes |
| Dependency license scan | O | Enterprise adoption |

**Typical evidence:** `LICENSE`, `public/`, `next.config.js` headers, `siteMetadata` analytics/comments blocks.

---

## 10. Agent compatibility

| Check | R/C/O | Applicability |
|---|---|---|
| Agent entry docs (`AGENTS.md`, CONTRIBUTING) | C | Agent-driven projects |
| Phase specs / STATUS / ADRs | C | Kit or governed repos |
| Cursor or tool rules | O | When present |
| Verifiable quality commands documented and runnable | R | Agent-maintained repos |

**Typical evidence:** `AGENTS.md`, `docs/agent/STATUS.md`, `.cursor/rules`, actual script list vs documented commands.

---

## Phase 0 lineage note (Game Site Kit)

The completed Game Site Kit Phase 0 audit validated a **blog-lineage** template with contentlayer2 MDX, App Router SEO endpoints, and known gaps (blog IA, `canonicalUrl` wiring, demo `siteUrl`). Use [examples/game-site-kit-audit.md](../examples/game-site-kit-audit.md) as a **worked example**, not as requirements every template must meet.
