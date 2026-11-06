# 配置与内容模型（逻辑契约）

**状态：** **proposed** — 字段与校验规则供 Phase 3–4 实现；当前 contentlayer 仍为 `Blog` + `Authors`（**validated**）。

**权威层级（Phase 2.2）：** 实例 Spec 决定该站点产品行为与实例配置；本文件定义**跨实例可复用**实体与 Kit 校验。安全、许可诚实性、结构化数据不虚构等约束对实例同样适用。不得用 Kit 默认**静默覆盖**实例已明确的 product 要求。

---

## 核心概念（术语）

| 概念 | 说明 |
|---|---|
| **Catalog Item** | 目录/启动器所需最小数据；**不**隐含详情页或 indexable |
| **Game Detail Content** | 可选；详情页 SEO 正文与扩展字段；与 Catalog 可同存储或分文档 |
| **Indexable Page** | 通过 `published` + 显式 `indexable` + 页面类型门槛的**页面**；非 Catalog 行属性 |
| **Publication status** | 内容是否对外发布（`draft` / `published` / `archived`） |
| **Game availability** | 第三方源是否可玩（运营态，与发布解耦） |
| **PageSEO** | 任意可渲染页面的 metadata + index 标志（见 [`specs/seo/03-metadata-structured-data.md`](seo/03-metadata-structured-data.md)） |
| **SitemapCandidate** | 满足 sitemap 规则的页面 URL 候选（见 [`specs/seo/04-internal-linking-sitemap.md`](seo/04-internal-linking-sitemap.md)） |

**关系（必须独立）：**

```text
Catalog Item 存在  ⇏  Game Detail Content 存在  ⇏  Indexable Page
showOnHome         ⇏  详情路由存在            ⇏  seo.indexable === true
```

---

## 站点实例配置（SiteInstance）

| 字段 | 说明 |
|---|---|
| `siteId` | 如 `ballgames` |
| `archetype` | `game-portal` \| `game-wiki` \| `embedded-game` |
| `canonicalOrigin` | 正式 HTTPS 源，如 `https://ballgames.io`（生产前 **MANUAL REVIEW**） |
| `urlPathStyle` | 路径与 canonical 格式（见 SEO [`02-url-canonical-indexing.md`](seo/02-url-canonical-indexing.md)）；**非** Kit 全局默认 |
| `defaultIndexable` | 新页面默认是否可索引（ballgames：**false**） |
| `enabledPageTypes` | 本实例启用的 `page_type` 列表（非 Kit 支持的全部路由） |
| `featureFlags` | 搜索、分页、广告、首页 launcher 等（默认关闭广告/分析，见 AGENTS） |

---

## Catalog Item（portal 目录行）

launcher、首页网格、Related 区消费的最小单元。实现时可与详情内容同文件，但**校验分层**。

| 字段 | 必填 | 说明 |
|---|---|---|
| `id`, `slug` | 是 | `slug` 唯一；变更走 `Redirect` |
| `title` | 是 | 卡片/iframe 标题来源 |
| `providerId` | 否 | 可选；声明时 → `Provider.id` 须可解析 |
| `launch` | 是 | → `LaunchConfig` |
| `thumbnail` | 推荐 | 卡片图；launcher-only 行可简化 |
| `showOnHome`, `homeSort` | 否 | 首页可见性与排序 |
| `cardAction` | 否 | 实例配置：`navigate-to-detail` \| `launcher-select` 等（见 archetypes） |
| `publicationStatus` | 是 | `draft` \| `published` \| `archived` — **Catalog 行**发布态 |
| `availability` | 推荐 | `available` \| `temporarily-unavailable` \| `discontinued` \| `unknown` |

**Kit 校验（Catalog）— 严重级别见 [`specs/phases/04.1-catalog-architecture-alignment.md`](phases/04.1-catalog-architecture-alignment.md) §4：**

- **Error：** slug 唯一、launch 合法、已声明关联可解析、iframe 模式 verified URL 等（schema 失败）
- **Warning：** FAQ/Controls/正文完整度、SEO 描述质量等（不阻止 Catalog 读取）
- **Info：** tags 缺失、首页行数低于实例设计目标等
- `published` + 首页 grid → 须有 verified launch；**不**因缺少 Provider 而一律禁止（external-link / 官方 URL）
- Catalog `published` **不要求** Detail 字段组

---

## Game Detail Content（portal 详情页内容）

仅当实例为该 `slug` 启用 `game_detail` 路由且存在内容包时适用。

| 字段组 | 详情页必填 | 说明 |
|---|---|---|
| `seo`（`PageSEO` 子集） | 是 | `title`, `description`, `indexable`（默认 false）, 可选 `canonical` |
| 正文块 | indexable 前必填 | `intro`, `howToPlay`, `sections[]`, `faq[]`, `controls[]` 等 — 禁止仅用 155 字 description 代替正文 |
| `categories[]`, `tags[]` | 按实例 | tags **不出页** |
| `publishedAt`, `updatedAt` | 发布时 | 驱动 `lastmod` |

**Indexable（页面级）：**

- `publicationStatus !== published`（页面/content 包）→ 不得 `seo.indexable === true`
- `seo.indexable === true` → 须满足实例 editorial 门槛 + Kit 结构校验（见 SEO 05）
- **launcher-only** Catalog 行：无详情内容包 → **无** `game_detail` URL、**无** sitemap 条目

**实现映射（proposed）：** 单条 `Game` 文档可合并 Catalog + Detail；构建/校验时按「是否有 detail 字段组」「是否 indexable」分支，逻辑上仍区分三层概念。

```typescript
// 逻辑拆分示例（存储可合并）
interface CatalogItem {
  id: string
  slug: string
  title: string
  providerId?: string
  embedPermissionId?: string
  launch: LaunchConfig
  publicationStatus: 'draft' | 'published' | 'archived'
  availability?: 'available' | 'temporarily-unavailable' | 'discontinued' | 'unknown'
  showOnHome?: boolean
  homeSort?: number
}

interface GameDetailContent {
  slug: string // 1:1 Catalog
  seo: { title: string; description: string; canonical?: string; indexable: boolean }
  intro: string
  howToPlay: string
  sections: { heading: string; body: string }[]
  faq: { q: string; a: string }[]
  controls?: { label: string; keys: string }[]
  // ...
}

// Indexable Page：由路由 + PortalHome/GameDetail 内容包的 seo.indexable 与 status 推导，非 Catalog 字段
```

---

## Game availability vs publication

| 状态 | 首页 grid | 详情 URL | indexable | sitemap | 用户可见 fallback |
|---|---|---|---|---|---|
| `published` + `available` | 可展示 | 200 | 按 `indexable` | 按规则 | 正常 launch |
| `published` + `temporarily-unavailable` | 实例策略 | **200** 保留 URL（ballgames §2-8） | 实例策略；**不**自动变 noindex | 按 `indexable` | 外链/说明降级 |
| `draft` / `archived` | 不展示 | 404 或未路由 | false | 排除 | — |

---

## LaunchConfig

| 字段 | 说明 |
|---|---|
| `mode` | `iframe-official` \| `iframe-provider` \| `external-link` \| `hosted` |
| `primaryUrl` | HTTPS 启动地址 |
| `fallbackUrls` | 可选备用源 |
| `timeoutMs` | 默认 8000；**UX 兜底**（onload/超时），**非**可玩性证明 |
| `embedLayout` | 可选；响应式嵌入（见下） |

**embedLayout（proposed，实例配置值）：**

```typescript
interface EmbedLayout {
  aspectRatio?: string // 如 "16/9"
  desktopMinHeightPx?: number
  mobileAspectRatio?: string
  mobileMinHeightPx?: number
  width?: string // 如 "70%" — 实例 CSS 策略
}
```

Kit **不**规定 ballgames 的 480px / 16:9 为全局默认；实例在 Spec 或 SiteInstance 中声明。

**Kit 规则：** `external-link` 符合 AGENTS 默认。**iframe 模式** 在生产启用时须 EmbedPermission **非 denied** 且 **granted + CSP**（ADR 0004）；**未**声明 EmbedPermission 的游戏仍可用 external-link。**`published` ⇏ `indexable`**（页面级 `seo.indexable` 默认 false）。

---

## EmbedPermission（许可记录 — 可选）

游戏 **可不**挂载 EmbedPermission；`external-link` **不**强制。显式引用时须校验关联与状态语义。

许可与 Provider 关联，但粒度可到 **游戏 + URL + 域**：

| 字段 | 说明 |
|---|---|
| `id` | 记录 ID |
| `providerId` | 发行方 |
| `gameSlug` | 可选；空表示 provider 级默认 |
| `sourceUrl` | 可选；匹配 `launch.primaryUrl` 或 pattern |
| `embedDomain` | 可选；允许嵌入的站点 canonical 域 |
| `commercialUse` | 可选枚举/备注 |
| `status` | `granted` \| `requested` \| `unknown` \| `denied` |
| `permissionBasis` | 邮件、官方 embed 页、协议引用（**须可追溯**） |
| `evidenceUrl`, `reviewedAt` | 审查追踪 |

**Provider（摘要字段）：**

| 字段 | 说明 |
|---|---|
| `id`, `name`, `site` | 发行方标识 |
| `defaultEmbedPermission` | 仅作无游戏级记录时的默认；**不**与 `Game.providerId` 重复维护游戏列表 |

`unknown` / `requested` **不得**在实现或文案中当作已批准 embed。

---

## Category

| 字段 | 说明 |
|---|---|
| `slug`, `keyword` | URL 与 SEO 主词 |
| `intro`, `body` | 手写正文 |
| `gameCount` | 关联游戏数（由 Catalog 查询推导或缓存） |
| `seo.indexable` | 默认 false |

**Kit 校验：** 未达实例 editorial 门槛（ballgames：≥12 款、≥600 词）→ 保持 draft / 不 indexable。

---

## Redirect

| 字段 | 说明 |
|---|---|
| `from`, `to` | 路径 |
| `code` | 301 \| 302 |

slug 变更必须登记。ballgames：源失效时详情 URL 仍 **200** + 正文 + 启动降级（实例 §2-8）。

---

## PortalHome（首页内容包）

逻辑上与 Catalog **分离**：站点级 `PageSEO`、区块顺序、FAQ、ItemList **成员**（仅 indexable 详情 URL）。ballgames 定稿见实例 Spec §5。

---

## URL  helpers（proposed）

- `siteUrl(path?)` — 唯一生成 absolute URL（canonical、OG、JSON-LD、sitemap、内链）；**禁止**业务模板硬编码 path。
- `gameUrl(slug)` — `siteUrl` + 实例 game 路径规则。
- 首页 canonical：由实例 `urlPathStyle` 决定（ballgames：**origin 无尾斜杠** `https://ballgames.io`）；路由仍可为 `/`。

---

## 与 contentlayer 的关系

**R1（Accepted — ADR 0002）：** Catalog 使用 **TypeScript modules + 只读 Adapter**（`lib/catalog/`）。**不**强制 contentlayer `Game` document type。

**后续选项（不改变 Adapter 消费契约）：**

1. 新增 contentlayer document types（`Game`, `Category`, …）
2. 并行 JSON/YAML catalog + adapter
3. 混合：PortalHome MDX + 游戏 JSON

业务代码应通过 **Catalog Adapter** 消费逻辑模型，避免与 `Blog` 耦死。
