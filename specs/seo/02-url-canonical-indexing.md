# URL、Canonical 与索引策略

**状态：** **proposed**（规则）；模板现状见审计 — `siteUrl` 仍为演示域名，frontmatter `canonicalUrl` 未接入文章页（**validated** 缺口）。

**生成原则：** absolute URL **仅**经 `siteUrl()` / `gameUrl(slug)`（及等价 helper）；内链、canonical、sitemap、JSON-LD、OG **同源**。

---

## 正式 URL（ballgames 目标）

| 项 | 规则 |
|---|---|
| 源 | `https://ballgames.io`（`canonicalOrigin`；生产前 **MANUAL REVIEW**） |
| 首页 canonical | **`https://ballgames.io`**（origin，**无**路径尾斜杠；用户可见路由仍为 `/`） |
| 游戏/分类 path | `/{slug}`，小写 kebab-case；canonical **无**尾斜杠（ballgames：`https://ballgames.io/hockey-bros`） |
| 大小写 | 统一小写路径 |
| slug 变更 | [`Redirect`](../04-config-and-content-models.md) 301 |

### 尾斜杠与实例 `urlPathStyle`

| 层级 | Kit |
|---|---|
| 策略 | **实例配置**，非 Kit 全局强制 |
| ballgames（R1） | 根与各 path canonical **均无** trailing slash |
| 模板基线（**validated**） | `next.config.js` 当前 `trailingSlash: true`（博客 `/blog/{slug}/`） |

**技术风险（Phase 3）：** portal 与博客共存时，须在 Phase 3 统一 redirect/canonical 与 Next 配置，避免 `/hockey-bros` 与 `/hockey-bros/` 双收录。本阶段仅文档化 ballgames 目标形态。

---

## Canonical

- 每 indexable 页 **自指向** 正式 HTTPS URL（无查询参数 canonical）。
- 首页：自指向 `canonicalOrigin`（ballgames 无 `/` 后缀）。
- 分页：第 1 页 canonical 指向无 `page` 参数的规范 URL（实例选定后全站一致）。
- 带 `?tag=` / 排序参数的列表：**canonical 指向无参主列表**（若该列表可索引）。

---

## 页面存在 vs 发布 vs 可索引 vs Sitemap

| 概念 | 含义 |
|---|---|
| 页面存在 | 路由可渲染（含 draft 预览策略） |
| 已发布 | `publicationStatus === published`（或 PortalHome 等价） |
| 可索引 | 显式 `seo.indexable === true` + 通过 Kit/实例门槛 |
| 有 canonical | indexable 页必有自指向 canonical |
| Sitemap 候选 | 见 [`04-internal-linking-sitemap.md`](04-internal-linking-sitemap.md) |

**禁止推断：** Catalog 在首页展示 ⇏ 详情页存在 ⇏ indexable ⇏ sitemap URL。

---

## Robots / 索引资格

| 页面 | robots / 策略 |
|---|---|
| 已放行 `portal_home`, `game_detail`, 达标 `category_hub` | index, follow（默认） |
| `search_results` | **noindex, follow**；是否 `robots.txt` Disallow 由**实例**定（ballgames R2：**不** Disallow，见实例 §2-2） |
| 分页第 2 页起 | **noindex, follow** |
| `draft` / 未 `published` | noindex；不进 sitemap |
| `indexable === false` | noindex 或等价；不进 sitemap |
| tags | 无独立页 → 不适用 |
| 预发/预览 | 全站 noindex 或访问控制 |

**区分：** 可抓取 ≠ 可索引。`robots.txt` Disallow **不能**替代对已公开 URL 的 noindex 策略。

**Game availability：** `temporarily-unavailable` **不**自动强制 noindex；是否降级 index 由实例 editorial 决定（ballgames：保 URL 200 + 正文，见实例 §2-8）。

---

## 失效与 HTTP 语义

| 场景 | Kit 默认 | ballgames 实例覆盖 |
|---|---|---|
| 永久移除且无替代 | 404 或 410 | — |
| 游戏源失效但 URL 已有排名 | 仍 200 + 正文 + 启动降级 | **必须**（实例 §2 规则 8） |
| slug 重命名 | 301 → 新 slug | Redirect 表 |
| 无详情内容包的 Catalog 行 | 无 `game_detail` 路由 | launcher-only |

---

## 与博客路由共存（Phase 3–4）

迁移期可能并存 `/blog/*`；portal 正式 URL **不得** 与博客文章 canonical 冲突。Phase 4 实施时须 ADR 或迁移表记录弃用路径。

---

## 验收（Phase 3 代码阶段）

- 内链、canonical、sitemap、JSON-LD **同源** URL
- ballgames R1 sitemap **2** 条（origin + `/hockey-bros`）
- `/search?q=` 不出现在 sitemap 且 noindex（R2 起）
- `indexable` 与 `publicationStatus` 一致
