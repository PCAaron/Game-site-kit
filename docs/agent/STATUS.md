# Agent Project Status

- **Current phase:** Phase 4 — ballgames.io R1 Implementation（**Phase 4.0 文档 — 待复核**；业务代码 **NOT STARTED**）
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Current HEAD：** `b45b3cc`（`docs(phase4): Phase 4.0 targeted spec and agent doc revision` — **文档**；非代码验证）
- **Phase 3 Code Validation Baseline：** `f2ea1b2ecfc5259270f9c27ba5873607b82f8c1d9`（lastmod 无时区兼容 + batch2 **20** tests）· 更早：`29e526b` · `1ef3f2e` · `8b3f51a` · `0f74c67` · `4514c3f`
- **Documentation sync（非验证基线）：** `866343e`（4.0 初稿）· **`b45b3cc`**（4.0 定点修订）
- **Last updated:** 2026-11-04
- **Current reviewed branch:** `main`
- **Pages deployment branch：** `main`（[`.github/workflows/pages.yml`](../../.github/workflows/pages.yml) — **历史验证路径，非 R1 正式部署目标**）
- **工作区：** 干净（与 `origin/main` 同步 — 推送后）

## Phase summary

| Phase | 名称                     | 状态                                                                 | 证据                                                                                                                              |
| ----- | ------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 0     | 模板基线审计             | **completed** / **validated**                                        | [`template-audit.md`](reports/template-audit.md)                                                                                  |
| 1     | Agent 文档与工作流基础   | **completed** / **validated**                                        | Phase 1 Spec                                                                                                                      |
| 2     | SEO 页面模型与内容契约   | **completed**（文档）                                                | Phase 2 Spec                                                                                                                      |
| 2.2   | Instance-to-Kit 契约对齐 | **completed**（文档）                                                | Phase 2 §2.2                                                                                                                      |
| 3     | 最小 SEO Foundation      | **completed**（**READY WITH EXTERNAL BLOCKERS**）                    | [`phase-3-final-validation.md`](reports/phase-3-final-validation.md) v5                                                           |
| 4     | ballgames R1 页面        | **4.0 Spec 已创建** / 4.0 文档验收 **待复核** / 4.1+ **NOT STARTED** | [`specs/phases/04-ballgames-r1.md`](../../specs/phases/04-ballgames-r1.md) · [`phase-4.0-review.md`](reports/phase-4.0-review.md) |
| —     | Shared Core              | **deferred**                                                         | 非获批阶段                                                                                                                        |

## Phase 3 能力摘要（与 Spec §13.1 一致）

| 区域                                           | 状态        | 说明                                                                               |
| ---------------------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| SiteInstance / PortalHomeContent / URL helpers | **PASS**    | `test:batch1`、`validate:seo`（历史 @ 代码基线链）                                 |
| Metadata / canonical / OG / robots             | **PASS**    | `test:batch2`、export HTML 校验                                                    |
| Sitemap eligibility + XML                      | **PARTIAL** | 机制 PASS（**@ `f2ea1b2`**）；**production 0 URL**（draft portal + 无 game route） |
| JSON-LD                                        | **PARTIAL** | fixture PASS；**页面集成 → Phase 4.6**                                             |
| Legacy indexability                            | **PASS**    | DEC-003-F                                                                          |
| Static export 本地校验                         | **PARTIAL** | `@8b3f51a` §C 矩阵（历史）                                                         |
| Pages live HTTP                                | **BLOCKED** | 未 host 实测                                                                       |

## Phase 4.0 摘要

| 项                   | 状态                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 4.0 Spec 创建  | **DONE** @ `866343e`                                                                                  |
| Phase 4.0 文档验收   | **待复核**（定点修订后由用户/审查方确认）                                                             |
| Phase 4 业务页面实现 | **NOT STARTED**                                                                                       |
| Phase 4.1 授权       | **PENDING**                                                                                           |
| 部署 gate            | GitHub Pages CI **非** Phase 4 前置；**NOT VERIFIED** 保留；正式目标 **Cloudflare Pages**（部署阶段） |

## ADR 0003（摘要）

DEC-003-A–C **Applied**；DEC-003-D **Partial**（production exact-two / page JSON-LD → **Phase 4**）；DEC-003-E **F1**；DEC-003-F **Applied**。Live HTTP **BLOCKED**。

## Blockers（R1 发布，非 Phase 4.0 Spec）

- Embed 许可与生产 CSP → **MANUAL REVIEW**（ADR 0004 Proposed）。
- Production exact-two sitemap + 页面 JSON-LD → **Phase 4.6**（机制已就绪）。
- GitHub Actions：**configure-pages** — **NOT VERIFIED**（**非 Phase 4 启动 gate**；不得改写为 PASS）。
- Node 20 Actions build → **NOT VERIFIED**。
- Cloudflare Pages 构建 / 域名 / live HTTP → **NOT STARTED**（部署阶段）。
- Live HTTP（GitHub Pages 路径）→ **BLOCKED**。

## Recommended next action

1. **复核 Phase 4.0 定点修订** — [`specs/phases/04-ballgames-r1.md`](../../specs/phases/04-ballgames-r1.md) · [`phase-4.0-review.md`](reports/phase-4.0-review.md)。
2. 验收通过后，用户明确授权 **Phase 4.1**（Catalog / Data Contract）再启动业务代码。
3. Phase 3 机制已 **READY WITH EXTERNAL BLOCKERS**；GitHub Pages 修复 **不**作为 Phase 4 必要条件。

## Last verified checks（代码 — 历史，非 Current HEAD 重跑）

**Node 22.14.0 @ `f2ea1b2`（§F）** — [`phase-3-final-validation.md`](reports/phase-3-final-validation.md) §F 表。

| Command             | Exit | Result               |
| ------------------- | ---- | -------------------- |
| `yarn typecheck`    | 0    | PASS                 |
| `yarn test:batch2`  | 0    | PASS（**20** tests） |
| `yarn validate:seo` | 0    | PASS                 |

**未在 Phase 4.0 任务中重跑上述命令**（无业务代码变更）。

**CI @ Current HEAD：** **NOT VERIFIED**。**Live HTTP：** **BLOCKED**。

详见 WORKLOG。
