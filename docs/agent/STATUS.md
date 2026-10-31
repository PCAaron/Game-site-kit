# Agent Project Status

- **Current phase:** Template baseline audit（文档化完成；**未**开始三类站点原型或 **ballgames.io** `game-portal` 改造）
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Last updated:** 2026-10-31
- **Current branch:** `main`（跟踪 `pcaaron/main`；工作区可能存在与文档路径相关的未提交变更）

## Accepted milestones

| Milestone | 说明 | 证据 |
|---|---|---|
| Template baseline ADR | 固定上游与 GSK 基线 commit | `docs/agent/decisions/0001-template-baseline.md` |
| Template audit report | 只读审计 + 可复现验证 | `docs/agent/reports/template-audit.md` |
| Windows build/dev fix | 含于基线 commit `723499b` | `scripts/next-with-init-cwd.mjs` |

## Current blockers

- **无自动化阻塞项**（lint / typecheck / build 在本机通过）。
- **MANUAL REVIEW：** 演示 `siteUrl`、MDX、图片、favicon 与第三方服务配置仍属模板默认值；**ballgames.io** 聚合站的品牌、各游戏 **Play / launchUrl**、素材许可与是否 iframe 需人工确认。
- **文档缺口：** `specs/00-project-charter.md`、`specs/phases/` 不存在；AGENTS.md 仍引用这些路径。

## Last verified checks（2026-10-31）

| Command | Result | Notes |
|---|---|---|
| `yarn typecheck` | PASS | exit 0 |
| `yarn lint` | PASS | exit 0；`next lint` 弃用提示 |
| `yarn build` | PASS | 60 SSG 页；RSS postbuild；Contentlayer Windows 警告 |
| `yarn dev` | PASS | Ready；3000 占用时使用 3001 |
| `yarn test` | N/A | 无脚本 |

## Next recommended task（未自动启动）

1. **补齐治理文档：** 添加 `specs/00-project-charter.md` 与 Phase 2 阶段 Spec（或更新 AGENTS 引用至现有 `docs/game-site-kit-seo-architecture-and-template-iteration-guide.md` 中的阶段定义）。
2. **首个站点实例（ballgames.io · `game-portal`）：** 球类游戏盒子聚合 — 游戏目录/分类/详情与 Play 外链；更新 `siteMetadata` 与路由；关闭未启用的 analytics/comments/newsletter；**不**替换 contentlayer 管线、**不**升级依赖。
3. **SEO 实例化：** 修正 `siteUrl`、接入文章 `canonicalUrl`、扩展 sitemap 与页面策略表（按 SEO 指南第 6–11 节）。

## Human decisions required

- 正式生产域名与 HTTPS canonical 策略。
- **ballgames.io** 正式 URL（HTTPS/canonical）与各收录游戏的 **Play / launchUrl**（默认新标签页；iframe 需单独许可与 CSP ADR）。
- 品牌与 OG 素材来源及许可记录。
