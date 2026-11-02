# Phase 3 — Minimum SEO Foundation

- **阶段编号：** 3
- **状态：** **specified / implementation gated / not started**
- **Archetype：** `game-portal`
- **首实例：** ballgames.io
- **文档日期：** 2026-11-02
- **实现状态：** Not started
- **关键决策：** ADR 0003 **Accepted**（DEC-003-A–E，2026-11-02）；**Phase 3 代码未开始**

## 1. Objective

建立 ballgames.io R1 所需的最小 SEO 基础设施：类型化站点 URL 配置、统一 URL 生成、metadata/canonical/Open Graph、页面资格、sitemap、robots 与按页面类型的 JSON-LD 生成机制。

本阶段必须遵循权威 ballgames 产品 Spec 和获批准的架构决策。Phase 3 只建立 SEO 机制与可重复契约验证，不实现 PortalHome、Game Detail、Catalog 或 Launcher。

## 2. Authority and required context

优先级：

1. `AGENTS.md` 与 `specs/00-project-charter.md` 的治理和安全边界。
2. `specs/ballgames/ballgames-specs-v1.md` 的 ballgames R1 产品要求。
3. `specs/04-config-and-content-models.md`、`specs/seo/` 的 Kit 契约。
4. 当前模板实现。

实现前必须复核：

- `docs/agent/decisions/0003-site-instance-url-and-seo-source.md`
- `docs/architecture/architecture-consistency-review.md`
- `docs/architecture/architecture-conflict-matrix.md`
- `specs/phases/02-seo-page-model-and-content-contract.md`
- `specs/ballgames/ballgames-specs-v1.md` §2、§4、§5.7、§6.8、§8

不得把已 Accepted ADR 当成已实现代码。若本 Spec 与 ADR 0003 不一致，先更新本 Spec。

## 3. Entry conditions

| Entry condition | Status | Required outcome / evidence |
|---|---|---|
| Site URL source of truth | **Decision resolved** | DEC-003-A / A-1 已批准（ADR 0003 Accepted）；实现 SiteInstance + helpers |
| Canonical URL policy | **Satisfied with conditions** | 产品无尾斜杠已冻结；`trailingSlash` 实现见 DEC-003-E §20 — **实施方案未批准** |
| Trailing-slash investigation | **Investigation complete** | DEC-003-E / E-1 只读调查已记录（Architecture Review §20）；不授权改配置 |
| PortalHome publication eligibility | **Decision resolved** | DEC-003-B / B-1 — 独立 PortalHomeContent |
| Publication state terminology | **Decision resolved** | DEC-003-B — `status` 为 `publicationStatus` 产品简写；不修改 ballgames Spec |
| Blog isolation | **Decision resolved** | DEC-003-C / C-1 — 保留 Blog/Authors；R1 sitemap 不读 `allBlogs` |
| Sitemap eligibility | **Satisfied with conditions** | predicate 已定义；production exact-two 依赖 Phase 4 route |
| Phase 3 scope | **Decision resolved** | DEC-003-D / D-1 — 不实现 PortalHome、Detail、Catalog、Launcher、`/hockey-bros` |
| Production exact-two integration | **Blocked by missing evidence** | `/hockey-bros` 尚不存在 |
| Page JSON-LD integration | **Blocked by missing evidence** | 可见 FAQ/内容属 Phase 4 |

**Implementation gate：** 架构决策 DEC-003-A–E 已关闭（2026-11-02）。**Phase 3 应用代码仍为 not started** — 须单独立项执行本 Spec。DEC-003-E **不等于**批准修改 `trailingSlash` 或部署 redirect；该选择须依据 §20 单独授权。production integration 两项不阻止机制开发，但阻止宣称 R1 SEO 已完成。

## 4. In scope

1. Phase 3 最小 SiteInstance URL/metadata 配置。
2. `siteUrl(path?)` 与 `gameUrl(slug)` 的统一 URL 生成。
3. canonical metadata 与 `metadataBase`。
4. Open Graph title、description、URL 与 site-level image source。
5. Site-level title、description、language、locale。
6. 页面资格与 SitemapCandidate 过滤。
7. sitemap 生成机制与 ballgames R1 contract fixture。
8. robots 生成策略及 page-level robots 一致性。
9. ballgames R1 所需 JSON-LD 的集中生成接口与 fixture validation。
10. Blog/legacy route 的 sitemap 隔离。
11. 确定性 SEO 输出、URL、sitemap 与 JSON-LD 校验脚本。

优先复用 Metadata API、`app/sitemap.ts`、`app/robots.ts` 和现有 layout 模式。只有现有模块无法保持单一职责时才新增文件。

## 5. Explicitly out of scope

- Game Catalog、CatalogRepository 或 15–20 款游戏录入。
- PortalHome、Game Detail 页面或 `/hockey-bros` 路由实现。
- GameCard、GameGrid、Launcher、PlayFrame、fallback UI。
- 第三方 iframe 集成、permission 审批、CSP production integration。
- 广告位或广告 provider。
- Wiki、Category、Search、分页、R2/R3。
- 第二 archetype。
- Shared Core 提取、Monorepo 或模板迁移。
- Blog/Authors 删除、博客 redesign 或历史内容迁移。
- 部署平台切换或自定义响应头配置。

## 6. Minimum contracts

### 6.1 SiteInstance

实现 shape 以获批准的 ADR 0003 为准。当前推荐最小字段：

```typescript
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

必须满足：

- ballgames `canonicalOrigin` 是 `https://ballgames.io`，实现和生产输出需分别核验。
- origin 不含 path、query、hash 或尾斜杠。
- `defaultIndexable` 必须为 false。
- Phase 3 不添加无消费者的未来 archetype 字段。
- secret/token 不进入 SiteInstance。

### 6.2 PortalHomeContent

已批准的 PortalHomeContent 契约（DEC-003-B / B-1）：

```typescript
type PublicationStatus = 'draft' | 'published' | 'archived'

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

职责与合并规则：

- SiteInstance `metadata` 提供站点级默认 title/description、language/locale 与可选默认 social image；这些默认值不得掩盖 PortalHome 必填 SEO 缺失。
- PortalHomeContent 提供首页 publicationStatus、必填 page title、必填 page description、indexable 和可选 page-specific OG image。
- indexable PortalHome 必须显式提供非空 title/description；缺失或无效值是配置错误 / validation failure，不得静默回退 SiteInstance title/description。
- `ogImage` 缺失时可回退 SiteInstance `socialBanner`。
- canonical 不写入 PortalHomeContent，由 `siteUrl()` 生成；不得建立第二个 canonical 事实源。
- `updatedAt` 是根级页面内容生命周期字段，不属于 SiteInstance，也不得在 `seo` 下重复。

| Field | PortalHomeContent | SiteInstance | Rule |
|---|---|---|---|
| `title` | Required | Site-level default | PortalHome 必须显式提供；缺失即 validation failure |
| `description` | Required | Site-level default | PortalHome 必须显式提供；缺失即 validation failure |
| `indexable` | Required | `defaultIndexable` | 页面级显式控制 |
| `ogImage` | Optional | `socialBanner` | 页面值覆盖站点默认图 |
| `canonical` | Not stored | `canonicalOrigin` | 由 `siteUrl()` 生成 |
| `updatedAt` | Root-level optional | Not provided | 页面内容生命周期单一来源 |

PortalHome 映射到共享 resolved SEO 表示时：

```text
ResolvedPageSEO.updatedAt = PortalHomeContent.updatedAt
```

该值存在且有效时可供 sitemap `lastmod` 使用。缺失时不得使用当前构建时间、文件处理时间或其他虚构时间补齐。

ballgames §2 规则 1 的 `status === "published"` 是 §3.1 `publicationStatus === "published"` 的产品简写（**DEC-003-B / B-1 已批准**）。实现只使用 `publicationStatus`。

Phase 3 可用 fixture 验证该接口；不得在本阶段实现首页正文或将其混入 SiteInstance。

### 6.3 SitemapCandidate

每个候选页面必须独立满足：

1. page type enabled；
2. `publicationStatus === 'published'`；
3. `seo.indexable === true`；
4. canonical 有效且来自统一 URL helper；
5. 页面类型的必需内容/结构检查通过；
6. 生产 sitemap 中 route 已存在且返回可索引页面。

缺少任一信息时默认不进入 sitemap。`seo.indexable`、publication 和 route existence 不能互相替代。

## 7. URL and canonical contract

### 7.1 `siteUrl(path?)`

- `siteUrl()` → `https://ballgames.io`
- `siteUrl('/hockey-bros')` → `https://ballgames.io/hockey-bros`
- 非根 path 无尾斜杠。
- canonical 模式拒绝 query、hash、其他 origin、空 segment、`..` 与重复 slash。
- canonical 输出不依赖模板的 `trailingSlash` 默认值。

### 7.2 `gameUrl(slug)`

- 只接受 slug；数据层不存完整 path。
- `gameUrl('hockey-bros')` → `https://ballgames.io/hockey-bros`
- 内部委托 `siteUrl()`。
- 拒绝 `/hockey-bros`、absolute URL、query、hash 和不合规 slug。

### 7.3 Consumers

以下输出必须从同一 helper 获取 URL：

- canonical metadata；
- Open Graph URL；
- sitemap URL；
- JSON-LD `url`、`@id` 和 breadcrumb item；
- 可索引页面内部链接；
- 兼容层产生的 RSS/legacy origin。

业务代码不得硬编码 `"/hockey-bros"`；测试 fixture、redirect 表与 `specs/` 可按 ballgames §2 规则 12 排除。

### 7.4 `trailingSlash` investigation

DEC-003-E（Option E-1）只读调查已于 2026-11-02 完成，结论见 [`docs/architecture/architecture-consistency-review.md`](../../docs/architecture/architecture-consistency-review.md) §20。

- **已记录：** Next 15.5.12、`trailingSlash: true`、`EXPORT=1` static export、GitHub Pages workflow、当前无 `out/` build 实测。
- **未批准：** 修改 `trailingSlash`、redirect 层、部署平台变更。
- Phase 3 实现 Step 3 依赖 **单独批准** 的无尾斜杠**公开 URL**方案；`siteUrl()` canonical 输出仍须无尾斜杠，且不拿 `next.config.js` 当 canonical 事实源。

## 8. R1 sitemap contract

权威 ballgames Spec 冻结的生产 R1 sitemap URL 是：

1. `https://ballgames.io`
2. `https://ballgames.io/hockey-bros`

不得添加 `/blog`、blog posts、`/tags`、`/projects`、`/about`、`/search`、category、launcher-only game slug 或带尾斜杠变体。

### 8.1 Phase 3 contract validation

由于 Phase 3 禁止实现 `/hockey-bros` 页面：

- 使用受控 page descriptor fixture 证明两个合格页面会生成上述 exact-two set。
- 使用 draft、archived、indexable false、disabled page type、invalid canonical 和 missing route fixture 证明会被排除。
- 当前生产 sitemap 不得在 route 不存在时提前输出 `/hockey-bros`。

### 8.2 Phase 4 integration acceptance

当 `/` 与 `/hockey-bros` 实际页面存在、返回 200、具有自指 canonical 并通过 eligibility 后：

- 生产 sitemap 必须恰好两条；
- 不允许 duplicate 或 slash variant；
- URL 顺序不作为语义要求，URL set 才是验收依据；
- 每个 URL 必须与页面 canonical 完全相等。

Phase 3 / Phase 4 两阶段职责划分已由用户通过 DEC-003-D / D-1 批准。

Phase 3 应用代码实现仍须获得独立任务授权。本决策批准的是实施边界，不代表应用代码实现已经开始。

## 9. Metadata and robots contract

### 9.1 Site-level metadata

- site title、description、language、locale 和 social banner 只来自 SiteInstance。
- 不得继承 starter title、description、origin 或 social image。
- `metadataBase` 与 `siteUrl()` 使用同一 canonicalOrigin。

### 9.2 Page metadata

- PortalHome title/description 必须来自 PortalHomeContent；SiteInstance title/description 仅为站点级默认值，不得作为缺失 PortalHome 必填字段的静默 fallback。其他页面类型按各自已批准契约解析。
- PortalHome `ogImage` 可选；缺失时可回退 SiteInstance `socialBanner`。
- canonical 与 `openGraph.url` 必须相同。
- `seo.indexable === false` 或非 published 页面输出 `noindex`；不得进入 sitemap。
- indexable 页面才可输出 `index,follow`。

### 9.3 Robots

- `app/robots.ts` 的 sitemap URL 使用统一 helper。
- 不用 `Disallow` 替代 page-level noindex。
- R1 不实现 `/search`；不得为不存在的 R2 搜索策略提前扩大范围。
- robots 不能把 draft 或 disabled 页面“变成”可索引。

## 10. Blog and legacy route isolation

已批准的 Blog / Authors 隔离规则（DEC-003-C / C-1）：

1. 保留 Blog/Authors schema 和 contentlayer pipeline；不删除 Blog/Authors 模板代码。
2. ballgames `enabledPageTypes` 不包含 blog、tag、projects、about。
3. R1 sitemap generator 不读取 `allBlogs`。
4. Blog 不进入 R1 sitemap，不等于自动 noindex；页面级 robots 仍按各自契约与 legacy 决策处理。
5. portal SEO generator 不把 BlogPosting 当作 portal schema fallback。
6. legacy routes 的公开状态、noindex、redirect 或构建隔离仍须单独决策；“不在 sitemap”本身不足以阻止索引。

Phase 3 验收至少证明 legacy route 不进入 R1 sitemap，也不继承 ballgames indexable default。

## 11. JSON-LD contract

集中生成器按 page type 分发；页面组件不得重复手写同类型冲突块。所有 JSON-LD 必须可解析，URL 与 canonical 一致，且不得编造 `aggregateRating`、`review`、publisher、date、offers 或 permission。

| Type | Applicable page | Required properties for R1 | Data source | Phase 3 validation / integration |
|---|---|---|---|---|
| `WebSite` | PortalHome | `@context`、`@type`、`name`、`url`；R1 **无** `potentialAction` / SearchAction | SiteInstance | Phase 3 fixture 可完整验证；Phase 4 接页 |
| `ItemList` | PortalHome | `@context`、`@type`、`itemListElement`；R1 仅一个 ListItem，包含 position、游戏名和 `gameUrl('hockey-bros')` | 合格 Detail page descriptor | Phase 3 fixture；Phase 4 route 存在后输出 |
| `Organization` | PortalHome | `@context`、`@type`、已核验的 `name`、`url`；logo/sameAs 仅有证据时输出 | 经人工核验的实例组织数据 | **Blocked by missing evidence**；不得用品牌猜测法定实体 |
| `FAQPage` | PortalHome | `@context`、`@type`、`mainEntity`；Question.name 与 Answer.text 和 8 条可见 FAQ 逐字一致 | ballgames §5.6 可见内容 | Phase 4 integration；Phase 3 仅验证 generator shape |
| `VideoGame` | Game Detail | `@context`、`@type`、已核验的 name、url、description；publisher/date 仅有依据时输出 | GameDetail verified fields | Phase 4 integration；不得在 Phase 3 虚构 |
| `FAQPage` | Game Detail | 同上；与 ballgames §6.6 的 7 条可见 FAQ 逐字一致 | GameDetail visible FAQ | Phase 4 integration |
| `BreadcrumbList` | Game Detail | `@context`、`@type`、两项 `itemListElement`；每项含 position、name、canonical item | URL helpers + 可见两级 breadcrumb | Phase 4 integration；Phase 3 fixture 可验证 URL |

Rich Results Test 只能辅助语法/类型检查，不证明 Google 必然展示 rich result。

## 12. Ordered implementation plan

### Step 1 — Close entry decisions

- **Objective：** DEC-003-A–E 已获用户批准（2026-11-02）；维持 ADR/Spec/STATUS 一致；DEC-003-E 调查已记录于 Architecture Review §20。
- **Validation：** ADR 0003 **Accepted**；trailing-slash **实施方案**仍为 open。

### Step 2 — Add minimal typed site configuration

- **Objective：** 用单一 ballgames instance value 取代 starter SEO origin。
- **Inspect/likely modify：** `data/siteMetadata.js`、`app/layout.tsx`。
- **Potential create：** `data/siteConfig.ts` 或等价路径，须在实现时遵循仓库命名。
- **Expected behavior：** site metadata 不再继承 starter brand/origin。
- **Dependencies：** DEC-003-A。
- **Risks：** ESM/JS/TS 互操作；Blog/RSS legacy consumer breakage。
- **Validation：** typecheck；配置断言；检查 metadata 输出。

### Step 3 — Implement URL helpers

- **Objective：** `siteUrl()` 与 `gameUrl()` 成为唯一 canonical URL API。
- **Inspect/likely modify：** `contentlayer.config.ts`、`scripts/rss.mjs`、现有 URL 拼接 consumer。
- **Potential create：** `lib/urls.ts`。
- **Expected behavior：** root 与 game URL 符合无尾斜杠契约；非法输入 fail closed。
- **Dependencies：** SiteInstance；**trailing-slash 公开 URL 方案须单独批准**（DEC-003-E §20 仅为调查）。
- **Risks：** static export、base path 与 absolute canonical 混淆。
- **Validation：** deterministic URL assertions；hardcoded path scan。

### Step 4 — Unify metadata, canonical and Open Graph

- **Objective：** layout/page metadata 消费统一 source。
- **Inspect/likely modify：** `app/layout.tsx`、`data/siteMetadata.js`、需要 metadata 的 page files。
- **Expected behavior：** canonical 与 OG URL 同源，starter URL 为零。
- **Dependencies：** Steps 2–3。
- **Risks：** Metadata API 的 relative/absolute URL 合并造成 slash 漂移。
- **Validation：** build artifact/HTML 检查；URL equality assertions。

### Step 5 — Implement page eligibility and sitemap mechanism

- **Objective：** 集中 SitemapCandidate predicate，隔离 legacy Blog。
- **Inspect/likely modify：** `app/sitemap.ts`、`app/robots.ts`、`contentlayer.config.ts`。
- **Potential create：** 单一 SEO policy module；只有多消费者确实需要时创建。
- **Expected behavior：** 六项资格独立判定；production 不输出 missing route。
- **Dependencies：** PortalHome decision、Blog isolation、URL helpers。
- **Risks：** fixture contract 与真实 route registry 漂移。
- **Validation：** exact-set fixture、negative fixtures、generated sitemap inspection。

### Step 6 — Implement JSON-LD generator contract

- **Objective：** 按 page type 集中生成，缺少事实时省略或阻塞。
- **Inspect/likely modify：** `app/seo.tsx`、现有 JSON-LD consumer。
- **Potential create：** `lib/seo/structured-data.ts`；仅在职责明确时创建。
- **Expected behavior：** R1 types 可由 typed descriptor 生成；BlogPosting 逻辑保持隔离。
- **Dependencies：** URL helpers、page descriptors。
- **Risks：** FAQ 与可见内容不同步；Organization/VideoGame 字段被猜测。
- **Validation：** JSON parse、type mapping、forbidden-field assertions、fixture snapshot/equality。

### Step 7 — Add deterministic SEO validation

- **Objective：** 在无现有 test script 的情况下提供最小自动化检查。
- **Inspect/likely modify：** `package.json` 仅在 Phase 3 实现任务明确授权脚本入口时；CI workflow 只读评估。
- **Potential create：** `scripts/validate-seo.mjs`。
- **Expected behavior：** 一个非交互命令验证 URL、sitemap set、JSON-LD 和 forbidden values。
- **Dependencies：** Steps 2–6。
- **Risks：** 校验脚本只测 fixture，不代表 production page 存在。
- **Validation：** 正反 fixture 均执行；明确标注 contract vs integration。

### Step 8 — Validate build/export without changing deployment

- **Objective：** 证明机制兼容当前 Next/static export。
- **Inspect：** `next.config.js`、`.github/workflows/pages.yml`、`scripts/next-with-init-cwd.mjs`、`scripts/postbuild.mjs`。
- **Expected behavior：** typecheck、non-mutating lint、build、CI-equivalent export 与 SEO checks 均通过。
- **Dependencies：** 全部实现步骤。
- **Risks：** build/postbuild 会生成文件；工作区需在前后对比。
- **Validation：** §14 的实际命令和 artifact checks。

## 13. Acceptance criteria

- [x] 用户已逐项批准 ADR 0003 DEC-003-A–E（2026-11-02）；ADR 状态与文档一致。
- [x] DEC-003-E 只读调查已记录（§20）；**未**修改配置、部署或 URL 实现。
- [ ] trailing-slash/export **实施方案**已单独批准（调查建议 **未** 自动生效）。
- [ ] Site URL 不再继承 starter 域名或 starter brand。
- [ ] `siteUrl()` 与 `gameUrl()` 是 canonical URL 唯一入口。
- [ ] `siteUrl()` 与 `gameUrl('hockey-bros')` 精确输出两个权威 R1 URL。
- [ ] 非根 canonical 无尾斜杠；无 duplicate/slash variant。
- [ ] canonical 与 Open Graph URL 完全一致。
- [ ] page type、publicationStatus、indexable、canonical validity、content checks 和 route existence 分别验证。
- [ ] PortalHome title/description 缺失时 validation failure；不得由 SiteInstance 默认值静默补齐。
- [ ] PortalHome 可选 `ogImage` 缺失时仅回退 SiteInstance `socialBanner`。
- [ ] `ResolvedPageSEO.updatedAt` 只映射自根级 `PortalHomeContent.updatedAt`；缺失时不伪造时间。
- [ ] draft、archived、non-indexable、disabled 和 missing route 不进入 production sitemap。
- [ ] Phase 3 fixture 对 R1 exact-two set 通过正反校验。
- [ ] Phase 4 页面上线后，production sitemap 恰好包含两个权威 URL。
- [ ] Blog、tags、projects、about 与 Blog posts 不进入 R1 sitemap。
- [ ] robots 与 page-level indexability 一致，不用 Disallow 替代 noindex。
- [ ] WebSite 无 SearchAction。
- [ ] ItemList 仅包含 hockey-bros。
- [ ] JSON-LD 可解析、类型适用、URL 与 canonical 一致。
- [ ] FAQPage 与可见 FAQ 逐字一致；该项在 Phase 4 集成验收。
- [ ] 无 aggregateRating、review、未核实 publisher/date/offers。
- [ ] typecheck、non-mutating lint、normal build、CI-equivalent export 与 SEO validation 均实际 PASS。
- [ ] 没有实现 Catalog、Detail page、Launcher、iframe、广告、Shared Core 或后续 archetype。

## 14. Validation strategy

### 14.1 Current repository facts

- `yarn typecheck` 存在，实际为 `tsc --noEmit`。
- `yarn lint` 包含 `--fix`，会修改工作区；不得用作只读验证。
- 没有 `test` script。
- `yarn build` 经 wrapper 与 postbuild，可能生成 feed/search/export 文件。
- CI 只运行 `EXPORT=1 UNOPTIMIZED=1 BASE_PATH=<pages-base-path> yarn build`。

### 14.2 Phase 3 implementation validation commands

以下命令必须在实现任务中实际执行；本规划任务不执行：

```powershell
yarn typecheck --incremental false --composite false
yarn next lint --dir pages --dir app --dir components --dir lib --dir layouts --dir scripts
yarn build
$env:EXPORT='1'; $env:UNOPTIMIZED='1'; $env:BASE_PATH='<actual-pages-base-path>'; yarn build
node ./scripts/validate-seo.mjs
```

注意：

- `BASE_PATH` 必须使用 CI/部署实际值；未知时不能声称 export host compatibility PASS。
- build 前后必须检查 Git diff，区分实现文件与生成物。
- 若 Next 15.5.12 不支持当前 lint CLI，记录 FAIL 并使用仓库 ESLint 配置的非 mutating 等价命令；不得运行 `yarn lint` 后声称工作区未改。
- 不得在当前规划任务新增 package script；Phase 3 实现时是否新增入口需明确授权。

### 14.3 Output validation

- **Build：** normal build 和 CI-equivalent export 均需 PASS。
- **Type：** `tsc --noEmit` PASS。
- **Lint：** 非 mutating lint PASS。
- **SEO output：** 解析生成 HTML/metadata，检查 canonical、OG、robots 与 starter URL absence。
- **Sitemap：** fixture exact set；Phase 4 再检查 production exact set 和 HTTP 200。
- **JSON-LD：** JSON parse、type/property/URL/forbidden-field checks。
- **Manual review：** Organization 数据证据、Google Rich Results Test 辅助、真实托管 redirect/headers；不能由本阶段自动证明。

## 15. Risks and controls

| Risk | Control |
|---|---|
| 为满足 exact-two 提前发布 404 URL | production predicate 必须检查 route exists；用 fixture 验证未来 contract |
| SiteInstance 过度抽象 | 只保留 Phase 3 实际消费者字段 |
| `trailingSlash` 改动破坏 export | 先做当前版本验证，再选择最小实现 |
| Blog 被“排除 sitemap”误当作 noindex | 分别验证 sitemap 与 page robots；legacy route 策略单独决定 |
| JSON-LD 虚构事实 | 缺证据属性省略；Organization 缺证据时阻塞输出 |
| fixture 与页面实现漂移 | Phase 4 加 route-level integration checks |
| lint/build 修改工作区 | 使用非 mutating lint；build 前后检查 Git |
| Phase 3 被误称 Shared Core | STATUS 与完成报告明确本阶段只为 Minimum SEO Foundation |

## 16. Completion report requirements

Phase 3 完成报告必须列出：

1. 实际修改文件。
2. 获批准 ADR/用户决定的证据。
3. 每条验证命令、退出码和结果。
4. contract-level 与 production integration 验收的区别。
5. 尚待 Phase 4 的页面、JSON-LD、exact-two production sitemap 项。
6. 未修改的 Phase 4/后续能力。

完成 Phase 3 不等于 ballgames R1 完成，不等于 Phase 4 开始，也不等于 Shared Core 已提取。
