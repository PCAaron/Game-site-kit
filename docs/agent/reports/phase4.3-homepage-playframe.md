# Phase 4.3 — Homepage / PlayFrame 验收报告

## A. 基线

| 项 | 值 |
|---|---|
| Branch | `main` |
| Base Commit | `7d3ef1146a4edaa8a72467e59fe9452fc2b39be6` |
| 完成后的 Commit | **未提交**（工作区变更） |
| Scope | Phase 4.3 — Portal Home UI、GameCard / GameGrid、PlayFrame、Launcher |

## B. 修改清单

| 文件 | 类型 | 用途 |
|---|---|---|
| `app/page.tsx` | Modified | 接入 PortalHome Reader + Catalog；`generateMetadata` 经 SEO Resolver |
| `components/portal/PortalHome.tsx` | Added | Hero + Launcher 组合 |
| `components/portal/Launcher.tsx` | Added | 单 PlayFrame 状态与游戏选择 |
| `components/portal/PlayFrame.tsx` | Added | 16:9 容器、embed 门禁、8s UX、外链兜底 |
| `components/portal/GameCard.tsx` | Added | `cardAction` 分支（Link vs button） |
| `components/portal/GameGrid.tsx` | Added | 响应式网格与空状态 |
| `lib/portal/play-presentation.ts` | Added | 生产 iframe 判定与 Launcher 纯逻辑 |
| `lib/portal/index.ts` | Added | 导出入口 |
| `scripts/phase4.3-test-entry.ts` | Added | H01–H15 契约测试 |
| `scripts/phase4.3-tests.mjs` | Added | esbuild 测试入口 |
| `package.json` | Modified | `test:phase4.3` 脚本 |
| `scripts/validate-seo-entry.ts` | Modified | export `index.html` 预期改为 Portal Home metadata |

## C. 组件交付

| 组件 | 状态 | 说明 |
|---|---|---|
| PortalHome | PASS | Hero（唯一 H1）+ 描述文案来自 `getPortalHomeContent()` |
| GameCard | PASS | `navigate-to-detail` → `gameUrl(slug)`；`launcher-select` → button |
| GameGrid | PASS | `getProductionHomeCatalog` 排序；0/1/N 条与空状态 |
| PlayFrame | PASS | `external-only`（当前生产数据）；门禁满足时渲染 iframe + 8s 兜底 |
| Launcher | PASS | 默认选中首个 verified 行；切换递增 `loadGeneration` |

## D. 数据流验证

```text
getPortalHomeContent()  → PortalHome（Hero 文案 / SEO metadata）
getBallgamesCatalog()
  → getProductionHomeCatalog()  → GameGrid / Launcher 默认游戏
  → isProductionEmbedAllowed()  → resolvePlayPresentation() → PlayFrame
```

首页**不再**使用 `allBlogs` / `Main` 帖子列表。当前生产首页网格 **1** 条（Hockey Bros，`navigate-to-detail`）；PlayFrame 默认展示同一条的 verified launch，模式为 **external-only**（embed `unknown` + CSP 未验证）。

## E. 测试结果

| Command | Exit Code | Result |
|---|---|---|
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS（10） |
| `yarn test:batch2` | 0 | PASS（30） |
| `yarn test:catalog` | 0 | PASS（34） |
| `yarn test:phase4.3` | 0 | PASS（15） |
| `yarn validate:catalog` | 0 | PASS |
| `yarn validate:seo` | 0 | PASS（contract） |
| `yarn build` | 0 | PASS |
| `$env:EXPORT=1; $env:UNOPTIMIZED=1; yarn build` | 0 | PASS |
| `yarn validate:seo --export-dir=out` | 0 | PASS |
| `git diff --check` | 0 | PASS |

静态导出：`out/index.html` 存在；`out/hockey-bros.html` 仍生成。

## F. 风险与人工确认

| 项 | 级别 | 说明 |
|---|---|---|
| 生产 iframe | **MANUAL REVIEW** | `EmbedPermission.status: unknown`；`cspFrameSrcVerified: false` — UI 不渲染生产 iframe |
| CSP 部署 | **MANUAL REVIEW** | 仓库 headers 未含目标 `frame-src`；静态 export 不携带 headers |
| 首页卡片数量 | **INFO** | 1 / 15–20 设计目标；未伪造数据 |
| PortalHome 发布 | **BLOCKED（上线门）** | `publicationStatus: draft`，`seo.indexable: false` — **未**提前放行索引 |
| Spec 冲突 | 无未决 | ADR 0004 优先于产品「可 iframe」表述；本实现遵守 |

**门禁语义（保持）：**

```text
UI_IMPLEMENTED != CONTENT_VERIFIED
CONTENT_VERIFIED != INDEXABLE_APPROVED
CATALOG_VALID != EMBED_APPROVED
```

## G. 下一阶段建议（Phase 4.4）

1. 在 `app/[slug]` 复用 Launcher / PlayFrame / GameGrid（Related 区）。
2. 接入 `hockeyBrosDetail` 正文、Controls、FAQ、面包屑壳层。
3. **不要**在本阶段提前 exact-two indexable 或生产 JSON-LD 页面输出（属 4.5–4.6）。
