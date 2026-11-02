# Agent Project Status

- **Current phase:** Phase 3 — 最小 SEO Foundation（**specified / implementation gated / not started**）
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Last updated:** 2026-11-02
- **Current reviewed branch:** `spec`
- **Phase 3 readiness remediation base commit:** `aa8e1db5c1fd670b9ad0db7d5a4990f754891a51`
- **Historical architecture remediation baseline:** `aca82e6b0c8c8467295fba274777ac6b043948e1`
- **Prior documentation review HEAD:** `534db2c7bf55b1c43b727bd50949fff594ba8e79`
- **ADR 0003 decision landing HEAD:** `04a61a5bab09bdb7977dc67c56b581f90cb59c3d`（编辑基线；文档更新后见 `git rev-parse HEAD`）
- **Pages deployment branch:** `main`（依据 `.github/workflows/pages.yml`；不等同于当前检出分支）

## Phase summary

| Phase | 名称 | 状态 | 证据 |
|---|---|---|---|
| 0 | 模板基线审计 | **completed** / **validated** | [`docs/agent/reports/template-audit.md`](reports/template-audit.md)、ADR 0001 |
| 1 | Agent 文档与工作流基础 | **completed** / **validated** | [`specs/phases/01-agent-workflow-foundation.md`](../../specs/phases/01-agent-workflow-foundation.md) |
| 2 | SEO 页面模型与内容契约 | **completed** / **validated**（文档） | [`specs/phases/02-seo-page-model-and-content-contract.md`](../../specs/phases/02-seo-page-model-and-content-contract.md) |
| 2.2 | Instance-to-Kit 契约对齐 | **completed**（文档） | 同上 §Phase 2.2 |
| 3 | 最小 SEO Foundation | **specified / implementation gated / not started** | [`specs/phases/03-minimum-seo-foundation.md`](../../specs/phases/03-minimum-seo-foundation.md)；ADR 0003 **Accepted**（DEC-003-A–E） |
| 4 | 首个 game-portal 实例（ballgames R1） | **not started** | Phase 3 机制后另行立项 |
| — | Shared Core | **not an approved phase / deferred** | 不得复用 Phase 1 编号 |

## ADR 0003 decision status（2026-11-02）

| Decision | Approved option | ADR / docs |
|---|---|---|
| DEC-003-A | A-1 最小 SiteInstance | Accepted |
| DEC-003-B | B-1 PortalHomeContent + `publicationStatus` 映射 | Accepted |
| DEC-003-C | C-1 Blog/Authors 保留、R1 隔离 | Accepted |
| DEC-003-D | D-1 Phase 3 机制 / Phase 4 页面集成 | Accepted |
| DEC-003-E | E-1 只读 trailing-slash 调查 | Investigation recorded — **配置/部署方案未批准** |

批准 DEC-003 **不代表** Phase 3 应用代码已开始。

## Current blockers

- Phase 3 **实现未开始**（无 SiteInstance、URL helper、sitemap 机制等代码变更）。
- **Trailing-slash 公开 URL 实施方案**须依据 Architecture Review §20 **单独批准**（调查已完成，不等于改 `trailingSlash`）。
- 生产 exact-two sitemap 与页面 JSON-LD 依赖 Phase 4 的 `/` 与 `/hockey-bros` 真实页面。
- **MANUAL REVIEW（阻塞上线）：** 正式域名 HTTPS、embed 许可、品牌/OG 素材、`launchUrl` 事实核验。

## Recommended next action

1. 立项 Phase 3 最小 SEO Foundation 实现（按 [`Phase 3 Spec`](../../specs/phases/03-minimum-seo-foundation.md) Step 2+）。
2. 在授权环境运行 CI 等价 export build，补全 §20 未实测项；再单独决策 trailing-slash 方案（F1–F4）。
3. Phase 4 仍为后续：Catalog + 首页/游戏详情模板 — **not started**。

## Last verified checks

| Command | Result | Notes |
|---|---|---|
| `yarn lint` | PASS | 2026-10-30 |
| `yarn typecheck` | PASS | 2026-10-30 |
| `yarn build` | PASS | 2026-10-30；**本任务未运行** |
| ADR 0003 文档落地验证 | 见 WORKLOG 2026-11-02 DEC-003 条目 | 本任务执行 `git diff --check`、prettier check |

## Human decisions still required

- ADR 0002：Content/Catalog 物理存储与 archived lifecycle（Phase 4 前）。
- **Trailing-slash / static export 实施方案**（在 §20 调查基础上单独批准）。
- Legacy blog 路由：继续公开、noindex 或构建隔离（DEC-003-C 未覆盖）。
- ballgames.io 生产 **canonical** 与 HTTPS。
- Hockey Bros / 第三方 **iframe 或外链** 许可记录。
- P0 上线前 `indexable` 人工放行策略。
