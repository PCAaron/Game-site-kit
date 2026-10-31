# ADR 0001：模板基线 revision

- **状态：** Accepted
- **日期：** 2026-10-31
- **决策者：** Game Site Kit 维护者（Agent 审计记录）

## 背景

Game Site Kit 需要在不替换已验证的内容管线、不擅自升级依赖的前提下，从开源博客模板演进到支持 `game-portal`、`game-wiki`、`embedded-game` 的工程基座。必须先固定**可复现的 Git 与上游对应关系**，避免后续 Agent 任务引用错误的模板版本或能力假设。

候选上游：[timlrx/tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog)。

## 决策

1. **正式基线 Git commit：** `723499bf9e590b398ed888cffc834a9c54274d00`（`git describe` → `v2.4.0-9-g723499b`）。
2. **上游模板标识：** release tag **`v2.4.0`**（commit `de6326a9d8701cdca5907cf2d8822b92c93fb3d4`）；仓库历史包含该 tag 之后的合并提交（含依赖更新），但以 **`723499b` 树** 作为 Game Site Kit 工作基线。
3. **`package.json` version 字段** 保持 `2.4.0`，**不**在此 ADR 中升级 Next/React/Tailwind/contentlayer 主版本。
4. **内容管线：** 继续使用 **contentlayer2 + `data/**/*.mdx` + `contentlayer.config.ts`**；禁止在未立项的 ADR 中改为其他 CMS/管线。
5. **Game Site Kit 相对上游的必需工程补丁**（已含于基线）：
   - `scripts/next-with-init-cwd.mjs` 与 `package.json` 中 `dev`/`build`/`typecheck` 调整（Windows 可构建）。
6. **SEO 实现：** 保留现有 `app/layout.tsx`、`app/seo.tsx`、`sitemap.ts`、`robots.ts`、RSS postbuild 与文章 JSON-LD 机制；已知缺口（如 `canonicalUrl` 未接入、`siteUrl` 仍为演示域名）在后续站点实例任务中修复，**不在基线审计阶段重写**。

## 理由

- `723499b` 已通过 `yarn lint`、`yarn typecheck`、`yarn build`（及 Windows 上 `yarn dev`）验证，且明确记录 Phase 1 收尾意图。
- 与 tag `v2.4.0` 的 merge-base 为 `de6326a`，便于追溯上游变更与 cherry-pick。
- SEO 架构指南要求「先审计、再迭代」；固定 commit 满足 Agent 可复现验收。

## 后果

### 正面

- 所有后续任务可引用同一 commit 与审计报告 [`docs/agent/reports/template-audit.md`](../reports/template-audit.md)。
- 内容层与 SEO 端点边界清晰，利于按 archetype 增量扩展。

### 负面 / 约束

- 仍继承博客信息架构（`/blog`、`/tags`），距离三类游戏站需大量路由与内容模型工作。
- contentlayer2 在 Windows 上有官方警告；CI 应以 Linux（如 GitHub Actions Node 20）为主。
- 无 `test` 脚本，质量门禁仅 lint + typecheck + build。
- `specs/00-project-charter.md` 等 AGENTS 引用路径**尚未**入库，需在独立任务中补齐或更新 AGENTS 引用。

## 验证（2026-10-31）

在 commit `723499b` 工作树执行：

| 命令 | 结果 |
|---|---|
| `yarn typecheck` | PASS（exit 0） |
| `yarn lint` | PASS（exit 0） |
| `yarn build` | PASS（exit 0，60 SSG 页 + RSS） |
| `yarn dev` | PASS（Ready；端口可能非 3000） |

## 后续工作（不在本 ADR 范围）

1. 补齐 `specs/` 与阶段 Spec（AGENTS 要求）。
2. 首个站点实例（**ballgames.io** · `game-portal` 球类游戏盒子聚合）：`siteMetadata`、游戏目录/分类路由、页面策略表、各游戏 Play 外链、关闭未授权 analytics/comments。
3. 按 SEO 指南扩展 sitemap / JSON-LD / canonical，**不**替换 MDX 管线。
4. 第二个差异站点验证 Site Kit 抽象后再沉淀共享模块。
