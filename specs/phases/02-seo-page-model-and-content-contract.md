# Phase 2 — SEO 页面模型与内容契约

- **阶段编号：** 2（对应 SEO 指南 §19）
- **状态：** **completed** / **validated**（文档；Phase 2 2026-10-31；**Phase 2.2** 2026-11-02）
- **Archetype：** `game-portal`
- **首实例：** ballgames.io（见 [`specs/instances/ballgames/README.md`](../instances/ballgames/README.md)）

## 目标

在大规模写页或改 SEO 实现前，为首个验证实例定义**最小**页面类型、URL、索引资格、内容字段、内链、Sitemap 与 metadata 规则；并沉淀可复用的 Kit 级契约，**不**在本阶段实现路由、contentlayer 扩展或 sitemap 代码。

## 交付物

| 层级 | 文件 | 用途 |
|---|---|---|
| Kit · 原型 | [`specs/01-site-archetypes.md`](../01-site-archetypes.md) | 三类原型页面类型目录（portal 详、wiki/embedded 纲要） |
| Kit · 内容 | [`specs/04-config-and-content-models.md`](../04-config-and-content-models.md) | 逻辑实体、字段、校验（**proposed**，未实现） |
| Kit · SEO | [`specs/seo/01-search-intent-and-page-types.md`](../seo/01-search-intent-and-page-types.md) | 页面策略表与意图映射 |
| Kit · SEO | [`specs/seo/02-url-canonical-indexing.md`](../seo/02-url-canonical-indexing.md) | URL、canonical、索引与 robots |
| Kit · SEO | [`specs/seo/03-metadata-structured-data.md`](../seo/03-metadata-structured-data.md) | 按页面类型的 metadata / JSON-LD |
| Kit · SEO | [`specs/seo/04-internal-linking-sitemap.md`](../seo/04-internal-linking-sitemap.md) | 内链关系与 Sitemap 资格 |
| Kit · SEO | [`specs/seo/05-content-quality-and-validation.md`](../seo/05-content-quality-and-validation.md) | 发布门槛与校验流程 |
| 实例 | [`specs/instances/ballgames/README.md`](../instances/ballgames/README.md) | 实例与 Kit 契约的映射 |
| 实例 | [`specs/ballgames/ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md) | P0 冻结范围、文案与 DoD（实例层） |

## 验收标准

- [x] `game-portal` 页面类型清单与 SEO 指南 §2.1、§6 字段对齐
- [x] ballgames.io R1 indexable canonical（`https://ballgames.io`、`/hockey-bros`）有明确 `index_policy` 与内容契约引用
- [x] Sitemap / 搜索 / 标签 / 分类的索引规则与实例 Spec 一致且无矛盾
- [x] 内容模型区分 Kit 逻辑字段与实例正文配额；未描述为已实现代码
- [x] `AGENTS.md` 与 `docs/agent/STATUS.md` 指向 Phase 2 交付物
- [x] 引用路径存在；无 `package.json` / 应用代码变更

## 明确不在范围

- Phase 3：统一 `siteUrl`、metadata/canonical 实现、sitemap 生成改造
- Phase 4：页面模板、Launcher、Catalog 录入、contentlayer `Game` 类型
- 依赖升级、博客路由删除、广告 SDK 接入

## Phase 2.2 — Instance-to-Kit Contract Alignment（2026-11-02）

**目标：** 通用 Kit 契约支持 ballgames v1.1，且不将 BallGames 假设写死进 Kit。

**权威层级：**

1. **ballgames-specs-v1** — 该实例 product 行为、R1/R2/R3、Launcher、URL/canonical（含首页 `https://ballgames.io` 无尾斜杠）、DoD。
2. **Kit**（本阶段交付物 + `04-config-and-content-models` + `seo/*`）— 可复用能力、Catalog/Detail 分层、PageSEO、SitemapCandidate、校验 vs editorial 分离。
3. **实现** — 约束证据；冲突记技术风险（如 `trailingSlash: true` 与 ballgames canonical）。

**主要契约变更摘要：**

- Catalog Item / Game Detail Content / Indexable Page 独立。
- game-portal Launcher 可配置（含首页 iframe + button 换源）。
- 导航 `<a>` vs launcher `<button>`；sitemap 仅 indexable 页面。
- `EmbedPermission` 粒度；`publicationStatus` vs `availability`。
- 结构化数据校验 **不** 承诺 Rich Results。

**不在范围：** 应用代码、BallGames 页面实现（仍属 Phase 4）。

## 与章程的边界

- **Kit** 定义 portal **可选**页面类型、Launcher 能力与 SEO 机制；**ballgames-specs-v1** 为实例 **product 权威**（正文配额、TDK、组件 DoD）。
- ballgames **iframe 嵌入**须在 `EmbedPermission` 有记录；与 AGENTS「默认新标签页」不冲突——默认适用于未核实 embed 的新游戏。

## 下一阶段

**Phase 3 — 最小 SEO Foundation**（SEO 指南 §20）：在代码中落实 URL 配置、canonical、索引标志与 sitemap 过滤。
