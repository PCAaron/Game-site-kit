# 站点原型 — 页面类型目录

能力状态：**proposed**（设计契约；仓库仍为博客 IA，见 [`docs/agent/reports/template-audit.md`](../docs/agent/reports/template-audit.md)）。

章程与旅程定义见 [`specs/00-project-charter.md`](00-project-charter.md)。

**Site Archetype**（站点类型：`game-portal` | `game-wiki` | `embedded-game`）与 **Game Launch Capability**（单游戏 `LaunchConfig.mode`：`iframe-official` | `iframe-provider` | `external-link` | `hosted`）是 **两个独立维度**。同一 portal 可混用多种 launch mode；某游戏不能 iframe **不**改变整站 archetype。

---

## game-portal（首个验证：ballgames.io）

**主旅程：** 发现 → 分类/筛选 → 游戏详情 → Play（启动器：外链或经许可的 embed）。

### 页面类型（Kit 能力目录）

`page_type` 为**能力**，非强制路由。实例通过 `SiteInstance.enabledPageTypes` 启用子集（ballgames R1：仅 `portal_home` + 一条 `game_detail`）。

| `page_type` | 典型 URL 模式 | 主要用户任务 | 默认索引 |
|---|---|---|---|
| `portal_home` | `/`（canonical 格式见实例） | 理解站点范围；发现游戏；可选首页 launcher | 实例配置 |
| `game_detail` | `/{game-slug}` | 玩/读玩法；故障回退 | 默认 **否**；发布 + 显式 `indexable` |
| `category_hub` | `/{category-slug}` | 浏览某类全部游戏 | 默认 **否**；达 editorial 门槛 |
| `topic_hub` | `/topics/{slug}` | 专题聚合（可选，P2+） | 按门槛 |
| `search_results` | `/search?q=` | 站内找游戏 | **不索引** |
| `paginated_list` | `/*?page=` 或 `/path/page/N` | 列表翻页 | 第 1 页可索引；第 2 页起 **noindex, follow**（实例规则） |
| `legal` | `/privacy` 等 | 合规 | 通常可索引 |
| `utility` | `/404`、重定向中间页 | 系统 | 不索引 |

**不生成独立 URL 的要素：** `tags` 仅作筛选参数；无足够游戏的「空分类」不发布。

**与博客模板的差异（proposed）：** 游戏 slug 路由不应复用 `/blog/[...slug]` 文章模型；详情页 SEO 价值来自结构化正文 + 启动区，而非 frontmatter summary。

### Launcher（可配置，非全实例必选）

Portal 可在**不同页面**配置 launcher（单 iframe 或多模式），由实例 feature flags / 页面模板决定：

| 配置维度 | 说明 |
|---|---|
| `placement` | `portal_home` \| `game_detail` \| `both` \| `none` |
| `maxVisibleGames` | 网格上限（如 15–20） |
| `initialSelectedSlug` | 打开页面时 iframe 默认源 |
| `sourceSwitchBehavior` | 换卡仅改 iframe `src`（**无** navigation、无 hash） |
| `cardActionBySlug` | 按 slug：`navigate`（`<a>` → 详情）\| `select-in-launcher`（`<button>`） |
| `relatedGamesBehavior` | 详情页相关区：`scroll-to-launcher` \| `navigate` \| `select-in-launcher`（实例定） |
| `embedLayout` | 见 [`04-config-and-content-models.md`](04-config-and-content-models.md) `LaunchConfig.embedLayout` |

**Kit 原则：**

- 首页 iframe launcher **允许**存在；**不**假设所有 portal 首页仅有外链卡片。
- 游戏卡 **不必** 一律链向详情页；launcher 选源是合法交互，**不**计入 SEO 内链图。
- 默认 AGENTS「新标签页 Play」适用于未核实 embed 的新游戏；经许可的 iframe 由实例 + `EmbedPermission` 决定。

实例 R1 行为见 [`specs/ballgames/ballgames-specs-v1.md`](ballgames/ballgames-specs-v1.md) §2、§4、§6.7。

---

## game-wiki（纲要，非 Phase 2 交付重点）

| `page_type` | 典型 URL | 说明 |
|---|---|---|
| `wiki_home` | `/wiki` 或 `/` | 主题导航 |
| `guide` | `/wiki/guides/{slug}` | 攻略长文 |
| `entity` | `/wiki/{type}/{slug}` | 角色/物品/机制条目 |
| `search_results` | `/wiki/search` | 通常不索引 |

内容契约：**不得**用单一 `Blog` post 替代 Wiki 关系模型（章程非目标）。

---

## embedded-game（纲要）

| `page_type` | 典型 URL | 说明 |
|---|---|---|
| `play_landing` | `/play/{slug}` | 运行区 + 可见说明 |
| `how_to` | 同页区块或子路径 | 操作与回退 |
| `fallback` | 错误态 UI | 非独立 SEO URL |

基线 **X-Frame-Options: DENY**；启用 embed 须 ADR + CSP（审计 §13）。

---

## 相关文档

- 搜索意图与策略表：[`specs/seo/01-search-intent-and-page-types.md`](seo/01-search-intent-and-page-types.md)
- 内容实体：[`specs/04-config-and-content-models.md`](04-config-and-content-models.md)
- 导航 vs 交互：[`specs/seo/04-internal-linking-sitemap.md`](seo/04-internal-linking-sitemap.md)
