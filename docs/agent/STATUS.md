# Agent Project Status

- **Current phase:** Phase 3 — 最小 SEO Foundation（**not started**；Phase 2 + **Phase 2.2** 文档已完成）
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Last updated:** 2026-11-02
- **Current reviewed branch:** `spec`（HEAD `aca82e6b0c8c8467295fba274777ac6b043948e1` at review start）
- **Pages deployment branch:** `main`（依据 `.github/workflows/pages.yml`；不等同于当前检出分支）

## Phase summary

| Phase | 名称 | 状态 | 证据 |
|---|---|---|---|
| 0 | 模板基线审计 | **completed** / **validated** | [`docs/agent/reports/template-audit.md`](reports/template-audit.md)、ADR 0001 |
| 1 | Agent 文档与工作流基础 | **completed** / **validated** | [`specs/phases/01-agent-workflow-foundation.md`](../../specs/phases/01-agent-workflow-foundation.md) |
| 2 | SEO 页面模型与内容契约 | **completed** / **validated**（文档） | [`specs/phases/02-seo-page-model-and-content-contract.md`](../../specs/phases/02-seo-page-model-and-content-contract.md) |
| 2.2 | Instance-to-Kit 契约对齐 | **completed**（文档） | 同上 §Phase 2.2；Catalog/Detail 分层、Launcher、canonical 无尾斜杠 |
| 3 | 最小 SEO Foundation | **specified / implementation gated / not started** | [`specs/phases/03-minimum-seo-foundation.md`](../../specs/phases/03-minimum-seo-foundation.md)；ADR 0003 仍 Proposed |

## Phase 2 交付物（ballgames · game-portal）

| 文档 | 路径 |
|---|---|
| 阶段 Spec | [`specs/phases/02-seo-page-model-and-content-contract.md`](../../specs/phases/02-seo-page-model-and-content-contract.md) |
| 页面类型 | [`specs/01-site-archetypes.md`](../../specs/01-site-archetypes.md) |
| 内容模型 | [`specs/04-config-and-content-models.md`](../../specs/04-config-and-content-models.md) |
| SEO 契约 | [`specs/seo/`](../../specs/seo/)（01–05） |
| 实例索引 | [`specs/instances/ballgames/README.md`](../../specs/instances/ballgames/README.md) |
| P0 实例 Spec | [`specs/ballgames/ballgames-specs-v1.md`](../../specs/ballgames/ballgames-specs-v1.md) |

## Current technical baseline（validated）

- **栈：** Next.js 15.5.12、React 19.2.4、Tailwind 4、contentlayer2、Yarn 3.6.1。
- **信息架构：** 仍为博客；**portal 页面与 Game 模型未实现**（**proposed**）。
- **SEO 代码：** 博客型 sitemap/metadata **validated**；portal 策略表与 indexable 规则**仅文档**。

## Current blockers

- Phase 3 Spec 已准备；应用实现等待 ADR 0003 的 SiteInstance、PortalHome source、Blog isolation、Phase 3/4 integration split 与 trailing-slash 策略获得具体用户决定。
- 生产 exact-two sitemap 与页面 JSON-LD 依赖 Phase 4 的真实 `/hockey-bros` 页面和可见内容；不得在 Phase 3 伪造。
- **MANUAL REVIEW（阻塞上线）：** 正式域名 HTTPS、embed 许可、品牌/OG 素材、`launchUrl` 事实核验。

## Recommended next action

1. 用户逐项确认 [`ADR 0003`](decisions/0003-site-instance-url-and-seo-source.md) 的 `User Decision Required`。
2. 获批后，按 [`Phase 3 Spec`](../../specs/phases/03-minimum-seo-foundation.md) 执行最小 SEO Foundation。
3. Phase 4 仍只作为后续建议：Catalog + 首页/游戏详情模板；未开始、未批准。

## Last verified checks

| Command | Result | Notes |
|---|---|---|
| `yarn lint` | PASS | 2026-10-30 |
| `yarn typecheck` | PASS | 2026-10-30 |
| `yarn build` | PASS | 2026-10-30，60 SSG 页 |
| Phase 2 文档路径校验 | PASS | 2026-10-31 |
| Phase 2.2 契约对齐 | PASS | 2026-11-02 文档-only；`git diff` 无应用代码 |

## Human decisions required

- ADR 0003：最小 SiteInstance 契约。
- PortalHome：独立 PortalHomeContent，或批准等价单一来源。
- Blog isolation：保留 Blog/Authors 能力但排除出 ballgames R1 SEO surface。
- Phase 3/4 split：Phase 3 做 contract/fixture 验证，Phase 4 页面存在后验收 production exact-two 与页面 JSON-LD。
- Trailing slash：允许 Phase 3 先验证当前 Next/export 行为，再选满足无尾斜杠公开 URL 的最小方案。
- ballgames.io 生产 **canonical** 与 HTTPS。
- Hockey Bros / 第三方 **iframe 或外链** 许可记录（[`Provider` 模型](../../specs/04-config-and-content-models.md)）。
- P0 上线前 `indexable` 人工放行策略。
