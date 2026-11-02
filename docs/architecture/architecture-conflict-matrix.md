# Architecture Conflict Matrix

> **评审日期：** 2026-11-02
> **状态：** Review remediated；不代表建议已批准
> **优先级规则：** ballgames Instance Spec > Game Site Kit Specs > Current Template
> **分类规则：** P0 仅用于直接 R1 上线/发布阻塞；阶段命名等治理问题最高为 P1。

## 1. Matrix

| ID | Topic | Related files / sections | Category | Type | Current behavior / problem | Impact | Priority | Recommended Resolution | Owner / approval | Blocking phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ACM-001 | `/car-soccer` page type | ballgames §1.2、§4.3、§9；SEO 01 intent table | Page model | Confirmed conflict | ballgames 定义 R3 Category，SEO intent 表误标 `game_detail` | R3 路由、字段与 JSON-LD 无法同时满足 | P1 | 以实例为准；获批后将通用表修正为 `category_hub` | Product + architecture owner | Future R3 | Open |
| ACM-002 | 发布态字段名 | ballgames §2 规则 1、§3.1、§4.1；Kit 04 Game Detail；SEO 05 §11 | Content lifecycle | Confirmed conflict | `status` 与 `publicationStatus` 混用 | 校验器可能出现两字段或错误过滤 | P1 | 建议将 `status` 映射为 `publicationStatus` 的产品简写；不在本任务改权威 Spec | User / DEC-003-B | Phase 3 | Pending decision |
| ACM-003 | PortalHome 发布资格 | SEO 03 PageSEO；SEO 04 §3–4；Kit 04 PortalHome；ballgames §4.1 | PortalHome | Missing specification | 通用 SitemapCandidate 要 published，但 PortalHome 尚无获批的发布态与完整 PageSEO 来源 | 首页无法严格成为 R1 sitemap 候选 | P0 | 推荐独立 PortalHomeContent，包含 publicationStatus、page title/description/indexable、可选 ogImage；canonical 由 `siteUrl()` 生成 | User / DEC-003-B | Phase 3 implementation | Pending decision |
| ACM-004 | Catalog 与 Detail 发布态 | Kit 04 Catalog/Game Detail；ballgames §2、§3.1 | Content lifecycle | Pending decision | Catalog 与 Detail 生命周期未分离，archived 行为未定义 | 可能暴露 draft Detail 或错误移除有效 Detail | P1 | 分别判断 Catalog visibility、Detail publication、SEO indexability | User / ADR 0002 | Phase 4 | Pending decision |
| ACM-005 | 首个验证实例 | Charter；STATUS；Legacy build guide / agent-ready spec | Governance | Governance issue | 现行首实例为 ballgames，Legacy 文件仍描述 Car Soccer 单站 | Agent 可能执行错误路线 | P1 | 获授权后仅给 Legacy 文件标记 superseded | Project owner | Planning | Open |
| ACM-006 | Phase 1 名称 | Phase 1 Spec；STATUS；用户旧路线措辞 | Governance | Governance issue | 既有 Phase 1 是 Agent Workflow Foundation，不是 Shared Core | 可能误报阶段或越权，但不是发布阻塞 | P1 | 保留编号；Shared Core 若需要必须另立并批准 | Project owner | Planning | Open |
| ACM-007 | Phase 文件索引 | SEO 指南 §18；实际 `specs/phases/` | Governance | Missing specification | 指南目标树与实际文件名不同 | Agent 可能搜索不存在文件 | P2 | 明确 §18 是目标树；新建实际 Phase 3 Spec | Documentation owner | None | Proposed |
| ACM-008 | SiteInstance 数据契约 | Kit 04 SiteInstance；ADR 0003；`data/siteMetadata.js` | Site configuration | Pending decision | Phase 3 最小契约已提出但未批准、未实现；导航、素材、组织与 feature 扩展明确后移 | origin 与站点默认 metadata 仍可能散落或串实例 | P0 | 批准 DEC-003-A 最小契约；未来字段只在出现真实消费者时扩展 | User / DEC-003-A | Phase 3 implementation | Pending decision |
| ACM-009 | URL 单一事实源 | ballgames §2 规则 11–13；SEO 02；layout/sitemap/RSS | URL policy | Missing specification | 多处独立拼接 URL | canonical、OG、JSON-LD、sitemap 可能不一致 | P0 | ADR 0003 定义 `siteUrl()` 与 `gameUrl()` | User | Phase 3 implementation | Pending decision |
| ACM-010 | Trailing slash | ballgames §2 规则 5；`next.config.js`；ADR 0003 DEC-003-E | URL policy | Confirmed conflict | 产品要求非根无尾斜杠，模板为 `trailingSlash: true`；调查尚未获授权 | 重复 URL、导出路径与 canonical 漂移 | P0 | 先单独批准只读调查；证据完成后再批准最终 redirect/export/配置方案 | User + Phase 3 owner | Phase 3 / R1 release | Pending decision |
| ACM-011 | 生产 origin | ballgames §2；`data/siteMetadata.js` | Canonical | Confirmed conflict | 目标是 `https://ballgames.io`，当前仍为 starter 域名 | 所有 SEO 输出会指向错误站点 | P0 | SiteInstance canonicalOrigin 驱动 metadataBase 与 helper | ADR 0003 | Phase 3 / R1 release | Proposed |
| ACM-012 | Sitemap 范围 | ballgames §4.1；`app/sitemap.ts` | Sitemap | Confirmed conflict | R1 要 exact two，模板包含 blog/projects/tags/文章 | 违反冻结的 R1 索引面 | P0 | 使用统一 SitemapCandidate，且 R1 不读取 allBlogs | ADR 0003 | Phase 3 mechanism / Phase 4 integration | Proposed |
| ACM-013 | Page-level indexable | ballgames §2 规则 4；SEO 04；当前 metadata/sitemap | Indexability | Missing specification | 默认 false + 显式放行尚未进入实现 | 未放行页面可能被索引 | P0 | 分离 page type、publication、indexable、canonical、route exists | ADR 0003 | Phase 3 / R1 release | Proposed |
| ACM-014 | Content storage | Kit 04 §4；ADR 0002；`contentlayer.config.ts` | Content storage | Pending decision | 有三种方案，当前只有 Blog/Authors | Phase 4 可能直接耦合存储 | P1 | 推荐 contentlayer Game + Catalog adapter；等待 ADR 0002 | User | Phase 4 | Pending decision |
| ACM-015 | Catalog access | Kit 01 catalog boundary；当前页面数据读取 | Data layer | Missing specification | 业务无统一 Catalog 接口 | 页面层与生成类型耦合 | P1 | Phase 4 定义最小只读 adapter；R1 不引数据库 | ADR 0002 | Phase 4 | Proposed |
| ACM-016 | Organization data | ballgames §4.2；Kit 04 SiteInstance | Structured data | Missing specification | 首页要求 Organization，但无已核验数据契约 | 容易硬编码或虚构实体 | P1 | 仅在有核验数据时配置；缺证据则阻塞该 schema 输出 | Product owner | Phase 4 / R1 release | Open |
| ACM-017 | VideoGame data | ballgames §4.2；Kit 04 GameDetail | Structured data | Missing specification | 未定义 VideoGame 最小真实字段 | publisher/date 可能无依据 | P1 | Phase 4 定义最小字段；缺证据属性必须省略 | Product owner | Phase 4 / R1 release | Open |
| ACM-018 | iframe product behavior | ballgames §3.2；AGENTS.md；ADR 0004 | Game runtime | Confirmed conflict | R1 iframe-first 与默认新标签/未授权禁嵌入冲突 | 直接实现会违反产品或安全边界 | P0 | 仅 explicit granted + allowlist 时 iframe，否则新标签 | User | Phase 4 / R1 release | Pending decision |
| ACM-019 | Embed permission | ballgames §3.2、§7.1、§8；ADR 0004 | Permission | Blocked by missing evidence | EmbedPermission 与商业使用许可未核验 | iframe-first 的 R1 主要 Play 行为无法获得生产发布批准 | P0 | 建立可追溯 permission record 并人工确认；不得将 unknown 记为 granted | Product/legal owner | Phase 4 / R1 release | Open |
| ACM-020 | Static export headers | ADR 0005；Pages workflow；ballgames §3.2 | Deployment security | Technical risk | export PASS、host headers、CSP、第三方 frame policy、runtime load 尚未分别验证 | build PASS 可能被误当作 iframe production-ready | P0 | 分别验证五类证据；Phase 3 SEO 不依赖 iframe | Deployment/security owner | Phase 4 release | Open |
| ACM-021 | Route Handler | Newsletter API；static export boundary | Feature / deployment | Technical risk | Newsletter 依赖 GET/POST，static export 无运行时 POST | 生产 Newsletter 不可依赖 | P1 | ballgames 默认关闭；如启用则使用已批准外部服务 | Product owner | Future feature | Open |
| ACM-022 | Redirects | SEO 02 slug policy；ADR 0005 | Deployment | Blocked by missing evidence | 静态托管 redirect 能力未知 | slug 迁移无法保证 301 | P1 | R1 可延期；部署决策须覆盖 redirect | Deployment owner | Future slug change | Open |
| ACM-023 | Feature flags | Kit 01；template providers/env | Configuration | Missing specification | analytics/search/newsletter/comments 直接由模板配置挂载 | 不同实例可能串功能 | P1 | 按实际阶段定义最小实例 flags，默认关闭 | Architecture owner | Phase 4+ | Proposed |
| ACM-024 | R1 广告 | ballgames §3.1；AGENTS.md | Product scope | Pending decision | 详情要求广告位，治理默认广告关闭；槽位与 provider 未区分 | DOM、CLS、合规与验收不明确 | P1 | 用户确认可为无 provider 的 DOM 占位，或推迟 | User | Phase 4 / R1 release | Open |
| ACM-025 | Blog/Authors 保留 | ADR 0001；ballgames §4.1；current routes | Blog isolation | Pending decision | 删除 Blog 过度，但直接进入 sitemap 违反 exact-two | R1 SEO surface 被旧路由扩大 | P1 | 保留 schema/pipeline；ballgames 不启用 blog page type，sitemap 不读 allBlogs | User / ADR 0003 | Phase 3 | Pending decision |
| ACM-026 | Structured Data generator | ballgames §4.2；SEO 02/03；`app/seo.tsx` | Structured data | Missing specification | R1 需六类 schema，当前只有 BlogPosting | R1 schema 验收失败 | P0 | Phase 3 建集中机制/contract tests；Phase 4 结合可见内容输出 | User confirms phase split | Phase 3/4 | Pending decision |
| ACM-027 | WikiEntry | Charter；Kit 01 §4 | Future archetype | Missing specification | game-wiki 只有纲要 | 不影响 ballgames | P2 | 第二原型驱动，不在 R1 抽象 | Architecture owner | Second archetype | Deferred |
| ACM-028 | Category model | ballgames §6 R3；Kit 04 Category | Category | Missing specification | `/car-soccer` 分类与 taxonomy 尚未冻结 | R3 前需修正 | P1 | 延后到 R3，但保留 ACM-001 冲突 | Product owner | Future R3 | Deferred |
| ACM-029 | Validation / tests | SEO specs；`package.json`；Pages workflow | Validation | Missing specification | 无 test script，CI 只 build | SEO 回归依赖人工 | P2 | Phase 3 增加确定性 SEO 校验脚本，不预设框架 | Phase 3 owner | Phase 3 completion | Proposed |
| ACM-030 | Template Audit drift | current package scripts；旧 audit | Documentation | Governance issue | 旧审计将 `start` 写为 `next start`，实际是 `next dev` | 运维命令可能误用 | P2 | 后续单独修正，不属于 R1 架构 | Documentation owner | None | Open |
| ACM-031 | Phase 3 / Phase 4 SEO 集成边界 | ballgames §4.1–4.2；Phase 3 non-goals；current routes | Phase boundary | Pending decision | Phase 3 需准备 SEO，但 `/hockey-bros` 与可见 FAQ 属 Phase 4 | 阻塞 Phase 3 实施边界；真正的 404 sitemap 与虚假 JSON-LD 风险已由 ACM-012、ACM-026 的 R1 gates 覆盖 | P1 | Phase 3 做 contract/fixture 验证；Phase 4 页面存在后验收生产 exact-two 与 page JSON-LD | User | Phase 3 implementation | Pending decision |

## 2. Priority Summary

### P0 — 直接 R1 上线/发布阻塞

- **11 项：** ACM-003、008–013、018–020、026。
- 理由：直接阻止正式 URL、索引面、页面资格、iframe 安全或结构化数据按 Spec 上线。

### P1

- **16 项：** ACM-001、002、004–006、014–017、021–025、028、031。
- 理由：必须在消费该契约的 Phase 或 Release 前解决，但不全部阻塞 Phase 3 起步。

### P2

- **4 项：** ACM-007、027、029、030。
- 理由：属于后续治理、第二原型或维护质量改进。

## 3. Resolution Rules

1. ballgames 产品行为冲突时，采用 ballgames Instance Spec。
2. 安全、许可和禁止虚构事实不是可被实例静默覆盖的“默认值”。
3. 模板实现与 Spec 冲突时，记录模板 Gap，不削弱业务需求。
4. 本矩阵的 `Proposed` 只表示存在建议 ADR，不表示已接受。
5. 修改现有 Spec、Legacy 文档或状态文件必须另获授权。
6. `Pending decision` 不能因为存在推荐而写成 Resolved。
