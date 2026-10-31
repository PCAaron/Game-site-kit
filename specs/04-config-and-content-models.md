# 配置与内容模型（逻辑契约）

**状态：** **proposed** — 字段与校验规则供 Phase 3–4 实现；当前 contentlayer 仍为 `Blog` + `Authors`（**validated**）。

**原则：** Kit 层定义跨 portal 实例可复用的实体；实例可在 [`specs/ballgames/ballgames-specs-v1.md`](ballgames/ballgames-specs-v1.md) 追加正文配额、TDK 定稿等，不得削弱 Kit 索引与安全规则。

---

## 站点实例配置（SiteInstance）

| 字段 | 说明 |
|---|---|
| `siteId` | 如 `ballgames` |
| `archetype` | `game-portal` \| `game-wiki` \| `embedded-game` |
| `canonicalOrigin` | 正式 HTTPS 源（生产前 **MANUAL REVIEW**） |
| `defaultIndexable` | 新页面默认是否可索引（ballgames：**false**） |
| `featureFlags` | 搜索、分页、广告等（默认关闭广告/分析，见 AGENTS） |

---

## Game（portal 核心）

与实例 Spec §3.1 对齐；实现时可 MDX frontmatter、JSON 或 DB，本文件不绑定存储。

| 字段组 | 必填 | 说明 |
|---|---|---|
| `id`, `slug` | 是 | `slug` 唯一；变更走 `Redirect` |
| `title` | 是 | 页面 H1 来源 |
| `seo.title`, `seo.description` | 是 | 长度见 [`specs/seo/03-metadata-structured-data.md`](seo/03-metadata-structured-data.md) |
| `seo.indexable` | 是 | 默认 **false** |
| `seo.canonical` | 否 | 缺省 = 自指向正式 URL |
| 正文块 | 详情页是 | `intro`, `howToPlay`, `sections[]`, `faq[]`, `controls[]` 等 — 禁止仅用 155 字 description 代替正文 |
| `categories[]`, `tags[]` | 是 | tags **不出页** |
| `thumbnail` | 是 | src + alt + 尺寸 |
| `provider` | 是 | → `Provider.id` |
| `launch` | 是 | → `LaunchConfig` |
| `status` | 是 | `draft` \| `published` \| `archived` |
| `publishedAt`, `updatedAt` | 发布时 | 驱动 `lastmod` |

**校验（Kit）：**

- `status !== published` → 不得 `indexable === true`
- `published` + `indexable` → 正文与 metadata 门槛见 [`specs/seo/05-content-quality-and-validation.md`](seo/05-content-quality-and-validation.md)
- 无 verified `launch.primaryUrl` 且非降级文案就绪 → 不得发布为 `published`

---

## LaunchConfig

| 字段 | 说明 |
|---|---|
| `mode` | `iframe-official` \| `iframe-provider` \| `external-link` \| `hosted` |
| `primaryUrl` | HTTPS 启动地址 |
| `fallbackUrls` | 可选备用源 |
| `timeoutMs` | 默认 8000；超时 UI 回退 |

**Kit 规则：** `external-link` 符合 AGENTS 默认；iframe 模式要求 `Provider.embedPermission !== denied` 且有 `permissionBasis` 或 ADR。

---

## Provider

| 字段 | 说明 |
|---|---|
| `id`, `name`, `site` | 发行方标识 |
| `embedPermission` | `granted` \| `requested` \| `unknown` \| `denied` |
| `permissionBasis` | 邮件、官方 embed 页、协议引用 |
| `contactStatus`, `lastContactedAt` | 合规追踪 |
| `riskNote` | 许可限制说明 |

---

## Category

| 字段 | 说明 |
|---|---|
| `slug`, `keyword` | URL 与 SEO 主词 |
| `intro`, `body` | 手写正文 |
| `gameCount` | 关联游戏数 |
| `indexable` | 默认 false |

**发布门槛（Kit）：** `gameCount` ≥ 实例配置（ballgames：**12**）且正文字数 ≥ 实例配置（ballgames：**600** 词）— 见实例 Spec §3.4。

---

## Redirect

| 字段 | 说明 |
|---|---|
| `from`, `to` | 路径 |
| `code` | 301 \| 302 |

slug 变更必须登记，避免已收录 URL 404（实例 §2 规则 8：失效源保 URL **200** + 降级，与 404 策略并存时以实例 Spec 为准）。

---

## PortalHome（首页内容包）

逻辑上与 `Game` 分离：站点级 `seo`、区块顺序、FAQ、ItemList 成员列表。ballgames 定稿见实例 Spec §5。

---

## 与 contentlayer 的关系（proposed）

Phase 4 选项（未决，需 ADR 若偏离 MDX）：

1. 新增 contentlayer document types（`Game`, `Category`, …）
2. 并行 JSON/YAML catalog + 只读 adapter
3. 混合：首页 MDX + 游戏 JSON

Phase 2 **不**选定实现；业务代码应通过 **Catalog 读取接口** 消费上述逻辑模型，避免与 `Blog` 耦死。
