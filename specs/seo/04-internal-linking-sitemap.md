# 内部链接与 Sitemap

---

## 导航链接 vs 交互动作（Kit）

| 语义 | HTML | 计入 SEO 内链图 | 示例（ballgames R1） |
|---|---|---|---|
| 导航到可索引/可分享 URL | `<a href={gameUrl(slug)}>` | **是**（目标页存在时） | 首页仅 `hockey-bros` 卡片 |
| 导航到站点根 | `<a href={siteUrl()}>` | **是** | 内页 H2⑤ → 首页 |
| 顶栏/页脚/面包屑 | `<a href>` | **是** | Home › Hockey Bros |
| Launcher 选游戏（换 iframe `src`） | `<button type="button">` | **否** | 首页其余 15–20 卡 |
| 相关区滚回 launcher | `<button>` + `scrollIntoView` | **否** | 内页 Related 12–16 卡 |
| 未来搜索触发 | `<button>` / dialog | **否** | R2 |

**原则：**

- Kit **不**要求「每张游戏卡都是内链」。
- 可访问性：button 须有可访问名称（游戏名）；launcher 状态变化须有屏幕阅读器可感知文案（实现 Phase 4）。
- **禁止**用 JS-only 点击替代**唯一**到达 indexable 详情页的路径（ballgames：Hockey Bros 须真实 `<a>`）。

---

## 内链关系（game-portal · 仅真实 `<a>`）

```text
portal_home
  ├─→ game_detail（仅已发布且策略为 navigate 的卡片 / ItemList）
  └─→ legal（若启用）

category_hub（R3+）
  ├─→ game_detail
  └─→ portal_home（面包屑）

game_detail
  ├─→ portal_home（面包屑 / 正文内链）
  ├─→ category_hub（存在时）
  └─→ game_detail（Related 仅在为 `<a>` 且目标页存在时；ballgames R1 Related 全 button → 无 Related 内链）
```

Launcher 网格、iframe 换源 **不**出现在上图中。

---

## SitemapCandidate 资格

**进入 sitemap 的必要条件（Kit）：**

```text
page_type ∈ instance enabledPageTypes
AND publicationStatus === "published"
AND seo.indexable === true
AND NOT search_results
AND NOT paginated noindex pages
AND URL === canonical（自指向）
```

**排除：**

- launcher-only Catalog 行（无 indexable `game_detail` 页面）
- `draft` / `archived`
- `/search` 及任意 `?q=`
- tag 筛选 URL
- 重定向源 URL
- 未达门槛的 category

**ballgames R1：** sitemap **恰好 2 URL** — `https://ballgames.io` 与 `https://ballgames.io/hockey-bros`（见 [`02-url-canonical-indexing.md`](02-url-canonical-indexing.md)）。

实例可提供 **显式 filter**（白名单/黑名单）在通用规则之上收窄。

**lastmod：** 来自 PortalHome / GameDetail 的 `updatedAt`；禁止批量假日期。

**生成后检查（Phase 3+）：** URL 200、canonical 一致、无重复、与 robots 不矛盾。

---

## RSS

博客 RSS（**validated** postbuild）与 portal sitemap **分离**；ballgames R1 非必需 — 若启用须 ADR。

---

## 与模板 sitemap.ts 的关系

当前 sitemap 来自 contentlayer 博客路径（**validated**）。Portal URL **未**包含 — Phase 3 扩展生成逻辑或并行 sitemap 索引。
