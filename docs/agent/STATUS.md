# Agent Project Status

- **Current phase:** Phase 3 — 最小 SEO Foundation（**not started**；Phase 2 文档已完成）
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Last updated:** 2026-10-31
- **Current branch:** `main`

## Phase summary

| Phase | 名称 | 状态 | 证据 |
|---|---|---|---|
| 0 | 模板基线审计 | **completed** / **validated** | [`docs/agent/reports/template-audit.md`](reports/template-audit.md)、ADR 0001 |
| 1 | Agent 文档与工作流基础 | **completed** / **validated** | [`specs/phases/01-agent-workflow-foundation.md`](../../specs/phases/01-agent-workflow-foundation.md) |
| 2 | SEO 页面模型与内容契约 | **completed** / **validated**（文档） | [`specs/phases/02-seo-page-model-and-content-contract.md`](../../specs/phases/02-seo-page-model-and-content-contract.md) |
| 3 | 最小 SEO Foundation | **not started** | SEO 指南 §20 |

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

- 无自动化阻塞 Phase 3 文档/实现准备。
- **MANUAL REVIEW（阻塞上线）：** 正式域名 HTTPS、embed 许可、品牌/OG 素材、`launchUrl` 事实核验。

## Next approved action

1. **Phase 3：** 统一 `siteUrl`、canonical/metadata 生成、indexable 与 sitemap 过滤（见 [`specs/seo/02-url-canonical-indexing.md`](../../specs/seo/02-url-canonical-indexing.md)、[`specs/seo/04-internal-linking-sitemap.md`](../../specs/seo/04-internal-linking-sitemap.md)）。
2. **Phase 4：** Catalog + 首页/游戏详情模板（见 [`specs/ballgames/ballgames-specs-v1.md`](../../specs/ballgames/ballgames-specs-v1.md)）。

## Last verified checks

| Command | Result | Notes |
|---|---|---|
| `yarn lint` | PASS | 2026-10-30 |
| `yarn typecheck` | PASS | 2026-10-30 |
| `yarn build` | PASS | 2026-10-30，60 SSG 页 |
| Phase 2 文档路径校验 | PASS | 2026-10-31 本任务 |

## Human decisions required

- ballgames.io 生产 **canonical** 与 HTTPS。
- Hockey Bros / 第三方 **iframe 或外链** 许可记录（[`Provider` 模型](../../specs/04-config-and-content-models.md)）。
- P0 上线前 `indexable` 人工放行策略。
