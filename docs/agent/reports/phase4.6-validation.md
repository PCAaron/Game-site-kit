# Phase 4.6 — Static Export & SEO Independent Integration Validation

**Date:** 2026-11-13  
**Method:** Local independent validation (not Cloudflare live HTTP)  
**Branch:** `main`  
**Code baseline (before validation artifacts):** `4f8bcabbb01a6411d0cb0089632d3418c83e4888`  
**Working tree after Phase 4.6 scripts/report:** uncommitted (`package.json`, `scripts/phase4.6-*`, this report, `STATUS.md`, `WORKLOG.md`)

---

## A. Validation Baseline

| Item | Value |
| --- | --- |
| Git branch | `main` |
| HEAD (start) | `4f8bcabb01a6411d0cb0089632d3418c83e4888` |
| HEAD (end) | `4f8bcabb01a6411d0cb0089632d3418c83e4888` (product code unchanged; validation-only additions in working tree) |
| Working tree (start) | clean |
| Node.js | v22.14.0 |
| Yarn | 3.6.1 |
| Next.js (lockfile) | 15.5.12 |
| Static export | `EXPORT=1`, `UNOPTIMIZED=1`, `output: 'export'`, `trailingSlash: false` (`next.config.js`) |
| Build entry | `node ./scripts/next-with-init-cwd.mjs build` + `scripts/postbuild.mjs` |

---

## B. Scope and Methodology

- Re-validate Ballgames R1 (Phase 4.0–4.5.1) using **fresh** `yarn build` output under `out/`, not a stale export.
- Reuse Kit validators (`validateProductionSitemapXml`, `assertExportHtmlHeadMatches`, catalog/SEO test batches).
- Add Phase 4.6 runner: `yarn test:phase4.6` (export HTML JSON-LD/FAQ parity + hardcoded path scan).
- **No** product feature changes; **no** content rewrites; **no** iframe/CSP relaxation.

---

## C. Build and Export

| Field | Evidence |
| --- | --- |
| Pre-build | Removed `.next` to avoid cache contention; no parallel `next dev` on same tree |
| Command | `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; yarn build` (PowerShell) |
| Exit code | **0** |
| Output dir | `out/` (regenerated) |
| Required artifacts | `out/index.html`, `out/hockey-bros.html`, `out/sitemap.xml`, `out/robots.txt` — **present** |
| Flat detail URL | `out/hockey-bros.html` exists; `out/hockey-bros/index.html` — **absent** (expected) |
| Notes | Contentlayer Windows warning; transient font fetch retries during build — build completed successfully |

---

## D. Sitemap XML Verification

**File:** `out/sitemap.xml`

| Check | Result |
| --- | --- |
| Parse (`parseSitemapUrlsetXml`) | PASS |
| URL count | **2** |
| URLs (set equality) | `https://ballgames.io`, `https://ballgames.io/hockey-bros` |
| Duplicates | none |
| Starter domain | absent |
| Legacy/blog in sitemap | absent |
| `validateProductionSitemapXml` on disk file | PASS |
| Portal `lastmod` | `2026-11-12` (matches `PortalHomeContent.updatedAt`) |

**Negative tests:** `P46-03` + existing `batch2` / `validate-seo` fixtures (one URL, third URL, duplicate, legacy host path, malformed XML) — **reject as expected**.

---

## E. HTML Metadata Verification

### Portal home (`out/index.html`)

| Field | Expected | Result |
| --- | --- | --- |
| Title | `Ball Games - Play Free Browser Games \| BallGames.io` | PASS |
| Description | frozen portal SEO description | PASS |
| Canonical | `https://ballgames.io` | PASS |
| Robots | `index, follow` | PASS |
| Open Graph title/description/url | aligned with resolver | PASS |
| `keywords` meta | absent | PASS |
| Starter domain in HTML | absent | PASS |

### Hockey Bros (`out/hockey-bros.html`)

| Field | Result |
| --- | --- |
| Title / description | matches `hockeyBrosDetail.seo` | PASS |
| Canonical | `gameUrl('hockey-bros')` | PASS |
| Robots | `index, follow` | PASS |
| OG URL | equals canonical | PASS |

### Legacy (`out/blog.html`, `about.html`, `projects.html`, `tags.html`)

| Field | Result |
| --- | --- |
| Robots | `noindex, follow` | PASS |
| Not in production sitemap | PASS (sitemap exact-two) |

### `out/robots.txt`

| Line | Result |
| --- | --- |
| `Host: https://ballgames.io` | PASS |
| `Sitemap: https://ballgames.io/sitemap.xml` | PASS |
| `Disallow: /search` | **absent** (R1 — no search route) | PASS |

---

## F. JSON-LD and FAQ

Validated from **exported HTML** (`P46-08`, `P46-09`), not TypeScript-only fixtures.

### Home (`index.html`)

| Type | Result |
| --- | --- |
| WebSite | PASS — `name=BallGames.io`, `url=https://ballgames.io`, no `SearchAction` / `potentialAction` |
| ItemList | PASS — single item **Hockey Bros**, URL `gameUrl('hockey-bros')` |
| FAQPage | PASS — **8** questions; `name` + `acceptedAnswer.text` match visible `<details>` |
| Organization | **omitted** (no verified evidence — not a failure) |

### Detail (`hockey-bros.html`)

| Type | Result |
| --- | --- |
| VideoGame | PASS — name/URL/description; no `aggregateRating` / `offers` |
| FAQPage | PASS — **7** items; visible FAQ parity |
| BreadcrumbList | PASS — Home → Hockey Bros; URLs via helpers |

**Forbidden fields:** `assertNoForbiddenJsonLdFields` on expected blocks — PASS. Script JSON-LD remains parseable.

---

## G. Indexability and Route Contract

| Route | Export HTML | Robots (head) | In sitemap |
| --- | --- | --- | --- |
| `/` | `index.html` | index, follow | yes |
| `/hockey-bros` | `hockey-bros.html` | index, follow | yes |
| Legacy blog/about/projects/tags | yes | noindex, follow | no |
| Other SSG routes (blog posts, tag pages) | yes | noindex (legacy policy) | no |

**Home structure (export):** one H1 `Ball Games`; five H2 headings match `PORTAL_HOME_SECTION_HEADINGS` order; SEO body block (intro + 5×H2 paragraphs) — `hockey bros` phrase **0** (card/ItemList may still say “Hockey Bros” per spec).

**Detail:** one H1 `Hockey Bros`; breadcrumbs + FAQ present.

---

## H. Hardcoded Path Scan

**Tool:** `scripts/phase4.6-hardcoded-paths.mjs`

| Item | Value |
| --- | --- |
| Roots | `app/**`, `components/**`, `lib/**` |
| Files scanned | 86 |
| Patterns | quoted `/hockey-bros`, `https://ballgames.io/hockey-bros` |
| Allowlist | `lib/urls/**`, `lib/catalog/instances/**`, catalog type/fixture files |
| Illegal hits | **0** |
| Self negative check | bad fixture detected; `gameUrl('hockey-bros')` not flagged |

---

## I. Catalog and Launcher Safety (read-only)

| Check | Evidence |
| --- | --- |
| EmbedPermission `embed-hockey-bros` | `status: unknown`, `cspFrameSrcVerified: false` |
| Production iframe gate | closed (`isProductionEmbedAllowed` — covered by P45-23) |
| CSP `frame-src` (next.config) | `giscus.app` only — no game embed host |
| MR-03 | **BLOCKED — EDITORIAL APPROVAL** (frozen intro “runs inside the tab” vs external-only); **non-blocking** for Phase 4.6 technical validation |
| RelatedGames self-exclusion | covered by `test:phase4.4` — PASS |

---

## J. Regression Tests

Environment: Node 22.14.0, `out/` from build above.

| Command | Exit | Result |
| --- | ---: | --- |
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS |
| `yarn test:batch2` | 0 | PASS |
| `yarn test:catalog` | 0 | PASS |
| `yarn test:phase4.3` | 0 | PASS |
| `yarn test:phase4.4` | 0 | PASS |
| `yarn test:phase4.5` | 0 | PASS (P45-01…24) |
| `yarn test:phase4.6` | 0 | PASS (P46-01…12 + hardcoded scan) |
| `yarn validate:catalog` | 0 | PASS |
| `yarn validate:seo` | 0 | PASS |
| `EXPORT=1 UNOPTIMIZED=1 yarn build` | 0 | PASS |
| `yarn validate:seo --export-dir=out` | 0 | PASS |

---

## K. Known Manual Review Items

| ID | Topic | Phase 4.6 technical impact | Phase 4.7 / release impact |
| --- | --- | --- | --- |
| MR-01 | Five H2 word count **682** vs product target **~950** (intro **57** words; FAQ **8**) | **MANUAL REVIEW** — not a build/test failure | Editorial / product acceptance |
| MR-02 | Organization JSON-LD omitted (no verified org evidence) | Allowed | Product decision if adding Organization |
| MR-03 | Frozen intro vs **external-only** play (embed not granted) | **BLOCKED — EDITORIAL APPROVAL** — gate unchanged | Blocks content “verified” narrative; iframe still blocked |
| MR-04 | Home grid **1** verified game vs 15–20 design target | Informational | Catalog expansion |
| MR-05 | Production iframe permission / CSP not independently verified | Gate **remains closed** | Required before in-tab embed |

---

## L. Validation Matrix (V46)

| ID | Item | Status | Evidence |
| --- | --- | --- | --- |
| V46-01 | Git baseline | PASS | `main` @ `4f8bcabb`, clean at start |
| V46-02 | Build environment | PASS | Node 22.14.0, Yarn 3.6.1, Next 15.5.12 |
| V46-03 | Static build | PASS | `yarn build` exit 0 |
| V46-04 | Export artifacts | PASS | flat HTML + sitemap + robots |
| V46-05 | Sitemap XML valid | PASS | `parseSitemapUrlsetXml` + production validator |
| V46-06 | Sitemap exact-two | PASS | 2 canonical URLs |
| V46-07 | Sitemap negatives | PASS | P46-03 + batch2 |
| V46-08 | Home metadata | PASS | P46-05 / validate-seo export |
| V46-09 | Detail metadata | PASS | P46-06 |
| V46-10 | Canonical / no dup | PASS | export head assertions |
| V46-11 | Robots indexable pages | PASS | home + detail |
| V46-12 | Legacy robots | PASS | P46-07 |
| V46-13 | robots.txt | PASS | Host + Sitemap |
| V46-14 | Home JSON-LD | PASS | P46-08 |
| V46-15 | Detail JSON-LD | PASS | P46-09 |
| V46-16 | FAQ 8+7 parity | PASS | HTML vs JSON-LD |
| V46-17 | Forbidden JSON-LD | PASS | no rating/review/offers |
| V46-18 | JSON-LD safety | PASS | P45-18 + parseable scripts |
| V46-19 | H1/H2 structure | PASS | P46-10, P46-11 |
| V46-20 | R1 index routes | PASS | only 2 in sitemap |
| V46-21 | Hardcoded paths | PASS | 0 illegal hits |
| V46-22 | Launcher / embed gate | PASS | unknown + CSP false |
| V46-23 | RelatedGames | PASS | phase4.4 tests |
| V46-24 | Full regression | PASS | table §J |
| V46-25 | Manual review items | MANUAL REVIEW | MR-01…05 retained |
| V46-26 | Phase 4.7 scope | PASS | not started |

---

## M. Final Gate

| Gate | Verdict |
| --- | --- |
| **Phase 4.6 Technical Validation** | **PASS WITH MANUAL REVIEW** |
| **Phase 4.7 Readiness** | **READY WITH MANUAL REVIEW** (engineering evidence complete; editorial/release blockers remain) |
| **R1 Production Release** | **NOT VERIFIED** (no live deployment validation; MR-03/05 and catalog scale block release sign-off) |

---

## Changed Files (Phase 4.6 validation delivery)

- `package.json` — `test:phase4.6`
- `scripts/phase4.6-hardcoded-paths.mjs`
- `scripts/phase4.6-test-entry.ts`
- `scripts/phase4.6-tests.mjs`
- `docs/agent/reports/phase4.6-validation.md` (this file)
- `docs/agent/STATUS.md`, `docs/agent/WORKLOG.md`

**Phase 4.7:** not started. No commit/push performed (await user authorization).
