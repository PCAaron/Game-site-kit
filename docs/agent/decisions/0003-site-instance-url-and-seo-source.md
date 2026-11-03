# ADR 0003：SiteInstance、URL 与 SEO 单一事实源

- **Status：** Accepted
- **Date：** 2026-11-02
- **Decision owner：** Game Site Kit 维护者
- **Approval：** User approved DEC-003-A–E on 2026-11-02（方案 A-1、B-1、C-1、D-1、E-1）

## Context

当前运行时站点配置只有非类型化 `data/siteMetadata.js`。正式 URL 分别在 `app/layout.tsx`、`app/sitemap.ts`、`contentlayer.config.ts` 和 `scripts/rss.mjs` 中拼接；`next.config.js` 设置 `trailingSlash: false`（**F1**，用户 2026-11-03 批准并落地）。模板 origin 仍为 starter 域名。

ballgames 产品契约要求：

- canonical origin 为 `https://ballgames.io`，生产前人工核验；
- 根 URL 和非根 canonical 均无尾斜杠；
- canonical、Open Graph、sitemap、JSON-LD 与内链遵循同一 URL 规则；
- 页面默认不可索引，只有符合发布和 SEO 条件的页面可进入 sitemap；
- R1 sitemap 最终恰好包含首页与 `/hockey-bros`。

通用 SEO 契约还要求 page type enabled、published、indexable、canonical valid。PortalHome 当前没有发布态；Blog/Authors 仍存在且现有 sitemap 直接读取 `allBlogs`。

## Decision Drivers

1. 满足 ballgames 的固定 origin、无尾斜杠和 exact-two R1 URL 要求。
2. 避免 SiteInstance 变成包含未来 archetype、部署平台和所有 feature 的大配置框架。
3. 把发布生命周期、页面启用、SEO indexability、canonical validity 与 route existence 分开。
4. 保留模板可复用能力，但阻止 legacy Blog URL 污染 ballgames SEO surface。
5. 让 Phase 3 可建立机制，而不伪造 Phase 4 页面或结构化数据。

## Considered Options

### Option A — 继续扩展 `data/siteMetadata.js`

- 优点：改动最少。
- 缺点：无类型边界，页面策略和 URL 规范难集中校验。
- 结论：不推荐作为长期来源；可在迁移期由新配置生成兼容视图。

### Option B — Phase 3 最小 SiteInstance + URL helpers

- 优点：只包含当前 SEO 必需字段；可验证且不要求 Monorepo。
- 缺点：需要逐步迁移模板消费者；后续功能仍需增量扩展。
- 结论：**已批准（DEC-003-A / Option A-1）。**

### Option C — 完整通用配置框架

- 优点：一次容纳 navigation、assets、deployment、organization、所有 feature 和未来 archetype。
- 缺点：在只有一个实例时过度抽象，混合已验证与假设字段。
- 结论：不用于 Phase 3。

### Option D — 环境变量或每实例复制

- 优点：部署切换或短期复制直观。
- 缺点：复杂结构难校验，规则会分叉；环境秘密与公开配置容易混淆。
- 结论：环境变量只承载秘密/环境差异，不是主配置。

## Recommended Decision

### 1. Minimum SiteInstance contract

Phase 3 推荐只批准以下逻辑 shape；最终模块路径由实现任务按仓库模式确定：

```typescript
type PublicationStatus = 'draft' | 'published' | 'archived'
type PageType = 'portal_home' | 'game_detail'

interface SiteInstance {
  siteId: string
  archetype: 'game-portal'
  canonicalOrigin: string
  urlPathStyle: 'no-trailing-slash'
  defaultIndexable: false
  enabledPageTypes: PageType[]
  metadata: {
    title: string
    description: string
    language: string
    locale: string
    socialBanner?: string
  }
}
```

Phase 3 不把 navigation、全量 assets、部署平台、Organization 法定信息、runtime URL 或全量 feature flags 放入此最小契约。实际消费者出现且字段有权威来源时再扩展。秘密与 token 永不进入公开 SiteInstance。

### 2. PortalHome source of truth

推荐 PortalHome 是独立内容对象，而不是 SiteInstance 子对象，也不能由 Catalog 推导：

```typescript
interface PortalHomeContent {
  publicationStatus: PublicationStatus
  seo: {
    title: string
    description: string
    indexable: boolean
    ogImage?: string
  }
  updatedAt?: string
}
```

职责分配：

- SiteInstance `metadata` 提供站点级默认 title/description、language/locale 与可选默认 social image；这些是站点级默认值，不是缺失 PortalHome 必填 SEO 的静默 fallback。
- PortalHomeContent 提供首页发布态及必填的 page-level title/description/indexable；可选 `ogImage` 覆盖站点默认 social image。
- indexable PortalHome 必须显式提供非空 title/description；缺失或无效值属于配置错误 / validation failure，不得用 SiteInstance title/description 掩盖。
- `ogImage` 缺失时可以回退 SiteInstance `socialBanner`。
- `canonical` 不存入 PortalHomeContent，由 `siteUrl()` 生成；共享 PageSEO 的可选 canonical 在此页面类型上采用 helper 默认值。
- `updatedAt` 是根级页面内容生命周期字段；它不属于 SiteInstance，也不在 `seo` 中重复存储。

| Field         | PortalHomeContent   | SiteInstance       | Resolution rule                                    |
| ------------- | ------------------- | ------------------ | -------------------------------------------------- |
| `title`       | Required            | Site-level default | PortalHome 必须显式提供；缺失即 validation failure |
| `description` | Required            | Site-level default | PortalHome 必须显式提供；缺失即 validation failure |
| `indexable`   | Required            | `defaultIndexable` | PortalHome 使用页面级显式控制                      |
| `ogImage`     | Optional            | `socialBanner`     | 页面值优先；缺失时可回退站点默认图                 |
| `canonical`   | Not stored          | `canonicalOrigin`  | 始终由 `siteUrl()` 生成                            |
| `updatedAt`   | Root-level optional | Not provided       | 由页面内容生命周期拥有                             |

PortalHome 解析为共享 SEO 表示时，必须应用：

```text
ResolvedPageSEO.updatedAt = PortalHomeContent.updatedAt
```

`updatedAt` 只存储一次；存在且有效时可作为 sitemap `lastmod`。缺失时不得以当前构建时间、文件处理时间或其他虚构时间补齐。

理由：站点身份配置相对稳定，而首页正文、审核、SEO 放行与更新时间有独立生命周期。Phase 3 只冻结接口和 eligibility；实际首页内容集成属于 Phase 4。

ballgames §2 规则 1 的 `status === "published"` 是 §3.1 数据模型 `publicationStatus === "published"` 的**产品简写**（DEC-003-B / Option B-1 已批准）。实现与架构契约统一使用 `publicationStatus`；不得同时维护 `status` 与 `publicationStatus` 两个发布字段。本 ADR **不修改**权威产品 Spec `specs/ballgames/ballgames-specs-v1.md`；语义映射见 [`architecture-consistency-review.md`](../../architecture/architecture-consistency-review.md) §6.2。

### 3. URL responsibilities

`siteUrl(path?)`：

- 唯一的 absolute canonical URL 构造器。
- 无 path 时返回 `https://ballgames.io`，不带尾斜杠。
- 接受 `/hockey-bros` 或等价规范 path，输出小写、单前导斜杠、无尾斜杠 URL。
- canonical 模式拒绝 query、hash、协议相对 URL 和其他 origin。
- 不以 `next.config.js` 的 `trailingSlash` 作为 canonical 事实源。

`gameUrl(slug)`：

- 只接受验证后的 slug，不接受完整 path 或 absolute URL。
- 委托 `siteUrl('/' + slug)`，不重复实现规范化。

暂不增加 category、blog 或 wiki URL helper。内部可有纯 normalize/assert 函数，但不暴露新的业务 API。

所有 canonical metadata、`metadataBase`/Open Graph URL、sitemap、JSON-LD `url`/`@id`、可索引页面内链都必须消费同一 helper 输出。RSS/Blog 若继续存在，可通过兼容适配读取 origin，但不得反向定义 portal canonical。

### 4. Indexability and sitemap eligibility

以下条件是独立维度，不能折叠为一个 `published` 或 `indexable` boolean：

1. `enabledPageTypes` 包含页面类型。
2. 页面内容 `publicationStatus === 'published'`。
3. 页面 `seo.indexable === true`；缺失时使用 `defaultIndexable: false`。
4. canonical 由 helper 生成、有效且自指。
5. 页面通过该类型的必需内容/结构校验。
6. 生产 sitemap 还必须确认 route 存在且返回可索引页面。

只有全部通过的对象才是 `SitemapCandidate`。`seo.indexable` 不替代发布态；publication 也不自动表示可索引。

### 5. Blog isolation

- 保留 Blog/Authors schema、contentlayer pipeline 和模板能力；本 ADR 不批准删除。
- ballgames 的 `enabledPageTypes` 不包含 blog、tag、projects 或 about。
- ballgames R1 sitemap 不读取 `allBlogs`，只读取通过统一 predicate 的 portal descriptors。
- “不进 sitemap”不等于 noindex。若 legacy routes 仍被部署公开，其删除、redirect 或 page-level noindex 必须在独立范围明确。
- Phase 3 负责 sitemap 隔离与 robots 策略；不实施 Blog redesign 或迁移。

### 6. Phase 3 / Phase 4 integration boundary

Phase 3 可实现 URL、metadata、eligibility、sitemap 和 JSON-LD 生成机制，并用受控 descriptor/fixture 验证 R1 契约。它不得把尚不存在的 `/hockey-bros` 放进生产 sitemap，也不得生成与不可见 FAQ/游戏内容不一致的 JSON-LD。

Phase 4 创建并发布实际页面后，生产输出才验收 exact-two sitemap 和页面级 JSON-LD。

## Consequences

### Positive

- 防止 canonical、sitemap、JSON-LD 和内部链接格式漂移。
- PortalHome 与站点身份配置职责清楚。
- Blog 能力可保留而不污染 ballgames R1 sitemap。
- Phase 3 不需要提前实现 Phase 4 页面。

### Negative

- Phase 3 需要迁移或适配现有 `siteMetadata` URL 消费点。
- route existence 使生产 exact-two 验收依赖 Phase 4 页面。
- legacy route 是否部署公开仍需独立决策。

## Migration / Implementation Implications

1. 先定义类型和 ballgames 实例值，再实现 helper 单元/脚本级断言。
2. 迁移 layout metadata、Open Graph、sitemap 和 JSON-LD 到同源 URL。
3. 为 sitemap 建立显式 page descriptor 输入，禁止隐式遍历 `allBlogs`。
4. DEC-003-E（Option E-1）已授权并完成**只读调查**（2026-11-02；审查 HEAD `04a61a5bab09bdb7977dc67c56b581f90cb59c3d`）。调查未修改配置、部署或 redirect。结论与可行方案见 [`architecture-consistency-review.md`](../../architecture/architecture-consistency-review.md) §20。**2026-11-03：** 用户批准 **F1**（`trailingSlash: false`）；已更新 `next.config.js`（见 Batch 0 报告 [`batch0-static-export-url-probe.md`](../reports/batch0-static-export-url-probe.md)）。F3 部署 redirect 未批准；GitHub Pages live HTTP clean URL 仍待实测。
5. `siteMetadata.js` 可临时成为由 SiteInstance 派生的兼容层；不得形成第二套 origin。
6. Phase 4 再接入 PortalHome、GameDetail 实体和实际 JSON-LD 内容。

## Open Questions

- **F1（`trailingSlash: false`）** 已于 2026-11-03 获用户批准并落地于 `next.config.js`（Batch 0 报告证据）。F2/F3/F4 未选；GitHub Pages 对 clean URL 的 **live HTTP** 仍待实测。
- legacy blog routes 在 ballgames 产物中是继续部署但 noindex，还是从实例构建/路由中移除？
- Organization 的真实名称、logo、sameAs 等字段尚无核验证据；不纳入最小 SiteInstance。
- Archived Catalog + Published Detail 的退役策略属于 ADR 0002 / Phase 4。

## Related Specs

- `specs/00-project-charter.md`
- `specs/04-config-and-content-models.md`
- `specs/seo/02-url-canonical-indexing.md`
- `specs/seo/03-metadata-structured-data.md`
- `specs/seo/04-internal-linking-sitemap.md`
- `specs/ballgames/ballgames-specs-v1.md` §2
- `docs/architecture/architecture-consistency-review.md`
- `docs/architecture/architecture-conflict-matrix.md` ACM-002、003、008–013、025、031

## Approved Decisions（2026-11-02）

| ID | Approved option | Summary | Implementation status |
|---|---|---|---|
| DEC-003-A | **A-1** | Phase 3 最小 `SiteInstance` 契约（§ Recommended Decision §1） | **Not started** — Phase 3 代码未开始 |
| DEC-003-B | **B-1** | 独立 `PortalHomeContent`；`status` → `publicationStatus` 语义映射 | **Not started** |
| DEC-003-C | **C-1** | 保留 Blog/Authors；ballgames R1 从 enabled page types 与 sitemap 隔离 | **Not started** |
| DEC-003-D | **D-1** | Phase 3 机制 + fixture；Phase 4 页面与 production exact-two / page JSON-LD | **Not started** |
| DEC-003-E | **E-1 + F1** | 只读调查（E-1）；**F1** `trailingSlash: false` 用户 2026-11-03 批准 | **F1 applied** — `next.config.js`；Pages HTTP 复核 **Pending** |

批准 DEC-003-A–D **不自动开始** Phase 3 应用实现；须按 Phase 3 Spec 单独立项执行。DEC-003-E 批准的是调查本身，**不是**调查报告中的任何技术推荐方案。
