# URL、Canonical 与索引策略

**状态：** **proposed**（规则）；模板现状见审计 — `siteUrl` 仍为演示域名，frontmatter `canonicalUrl` 未接入文章页（**validated** 缺口）。

---

## 正式 URL（ballgames 目标）

| 项 | 规则 |
|---|---|
| 源 | `https://ballgames.io`（生产前 **MANUAL REVIEW**） |
| 首页 | `https://ballgames.io/`（尾斜杠与实例一致） |
| 游戏/分类 | `https://ballgames.io/{slug}`，小写 kebab-case |
| 大小写 | 统一小写路径 |
| slug 变更 | [`Redirect`](../04-config-and-content-models.md) 301；禁止仅改 canonical 掩盖旧 URL |

---

## Canonical

- 每可索引页 **自指向** 正式 HTTPS URL（无查询参数 canonical）。
- 分页：第 1 页 canonical 指向无 `page` 参数或 `/page/1` 的选定规范（实例选定后全站一致）。
- 带 `?tag=` / 排序参数的列表：**canonical 指向无参主列表**（若该列表可索引）。

---

## Robots / 索引资格

| 页面 | robots / 策略 |
|---|---|
| `portal_home`, 已放行 `game_detail`, 达标 `category_hub` | index, follow（默认） |
| `search_results` | **noindex**；`robots.txt` `Disallow: /search`（上线首日，实例 §2） |
| 分页第 2 页起 | **noindex, follow** |
| `draft` / 未 `published` | noindex；不进 sitemap |
| `indexable === false` | noindex 或等价；不进 sitemap |
| tags | 无独立页 → 不适用 |
| 预发/预览 | 全站 noindex 或访问控制 |

**区分：** 可抓取 ≠ 可索引。`robots.txt` 不能替代 noindex 处理已公开 URL。

---

## 失效与 HTTP 语义

| 场景 | Kit 默认 | ballgames 实例覆盖 |
|---|---|---|
| 永久移除且无替代 | 404 或 410 | — |
| 游戏源失效但 URL 已有排名 | 仍 200 + 正文 + 启动降级 | **必须**（实例 §2 规则 8） |
| slug 重命名 | 301 → 新 slug | Redirect 表 |

---

## 与博客路由共存（Phase 3–4）

迁移期可能并存 `/blog/*`；portal 正式 URL **不得** 与博客文章 canonical 冲突。Phase 4 实施时须 ADR 或迁移表记录弃用路径。

---

## 验收（Phase 3 代码阶段）

- 内链、canonical、sitemap 同源 URL
- `/search?q=` 不出现在 sitemap 且带 noindex
- `indexable` 与 `status` 一致
