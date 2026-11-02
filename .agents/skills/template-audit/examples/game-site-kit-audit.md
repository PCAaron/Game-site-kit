# Worked example — Game Site Kit Phase 0 (reference only)

This example summarizes evidence from the **completed** Game Site Kit Phase 0 template audit. It illustrates how to apply the `template-audit` skill; it is **not** a definition of what every template must provide.

**Primary sources (read for full detail):**

- [`docs/agent/reports/template-audit.md`](../../../../docs/agent/reports/template-audit.md) — validated audit report
- [`docs/agent/decisions/0001-template-baseline.md`](../../../../docs/agent/decisions/0001-template-baseline.md) — Accepted baseline ADR
- [`specs/phases/00-template-audit.md`](../../../../specs/phases/00-template-audit.md) — Phase 0 spec

**Baseline commit (Phase 0):** `723499bf9e590b398ed888cffc834a9c54274d00` (`v2.4.0-9-g723499b`)

**Target context (Game Site Kit):** Evolve blog lineage into Site Kit supporting `game-portal`, `game-wiki`, `embedded-game`; first instance ballgames.io-style portal — **archetypes not implemented at baseline**.

---

## Condensed executive summary

Upstream **Tailwind Nextjs Starter Blog** lineage with Game Site Kit patches (Windows `INIT_CWD` build script, `typecheck`, agent docs). **contentlayer2** MDX pipeline and core SEO endpoints (**sitemap**, **robots**, layout metadata, article JSON-LD) are **Validated** for reuse with adaptation. Information architecture remains **blog** (`/blog`, `/tags`) — **Missing** for game portal routes/models at baseline. **Recommendation for Site Kit baseline (Phase 0):** adopt fixed commit `723499b` as engineering baseline (**Adopt with Conditions** for product archetypes, `siteUrl`, canonical wiring, embed policy).

---

## Sample dimension table (abbreviated)

| Dimension | Representative finding | Status | Evidence |
|---|---|---|---|
| Repository baseline | Fixed SHA, upstream tag `v2.4.0`, fork remote | Validated | ADR 0001; audit §1 |
| Tech stack | Next 15.5.12, React 19, Yarn 3.6.1, contentlayer2 0.5.8 | Validated | audit §2–3; `package.json` at baseline |
| Build system | `dev`/`build`/`typecheck`/`lint`; no `test` script | Partial | audit §2; Missing test harness |
| Routing | App Router; blog/tags/projects/about | Validated | audit §4 |
| Content system | `data/**/*.mdx`, Blog/Authors types | Validated | audit §5 |
| SEO foundation | sitemap/robots/metadata; `canonicalUrl` not in metadata | Partial | audit §6 |
| Extensibility | Single `siteMetadata.js`; demo domain | Partial | audit §6, §13 |
| Deployment | `EXPORT`/`BASE_PATH`/`UNOPTIMIZED`; GitHub Pages CI Node 20 | Validated | audit §2, §4; headers weak under static export |
| Security & license | MIT; CSP/XFO block general iframe embed | Validated + Risk | audit §8, §11 |
| Agent compatibility | lint/typecheck/build documented; Phase 0 added STATUS/ADR | Partial | audit §12–13; `specs/` added in later phases |

---

## Historical validation commands (2026-10-31, Windows @ `723499b`)

| Command | Exit | Result |
|---|---|---|
| `yarn typecheck` | 0 | PASS |
| `yarn lint` | 0 | PASS |
| `yarn build` | 0 | PASS (60 SSG pages; contentlayer Windows warning) |
| `yarn dev` | — | PASS |
| `yarn test` | — | N/A (script absent) |

**Not run in Phase 0 report:** full `EXPORT=1` export sweep, `yarn analyze`, e2e.

Re-running audits on a **later** commit requires a fresh command table; do not copy this table without re-execution.

---

## Risks called out in Phase 0 (illustrative)

| Risk | Status | Note |
|---|---|---|
| contentlayer2 on Windows | Risk | Prefer Linux CI |
| Demo `siteUrl` | Risk | Wrong canonical/sitemap until instance config |
| Static export vs API/headers | Risk | Newsletter API, CSP at CDN |
| iframe / CSP for embedded-game | Risk | Default DENY; embed not whitelisted |
| No automated tests | Risk | Regression via lint/typecheck/build only |

---

## Using this example in a new audit

1. Replace all SHAs, versions, and paths with the **candidate** repository tree.
2. Replace target requirements with the **user-supplied** project (not Game Site Kit unless that is the adopter).
3. Keep status discipline: Phase 0 **Validated** items apply only to `723499b` evidence, not to arbitrary starters.
