# Metadata 与 Structured Data

按 **page_type** 区分规则（SEO 指南 §9）。**禁止**虚构 `aggregateRating`、评论或未核实日期。`offers` / `Organization` 见 [`06-verified-offer-and-organization.md`](06-verified-offer-and-organization.md)（有条件允许 vs 证据门控）。

---

## PageSEO（共享页面契约）

适用于 `portal_home`、`game_detail`、`category_hub`、`legal` 等**页面**，不限于 Game 实体。

| 字段 | 说明 |
|---|---|
| `title` | `<title>` 来源 |
| `description` | meta description |
| `canonical` | 缺省 = `siteUrl()` / `gameUrl(slug)` 自指向 |
| `indexable` | 与 robots / sitemap 一致 |
| `ogImage` | 须许可记录 |
| `updatedAt` | 可选；驱动 `lastmod` |

Catalog Item 的 launcher 字段 **不**替代页面级 `PageSEO`。

---

## 全局约束

| 项 | 规则 |
|---|---|
| `<title>` | 主词前置；≤ **60** 字符（实例计数以 ballgames Spec 为准） |
| `meta description` | ≤ **155** 字符；**不**承担 800+ 词正文 |
| `meta keywords` | **不使用** |
| H1 | 每页唯一；与主词策略一致 |
| `canonical` | 见 [`02-url-canonical-indexing.md`](02-url-canonical-indexing.md) |
| OG | title/description/url 与 metadata 一致 |
| robots | 与 `index_policy` / `indexable` 一致 |

---

## 按页面类型

### `portal_home`（ballgames R1）

| 输出 | 规则 |
|---|---|
| title / description / H1 | 实例 §5.1 **照抄** |
| JSON-LD | `WebSite`（R1 **无** `SearchAction`）、`ItemList`（**仅** indexable 真实详情 URL）、`Organization`（可选，证据门控）、`FAQPage` |
| ItemList | `name` 仅游戏名；**不得**列未发布/未 indexable 的 URL；**不得**为 `DEFAULT_PLAYER_GAME` 虚构无详情路由（ballgames R1：1 项 → Hockey Bros `/hockey-bros`） |
| `WebSite.url` | 与首页 canonical 一致（ballgames：`https://ballgames.io`） |

### `game_detail`（ballgames R1：`/hockey-bros`）

| 输出 | 规则 |
|---|---|
| title / description / H1 | 实例 §6.1 **照抄** |
| JSON-LD | `VideoGame`（publisher/date 须有依据）、`FAQPage`（与可见 FAQ 逐字一致）、`BreadcrumbList` |
| 禁止 | `aggregateRating`、未核实 `review` / `offers`（核实免费 Offer 见 doc 06） |

### `category_hub`（R3+）

| 输出 | 规则 |
|---|---|
| title | 类目主词 + 站点品牌 |
| JSON-LD | `CollectionPage` 或 `ItemList`（Phase 4 按可见内容选定） |

### `search_results`

- title 可固定为「Search」；**robots noindex**；**无** SEO 向 JSON-LD。

---

## Structured Data 校验（proposed）

**目标：** schema **正确性**与**页面一致性**；**不**承诺 Rich Results 展现。

| 检查 | 说明 |
|---|---|
| JSON-LD 语法 | 可解析 |
| `@type` 与 page_type 映射 | 集中生成器，禁止页内重复手写冲突块 |
| 必填属性 | 按 schema.org 与页面可见内容 |
| URL 字段 | 与 canonical 一致（`siteUrl` / `gameUrl`） |
| FAQPage | 问答案与可见 `<details>` 逐字一致 |
| ItemList / BreadcrumbList | 项与真实可导航 URL 一致 |
| 禁止 | 编造评分、虚假 SearchAction（R1 ballgames） |

Phase 4 DoD 可用 Rich Results Test **仅作**语法/类型辅助，**通过 ≠** FAQ/Video 等富摘要必现。

---

## 模板基线（validated）

现有博客：`app/seo.tsx`、`BlogPosting` JSON-LD。Portal 类型**未**接入；Phase 3–4 扩展时复用 metadata 模式，不复制整页手写 script。
