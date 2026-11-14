# BG-1.2.2.1 — Homepage Closeout Report

**Task:** BG-1.2.2.1 Homepage Integration Hardening & Legacy UI Isolation  
**Date:** 2026-11-14

## A. Git Baseline

| Field | Value |
| --- | --- |
| Branch | `main` |
| Before SHA | `200280fc93492e16fd389ed5f3d52e4c9ebb398c` |
| Validation SHA | `200280fc93492e16fd389ed5f3d52e4c9ebb398c` (local changes uncommitted) |
| Working Tree | Modified layout/header/footer/catalog/tests + new `lib/site/resolve-site-chrome.ts` |
| Node | v24.9.0 |
| Yarn | 3.6.1 (via corepack) |

## B. Findings & Fixes

### FIX-01 — Unified Footer

| | |
| --- | --- |
| **Problem** | `RootLayout` rendered legacy `Footer` while `PortalHome` also rendered `PortalHomeSiteFooter` → two footers on homepage. |
| **Files** | `components/Footer.tsx`, `components/portal/PortalHome.tsx`, `lib/site/types.ts`, `lib/site/resolve-site-chrome.ts` |
| **Fix** | `Footer` selects portal vs legacy via `resolveSiteChrome()`; removed inline footer from `PortalHome`. |
| **Tests** | `FOOTER-01`, `FOOTER-02` in `phase4.6-test-entry.ts`; export HTML: 1×`<footer>` on index + hockey-bros. |
| **Risk** | Future non–game-portal instances must set `chrome.footerVariant: 'legacy'` when archetype defaults change. |

### FIX-02 — Legacy Header Search / About

| | |
| --- | --- |
| **Problem** | `SearchButton` always visible; About in nav/footer despite legacy `/about` content. |
| **Files** | `components/Header.tsx`, `MobileNav.tsx`, `SearchButton.tsx`, `components/portal/PortalHomeSiteFooter.tsx`, `lib/site/resolve-site-chrome.ts` |
| **Fix** | `game-portal` defaults: `searchEnabled: false`, `includeLegacyAboutNav: false`; shared `resolveHeaderNavLinks()`. Legacy `SearchButton` logic retained for instances with `searchEnabled: true`. |
| **Tests** | Export index: 0× `aria-label="Search"`; nav About removed from portal footer. |
| **Risk** | Wiki/blog prototypes need explicit `chrome` overrides when added. |

### FIX-03 — Dual-game iframe switch tests

| | |
| --- | --- |
| **Problem** | Missing A→B granted iframe integration coverage. |
| **Files** | `scripts/phase4.3-component-tests.tsx` |
| **Fix** | `PLAY-02`, `PLAY-N01` with test-only granted fixtures (`fixture-game-a/b`); no production catalog writes. |
| **Tests** | `yarn test:phase4.3` — PLAY-02, PLAY-N01 pass; Launcher/PlayFrame unchanged (generation isolation already correct). |
| **Risk** | None for production embed gate. |

### FIX-04 — Product-visible phrase frequency

| | |
| --- | --- |
| **Problem** | `visibleDomText` overstated “browser visible” and ignored hidden/sr-only. |
| **Files** | `scripts/phase4.6-test-entry.ts` |
| **Fix** | `productVisibleDomText()` Level-2 SSR rules; renamed SEO-HOME-01; negative fixtures SEO-N06–N10, SEO-HOME-06, FOOTER-01/02. |
| **Tests** | Fresh `out/index.html` — hockey bros count 1; Level 3 browser: **MANUAL REVIEW**. |
| **Risk** | Level 2 does not validate computed CSS media queries. |

### FIX-05 — Catalog calendar date validation

| | |
| --- | --- |
| **Problem** | `Date.parse` accepted impossible dates (e.g. 2026-02-30). |
| **Files** | `lib/catalog/validate.ts`, `lib/catalog/index.ts`, `scripts/catalog-test-entry.ts` |
| **Fix** | `isValidIsoCalendarDate()` with UTC round-trip equality. |
| **Tests** | Positive/negative unit tests + `CAT-N05b`. |
| **Risk** | None; production catalog dates unchanged. |

### FIX-06 — Editorial / product capability gate

| | |
| --- | --- |
| **Problem** | Frozen copy claims exceed verified production capability. |
| **Files** | This report §H; **no** content or catalog permission changes. |
| **Fix** | Documented manual gate matrix; engineering tests may pass while product review remains open. |
| **Risk** | R1 release still blocked until editorial alignment. |

## C. Shared Kit Impact

| Area | Changed? | Notes |
| --- | --- | --- |
| RootLayout | No | Still single `<Footer />`. |
| Footer | Yes | Instance-aware portal vs legacy. |
| Header / MobileNav | Yes | Instance chrome for search + nav filtering. |
| SiteInstance | Yes | Optional `chrome` + `resolveSiteChrome()` defaults per archetype. |

**Non-Ballgames safety:** Legacy footer and search default to **on** when archetype is not `game-portal` (future instances). Explicit `chrome` overrides supported.

## D. Footer / Header

| Check | Result |
| --- | --- |
| Homepage Footer Count | **1** |
| Legacy Footer Visible (index) | **No** (no Tailwind Theme / starter author block) |
| Legacy Search Visible | **No** |
| About Link Visible (R1 nav/footer) | **No** |
| Mobile/Desktop Navigation Consistent | **Yes** (same `resolveHeaderNavLinks`) |

## E. Launcher (fixture evidence)

| Field | Value |
| --- | --- |
| Fixture Game A | `fixture-game-a` → `https://embed.example.com/a` |
| Fixture Game B | `fixture-game-b` → `https://embed.example.com/b` |
| Iframe Count Before | 1 |
| Iframe Count After B select | 1 |
| Iframe Src Before | `…/a` |
| Iframe Src After | `…/b` |
| Stale Timer Handling | Stale `load` on gen-1 does not clear gen-2 loading; B timeout at 8s with B URL |

**Not** evidence of production Football Bros iframe grant.

## F. SEO

| Field | Value |
| --- | --- |
| Visible Hockey Bros Count (Level 2) | **1** |
| First Card Anchor | **Hockey Bros** |
| Footer Count (export) | **1** |
| Required JSON-LD | WebSite + ItemList + FAQPage (unchanged) |
| Canonical | `https://ballgames.io` |
| Sitemap URLs | exact-two: `/`, `/hockey-bros` |

## G. Catalog

| Field | Value |
| --- | --- |
| Invalid Calendar Dates Rejected | **PASS** (2026-02-30, etc.) |
| Valid Leap Day Accepted | **PASS** (2024-02-29) |
| Existing Production Catalog Valid | **PASS** (`validate:catalog` exit 0) |

## H. Editorial Gate

| Claim | Capability | Status |
| --- | --- | --- |
| Pick a card, game loads in place | Production iframe **BLOCKED** | **REVIEW REQUIRED** |
| Every card carries mode tag | Not implemented | **REVIEW REQUIRED** |
| 15–20 game cards | **1** verified home card | **REVIEW REQUIRED** |
| Browser game launch | Safe external link | **CONDITIONAL** |
| Football Bros default player | Configured; name shown | **PASS** |

| Gate | Status |
| --- | --- |
| Frozen Copy | **UNCHANGED** |
| In-page Embed Claim | **REVIEW REQUIRED** |
| Mode Tag Claim | **REVIEW REQUIRED** |
| Production Home Card Target | **NOT MET** |
| Production iframe | **BLOCKED** |

## I. Validation

| Command | Exit Code | Evidence |
| --- | ---: | --- |
| `git diff --check` | 0 | Clean |
| `yarn typecheck` | 0 | |
| `yarn test:batch1` | 0 | 12 tests |
| `yarn test:batch2` | 0 | 30 tests |
| `yarn test:catalog` | 0 | 46 tests |
| `yarn validate:catalog` | 0 | BLOCKED iframe noted |
| `yarn test:phase4.3` | 0 | 28 tests incl. PLAY-02 |
| `yarn test:phase4.4` | 0 | 25 tests |
| `yarn test:phase4.5` | 0 | 24 tests |
| `yarn validate:seo` | 0 | contract |
| `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; yarn build` | 0 | fresh `out/` |
| `yarn validate:seo --export-dir=out` | 0 | contract+artifacts |
| `yarn test:phase4.6` | 0 | 36 tests, FOOTER-01/02 |

**BROWSER VISUAL CHECK:** MANUAL REVIEW (no automated Playwright evidence this run).

## J. Final Verdict

| Gate | Result |
| --- | --- |
| BG-1.2.2.1 Engineering | **PASS WITH MANUAL REVIEW** |
| BG-1.2.2 Closeout | **CLOSED** (with product manual gates) |
| BG-1.2.3 Readiness | **READY WITH GATES** |
| Production iframe | **BLOCKED** |
| R1 Production Release | **NOT VERIFIED** |

## K. Commit status update (2026-11-14)

BG-1.2.2.1 changes were subsequently committed to `main` as **`129961e1207a9e7be5a19a00a7c9ed94ba39e31d`**.

The original local validation baseline was **`200280f`**. Historical execution evidence in §I above remains unchanged and is **not** claimed to have been re-run verbatim on `129961e` unless a later report (e.g. BG-1.2.3) states otherwise.