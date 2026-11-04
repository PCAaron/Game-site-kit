# Agent Project Status

- **Current phase:** Phase 4.1 — Catalog / Data Contract（**schema PASS；生产首页数量 / embed BLOCKED**；4.2 **NOT STARTED**）
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Current Git HEAD（任务开始）：** `5e6b6b1b3ac01901ce1fb3aea77ff0495266662b`（`docs(phase4): sync agent STATUS HEAD to 87adf98` — **pointer-only documentation synchronization commit**，不是实质性 Phase 4.0 修订）
- **Last substantive Phase 4.0 revision:** `87adf9866c8f8bb6f9eb4898b8618ced8d8abf49`（`docs(phase4): Phase 4.0 targeted spec and agent doc revision` — **文档**；非代码验证）
- **Phase 3 Code Validation Baseline：** `f2ea1b2ecfc5259270f9c27ba5873607b82f8c1d9`（lastmod 无时区兼容 + batch2 **20** tests）· 更早：`29e526b` · `1ef3f2e` · `8b3f51a` · `0f74c67` · `4514c3f`
- **Documentation sync（非验证基线）：** `866343e`（4.0 初稿）· **`87adf98`**（4.0 定点修订）· **`5e6b6b1`**（pointer-only HEAD 同步）
- **Last updated:** 2026-11-04
- **Current reviewed branch:** `main`
- **Pages deployment branch：** `main`（[`.github/workflows/pages.yml`](../../.github/workflows/pages.yml) — **历史验证路径，非 R1 正式部署目标**）
- **工作区：** Phase 4.1 Catalog 本提交落地（推送后与 `origin/main` 同步；4.2 **NOT STARTED**）

## Phase summary

| Phase | 名称                     | 状态                                                                                     | 证据                                                                                                              |
| ----- | ------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 0     | 模板基线审计             | **completed** / **validated**                                                            | [`template-audit.md`](reports/template-audit.md)                                                                  |
| 1     | Agent 文档与工作流基础   | **completed** / **validated**                                                            | Phase 1 Spec                                                                                                      |
| 2     | SEO 页面模型与内容契约   | **completed**（文档）                                                                    | Phase 2 Spec                                                                                                      |
| 2.2   | Instance-to-Kit 契约对齐 | **completed**（文档）                                                                    | Phase 2 §2.2                                                                                                      |
| 3     | 最小 SEO Foundation      | **completed**（**READY WITH EXTERNAL BLOCKERS**）                                        | [`phase-3-final-validation.md`](reports/phase-3-final-validation.md) v5                                           |
| 4     | ballgames R1 页面        | **4.0 定点修订 DONE** / **4.1 Catalog schema PASS WITH BLOCKERS** / 4.2+ **NOT STARTED** | [`specs/phases/04-ballgames-r1.md`](../../specs/phases/04-ballgames-r1.md) · [`lib/catalog/`](../../lib/catalog/) |
| —     | Shared Core              | **deferred**                                                                             | 非获批阶段                                                                                                        |

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

## Phase 4.0 / 4.1 摘要

| 项                     | 状态                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 4.0 Spec 创建    | **DONE** @ `866343e`                                                                                  |
| Last substantive 4.0   | **`87adf98`**（定点修订）；`5e6b6b1` 仅为 pointer-only HEAD 同步                                      |
| Phase 4.1 授权         | **Satisfied**（本任务）                                                                               |
| Phase 4.1 Catalog 契约 | **PASS WITH BLOCKERS**（类型/校验/测试 PASS；生产首页 1/15–20；embed **unknown**）                    |
| Phase 4 业务页面实现   | **NOT STARTED**（4.2+）                                                                               |
| 部署 gate              | GitHub Pages CI **非** Phase 4 前置；**NOT VERIFIED** 保留；正式目标 **Cloudflare Pages**（部署阶段） |

## ADR 0003（摘要）

DEC-003-A–C **Applied**；DEC-003-D **Partial**（production exact-two / page JSON-LD → **Phase 4**）；DEC-003-E **F1**；DEC-003-F **Applied**。Live HTTP **BLOCKED**。

## Blockers（R1 发布）

- Catalog 生产首页卡：**1** 条已核实 `published`（Hockey Bros）；目标 15–20 → **BLOCKED**（不得用虚构 URL 补足）。
- 其余 9 条 Spec 列出的 Bros slug 保持 `draft`，无 `primaryUrl` → **MANUAL REVIEW**。
- Embed 许可与生产 CSP → **BLOCKED**（`unknown` ≠ `granted`；`cspFrameSrcVerified: false`）。
- Hockey Bros 详情正文中的 studio / 上线日期等 → **VERIFICATION REQUIRED**（未写入 `publishedAt`）。
- Production exact-two sitemap + 页面 JSON-LD → **Phase 4.6**（机制已就绪；页面未接）。
- GitHub Actions：**configure-pages** — **NOT VERIFIED**（**非 Phase 4 启动 gate**；不得改写为 PASS）。
- Node 20 Actions build → **NOT VERIFIED**。
- Cloudflare Pages 构建 / 域名 / live HTTP → **NOT STARTED**（部署阶段）。
- Live HTTP（GitHub Pages 路径）→ **BLOCKED**。

## Recommended next action

1. **审查 Phase 4.1 Catalog / Data Contract** — `lib/catalog/`、`yarn test:catalog`、`yarn validate:catalog`。
2. **不要**自动进入 Phase 4.2（路由 / metadata）。等待用户明确授权。
3. 生产首页 15–20 卡与 iframe 仍依赖人工核验 `primaryUrl` / Provider / EmbedPermission + CSP。

## Last verified checks（Phase 4.1 — Node 22.14.0，本提交）

| Command                    | Exit | Result                            |
| -------------------------- | ---- | --------------------------------- |
| `yarn typecheck`           | 0    | PASS                              |
| `yarn test:catalog`        | 0    | PASS（**18** tests）              |
| `yarn test:batch1`         | 0    | PASS（**10** tests）              |
| `yarn test:batch2`         | 0    | PASS（**20** tests）              |
| `yarn validate:seo`        | 0    | PASS                              |
| `yarn validate:catalog`    | 0    | PASS（schema；readiness BLOCKED） |
| `yarn next lint --dir lib` | 0    | PASS                              |
| `git diff --check`         | 0    | PASS                              |

**CI：** **NOT VERIFIED**。**Live HTTP：** **BLOCKED**。**export build：** **NOT RUN**（本批次无页面变更）。

详见 WORKLOG。
