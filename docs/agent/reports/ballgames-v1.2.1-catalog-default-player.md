# BG-1.2.1 — Catalog & Default Player + `gamePath`

**Date:** 2026-11-13  
**Task:** BG-1.2.1（授权基线 `a8b4f59f34a490cefc503f05d47d1aa041e10efa`）

## A. Baseline

| Field | Value |
| --- | --- |
| Branch | `main` |
| Before SHA | `a8b4f59f34a490cefc503f05d47d1aa041e10efa` |
| Validated SHA | `a8b4f59f34a490cefc503f05d47d1aa041e10efa`（工作区未 commit） |
| Node | v22.14.0 |
| Yarn | 3.6.1 |
| Working Tree | Modified — BG-1.2.1 实施（未 commit） |

## B. Scope

**完成：**

- Task A：四项规范定点修订（§7.1 / §7.3 / §2.3、`verifiedAt`）
- Task B：`gamePath(slug)` + 共享 `validateGameSlug`；`GameCard` 站内 `Link` 改用相对路径
- Task C：`DEFAULT_PLAYER_GAME = football-bros`（`catalog.defaultPlayerGameSlug` + 常量）；`pickDefaultLauncherGame(catalog, homeGames)`
- Task D：Football Bros Catalog 行（verified launch + `technicalEmbedVerification.status: reported`）；生产 iframe 仍 closed
- Task E：R1 路由 / sitemap / ItemList 回归（仍为 Hockey Bros only）
- 测试扩充与 Phase 4.4 D26 断言更新

**未完成（BG-1.2.2+）：**

- 首页正式 SEO 正文 / UI v1.2
- JSON-LD Offer / Organization 输出
- 生产 embed 授权与 CSP 核实
- Cloudflare / 上线验证

## C. Spec Corrections

| ID | File | Change |
| --- | --- | --- |
| A-01 | `specs/ballgames/ballgames-specs-v1.2.md` §7.1 | `app/`/`components/`/`lib/` 静态检查 + iframe 语义验证；禁止误用全页 grep |
| A-02 | 同上 §7.3 | JSON-LD 分类型验收；Organization / Offer 条件省略 |
| A-03 | 同上 §2.3 + `specs/seo/02-url-canonical-indexing.md` | `gamePath`/`gameUrl` 共用路径策略 |
| A-04 | `specs/ballgames/content/hockey-bros-r1.md` + `specs/seo/06-verified-offer-and-organization.md` | `verifiedAt` = 实际核实日，非定稿日 |

## D. URL Contract

| Helper | Behavior |
| --- | --- |
| `gamePath('hockey-bros')` | `/hockey-bros` |
| `gameUrl('hockey-bros')` | `https://ballgames.io/hockey-bros`（不变） |
| `GameCard` navigate link | `href={gamePath(slug)}` |
| Canonical / JSON-LD / sitemap | 仍 `gameUrl` |

**Tests:** `scripts/batch1-test-entry.ts` URL-P/N 矩阵；`phase4.3` T01；`phase4.4` D26

## E. Catalog and Default Player

| Field | Value |
| --- | --- |
| `DEFAULT_PLAYER_GAME` | `football-bros` (`BALLGAMES_DEFAULT_PLAYER_GAME_SLUG` + `catalog.defaultPlayerGameSlug`) |
| Source | `https://footballbros.io/` |
| Technical Demo | `technicalEmbedVerification.status: reported`（§7.4 声明；非 `verified`） |
| Production Permission | 无 `embedPermissionId`；global gate **unknown** |
| Production CSP | 未核实 |
| Production Presentation | `external-only`（`primaryUrl` 保留外链回退） |

Home grid 仍仅 **Hockey Bros** `published` + `showOnHome`；Football Bros `draft` + `showOnHome: false`.

## F. Security

| Layer | Football Bros | Hockey Bros |
| --- | --- | --- |
| Demo Technical Validation | **reported**（本地声明） | n/a |
| Production Embed Authorization | **Not Verified** | **unknown** |
| Production CSP Verification | **false / Not Verified** | **false** |
| Production iframe | **BLOCKED** | **BLOCKED** |

`isProductionEmbedAllowed` 未修改门禁逻辑；reported demo 不 bypass permission/CSP。

## G. SEO Regression

- Sitemap：**exact-two**（origin + `/hockey-bros`）
- ItemList：仍 **Hockey Bros** only
- 无 `/football-bros` 详情路由（`generateStaticParams` 仅 hockey-bros）
- Canonical 绝对 URL 未变

## H. Test Results

| Command | Exit |
| --- | --- |
| `yarn typecheck` | 0 |
| `yarn test:batch1` | 0 |
| `yarn test:batch2` | 0 |
| `yarn test:catalog` | 0 |
| `yarn validate:catalog` | 0 |
| `yarn validate:seo` | 0 |
| `yarn test:phase4.3` | 0 |
| `yarn test:phase4.4` | 0 |
| `yarn test:phase4.5` | 0 |
| `yarn test:phase4.6` | 0 |
| `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; yarn build` | 0 |
| `yarn validate:seo --export-dir=out` | 0 |
| `git diff --check` | 0 |

## I. Remaining Risks

- Football Bros 商业 embed 许可与生产 CSP 仍待外部证据
- 首页卡片规模 / 正式 v1.2 文案与 UI 未实施
- Organization / Verified Offer JSON-LD 仍 gated（BG-1.2.2/1.2.3）
- 其余 draft 卡片来源未核实

## J. Final Gate

```text
BG-1.2.1: PASS WITH MANUAL GATES
BG-1.2.2 Readiness: READY WITH GATES
Production iframe: BLOCKED
R1 Production Release: NOT VERIFIED
```
