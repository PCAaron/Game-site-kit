# BG-1.2.3 — Verified Offer / Organization Evidence-Gated Structured Data

**任务：** BG-1.2.3 · **日期：** 2026-11-14 · **基线：** `129961e` on `main`

## A. Git Baseline

| 项 | 值 |
| --- | --- |
| Branch | `main` |
| Task baseline HEAD | `129961e1207a9e7be5a19a00a7c9ed94ba39e31d` |
| 工作区 | 白名单 9 文件 + `docs/agent/*` 报告；用户既有 `app/tag-data.json`（未动） |
| Node | 24.9.0 |
| Package manager | npm 11.6.0（环境无 `yarn` PATH；等价 `npm run`） |
| 白名单 | **PASS** — 无 `specs/`、`app/`、instances、部署配置改动 |

## B. Implementation Summary

### VerifiedFreeOffer

- `lib/catalog/types.ts`：`FreeOfferEvidence` 判别联合 + `CatalogGame.freeOffer?`
- `lib/catalog/validate.ts`：`assertFreeOfferEvidence`；错误码 `CATALOG_FREE_OFFER_*`；`isVerifiedFreeOfferEligible()`
- 禁止从 launch/embed/正文自动推断 `verified`

### Organization

- `lib/site/types.ts`：`OrganizationEvidence` + `SiteInstance.organizationEvidence?`
- `lib/site/validate-site-instance.ts`：`assertOrganizationEvidence`；`isVerifiedOrganizationEvidenceEligible()`
- `url` 必须匹配 `canonicalOrigin`

### JSON-LD

- `buildVideoGameJsonLd`：仅在 `isVerifiedFreeOfferEligible` 时输出最小 `Offer`
- `buildOrganizationJsonLd`：仅 verified 证据时输出最小 `Organization`
- `buildPortalHomeJsonLdBlocks`：可选附加 Organization
- `assertNoForbiddenJsonLdFields`：**保留**全局 `offers` 禁止（负面测试兼容）
- `assertJsonLdBlocksMeetEvidenceContract`：导出/生成证据门控
- `assertMinimalVerifiedOfferShape` / `assertMinimalOrganizationShape`：结构白名单

### 生产默认行为

- Hockey Bros：**无** `freeOffer` → **无** `VideoGame.offers`
- Ballgames Site：**无** `organizationEvidence` → 首页 **无** Organization

## C. Evidence Gate Matrix

| 门禁项 | 生产状态 | 说明 |
| --- | --- | --- |
| Free fact evidence | **未核实 / 未入库** | 工程能力就绪 |
| Evidence URL | N/A | 无生产记录 |
| Verified date | N/A | 无生产记录 |
| Game source URL match | N/A | 无生产记录 |
| Brand evidence (Organization) | **未核实 / 未入库** | 工程能力就绪 |
| Organization eligibility | **省略** | 首页 JSON-LD 无 Organization |
| Production embed permission | **unknown** | 未因 Offer 变更 |
| Production CSP | **false** | BLOCKED |

## D. Test Matrix

| 套件 | 结果 | 备注 |
| --- | --- | --- |
| OFF-P / OFF-N | **PASS** | catalog + phase4.5 |
| ORG-P / ORG-N | **PASS** | phase4.5 + phase4.6 |
| P45 | **PASS** | 37 tests |
| P46 | **PASS** | 39 tests（含 LD-N02 证据化调整） |
| Catalog | **PASS** | 55 tests |
| SEO validate contract | **PASS** | |
| SEO validate + `out/` | **PASS** | |
| Export build | **PASS** | `EXPORT=1 UNOPTIMIZED=1` |

命令退出码均为 **0**（见 §F）。

## E. Export Artifacts

| 文件 | 关键断言 | 结果 |
| --- | --- | --- |
| `out/index.html` | WebSite + ItemList + FAQPage；Organization **0**；无 offers / SearchAction / 评分 | **PASS** |
| `out/hockey-bros.html` | VideoGame + FAQPage + BreadcrumbList；无 Organization；VideoGame **无** offers | **PASS** |
| `out/sitemap.xml` | 恰好 2 URL | **PASS** |
| `out/robots.txt` | ballgames.io Host/Sitemap | **PASS** |

## F. Regression Commands

| 命令 | Exit |
| --- | --- |
| `git diff --check` | 0 |
| `npm run typecheck` | 0 |
| `npm run test:catalog` | 0 |
| `npm run validate:catalog` | 0 |
| `npm run test:phase4.5` | 0 |
| `npm run validate:seo` | 0 |
| `npm run test:batch1` | 0 |
| `npm run test:batch2` | 0 |
| `npm run test:phase4.3` | 0 |
| `npm run test:phase4.4` | 0 |
| `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; npm run build` | 0 |
| `npm run validate:seo -- --export-dir=out` | 0 |
| `npm run test:phase4.6` | 0 |

## G. Manual Review Gates

| 编号 | 状态 |
| --- | --- |
| MR-01 首页正文长度 | 保留 |
| MR-02 Organization 品牌依据 | 无证据，JSON-LD 省略 |
| MR-03 loads in place vs external-only | 保留 |
| MR-04 verified 卡 1 张 | 保留 |
| MR-05 生产 iframe/CSP | **BLOCKED** |
| MR-06 mode 标签 | 保留 |
| MR-07 Cloudflare/真机 | **NOT VERIFIED** |
| MR-08 免费事实人工审计 | 工程就绪；**无生产 freeOffer** |

## H. Final Verdict

| Gate | Result |
| --- | --- |
| BG-1.2.3 Engineering | **PASS WITH MANUAL REVIEW** |
| Verified Offer Contract | **PASS** |
| Organization Contract | **PASS** |
| Ballgames R1 Product Acceptance | **CONDITIONAL ACCEPTANCE** |
| Production iframe | **BLOCKED** |
| R1 Production Release | **NOT VERIFIED** |