# Phase 2 — SEO 页面模型与内容契约

- **阶段编号：** 2（对应 SEO 指南 §19）
- **状态：** **completed** / **validated**（文档；2026-10-31）
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
- [x] ballgames.io 首批 URL（`/`、`/hockey-bros`）有明确 `index_policy` 与内容契约引用
- [x] Sitemap / 搜索 / 标签 / 分类的索引规则与实例 Spec 一致且无矛盾
- [x] 内容模型区分 Kit 逻辑字段与实例正文配额；未描述为已实现代码
- [x] `AGENTS.md` 与 `docs/agent/STATUS.md` 指向 Phase 2 交付物
- [x] 引用路径存在；无 `package.json` / 应用代码变更

## 明确不在范围

- Phase 3：统一 `siteUrl`、metadata/canonical 实现、sitemap 生成改造
- Phase 4：页面模板、Launcher、Catalog 录入、contentlayer `Game` 类型
- 依赖升级、博客路由删除、广告 SDK 接入

## 与章程的边界

- **Kit** 定义 portal 通用页面类型与 SEO 机制；**ballgames-specs-v1** 承载英文正文配额、TDK 定稿与 P0 组件清单。
- ballgames 游戏详情页采用 **iframe 嵌入**（`LaunchConfig`）属于实例产品决策，须在 `Provider.embedPermission` 有记录；与 AGENTS「默认新标签页」不冲突——默认适用于未核实嵌入许可的新游戏。

## 下一阶段

**Phase 3 — 最小 SEO Foundation**（SEO 指南 §20）：在代码中落实 URL 配置、canonical、索引标志与 sitemap 过滤。
