# Phase 4 — ballgames.io R1 Implementation

- **阶段编号：** 4
- **状态：** **Phase 4.0 — Spec 已批准启动**（业务代码 **NOT STARTED**）
- **Archetype：** `game-portal`
- **首实例：** ballgames.io
- **文档日期：** 2026-11-04
- **产品权威：** [`specs/ballgames/ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md)
- **前置阶段：** Phase 3 — Minimum SEO Foundation（**implemented — READY WITH EXTERNAL BLOCKERS**）

## 1. Objective

在 Phase 3 已落地的 SEO 机制之上，实现 ballgames.io **R1 冻结范围**：两个 indexable 页面（Portal Home `/` 与 Game Detail `/hockey-bros`）、15–20 条 Catalog launch 数据、首页单 iframe Launcher、组件层（GameCard / GameGrid / PlayFrame）、页面级 metadata / JSON-LD，以及 **production exact-two sitemap**。

本阶段交付 **首个真实 game-portal 实例**，验证 Kit 契约与 ballgames 产品 Spec 可在同一仓库共存，且 **不** 抽取 Shared Core、**不** 启动第二 archetype、**不** 实现 R2/R3 路由。

## 2. Authority and precedence

优先级（冲突时）：

1. **治理与安全** — `AGENTS.md`、`specs/00-project-charter.md`：禁止虚构事实、默认广告/分析关闭、未核实 embed 不得视为批准。
2. **ballgames 产品** — `specs/ballgames/ballgames-specs-v1.md`：R1 页面结构、TDK、正文配额、Launcher 行为、DoD（§8）。
3. **Kit 契约** — `specs/04-config-and-content-models.md`、`specs/seo/*`、`specs/phases/02-seo-page-model-and-content-contract.md`：可复用模型、SitemapCandidate、校验分层。
4. **已批准 ADR** — 尤其 ADR 0003（Applied）；ADR 0002 / 0004 / 0005 为 **Proposed**，实施须按本文 §6 边界执行，不得将 Proposed 全文当作已批准产品 override。
5. **Phase 3 机制代码** — `lib/site/*`、`lib/urls/*`、`lib/seo/*`：扩展集成，非替换。

**Phase 2.2 规则：** 实例 product 要求可覆盖 Kit **默认**；安全、许可诚实性、禁止虚构 structured data **不可**被实例静默覆盖。

**部署策略（2026-11-04 用户授权）：** GitHub Pages CI（`configure-pages@v5`）与 Node 20 Actions build **未验证通过** — 保留历史事实，**不再**作为 Phase 4 启动或批次验收的前置条件。正式部署目标为 **Cloudflare Pages**；host 级 HTTP、静态资源、域名与 CSP 验证留待 **部署阶段**，不在 Phase 4.0–4.x 机制验收中冒充 PASS。

## 3. Entry conditions

| Entry condition              | Status                      | Required outcome                                                                                                          |
| ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Phase 3 SEO 机制             | **Satisfied**               | `siteUrl` / `gameUrl`、`isSitemapCandidate`、sitemap 管线、legacy noindex、fixture 校验（代码基线见 STATUS `f2ea1b2` 链） |
| ADR 0003 DEC-003-A–F         | **Applied**                 | SiteInstance、PortalHomeContent 类型、Blog sitemap 隔离、legacy robots                                                    |
| ballgames R1 产品 Spec       | **Frozen**                  | §1–§8 v1.1 + Phase 2.2                                                                                                    |
| Phase 4 用户授权             | **Satisfied**               | 本 Kickoff 任务                                                                                                           |
| `/hockey-bros` 路由          | **NOT STARTED**             | Phase 4.1+                                                                                                                |
| Production exact-two sitemap | **NOT STARTED**             | 依赖 published + indexable + route exists                                                                                 |
| Embed 许可书面证据           | **BLOCKED — MANUAL REVIEW** | 不阻塞 Spec/内容模型/占位 UI；阻塞 **生产 iframe 启用**                                                                   |
| GitHub Pages CI              | **NOT VERIFIED**            | **非 Phase 4 gate**（见 §2）                                                                                              |
| Cloudflare Pages 部署        | **NOT STARTED**             | 部署阶段                                                                                                                  |

**Implementation gate：** Phase 4.0（本文档 + STATUS/WORKLOG）完成后，方可按 §13 批次授权 Phase 4.1 及后续业务代码。

## 4. In scope

### 4.1 页面与路由（R1）

- Portal Home `/`：替换当前 starter 博客首页为 ballgames 首页（DEC-003-F：indexable portal 须显式 metadata，**不得**依赖 legacy 默认可索引）。
- Game Detail `/hockey-bros`：唯一 R1 详情路由。
- Legacy Blog/Authors/tags/projects/about：**保留**，继续 `noindex, follow`，不进 R1 sitemap。

### 4.2 内容与 Catalog

- contentlayer2 扩展：**独立 `Game` 文档类型**（ADR 0002 推荐方案 B；单记录可合并 Catalog + 可选 Detail 字段组）。
- **PortalHome** 独立内容包（非 Blog、非 Game 伪装）。
- **Provider**、**LaunchConfig**、**EmbedPermission**（或等价结构化字段）可校验数据源。
- R1：**15–20** 条 `published` Catalog 行；**仅 `hockey-bros`** 完整 Detail + `seo.indexable === true`；其余 launcher-only。
- `publicationStatus`、`availability`、`showOnHome`、`homeSort`、页面级 `seo.indexable`。

### 4.3 组件与 Launcher

- GameCard、GameGrid、PlayFrame、Game Launcher（单 iframe、8s UX 兜底、16:9 / 桌面 min-height）。
- 首页卡行为 §2-14；内页 Related §6.7。
- 详情模板：正文、Controls、How to Play、FAQ、Breadcrumbs、广告 **DOM 槽位**（无 provider，默认不加载广告 SDK）。

### 4.4 SEO 集成（Phase 3 → 页面）

- 全站 URL：`siteUrl()`、`gameUrl(slug)`；禁止业务 path 硬编码（redirect 表、测试 fixture、`specs/` 除外）。
- Portal Home / Hockey Bros：TDK、canonical、OG、robots 与 `resolvePortalHomePageSeo` / Game Detail 对等解析器。
- **Production sitemap 恰好 2 条 canonical URL**（published + indexable + route exists + 结构校验）。
- JSON-LD 页面输出：首页 WebSite + ItemList + FAQPage + Organization（**仅在有核验证据时**）；内页 VideoGame + FAQPage + BreadcrumbList。
- 扩展 `getProductionPortalDescriptors()`、`isAppRoutePath()`、structured-data 生成器（内页类型 Phase 3 未完整实现部分）。
- 确定性校验：`validate:seo` / batch 测试扩展 **route + export** 集成（不替代 Cloudflare live HTTP）。

### 4.5 验证与文档

- 各批次 Agent 报告；里程碑更新 STATUS / WORKLOG。
- `git diff --check`；仓库既有 Prettier / lint 配置。

## 5. Out of scope

- R2/R3 路由（`/soccer-bros`、`/games`、`/search`、分类页、分页、Hot/New 顶栏等）。
- Shared Core 提取、Monorepo、第二站点 archetype。
- 删除 Blog 模板能力；Blog SEO redesign。
- 修复 GitHub Pages workflow；**本阶段不切换** Cloudflare 部署配置（部署阶段单独授权）。
- Next.js / React / Tailwind / contentlayer **版本升级**或替换 contentlayer。
- 未经论证的新依赖；广告 SDK；第三方分析默认仍关闭。
- 虚构 `primaryUrl`、Provider、EmbedPermission、aggregateRating、未核实 Organization/VideoGame 字段。
- Wiki、Newsletter 生产依赖、数据库 CMS。

## 6. Architecture and implementation boundaries

### 6.1 Phase 3 已有能力（集成点，非重写）

| 区域               | 位置                                           | Phase 4 职责                                                                      |
| ------------------ | ---------------------------------------------- | --------------------------------------------------------------------------------- |
| SiteInstance       | `lib/site/instances/ballgames.ts`              | 保持；必要时仅增 **有消费者** 的字段                                              |
| PortalHome fixture | `ballgamesPortalHomeContentFixture`            | 迁移为 **真实 PortalHome 内容源**；published + indexable 在首页上线批次启用       |
| URL helpers        | `lib/urls/site-url.ts`                         | 消费方扩展到页面/组件/内容                                                        |
| Sitemap            | `app/sitemap.ts` → `buildProductionSitemap`    | 注册 portal + game descriptors；exact-two                                         |
| Eligibility        | `lib/seo/sitemap-eligibility.ts`               | 接入 Game Detail descriptor                                                       |
| Route exists       | `lib/seo/routes.ts`                            | `/hockey-bros` → true；动态 game 路由注册策略                                     |
| Metadata           | `lib/seo/metadata.ts`、`resolve-page-seo.ts`   | Game Detail resolver；portal `/` 显式 indexable                                   |
| JSON-LD            | `lib/seo/structured-data.ts`                   | FAQPage、VideoGame、BreadcrumbList、Organization（有证据时）；禁止字段已有 assert |
| Legacy             | `LEGACY_PAGE_ROBOTS`                           | Blog 等保持；**`/` 不再走 legacy 默认可索引**                                     |
| 校验               | `scripts/validate-seo-entry.ts`、`test:batch*` | export 集成、exact-two production、无硬编码 path grep                             |

**当前 production 事实（@ Phase 4.0 审查）：**

- `app/page.tsx` 仍为 starter `Main` + `allBlogs`。
- `ballgamesPortalHomeContentFixture`：`publicationStatus: 'draft'`，`indexable: false` → sitemap **0 URL**（预期）。
- `isAppRoutePath('/hockey-bros')` → **false**。
- `contentlayer.config.ts` 仅 `Blog` + `Authors`。
- `buildOrganizationJsonLd` 故意返回 `undefined`（缺证据）。
- `data/siteMetadata.js` 已与 ballgames origin 对齐；须保持与 SiteInstance **单一 origin**，不得第二套 canonical。

### 6.2 与 ADR / 冲突矩阵

| ID                | 主题                          | Phase 4 处理                                                                                             |
| ----------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| ACM-004           | Catalog vs Detail 生命周期    | 实施前用户确认 archived Catalog + published Detail 策略；R1 默认同行 `published` 或 Detail 包独立 status |
| ACM-014 / ACM-015 | 存储与 Catalog adapter        | 采用 ADR 0002 方案 B；页面经只读 adapter，不直接耦合 UI 与 generated 类型                                |
| ACM-016 / ACM-017 | Organization / VideoGame 证据 | 缺证据字段 **省略**；不得为 DoD 凑数                                                                     |
| ACM-018 / ACM-019 | iframe vs 治理 / Embed 许可   | ADR 0004 方案 C：**granted + CSP 验证** 才生产 iframe；否则外链回退 + 配置边界；**unknown 非 granted**   |
| ACM-024           | R1 广告槽                     | 无 provider DOM 占位 vs 推迟 — **MANUAL REVIEW**（产品 §6.3 要求槽位）                                   |
| ACM-031           | Phase 3/4 边界                | 本阶段完成 production sitemap + 页面 JSON-LD；不得提前 index 未实现路由                                  |

**矩阵文档漂移：** `architecture-conflict-matrix.md` 部分行仍写 Phase 3「未实现」；以 **当前代码 + Phase 3 终验 v5** 为准，矩阵更新非 Phase 4.0 范围（需单独文档授权）。

### 6.3 App Router 约定

- Game Detail：`app/[slug]/page.tsx` **或** `app/(portal)/[slug]/page.tsx` — 批次 1 选定一种；须与 `isAppRoutePath`、generateStaticParams 一致。
- Portal Home：`app/page.tsx` 重写。
- 不得为 launcher-only slug 生成静态详情 HTML（404 或 noindex 占位 **不可**作为 R1 策略；launcher-only **无**详情路由）。

## 7. Content model

逻辑分层（[`specs/04-config-and-content-models.md`](../04-config-and-content-models.md)）：

```text
Catalog Item 存在  ⇏  Detail Content  ⇏  Indexable Page
showOnHome         ⇏  详情路由          ⇏  seo.indexable
```

### 7.1 Game（contentlayer proposed shape）

合并存储、分层校验：

- **Catalog 必填（R1 全部行）：** `slug`, `title`, `providerId`, `launch`, `publicationStatus`, `showOnHome`, `homeSort`；推荐 `thumbnail`, `availability`。
- **Detail 必填（仅 indexable 行）：** `seo`（title, description, indexable）, `intro`, `howToPlay`, `sections[]`, `faq[]`, `controls[]`, `publishedAt`, `updatedAt`。
- **字段名：** 架构统一 `publicationStatus`（DEC-003-B）；产品 §2 `status` 为简写。

### 7.2 PortalHomeContent

- 独立文档或 TS 模块 + MDX 正文块（批次 1 定案）。
- R1：`publicationStatus: 'published'`，`seo.indexable: true`，title/description 见 ballgames §5.1。
- 导语 + 五 H2 + **8** FAQ（`<details>`）；词频规则 §5、§7。

### 7.3 Provider / EmbedPermission

- 每条 `launch.primaryUrl` 映射 Provider；embed 状态为 **数据字段**（`granted` | `requested` | `denied` | `unknown`）。
- R1 Catalog `primaryUrl`：**人工填满** — Agent 不得虚构；未核实 URL 用 placeholder + `draft` 或 blocking 清单。

### 7.4 Card action 配置

- R1 仅 `hockey-bros`：`navigate-to-detail`（`<a href={gameUrl(slug)}>`）。
- 其余：`launcher-select`（`<button>` 换 iframe `src`）；内页 Related 一律 button + scrollIntoView。

## 8. Component responsibilities

| 组件                        | 职责                                                   | SEO                       |
| --------------------------- | ------------------------------------------------------ | ------------------------- |
| **SEOHead** / metadata 集成 | 消费 ResolvedPageSEO；canonical 仅 helpers             | 全页                      |
| **GameGrid**                | 排序、15–20 / 12–16 布局                               | 无独立 schema             |
| **GameCard**                | 锚文本仅游戏名；`<a>` vs `<button>` 由 cardAction 驱动 | 无 aggregateRating        |
| **PlayFrame**               | 16:9、游戏名非 heading、无 sandbox/lazy                | —                         |
| **Launcher**                | 单 iframe、src 切换、8s 兜底、外链 fallback            | —                         |
| **GameDetailTemplate**      | 正文结构、FAQ 可见块 = JSON-LD 源                      | Breadcrumb 可见 + JSON-LD |
| **Breadcrumbs**             | Home › Game；URL 经 helpers                            | BreadcrumbList            |
| **AdSlot**                  | 300×250、336×280 空槽                                  | 游戏区外                  |

## 9. Page implementation requirements

### 9.1 Portal Home `/`

- H1「Ball Games」+ 副标题 `<p>`（§5.2）。
- TDK §5.1；canonical = `siteUrl()`（无尾斜杠）。
- SEO 正文块：导语 + 5×H2；块内 **hockey bros = 0**。
- FAQ：**8** 条独立 `<details>`。
- GameGrid **15–20**；Launcher 默认 `hockeybros.io`（或 Catalog 配置）；屏宽 70%；桌面 min-height 480px。
- JSON-LD：WebSite、ItemList（仅 hockey-bros URL）、FAQPage、Organization（**有证据才输出**）。
- robots：indexable 时 `index, follow`（与 legacy `/` 策略切换）。

### 9.2 Game Detail `/hockey-bros`

- TDK、H1、副标题、五 H2 正文 ≈980 词、Controls、How to Play、FAQ **7** 条（§6）。
- Launcher + 双广告槽；**无** iframe 下 Controls/Note 两行（§8 DoD）。
- Related **12–16**，**全部 button** + scrollIntoView；H2⑤ 末句唯一 `<a>` 回 `/`。
- JSON-LD：VideoGame（无 aggregateRating）、FAQPage、BreadcrumbList（§6.8）。
- 源失效：URL 与正文 200，游戏区降级新窗口 + 说明（§2-8）。

### 9.3 全局

- 每页唯一 H1；禁止 keywords meta。
- 禁止 pushState、hash 路由、第二 iframe、链到未建详情 slug。

## 10. SEO integration requirements

1. 仅 **Portal Home** 与 **`hockey-bros` Detail** 允许 `seo.indexable === true` 且 `published`。
2. Sitemap：**严格 2 URL** — `https://ballgames.io`、`https://ballgames.io/hockey-bros`。
3. Blog/Authors/tags/projects/about：**不进** sitemap；legacy **noindex, follow**。
4. ItemList JSON-LD **仅**含已 indexable 详情 URL（R1 仅 hockey-bros）。
5. FAQPage JSON-LD 与可见 FAQ **逐字一致**（Phase 3 deferred 项在本阶段验收）。
6. CI /脚本：检测业务组件与页面中硬编码 `"/hockey-bros"` 等（排除 allowlist）。
7. `validate:seo --export-dir=out`：export 后 sitemap XML、首页/内页 canonical、robots、JSON-LD 块、**禁止** export `hockey-bros` 在 Phase 4 完成前 — 完成后 **必须**存在且可索引。

## 11. Security and embed permission requirements

- 遵循 ADR 0004 **推荐方案 C**（Proposed）：生产 iframe 仅当 `EmbedPermission.status === 'granted'` 且 CSP `frame-src` 部署验证通过。
- 始终提供 `target="_blank"` `rel="noopener noreferrer"` 回退。
- 不得将 `unknown` 默认为 granted；不得无许可启用生产 embed。
- `next.config.js` CSP 当前 **未**含游戏源 — iframe 批次须显式列出 allowlist 或保持 blocked + fallback（**MANUAL REVIEW** 阻塞生产 embed）。
- 广告与分析：默认关闭；不引入追踪 SDK。

## 12. Data verification requirements

`ballgames-specs-v1` §7.1 **VERIFICATION REQUIRED** — 实施时保留 cautious 措辞或 blocking 状态：

- 网格排序声明、studio/上线日期、隐私措辞、ad blocker 因果、两玩家支持范围、各 `primaryUrl` 与 embed 许可。

**JSON-LD 规则：** 无核验依据的属性 **不输出**；禁止 aggregateRating/review（Phase 3 `FORBIDDEN_KEYS` 延续）。

## 13. Implementation batches

各批次 **独立授权、独立验收**；不得跨批次合并未验收工作宣称 Phase 4 完成。

| Batch   | 名称                   | 范围                                                              | 主要交付                          | 验收要点                                          |
| ------- | ---------------------- | ----------------------------------------------------------------- | --------------------------------- | ------------------------------------------------- |
| **4.0** | Spec 与规划            | 本文档、STATUS、WORKLOG                                           | 无业务代码                        | Spec 完整、批次可执行                             |
| **4.1** | 内容模型与 adapter     | contentlayer `Game`、PortalHome 源、Provider/Embed 数据、校验脚本 | 类型 + 15–20 行数据（URL 人工填） | build 生成；校验 publication/indexable 分层       |
| **4.2** | 路由与 descriptor 注册 | `app/[slug]`、`isAppRoutePath`、production descriptors            | 静态路由仅 hockey-bros            | generateStaticParams；无 launcher-only 详情页     |
| **4.3** | Launcher 与卡片        | GameCard、GameGrid、PlayFrame、Launcher                           | 可 Storybook/临时页或并入 4.4     | 首页 button/a 行为；8s 兜底；无第二 iframe        |
| **4.4** | Portal Home 页面       | `app/page.tsx`、正文+FAQ、metadata                                | 可见首页                          | TDK、词频、iframe 唯一、legacy `/` 切换 indexable |
| **4.5** | Hockey Bros 详情       | 详情模板、正文、Related、Breadcrumbs                              | `/hockey-bros` 200                | §6 DoD 结构；Related scrollIntoView               |
| **4.6** | SEO 生产集成           | sitemap exact-two、页面 JSON-LD、grep 硬编码                      | `validate:seo` export             | 2 URL sitemap；FAQ JSON-LD 一致                   |
| **4.7** | R1 终验                | typecheck、batch tests、export、Agent 报告                        | phase-4-final-validation.md       | ballgames §8 DoD 逐项；**非** Cloudflare live     |

**建议顺序：** 4.0 → 4.1 → 4.2 → 4.3 ∥ 4.4/4.5（4.4 依赖 4.3；4.5 依赖 4.3）→ 4.6 → 4.7。

## 14. Acceptance criteria

Phase 4 **整体**完成（4.7 后）须满足：

- [ ] ballgames §8 R1 DoD 可核对项 **PASS** 或标注 **MANUAL REVIEW**（LCP、许可、词数回填）。
- [ ] Production sitemap **恰好 2** canonical URL（verified export XML）。
- [ ] 首页 + 内页 JSON-LD 类型与 §5.7 / §6.8 一致；无 forbidden fields。
- [ ] Legacy 路由仍 noindex；Blog 不进 sitemap。
- [ ] `yarn typecheck`、`yarn test:batch1`、`yarn test:batch2`、`yarn validate:seo`（含 export）exit 0 — 在 **documented code SHA** 上执行并记入报告。
- [ ] 无未经批准的依赖升级；Blog 未删除。
- [ ] **不得**声称 GitHub Pages CI PASS、Node 20 CI PASS、Cloudflare 部署 PASS、embed 生产许可 PASS，除非有独立证据。

Phase 4.0 alone：

- [x] 本文档存在且与 ballgames v1、Phase 3、ADR 0003 一致。
- [x] STATUS / WORKLOG 反映 Phase 4 启动与 4.0 完成。
- [ ] 业务页面 **NOT STARTED**（诚实状态）。

## 15. Manual review items

- ballgames §7.1 全部 VERIFICATION REQUIRED 项。
- Embed 许可与 CSP / Cloudflare 响应头（ADR 0005）。
- 生产 HTTPS canonical 源 `https://ballgames.io`。
- Organization / VideoGame 可选字段证据。
- LCP / PageSpeed（§8 DoD）。
- R1 广告槽：空 DOM vs 推迟 provider。
- Catalog `primaryUrl` 逐条来源与许可记录。
- Cloudflare Pages 首次部署与域名绑定（**部署阶段**）。

## 16. Risks and dependencies

| Risk                                   | Mitigation                                         |
| -------------------------------------- | -------------------------------------------------- |
| iframe 无许可仍上线                    | EmbedPermission gate + 外链 fallback；生产阻塞清单 |
| fixture 与页面 drift                   | 4.6 export 集成测试；FAQ 单一数据源                |
| contentlayer 校验不足                  | 构建前脚本 + publication/indexable 断言            |
| 硬编码 path 回归                       | grep CI / validate-seo                             |
| Organization 被猜测输出                | 保持 Phase 3 策略直至证据                          |
| GitHub Pages 失败被误读为 Phase 4 失败 | STATUS 明确非 gate；保留 NOT VERIFIED              |
| 矩阵/文档仍写 Phase 3「未实现」        | 以代码与终验为准；后续文档 sweep                   |

**Dependencies：** Phase 3 机制；ballgames 正文定稿；人工 URL/许可；Phase 4.1+ 分批授权。

## 17. Completion protocol

1. 每批次：列出修改文件、命令、exit code、PASS/FAIL/MANUAL REVIEW。
2. 区分 **机制 PASS** vs **production/live PASS**。
3. Phase 4 全部批次完成后更新 STATUS 为 **completed**（或 **READY WITH MANUAL BLOCKERS**），WORKLOG 里程碑条目。
4. **Phase 4.0 完成**不等于 R1 上线，不等于 ballgames DoD 全部满足。
5. 不得删除 Phase 3 验证报告；不得将 GitHub Pages 阻塞改写为 PASS。

## 18. Related documents

- [`specs/ballgames/ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md)
- [`specs/instances/ballgames/README.md`](../instances/ballgames/README.md)
- [`specs/phases/03-minimum-seo-foundation.md`](03-minimum-seo-foundation.md)
- [`docs/agent/decisions/0003-site-instance-url-and-seo-source.md`](../../docs/agent/decisions/0003-site-instance-url-and-seo-source.md)
- [`docs/agent/reports/phase-3-final-validation.md`](../../docs/agent/reports/phase-3-final-validation.md)
- [`docs/architecture/architecture-conflict-matrix.md`](../../docs/architecture/architecture-conflict-matrix.md)
