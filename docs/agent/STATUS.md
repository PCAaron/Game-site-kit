# Agent Project Status

- **Current phase：** Phase 4.2 / 4.2.1（**DONE**）；Phase 4.3 Homepage / PlayFrame（**DONE — 未提交**）；Phase 4.4+ **NOT STARTED**
- **Baseline commit（审查基线）：** `7d3ef1146a4edaa8a72467e59fe9452fc2b39be6`；**Phase 4.3 工作区基线：** 同上（实施起点）
- **Last substantive Phase 4.0 revision:** `87adf9866c8f8bb6f9eb4898b8618ced8d8abf49`
- **Phase 3 Code Validation Baseline：** `f2ea1b2ecfc5259270f9c27ba5873607b82f8c1d9`
- **Last updated:** 2026-11-11（Phase 4.3 实施）
- **Specs 治理：** [`specs-governance-review.md`](reports/specs-governance-review.md)（2026-11-09）；Phase 4.x 批次权威 [`04-ballgames-r1.md`](../../specs/phases/04-ballgames-r1.md) **§13**
- **Current reviewed branch:** `main`
- **Catalog 实现基线 commit：** `4ea8e14cb0c3a048029b5cbeca8efa626db91d3d`（`feat(catalog): add Phase 4.1 data contract and validation`）

## Phase summary

| Phase | 名称                     | 状态                                                                                     | 证据                                                                                                              |
| ----- | ------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 4     | ballgames R1 页面        | **4.0–4.3 DONE（4.3 待提交）** / 4.4+ **NOT STARTED** | [`04-ballgames-r1.md`](../../specs/phases/04-ballgames-r1.md) · [`phase4.3-homepage-playframe.md`](reports/phase4.3-homepage-playframe.md) |

## Phase 4.0 / 4.1 摘要

| 项                     | 状态                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 4.1 架构对齐 Spec | **DONE**（2026-11-06；**4.1.3** 已与 4.1.2 代码对齐修订）                                              |
| Phase 4.1.3 验证收口    | **DONE** — `validateCatalogSeo` 接入 `yarn validate:seo`；PortalHome fixture 不从 `lib/site/index` 导出；文档 / ADR / Spec `hosted` 分类修订 |
| ADR 0002 / 0004        | **Accepted**（R1 TS Catalog + Launcher/embed 原则）                                                   |
| Phase 4.1 Catalog schema + SEO 入口 | **PASS**（`yarn typecheck`、`yarn test:catalog`、`yarn validate:catalog`、`yarn validate:seo`） |
| Readiness 语义         | **代码已对齐** Info / Warning / 生产 iframe BLOCKED（`PRODUCTION_IFRAME_NOT_READY`） |
| PortalHome Reader      | **`getPortalHomeContent()`** @ `lib/site/get-portal-home-content.ts` |
| 生产首页行数           | **1** / 15–20 **设计目标**（Info；非 schema Error）                                                   |
| 生产 iframe            | **未就绪**（embed `unknown`；CSP 未验证 — **生产门禁**，非 Catalog 读取阻塞）                         |
| Phase 4.2 路由 / Metadata | **DONE** — `app/[slug]`、`/hockey-bros` SSG、`isAppRoutePath`、production descriptors、`resolveGameDetailPageSeo`；**4.2.1** `title.absolute`、R1 详情路由 allowlist（`R1_DETAIL_CONTENT_SLUG`） |
| Phase 4.3 首页 / Launcher | **DONE** — `app/page.tsx` + `components/portal/*`；生产 iframe **仍 BLOCKED**（embed unknown） |
| Phase 4.4+ 详情 UI     | **NOT STARTED**                                                                                       |
| Phase 4.1 系列冻结     | **FROZEN**（4.1.x 公共 Adapter 未改；4.2 仅消费）                                                    |

## ADR 0003（摘要）

DEC-003-A–C **Applied**；DEC-003-D **Partial**；DEC-003-E **F1**；DEC-003-F **Applied**。

## Blockers（R1 上线 — 非 Phase 4.1 文档 gate）

- 首页 **设计目标** 15–20：当前 **1** 条 verified `published`（Hockey Bros）— **不得**伪造 URL 补足。
- 其余 Bros slug 保持 `draft` → **MANUAL REVIEW**（内容/URL 核实）。
- **生产 iframe** → embed granted + CSP **MANUAL REVIEW**（与 Catalog schema PASS 分离）。
- Production exact-two sitemap + 页面 JSON-LD → **Phase 4.5–4.6**。
- Cloudflare / live HTTP → **NOT STARTED**。

## Recommended next action

1. 用户审阅 Phase 4.3 报告 [`phase4.3-homepage-playframe.md`](reports/phase4.3-homepage-playframe.md) 并决定是否提交 Git。
2. 授权后进入 **Phase 4.4 — Hockey Bros Detail UI**（正文、Related、复用 Launcher 组件）。
3. **不要**在未授权时开启 4.5 indexable / exact-two 生产收口或生产 iframe 放行。

## Last verified checks

**Phase 4.2.1（2026-11-11）：** 见 WORKLOG 2026-11-11 条目（含 `validate:seo --export-dir=out` 若已跑 static export）。

**Phase 4.2（2026-11-09）：** 见 WORKLOG 2026-11-09 条目。

**Phase 4.1.3（2026-11-06）：** `yarn typecheck`、`yarn test:catalog`、`yarn validate:catalog`、`yarn validate:seo`、`git diff --check` — 见 WORKLOG 条目。

详见 WORKLOG。
