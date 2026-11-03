# Architecture Conflict Matrix

> **评审日期：** 2026-11-02
> **状态：** ADR 0003 DEC-003-A–E Accepted（2026-11-02）；**实现未完成**
> **优先级规则：** ballgames Instance Spec > Game Site Kit Specs > Current Template
> **分类规则：** P0 仅用于直接 R1 上线/发布阻塞；阶段命名等治理问题最高为 P1。

## 1. Issue Type Taxonomy

| Type | Definition |
|---|---|
| Missing specification | No corresponding specification or proposed contract exists |
| Pending decision | A proposed solution or contract exists but requires explicit approval |
| Implementation gap | The requirement or contract is defined, but application code has not implemented it |
| Confirmed conflict | Two authoritative requirements cannot currently be satisfied together |
| Blocked by missing evidence | An external fact, permission, or authoritative source is not yet verified |

`Governance issue` 与 `Technical risk` 仅用于不属于上述五类契约决策的治理或技术风险记录。对已有提案或明确规范，不得使用 `Missing specification`；若同一主题同时含待批准决策与代码缺口，矩阵行按其当前主要阻塞因素分类，并在 problem / resolution 中分别说明，不合并为含糊标签。

## 2. Matrix

| ID | Topic | Related files / sections | Category | Type | Current behavior / problem | Impact | Priority | Recommended Resolution | Owner / approval | Blocking phase | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ACM-001 | `/car-soccer` page type | ballgames §1.2、§4.3、§9；SEO 01 intent table | Page model | Confirmed conflict | ballgames 定义 R3 Category，SEO intent 表误标 `game_detail` | R3 路由、字段与 JSON-LD 无法同时满足 | P1 | 以实例为准；获批后将通用表修正为 `category_hub` | Product + architecture owner | Future R3 | Open |
| ACM-002 | 发布态字段名 | ballgames §2 规则 1、§3.1、§4.1；Kit 04 Game Detail；SEO 05 §11 | Content lifecycle | Implementation gap | 产品 §2 仍写 `status`；DEC-003-B 批准架构统一 `publicationStatus`，不修改产品 Spec | 校验器须只读 `publicationStatus` | P1 | **Decision resolved** — ADR 0003 DEC-003-B | User / DEC-003-B | Phase 3 | Decision resolved |
| ACM-003 | PortalHome 发布资格 | SEO 03 PageSEO；SEO 04 §3–4；Kit 04 PortalHome；ADR 0003；Phase 3 Spec；ballgames §4.1 | PortalHome | Implementation gap | DEC-003-B 已批准 PortalHomeContent；通用模型未集成；代码未实现 | 首页尚不能作为 R1 sitemap 候选（代码） | P0 | **Decision resolved** — B-1；实现见 Phase 3 | User / DEC-003-B | Phase 3 implementation | Decision resolved |
| ACM-004 | Catalog 与 Detail 发布态 | Kit 04 Catalog/Game Detail；ballgames §2、§3.1 | Content lifecycle | Pending decision | Catalog 与 Detail 生命周期未分离，archived 行为未定义 | 可能暴露 draft Detail 或错误移除有效 Detail | P1 | 分别判断 Catalog visibility、Detail publication、SEO indexability | User / ADR 0002 | Phase 4 | Pending decision |
| ACM-005 | 首个验证实例 | Charter；STATUS；Legacy build guide / agent-ready spec | Governance | Governance issue | 现行首实例为 ballgames，Legacy 文件仍描述 Car Soccer 单站 | Agent 可能执行错误路线 | P1 | 获授权后仅给 Legacy 文件标记 superseded | Project owner | Planning | Open |
| ACM-006 | Phase 1 名称 | Phase 1 Spec；STATUS；用户旧路线措辞 | Governance | Governance issue | 既有 Phase 1 是 Agent Workflow Foundation，不是 Shared Core | 可能误报阶段或越权，但不是发布阻塞 | P1 | 保留编号；Shared Core 若需要必须另立并批准 | Project owner | Planning | Open |
| ACM-007 | Phase 文件索引 | SEO 指南 §18；实际 `specs/phases/` | Governance | Pending decision | Phase 3 Spec 已存在，但指南目标树与实际文件名仍不同，澄清方案尚未批准 | Agent 可能搜索不存在文件 | P2 | 明确 §18 是目标树；保留实际 Phase 3 Spec | Documentation owner | None | Proposed |
| ACM-008 | SiteInstance 数据契约 | Kit 04 SiteInstance；ADR 0003；`data/siteMetadata.js` | Site configuration | Implementation gap | DEC-003-A 已批准；未实现 | origin 与站点默认 metadata 仍散落 | P0 | **Decision resolved** — A-1 | User / DEC-003-A | Phase 3 implementation | Decision resolved |
| ACM-009 | URL 单一事实源 | ballgames §2 规则 11–13；SEO 02；ADR 0003；Phase 3 Spec；layout/sitemap/RSS | URL policy | Implementation gap | DEC-003-A 已批准 helper；代码仍分散拼接 | canonical、OG、JSON-LD、sitemap 可能不一致 | P0 | 实现 `siteUrl`/`gameUrl`；**F1** 已批准并落地 | User / DEC-003-A | Phase 3 implementation | Decision resolved |
| ACM-010 | Trailing slash | ballgames §2 规则 5；`next.config.js`；ADR 0003 DEC-003-E | URL policy | Implementation gap | **F1：** `trailingSlash: false`（2026-11-03）；§20 + Batch 0 build 证据 | 若 Pages clean URL 失败需 F3 | P0 | **F1 applied**；host HTTP 复核 Pending | User / DEC-003-E | Phase 3 / R1 release | Partially resolved |
| ACM-011 | 生产 origin | ballgames §2；`data/siteMetadata.js` | Canonical | Implementation gap | DEC-003-A 已批准 `canonicalOrigin`；仍为 starter 域名 | SEO 输出指向错误站点 | P0 | SiteInstance 驱动 metadataBase（**未实现**） | ADR 0003 DEC-003-A | Phase 3 / R1 release | Decision resolved |
| ACM-012 | Sitemap 范围 | ballgames §4.1；`app/sitemap.ts` | Sitemap | Implementation gap | DEC-003-C/D 已批准；代码仍读 allBlogs | 违反 R1 exact-two | P0 | SitemapCandidate + 不读 allBlogs（**未实现**） | ADR 0003 | Phase 3 / Phase 4 | Decision resolved |
| ACM-013 | Page-level indexable | ballgames §2 规则 4；SEO 04；ADR 0003；Phase 3 Spec；当前 metadata/sitemap | Indexability | Implementation gap | SEO Specs、ADR 0003 与 Phase 3 Spec 已定义默认 false、显式放行及 SitemapCandidate 资格，但当前应用未实现 | 未放行页面可能被索引 | P0 | 实现并分别验证 page type、publication、indexable、canonical、route exists | ADR 0003 | Phase 3 / R1 release | Proposed |
| ACM-014 | Content storage | Kit 04 §4；ADR 0002；`contentlayer.config.ts` | Content storage | Pending decision | 有三种方案，当前只有 Blog/Authors | Phase 4 可能直接耦合存储 | P1 | 推荐 contentlayer Game + Catalog adapter；等待 ADR 0002 | User | Phase 4 | Pending decision |
| ACM-015 | Catalog access | Kit 01 catalog boundary；当前页面数据读取 | Data layer | Missing specification | 业务无统一 Catalog 接口 | 页面层与生成类型耦合 | P1 | Phase 4 定义最小只读 adapter；R1 不引数据库 | ADR 0002 | Phase 4 | Proposed |
| ACM-016 | Organization data | ballgames §4.2；Phase 3 Spec §11；Kit 04 SiteInstance | Structured data | Blocked by missing evidence | Phase 3 Spec 已定义最小 schema 规则，但 Organization 名称、logo、sameAs 等权威数据未核验 | 容易硬编码或虚构实体 | P1 | 仅在有核验数据时配置；缺证据则阻塞该 schema 输出 | Product owner | Phase 4 / R1 release | Open |
| ACM-017 | VideoGame data | ballgames §4.2；Phase 3 Spec §11；Kit 04 GameDetail | Structured data | Blocked by missing evidence | Phase 3 Spec 已定义 name/url/description 最小规则，但 publisher/date 等产品事实未核验 | publisher/date 可能无依据 | P1 | 缺证据属性必须省略；Phase 4 只接入已核验字段 | Product owner | Phase 4 / R1 release | Open |
| ACM-018 | iframe product behavior | ballgames §3.2；AGENTS.md；ADR 0004 | Game runtime | Confirmed conflict | R1 iframe-first 与默认新标签/未授权禁嵌入冲突 | 直接实现会违反产品或安全边界 | P0 | 仅 explicit granted + allowlist 时 iframe，否则新标签 | User | Phase 4 / R1 release | Pending decision |
| ACM-019 | Embed permission | ballgames §3.2、§7.1、§8；ADR 0004 | Permission | Blocked by missing evidence | EmbedPermission 与商业使用许可未核验 | iframe-first 的 R1 主要 Play 行为无法获得生产发布批准 | P0 | 建立可追溯 permission record 并人工确认；不得将 unknown 记为 granted | Product/legal owner | Phase 4 / R1 release | Open |
| ACM-020 | Static export headers | ADR 0005；Pages workflow；ballgames §3.2 | Deployment security | Technical risk | export PASS、host headers、CSP、第三方 frame policy、runtime load 尚未分别验证 | build PASS 可能被误当作 iframe production-ready | P0 | 分别验证五类证据；Phase 3 SEO 不依赖 iframe | Deployment/security owner | Phase 4 release | Open |
| ACM-021 | Route Handler | Newsletter API；static export boundary | Feature / deployment | Technical risk | Newsletter 依赖 GET/POST，static export 无运行时 POST | 生产 Newsletter 不可依赖 | P1 | ballgames 默认关闭；如启用则使用已批准外部服务 | Product owner | Future feature | Open |
| ACM-022 | Redirects | SEO 02 slug policy；ADR 0005 | Deployment | Blocked by missing evidence | 静态托管 redirect 能力未知 | slug 迁移无法保证 301 | P1 | R1 可延期；部署决策须覆盖 redirect | Deployment owner | Future slug change | Open |
| ACM-023 | Feature flags | Kit 01；template providers/env | Configuration | Missing specification | analytics/search/newsletter/comments 直接由模板配置挂载 | 不同实例可能串功能 | P1 | 按实际阶段定义最小实例 flags，默认关闭 | Architecture owner | Phase 4+ | Proposed |
| ACM-024 | R1 广告 | ballgames §3.1；AGENTS.md | Product scope | Pending decision | 详情要求广告位，治理默认广告关闭；槽位与 provider 未区分 | DOM、CLS、合规与验收不明确 | P1 | 用户确认可为无 provider 的 DOM 占位，或推迟 | User | Phase 4 / R1 release | Open |
| ACM-025 | Blog/Authors 保留 | ADR 0001；ballgames §4.1；current routes | Blog isolation | Implementation gap | DEC-003-C 已批准；legacy 路由策略仍 Open | R1 SEO surface 风险 | P1 | **Decision resolved** — C-1 | User / ADR 0003 | Phase 3 | Decision resolved |
| ACM-026 | Structured Data generator | ballgames §4.2；SEO 02/03；Phase 3 Spec；`app/seo.tsx` | Structured data | Implementation gap | DEC-003-D 已批准；当前仅 BlogPosting | R1 schema 验收失败 | P0 | Phase 3 机制 + Phase 4 集成（**未实现**） | User / DEC-003-D | Phase 3/4 | Decision resolved |
| ACM-027 | WikiEntry | Charter；Kit 01 §4 | Future archetype | Missing specification | game-wiki 只有纲要 | 不影响 ballgames | P2 | 第二原型驱动，不在 R1 抽象 | Architecture owner | Second archetype | Deferred |
| ACM-028 | Category model | ballgames §6 R3；Kit 04 Category | Category | Pending decision | Kit 已有 proposed Category contract，但 `/car-soccer` 分类与 taxonomy 尚未冻结 | R3 前需修正 | P1 | 延后到 R3 决策，但保留 ACM-001 冲突 | Product owner | Future R3 | Deferred |
| ACM-029 | Validation / tests | SEO specs；Phase 3 Spec；`package.json`；Pages workflow | Validation | Implementation gap | 确定性 SEO 校验要求已定义，但无 test script，CI 只 build | SEO 回归依赖人工 | P2 | Phase 3 增加确定性 SEO 校验脚本，不预设框架 | Phase 3 owner | Phase 3 completion | Proposed |
| ACM-030 | Template Audit drift | current package scripts；旧 audit | Documentation | Governance issue | 旧审计将 `start` 写为 `next start`，实际是 `next dev` | 运维命令可能误用 | P2 | 后续单独修正，不属于 R1 架构 | Documentation owner | None | Open |
| ACM-031 | Phase 3 / Phase 4 SEO 集成边界 | ballgames §4.1–4.2；Phase 3 non-goals；current routes | Phase boundary | Implementation gap | DEC-003-D 已批准；`/hockey-bros` 尚不存在 | 不得伪造 production sitemap/JSON-LD | P1 | **Decision resolved** — D-1 | User / DEC-003-D | Phase 3 implementation | Decision resolved |

## 3. Priority Summary

### P0 — 直接 R1 上线/发布阻塞

- **11 项：** ACM-003、008–013、018–020、026。
- 理由：直接阻止正式 URL、索引面、页面资格、iframe 安全或结构化数据按 Spec 上线。

### P1

- **16 项：** ACM-001、002、004–006、014–017、021–025、028、031。
- 理由：必须在消费该契约的 Phase 或 Release 前解决，但不全部阻塞 Phase 3 起步。

### P2

- **4 项：** ACM-007、027、029、030。
- 理由：属于后续治理、第二原型或维护质量改进。

## 4. Resolution Rules

1. ballgames 产品行为冲突时，采用 ballgames Instance Spec。
2. 安全、许可和禁止虚构事实不是可被实例静默覆盖的“默认值”。
3. 模板实现与 Spec 冲突时，记录模板 Gap，不削弱业务需求。
4. 本矩阵的 `Decision resolved` 表示 **ADR/用户决策已关闭**，不表示应用代码已实现。
5. 修改现有 Spec、Legacy 文档或状态文件必须另获授权。
6. `Pending decision` 不能因为存在推荐而写成 Resolved。
7. `Missing specification` 仅用于不存在规范或 proposed contract 的主题；已有契约但缺代码时使用 `Implementation gap`。
