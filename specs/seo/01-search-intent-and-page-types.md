# 搜索意图与页面类型映射

**实例：** ballgames.io · `game-portal`  
**状态：** **proposed**（策略表）；首批页面文案与词频规则见 [`specs/ballgames/ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md)。

字段定义见 SEO 指南 §6。

---

## Kit 原则：页面类型 = 可选能力

- Kit 列出 portal **可支持**的 `page_type`（见 [`specs/01-site-archetypes.md`](../01-site-archetypes.md)）。
- 每个实例在 roadmap 中启用子集；**未启用**的类型不建路由、不进入策略表验收。
- ballgames：**R1** 仅 `portal_home` + 一条 `game_detail`；**R2** 搜索/列表；**R3** 分类 hub。

---

## ballgames.io — 页面策略表（R1 已冻结）

| intent_id | query_cluster | intent_type | page_type | route_pattern | content_requirements | internal_link_sources | index_policy | status |
|---|---|---|---|---|---|---|---|---|
| BG-HOME-001 | ball games（及同类导航） | 信息 + 行动 | `portal_home` | `/` | 说明站点范围；launcher + 网格；英文正文满足实例配额 | 内页 H2⑤ 等 **真实** `<a>` | `indexable` 人工 true | **proposed** |
| BG-GAME-HOCKEY | hockey bros | 信息 + 行动 | `game_detail` | `/hockey-bros` | 玩法/控制/FAQ；iframe + 回退 | 首页 **一条** `<a>` 卡片；ItemList | 默认 false → 人工 true | **proposed** |
| BG-CAT-BROS | bros games | 信息 | `category_hub` | `/bros-games` | ≥12 游戏 + ≥600 词 | R3 | 未达门槛不建 | R3 |
| BG-CAT-SPORTS | sports games | 信息 | `category_hub` | `/sports-games` | 同上 | R3 | 未达门槛不建 | R3 |
| BG-GAME-CARSOC | car soccer | 信息 + 行动 | `game_detail` | `/car-soccer` | 同 game_detail 契约 | R3+ | 未建 | R3+ |
| BG-SEARCH | （任意 q） | 工具 | `search_results` | `/search?q={q}` | 结果列表 | 顶栏 R2 | **never index** | R2 |
| BG-TAG-FILTER | tag 名 | 工具 | — | `?tag=` 等 | 仅筛选 | — | **no URL** | — |

**规则摘要：**

- R1 **两个** indexable 页面：站点根（canonical `https://ballgames.io`）与 `/hockey-bros`（见 URL Spec）。
- Catalog 可有 15–20 条 launcher 数据；**不**为每条自动生成 indexable `game_detail`。
- 搜索、tag 筛选不成为 SEO 落地页。
- 不得编造搜索量用于 Kit 验收；实例 Spec 中的量级仅作内容优先级参考。

---

## game-portal — 通用意图 → 页面类型（Kit）

| 用户意图 | 推荐 page_type | 避免 |
|---|---|---|
| 找「某类游戏」 | `category_hub` | 每个 tag 一页 |
| 找「某款游戏怎么玩/在哪玩」 | `game_detail` | 纯 iframe 无正文 |
| 站点品牌/类目总览 | `portal_home` | 首页堆砌多款游戏主词正文 |
| 站内搜 ID/名字 | `search_results` | 可索引 SERP 薄页 |
| 比较/列表翻页 | `paginated_list` | 全部分页可索引 |

---

## 后续实例

新 `game-portal` 站点复制本表结构，替换 `intent_id` 与 `route_pattern`；共享规则见 [`specs/seo/02-url-canonical-indexing.md`](02-url-canonical-indexing.md)。
