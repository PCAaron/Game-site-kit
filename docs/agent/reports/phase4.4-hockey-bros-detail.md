# Phase 4.4 — Hockey Bros Detail UI 验收报告

## A. 基线

| 项 | 值 |
|---|---|
| Branch | `main` |
| 任务基线 SHA | `703118f9cf9f8bf5afc895d57cea7a5d46232405` |
| 实施完成后 HEAD（未提交） | `703118f9cf9f8bf5afc895d57cea7a5d46232405` |
| Scope | Phase 4.4 — `/hockey-bros` 完整详情 UI；**不含** Phase 4.5+ |

## B. 文件变更

| 文件 | 类型 | 用途 |
|---|---|---|
| `app/[slug]/page.tsx` | Modified | 接入 `GameDetailTemplate`；保留 4.2 路由与 metadata |
| `components/portal/GameDetailTemplate.tsx` | Added | 详情页结构编排 |
| `components/portal/Breadcrumbs.tsx` | Added | 两级面包屑 |
| `components/portal/GameDetailPlaySection.tsx` | Added | Play + 广告壳 Client 岛 |
| `components/portal/DetailPlayArea.tsx` | Added | 单 PlayFrame + scroll 锚点 |
| `components/portal/DetailAdSlots.tsx` | Added | 300×250 / 336×280 静态壳 |
| `components/portal/GameDetailContent.tsx` | Added | How to Play … Bros Series 正文 |
| `components/portal/GameFaq.tsx` | Added | 7× `<details>` FAQ |
| `components/portal/RelatedGames.tsx` | Added | Related 区 GameGrid |
| `components/portal/RelatedGamesWithScroll.tsx` | Added | `scrollIntoView` 行为 |
| `components/portal/GameCard.tsx` | Modified | `displayContext`：`home` / `related` |
| `components/portal/GameGrid.tsx` | Modified | 传递展示上下文 |
| `lib/portal/parse-detail-body.tsx` | Added | 段落 / ### H3 / 列表解析 |
| `lib/catalog/adapter.ts` | Modified | `getProductionRelatedCatalogGames()` |
| `lib/catalog/instances/hockey-bros-detail.ts` | Modified | About 两则 H3 标记（`###`，无事实改写） |
| `scripts/phase4.4-*` | Added | D01–D20 组件/契约测试 |
| `package.json` | Modified | `test:phase4.4` |

## C. 页面结构

```text
GameDetailTemplate (RSC)
├── Breadcrumbs
├── Hero (H1 + intro)
├── GameDetailPlaySection (client)
│   ├── DetailPlayArea → PlayFrame
│   └── DetailAdSlots
├── GameDetailContent (RSC)
│   ├── How to Play
│   ├── Controls (+ controls[] dl)
│   ├── Tips for Winning
│   ├── About Hockey Bros (2× H3)
│   └── The Rest of the Bros Series (ul×5)
├── GameFaq (7 details)
└── RelatedGamesWithScroll (client)
    └── GameGrid context=related → GameCard(button)
```

## D. 数据链路

```text
findProductionRoutableGame(slug)
  → CatalogGame + detail (hockey-bros-detail fixture)
  → GameDetailTemplate
getProductionRelatedCatalogGames(catalog)
  → 同 getProductionHomeCatalog 门禁（无 draft 造假）
resolvePlayPresentation(game, catalog)
  → PlayFrame（external-only，生产 iframe 仍 BLOCKED）
```

## E. RelatedGames

| 项 | 说明 |
|---|---|
| 数据源 | `getProductionRelatedCatalogGames()` = 生产首页网格门禁 |
| 数量 | **1** 张（仅 Hockey Bros）— **INFO**，未伪造 12–16 目标 |
| 全部为 button | `GameGrid displayContext="related"` 覆盖 `navigate-to-detail` |
| 滚动目标 | `#detail-play-area` `scrollIntoView`（尊重 `prefers-reduced-motion`） |
| URL / iframe | 不 `pushState`、不改 hash、不切换 PlayFrame src（generation 固定 0） |

## F. 内容结构

| 检查项 | 结果 |
|---|---|
| H1 数量 | 1（`Hockey Bros`） |
| Subtitle | `detail.intro` = 冻结副标题 |
| H2（5） | How to Play → Controls → Tips → About → Bros Series |
| H3（2） | About 内「unblocked…」「Why it is worth a tab」 |
| Bros 列表 | 5× `<li>` |
| Controls | 正文 + `controls[]` 表；PlayFrame 下无重复 |
| FAQ | 7 条可见；**无** FAQPage JSON-LD |

## G. 测试结果

| Command | Exit | Result |
|---|---|---|
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS（10） |
| `yarn test:batch2` | 0 | PASS（30） |
| `yarn test:catalog` | 0 | PASS（34） |
| `yarn test:phase4.3` | 0 | PASS（22） |
| `yarn test:phase4.4` | 0 | PASS（20） |
| `yarn validate:catalog` | 0 | PASS |
| `yarn validate:seo` | 0 | PASS |
| `yarn build`（`EXPORT=1` `UNOPTIMIZED=1`） | 0 | PASS |
| `yarn validate:seo --export-dir=out` | 0 | PASS |
| `git diff --check` | 0 | PASS |

## H. 人工确认（MANUAL REVIEW）

| 项 | 状态 |
|---|---|
| 生产 iframe 许可 / CSP | BLOCKED（embed `unknown`；未 bypass） |
| 正文开发商 / 上线日等 §7.1 事实 | MANUAL REVIEW — 仅渲染定稿文案，未宣称已独立核实 |
| Related 卡片数量 vs 设计目标 | INFO（1/12–16） |
| 375 / 768 / 1280 视觉验收 | MANUAL REVIEW — 未在本环境跑真浏览器 |
| 广告位空壳是否满足产品终审 | MANUAL REVIEW |

## I. 后续阶段

- **Phase 4.5**：首页长正文 / FAQ 可见层、页面 JSON-LD（含 FAQPage / BreadcrumbList）、exact-two 生产收口。
- 本阶段 **未** 实施 4.5；详情 FAQ 数据源已稳定可供 4.5 复用。
