# 站点原型 — 页面类型目录

能力状态：**proposed**（设计契约；仓库仍为博客 IA，见 [`docs/agent/reports/template-audit.md`](../docs/agent/reports/template-audit.md)）。

章程与旅程定义见 [`specs/00-project-charter.md`](00-project-charter.md)。

---

## game-portal（首个验证：ballgames.io）

**主旅程：** 发现 → 分类/筛选 → 游戏详情 → Play（启动器：外链或经许可的 embed）。

### 页面类型（Kit 最小集）

| `page_type` | 典型 URL 模式 | 主要用户任务 | 默认索引 |
|---|---|---|---|
| `portal_home` | `/` | 理解站点范围；进入主推游戏与分类 | 实例配置（ballgames：可索引） |
| `game_detail` | `/{game-slug}` | 玩/读玩法；故障回退 | 默认 **否**；发布 + 人工 `indexable` |
| `category_hub` | `/{category-slug}` | 浏览某类全部游戏 | 默认 **否**；≥ 游戏数与正文字数门槛 |
| `topic_hub` | `/topics/{slug}` | 专题聚合（可选，P2+） | 按门槛 |
| `search_results` | `/search?q=` | 站内找游戏 | **不索引** |
| `paginated_list` | `/*?page=` 或 `/path/page/N` | 列表翻页 | 第 1 页可索引；第 2 页起 **noindex, follow**（实例规则） |
| `legal` | `/privacy` 等 | 合规 | 通常可索引 |
| `utility` | `/404`、重定向中间页 | 系统 | 不索引 |

**不生成独立 URL 的要素：** `tags` 仅作筛选参数；无足够游戏的「空分类」不发布。

**与博客模板的差异（proposed）：** 游戏 slug 路由不应复用 `/blog/[...slug]` 文章模型；详情页 SEO 价值来自结构化正文 + 启动区，而非 frontmatter summary。

实例首批 URL 与冻结范围见 [`specs/ballgames/ballgames-specs-v1.md`](ballgames/ballgames-specs-v1.md) §1。

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
