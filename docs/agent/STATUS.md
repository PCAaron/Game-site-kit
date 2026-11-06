# Agent Project Status

- **Current phase:** Phase 4.1.2 — Catalog Contract & PortalHome Alignment（**DONE** @ 本任务 HEAD）；Phase 4.2 **NOT STARTED**
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Current Git HEAD（文档对齐任务）：** 见 WORKLOG 2026-11-06 条目
- **Last substantive Phase 4.0 revision:** `87adf9866c8f8bb6f9eb4898b8618ced8d8abf49`
- **Phase 3 Code Validation Baseline：** `f2ea1b2ecfc5259270f9c27ba5873607b82f8c1d9`
- **Last updated:** 2026-11-06
- **Current reviewed branch:** `main`
- **Catalog 实现基线 commit：** `4ea8e14cb0c3a048029b5cbeca8efa626db91d3d`（`feat(catalog): add Phase 4.1 data contract and validation`）

## Phase summary

| Phase | 名称                     | 状态                                                                                     | 证据                                                                                                              |
| ----- | ------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 4     | ballgames R1 页面        | **4.0 DONE** / **4.1 + 4.1.2 DONE** / 4.2+ **NOT STARTED** | [`04-ballgames-r1.md`](../../specs/phases/04-ballgames-r1.md) · [`04.1-catalog-architecture-alignment.md`](../../specs/phases/04.1-catalog-architecture-alignment.md) · [`lib/catalog/`](../../lib/catalog/) |

## Phase 4.0 / 4.1 摘要

| 项                     | 状态                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 4.1 架构对齐 Spec | **DONE**（2026-11-06；仅文档）                                                                        |
| ADR 0002 / 0004        | **Accepted**（R1 TS Catalog + Launcher/embed 原则）                                                   |
| Phase 4.1 Catalog schema | **PASS**（`yarn typecheck`、`yarn test:catalog`、`yarn validate:catalog`） |
| Readiness 语义         | **代码已对齐** Info / Warning / 生产 iframe BLOCKED（`PRODUCTION_IFRAME_NOT_READY`） |
| PortalHome Reader      | **`getPortalHomeContent()`** @ `lib/site/get-portal-home-content.ts` |
| 生产首页行数           | **1** / 15–20 **设计目标**（Info；非 schema Error）                                                   |
| 生产 iframe            | **未就绪**（embed `unknown`；CSP 未验证 — **生产门禁**，非 Catalog 读取阻塞）                         |
| Phase 4 业务页面       | **NOT STARTED**（4.2+）                                                                               |

## ADR 0003（摘要）

DEC-003-A–C **Applied**；DEC-003-D **Partial**；DEC-003-E **F1**；DEC-003-F **Applied**。

## Blockers（R1 上线 — 非 Phase 4.1 文档 gate）

- 首页 **设计目标** 15–20：当前 **1** 条 verified `published`（Hockey Bros）— **不得**伪造 URL 补足。
- 其余 Bros slug 保持 `draft` → **MANUAL REVIEW**（内容/URL 核实）。
- **生产 iframe** → embed granted + CSP **MANUAL REVIEW**（与 Catalog schema PASS 分离）。
- Production exact-two sitemap + 页面 JSON-LD → **Phase 4.5–4.6**。
- Cloudflare / live HTTP → **NOT STARTED**。

## Recommended next action

1. 用户审查 Phase 4.1.2 代码与文档。
2. 授权后进入 **Phase 4.2** 页面实现（Portal Home / Game Detail UI）。
3. **不要**在未授权时自动开 Phase 4.2。

## Last verified checks

**Phase 4.1.2（2026-11-06）：** `yarn typecheck`、`yarn test:catalog`、`yarn validate:catalog`、`git diff --check` — 见 WORKLOG 条目。

详见 WORKLOG。
