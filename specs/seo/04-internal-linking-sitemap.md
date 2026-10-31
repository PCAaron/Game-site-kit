# 内部链接与 Sitemap

---

## 内链关系（game-portal）

```text
portal_home
  ├─→ game_detail（主推大卡、ItemList、网格卡片；锚文本 = 游戏名）
  ├─→ category_hub（chips / 页脚；达标后）
  └─→ legal

category_hub
  ├─→ game_detail（列表卡片）
  └─→ portal_home（面包屑）

game_detail
  ├─→ portal_home
  ├─→ category_hub（面包屑中间级，页面存在时）
  ├─→ game_detail（RelatedGames；锚文本仅游戏名）
  └─→ 未建 slug → 链到父分类 hub（实例：链 /bros-games），**禁止死链**
```

**原则：** 主要导航与 SEO 内链用真实 `<a href>`；不把关键路径只绑在 JS 点击事件上。

Wiki / embedded 纲要见 [`specs/01-site-archetypes.md`](../01-site-archetypes.md) 与 SEO 指南 §10。

---

## Sitemap 资格

**进入 sitemap 的必要条件（Kit + ballgames）：**

```text
status === "published"
AND seo.indexable === true
AND page_type ∈ { portal_home, game_detail, category_hub, legal, ... 实例白名单 }
AND NOT search_results
AND NOT paginated noindex pages
```

**排除：**

- `draft` / `archived`
- `/search` 及任意 `?q=`
- tag 筛选 URL
- 重定向源 URL
- 未达门槛的 category

**P0 ballgames：** sitemap **仅** 2 个 URL（`/`、`/hockey-bros`），见实例 DoD。

**lastmod：** 来自内容 `updatedAt` 或首页内容包更新 time；禁止批量假日期。

**生成后检查（Phase 3+）：** URL 200、canonical 一致、无重复、与 robots 不矛盾。

---

## RSS

博客 RSS（**validated** postbuild）与 portal sitemap **分离**；ballgames 是否提供 RSS 非 P0 — 若启用须 ADR。

---

## 与模板 sitemap.ts 的关系

当前 sitemap 来自 contentlayer 博客路径（**validated**）。Portal URL **未**包含 — Phase 3 扩展生成逻辑或并行 sitemap 索引。
