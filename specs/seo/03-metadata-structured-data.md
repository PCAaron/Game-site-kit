# Metadata 与 Structured Data

按 **page_type** 区分规则（SEO 指南 §9）。**禁止**虚构 `aggregateRating`、评论或未核实日期。

---

## 全局约束

| 项 | 规则 |
|---|---|
| `<title>` | 主词前置；≤ **60** 字符（实例 wc/字符计数以 ballgames Spec 为准） |
| `meta description` | ≤ **155** 字符；**不**承担 800+ 词正文 |
| `meta keywords` | **不使用** |
| H1 | 每页唯一；与主词策略一致 |
| `canonical` | 见 [`02-url-canonical-indexing.md`](02-url-canonical-indexing.md) |
| OG | title/description/url 与 metadata 一致；image 须许可记录 |
| robots | 与 `index_policy` 一致 |

---

## 按页面类型

### `portal_home`（ballgames P0）

| 输出 | 规则 |
|---|---|
| title / description / H1 | 实例 §5.1 **照抄** |
| JSON-LD | `WebSite`（含 `SearchAction` → `/search?q=`）、`ItemList`（仅已发布且可链接 URL）、`Organization` |
| ItemList | `name` 仅游戏名；不堆 description |

### `game_detail`（ballgames：`/hockey-bros`）

| 输出 | 规则 |
|---|---|
| title / description / H1 | 实例 §6.1 **照抄** |
| JSON-LD | `VideoGame`（真实 publisher、datePublished 须有依据）、`FAQPage`（与可见 FAQ 一一对应）、`BreadcrumbList` |
| 禁止 | `aggregateRating`、未上线游戏的虚假 offers |

### `category_hub`（P1+）

| 输出 | 规则 |
|---|---|
| title | 类目主词 + 站点品牌 |
| JSON-LD | `CollectionPage` 或 `ItemList`（待 Phase 4 按可见内容选定） |

### `search_results`

- title 可固定为「Search」；**robots noindex**；**无** SEO 向 JSON-LD。

---

## Structured Data 流程（proposed）

1. 页面类型 → schema 模板映射（集中生成器，实例 Spec §4 JSON-LD 生成器）
2. 构建后 Rich Results Test / 等效校验（Phase 4 DoD）
3. 内容与 schema 字段逐条对齐

---

## 模板基线（validated）

现有博客：`app/seo.tsx`、`BlogPosting` JSON-LD。Portal 类型**未**接入；Phase 3–4 扩展时复用 metadata 模式，不复制整页手写 script。
