# Phase 4.7 — Ballgames R1 Final Engineering Acceptance

**Date:** 2026-11-13  
**Project:** Game Site Kit · Ballgames R1 (`game-portal`)  
**Branch:** `main`  
**Validated SHA:** `339250db53cbd48e7b816b10a73f4730146ca89b`  
**Review baseline (authorized):** `339250db53cbd48e7b816b10a73f4730146ca89b` (HEAD equals baseline)  
**Method:** Read-only product code · full regression · fresh `EXPORT=1 UNOPTIMIZED=1` static export · export HTML/XML SEO evidence  

**Not in scope:** product fixes · deploy · Cloudflare/DNS · R2/R3 · content padding · embed grant relaxation.

---

## A. Executive Summary

Ballgames R1 Phase 4 **engineering delivery** is complete on `main` at `339250d`: Catalog, routes, Portal Home, PlayFrame/Launcher, Hockey Bros detail, Content/SEO integration, and Phase 4.6 export validation all re-pass at this SHA with **fresh** `out/` artifacts (build exit 0, `out/index.html` mtime **2026-11-13T11:51:09+08:00**).

**Phase 4 Engineering Acceptance:** **PASS WITH MANUAL REVIEW** — automated gates and export SEO contracts hold; editorial/product and live-production items remain.

**Ballgames R1 Product Acceptance:** **CONDITIONAL ACCEPTANCE** — frozen content and catalog scale gaps (MR-01, MR-03, MR-04) require product/editor sign-off; no content was invented or padded in this batch.

**R1 Production Release:** **NOT VERIFIED** — no live HTTPS, Cloudflare, production response headers, or third-party embed grant evidence.

---

## B. Git and Environment

| Field | Value |
| --- | --- |
| Branch | `main` |
| Before SHA (user baseline) | `339250db53cbd48e7b816b10a73f4730146ca89b` |
| Validated SHA | `339250db53cbd48e7b816b10a73f4730146ca89b` |
| Working tree | **clean** |
| `git diff --check` | exit **0** |
| Node.js | v22.14.0 |
| Yarn | 3.6.1 |
| Next.js (package.json) | 15.5.12 |
| Validation date | 2026-11-13 (UTC+8) |

**Commits since prior STATUS pointer `8bdb3e8`:** `339250d` — docs only (`docs(agent): align STATUS HEAD with main`); **no product code delta** for acceptance.

---

## C. Phase 4 Delivery Summary

| Phase | Scope | On `main` | Evidence |
| --- | --- | --- | --- |
| 4.0 | Spec review | DONE | [`phase-4.0-review.md`](phase-4.0-review.md) |
| 4.1 | Catalog architecture | DONE | `lib/catalog/**`, ADR 0002 |
| 4.2 | Routes / metadata | DONE | App `[slug]`, URL helpers, ADR 0003 |
| 4.3 | Homepage / PlayFrame | DONE | `test:phase4.3` @ `339250d` |
| 4.4 | Hockey Bros detail | DONE | [`phase4.4-hockey-bros-detail.md`](phase4.4-hockey-bros-detail.md), `test:phase4.4` |
| 4.5 | Content / SEO | DONE | [`phase4.5-content-seo-integration.md`](phase4.5-content-seo-integration.md) |
| 4.5.1 | Spec consistency closeout | DONE | [`phase4.5.1-spec-consistency-closeout.md`](phase4.5.1-spec-consistency-closeout.md) |
| 4.6 | Export / validation hardening | DONE | [`phase4.6-validation.md`](phase4.6-validation.md) |
| 4.7 | Final acceptance (this report) | **DONE** (documentation) | this file |

Known engineering exceptions retained: MR-01…MR-05 (see §I).

---

## D. R1 DoD Matrix (`ballgames-specs-v1.md` §8)

Evidence levels: **E1** executed @ `339250d` · **E2** source/export read @ `339250d` · **E4** manual/external required.

| ID | Spec | Requirement | Result | Evidence | Residual risk |
| --- | --- | --- | --- | --- | --- |
| DoD-01 | §5.2 / §6.2 | Unique H1 + `<p>` subtitle on home & detail | **PASS** | E1 — P46-10/11; `out/index.html`, `out/hockey-bros.html` | — |
| DoD-02 | §5.1 / §6.1 | Title ≤60, description ≤155, no keywords meta | **PASS** | E1 — P46-05/06; title len **51** | — |
| DoD-03 | §8 | Body word counts (no padding) | **MANUAL REVIEW** | E1 — `phase4.5-word-count-entry.ts` @ `339250d` | MR-01: five H2 **682** vs ~950 target |
| DoD-04 | §8 | Primary phrase + home SEO `hockey bros = 0` | **PARTIAL** | E1 — `ball games` count **3** in SEO body; `hockey bros` **0** in SEO body (P46-10) | **NOT VERIFIED:** full-page “first phrase” frequency ranking (no tool) |
| DoD-05 | §8 | Sitemap exactly 2 canonical URLs; ItemList Hockey Bros only | **PASS** | E1 — `out/sitemap.xml`; P46-02 | — |
| DoD-06 | §5.6 / §6.6 | FAQ 8 home / 7 detail + JSON-LD parity | **PASS** | E1 — P46-08/09 | — |
| DoD-07 | §8 | Card anchor = game name only | **PASS** | E2/E1 — export grid: single `<a>Hockey Bros</a>` to detail | MR-04: only one card |
| DoD-08 | §9 | R1 excludes `/search`, category routes, Disallow search | **PASS** | E2 — no R1 routes; `robots.txt` no Disallow; starter KBar search UI legacy only | R2 deferred |
| DoD-09 | §4.2 | Play area min-height 480px desktop, 16:9 narrow | **PASS** (code) **MANUAL REVIEW** (visual) | E2 — `PlayFrame.tsx` `md:min-h-[480px]` + `aspect-video`; export home `min-height:480px` on launcher shell | E4 — no PSI/screenshot |
| DoD-10 | §8 | Home 15–20 cards target; honest display | **MANUAL REVIEW** | E1 — export: **1** published home card | MR-04 |
| DoD-11 | §8 | iframe / ad slots / no sandbox·lazy | **PASS** (gate) / **MANUAL REVIEW** (literal iframe) | E1 — export: **0** `<iframe>`; external-only + `noopener noreferrer`; `DetailAdSlots` shells (border-dashed) in detail HTML | MR-05; intended capacity 1 iframe when granted |
| DoD-12 | §8 | No Controls/Note rows under PlayFrame | **PASS** | E2 — `PlayFrame` / `DetailPlayArea`; catalog “Controls” only in article body | — |
| DoD-13 | §6.7 | Related 12–16; button + scrollIntoView | **MANUAL REVIEW** | E2 — `RelatedGamesWithScroll`; export: **no** related section (0 eligible peers) | Data gap, not layout bug |
| DoD-14 | §8 | `gameUrl()`; no illegal hardcoded paths | **PASS** | E1 — `yarn test:phase4.6` P1-01 scan **0** illegal hits | — |
| DoD-15 | §8 | 8s fallback; detail page complete when embed blocked | **PASS** (unit) **MANUAL REVIEW** (UX) | E1 — `test:phase4.3`; export `hockey-bros.html` full body | E4 — live play/network |
| DoD-16 | §5.7 / §6.8 | JSON-LD types, no forbidden fields, no SearchAction | **PASS** | E1 — P46-08/09, LD-N negative tests | MR-02 Organization omitted by design |
| DoD-17 | §8 | LCP / PageSpeed | **MANUAL REVIEW — PERFORMANCE** | — | E4 — no authenticated PSI evidence |

**DoD tally (engineering classification):** PASS **11** · MANUAL REVIEW / PARTIAL **6** · FAIL **0** · NOT APPLICABLE (R2) **0** · NOT VERIFIED (subset) **2** (phrase ranking, production release).

---

## E. SEO Export Evidence (@ `339250d` build)

| Artifact | Check | Result |
| --- | --- | --- |
| `out/index.html` | Title, description, canonical `https://ballgames.io`, robots index, OG url = canonical | **PASS** E1 |
| `out/hockey-bros.html` | Detail metadata, canonical `/hockey-bros`, index | **PASS** E1 |
| `out/sitemap.xml` | Exact-two URLs | **PASS** E1 |
| `out/robots.txt` | Host + Sitemap; no `/search` Disallow | **PASS** E1 |
| Legacy | `about.html` etc. **noindex, follow**; not in sitemap | **PASS** E1 (P46-07) |
| JSON-LD home | WebSite, ItemList (Hockey Bros), FAQPage ×8 | **PASS** E1 |
| JSON-LD detail | VideoGame, FAQPage ×7, BreadcrumbList | **PASS** E1 |

---

## F. UI and Interaction Evidence

| Area | Engineering (export/code) | Manual review |
| --- | --- | --- |
| Home H1 / 5×H2 / 8 FAQ | **PASS** E1 | Mobile layout E4 |
| Launcher | External-only gate message + official link | scrollIntoView on home N/A (one card navigates to detail) E4 |
| PlayFrame | `aspect-video` + desktop min-height contract in code | 8s timeout UX E4 |
| Detail breadcrumbs | Two-level in export/tests | — |
| RelatedGames | Hidden when empty (R1 data) | Button+scroll when peers exist — E2 code, E4 interaction |
| Ad slots | Empty dashed placeholders, no SDK | Visual spacing E4 |

---

## G. Security and Embed Policy

| Check | Result | Evidence |
| --- | --- | --- |
| **Embed Security Gate** | **PASS** | `embed-hockey-bros.status: unknown`, `cspFrameSrcVerified: false`; `isProductionEmbedAllowed` → false |
| **Production Embed Permission** | **BLOCKED** | ADR 0004; Catalog `ballgames.ts` |
| **External Fallback** | **PASS** | Export: `target="_blank"` `rel="noopener noreferrer"` to `https://www.hockeybros.io/` |
| CSP game embed | Not allowlisted (starter `giscus` only) | ADR 0005 |

**Intended UI capacity:** 1 iframe per page when granted. **Actual production iframe count:** **0** in export (expected under gate).

---

## H. Regression and Build Evidence (SHA `339250d`)

Pre-build: removed `.next` cache; no parallel `next dev`.

| Command | Exit | Result |
| --- | ---: | --- |
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS |
| `yarn test:batch2` | 0 | PASS |
| `yarn test:catalog` | 0 | PASS |
| `yarn test:phase4.3` | 0 | PASS |
| `yarn test:phase4.4` | 0 | PASS |
| `yarn test:phase4.5` | 0 | PASS |
| `yarn test:phase4.6` | 0 | PASS |
| `yarn validate:catalog` | 0 | PASS |
| `yarn validate:seo` | 0 | PASS |
| `EXPORT=1 UNOPTIMIZED=1 yarn build` | 0 | PASS |
| `yarn validate:seo --export-dir=out` | 0 | PASS |
| `yarn test:phase4.6` (post-build) | 0 | PASS |

**Required artifacts:** `out/index.html`, `out/hockey-bros.html`, `out/sitemap.xml`, `out/robots.txt` — present.

### Content metrics (E1, not padded)

```json
{
  "homepage": {
    "introWordCount": 57,
    "fiveH2WordCount": 682,
    "faqCount": 8,
    "hockeyBrosInSeoBody": 0
  },
  "hockeyBros": {
    "bodyWordCount": 988,
    "faqCount": 7
  }
}
```

---

## I. Manual Review Register (MR-01 … MR-05)

### MR-01 — Homepage five H2 word count

| Field | Value |
| --- | --- |
| Description | Five H2 **682** words vs product target **~950**; intro **57** |
| Spec | `ballgames-specs-v1` §5.5, §8 |
| Code evidence | `ballgames-portal-home-production.ts` unchanged |
| Current status | **MANUAL REVIEW** — user decision: **do not pad** |
| Engineering impact | Non-blocking for build/tests |
| Release impact | Product/editorial acceptance |
| Owner | Product / editor |

### MR-02 — Organization JSON-LD

Omitted without verified org evidence — **PASS (by policy)**; release impact: optional enrichment only. Owner: product/legal.

### MR-03 — Frozen intro vs external-only play

| Field | Value |
| --- | --- |
| Description | Intro §5.4 narrative (“runs inside the tab” / in-frame play) vs production **external-only** while embed `unknown` |
| Spec | §5.4 vs ADR 0004 gate |
| Status | **BLOCKED — EDITORIAL APPROVAL** |
| Engineering impact | **No** — build/export pass |
| Release impact | **Yes** — content sign-off |
| Owner | Product / editor |

### MR-04 — Home grid card count

**1** verified published card vs 15–20 design target — honest catalog, no forged URLs. Owner: catalog/product.

### MR-05 — Production iframe permission

Gate remains **closed** until `granted` + `cspFrameSrcVerified` + deployment CSP — Owner: legal/ops + ADR 0005.

---

## J. Non-Goals and Deferred Items

R2/R3 routes (`/games`, `/search`, category hubs, extra detail pages) · Cloudflare deploy · DNS · live CSP headers · AdSense · analytics enablement on production · GSC · PSI/LCP capture · embed grant · catalog expansion.

---

## K. Final Verdict

| Gate | Verdict |
| --- | --- |
| **Phase 4 Engineering Acceptance** | **PASS WITH MANUAL REVIEW** |
| **Ballgames R1 Product Acceptance** | **CONDITIONAL ACCEPTANCE** |
| **R1 Production Release** | **NOT VERIFIED** |

---

## L. Next Recommended Actions

1. Product/editor: resolve **MR-03** (intro copy vs external-only) and acknowledge **MR-01** without auto-padding.  
2. Catalog: plan verified launches for **MR-04** (no fake cards).  
3. Legal/ops: **MR-05** embed + CSP verification before enabling production iframe.  
4. Deploy track (separate authorization): Cloudflare Pages, `ballgames.io` HTTPS, live `robots`/headers audit.  
5. Optional: PSI/LCP capture on staging or production URL (E4).

---

## M. Phase 4.7 Acceptance Matrix (F47-01 … F47-30)

| ID | Item | Status | Lvl | Reference |
| --- | --- | --- | --- | --- |
| F47-01 | Git SHA | PASS | E1 | `339250d` |
| F47-02 | Environment | PASS | E1 | Node/Yarn/Next |
| F47-03 | Typecheck | PASS | E1 | exit 0 |
| F47-04 | Batch1/2 | PASS | E1 | exit 0 |
| F47-05 | Catalog validation | PASS | E1 | exit 0 |
| F47-06 | Phase 4.3–4.6 | PASS | E1 | exit 0 |
| F47-07 | Static export | PASS | E1 | build exit 0 |
| F47-08 | exact-two sitemap | PASS | E1 | `out/sitemap.xml` |
| F47-09 | Home metadata | PASS | E1 | P46-05 |
| F47-10 | Detail metadata | PASS | E1 | P46-06 |
| F47-11 | Legacy noindex | PASS | E1 | P46-07 |
| F47-12 | robots.txt | PASS | E1 | P46-04 |
| F47-13 | Home JSON-LD | PASS | E1 | P46-08 |
| F47-14 | Detail JSON-LD | PASS | E1 | P46-09 |
| F47-15 | FAQ parity | PASS | E1 | P46-08/09 |
| F47-16 | URL helper scan | PASS | E1 | phase4.6 AST |
| F47-17 | Home H1/H2/body | MANUAL REVIEW | E1 | word count MR-01 |
| F47-18 | Detail H1/crumbs | PASS | E1 | export + tests |
| F47-19 | Launcher/PlayFrame | PASS | E1/E2 | external-only |
| F47-20 | 8s timeout | PASS | E1 | phase4.3 |
| F47-21 | RelatedGames | MANUAL REVIEW | E2 | zero peers |
| F47-22 | Ad slots | PASS | E1 | dashed shells in export |
| F47-23 | Responsive UI | MANUAL REVIEW — UI | E4 | no screenshots |
| F47-24 | Embed/licence | PASS gate / BLOCKED embed | E1/E2 | Catalog |
| F47-25 | MR-01…05 | RECORDED | E1 | §I |
| F47-26 | Legacy/blog retained | PASS | E1 | sitemap exact-two |
| F47-27 | Build SHA consistency | PASS | E1 | clean tree + fresh out |
| F47-28 | Layered verdicts | PASS | — | §K |
| F47-29 | Report complete | PASS | — | this file |
| F47-30 | No unauthorized product edits | PASS | E1 | docs-only delta pending commit |

---

## Changed Files (Phase 4.7)

- `docs/agent/reports/phase-4-final-validation.md` (this file)  
- `docs/agent/STATUS.md`  
- `docs/agent/WORKLOG.md`  

**No commit or push performed** (await user authorization).
