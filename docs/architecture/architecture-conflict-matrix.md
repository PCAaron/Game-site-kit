# Architecture Conflict Matrix

> **评审日期：** 2026-11-02
> **状态：** Review output；不代表建议已批准
> **优先级规则：** ballgames Instance Spec > Game Site Kit Specs > Current Template

## 1. Matrix

| ID | Topic | Source A | Source B | Conflict / Gap | Impact | Priority | Recommended Resolution | Status |
|---|---|---|---|---|---|---|---|---|
| ACM-001 | `/car-soccer` page type | `specs/ballgames/ballgames-specs-v1.md` §1.2、§4.3、§9：R3 Category | `specs/seo/01-search-intent-and-page-types.md`：`game_detail` | **Conflict** | R3 路由、内容字段与 JSON-LD 无法同时满足 | P1 | 以实例为准，后续把 Kit 行修正为 `category_hub` 或删除未冻结行 | Open |
| ACM-002 | 发布态字段名 | ballgames §2-1 使用 `status` | ballgames §3.1 与 Kit `04` 使用 `publicationStatus` | **Conflict / terminology** | 校验器可能出现两个字段或错误过滤 | P0 | 统一为 `publicationStatus`；当前只记录建议 | Open |
| ACM-003 | PortalHome 发布资格 | `specs/seo/04` 要求 `publicationStatus === published` | `specs/04` PortalHome 没有发布态字段 | **Gap** | 首页无法严格成为 SitemapCandidate | P0 | 为 PortalHome 增加发布态，或为 portal_home 定义等价显式规则 | Open |
| ACM-004 | Catalog 与 Detail 发布态 | 合并 Game 示例只有一个 `publicationStatus` | 文本允许 Catalog 与 Detail 独立存在 | **Gap / ambiguity** | Catalog 已发布但 Detail 未就绪时行为不明确 | P1 | 选定 Detail 独立状态或明确继承规则 | Open |
| ACM-005 | 首个验证实例 | 章程、STATUS、SEO 指南：ballgames game-portal | Legacy build guide / agent-ready spec：Car Soccer 单游戏站 | **Governance conflict** | Agent 可能执行错误业务路线 | P1 | 授权后在 Legacy 文件顶部标记 superseded | Open |
| ACM-006 | Phase 1 名称 | `specs/phases/01-*`：Agent workflow foundation，已完成 | 用户路线称 Phase 1 Shared Core | **Governance conflict** | 可能覆盖已完成 Phase 或错误更新 STATUS | P0 | 保留现行名称；Shared Core 若需要必须另立 Spec 和阶段号 | Resolved by review, confirmation required |
| ACM-007 | Phase 文件索引 | SEO 指南 §18 列出目标文件名 | 实际 `specs/phases/` 只有 00–02 且名称不同 | **Gap** | 新 Agent 可能搜索不存在文件 | P2 | 把 §18 明确为目标树，Phase 3 新建实际 Spec | Open |
| ACM-008 | SiteInstance 数据契约 | Kit `04` 仅列 7 个顶层字段 | ballgames 还需要品牌、语言、导航、素材、Organization、部署与 flags | **Gap** | 配置仍会散落或跨实例串值 | P0 | 接受 Proposed ADR 0003 后补最小类型化契约 | Proposed |
| ACM-009 | URL 单一事实源 | ballgames §2-11–13 与 Kit SEO 02 要求 helper | 当前 layout/sitemap/contentlayer/RSS 各自拼接 | **Gap** | canonical、OG、JSON-LD、sitemap 可能不一致 | P0 | Phase 3 实现 `siteUrl/gameUrl` | Proposed |
| ACM-010 | Trailing slash | ballgames canonical 无尾斜杠 | `next.config.js` `trailingSlash: true` | **Implementation conflict** | 重复 URL、导出路径与 canonical 漂移 | P0 | Phase 3 明确迁移/redirect/共存策略 | Open |
| ACM-011 | 生产 origin | ballgames 目标 `https://ballgames.io` | `data/siteMetadata.js` 仍是模板演示域名 | **Gap** | 所有 SEO 输出指向错误站点 | P0 | SiteInstance 驱动 metadataBase 与 helper；生产前人工核验 | Open |
| ACM-012 | Sitemap 范围 | ballgames R1 恰好 2 URL | 当前 sitemap 包含 blog/projects/tags/文章 | **Implementation conflict** | 违反冻结的 R1 索引面 | P0 | 使用 SitemapCandidate；排除未启用 page type | Open |
| ACM-013 | Page-level indexable | ballgames 默认 false、显式放行 | 当前根 metadata 默认 index/follow，Blog 仅用 draft | **Gap** | 未放行页面可能被索引 | P0 | PageSEO 统一 robots 与 sitemap 资格 | Open |
| ACM-014 | Content storage | Kit `04` 提供 contentlayer、JSON/YAML、混合三方案 | 当前只有 Blog/Authors | **Open architecture decision** | Phase 4 可能直接耦合存储 | P1 | 推荐 contentlayer Game + Catalog adapter，见 ADR 0002 | Proposed |
| ACM-015 | Catalog access | 架构要求业务通过 Catalog 接口读取 | 当前页面直接读取 `allBlogs` | **Gap** | 页面层与生成类型耦合 | P1 | 定义只读 adapter；R1 不引入数据库 | Proposed |
| ACM-016 | Organization data | 首页要求 Organization JSON-LD | SiteInstance 没有 organization 字段组 | **Gap** | 容易硬编码或虚构实体信息 | P1 | 增加可选且需核验的 Organization 配置 | Open |
| ACM-017 | VideoGame data | 详情页要求 VideoGame | GameDetail 未定义 schema 所需最小真实字段 | **Gap** | publisher/date 可能无依据 | P1 | 定义最小字段与“缺证据则省略”规则 | Open |
| ACM-018 | iframe product behavior | ballgames R1 强制单 iframe + 回退 | 当前无 Launcher，CSP 只允许 giscus | **Gap** | R1 运行区不能工作 | P0 | 接受 ADR 0004；许可与 CSP 验证后放行 | Proposed |
| ACM-019 | Embed permission | Kit 禁止 unknown 冒充 granted | ballgames URL/许可仍在 §7.1 待核实 | **Open Question** | 法务与上线阻塞 | P0 | 不改需求；保持 release gate | Manual Review |
| ACM-020 | Static export headers | 仓库主部署导出静态 `out` | 安全要求依赖 CSP/security headers | **Deployment gap** | Next `headers()` 无仓库内生效证据 | P0 | 接受 ADR 0005；由部署层提供或改部署模式 | Proposed |
| ACM-021 | Route Handler | Newsletter 支持 GET/POST | 静态 export 无运行时 POST | **Compatibility gap** | Newsletter 在生产不可依赖 | P1 | ballgames 默认关闭或外置服务 | Open |
| ACM-022 | Redirects | slug 变更要求 Redirect 表 | 静态部署 redirect 能力未知 | **Deployment gap** | 未来 slug 迁移不能保证 301 | P1 | R1 可延期；生产平台决策须覆盖 redirects | Open |
| ACM-023 | Feature flags | Kit 要求 per-site flags 且 ads/analytics 默认关 | 当前 analytics/search/newsletter/comments 由模板配置直接挂载 | **Gap** | 不同实例无法隔离服务 | P1 | 纳入 SiteInstance；按 flag 条件渲染 | Proposed |
| ACM-024 | R1 广告 | ballgames 详情要求两个广告位 | 项目治理默认广告关闭 | **Not a direct conflict / ambiguity** | 不清楚是空槽还是实际广告 SDK | P1 | 用户确认槽位与服务启用是两个决策 | Open Question |
| ACM-025 | Blog/Authors 保留 | ADR 0001 要求保留 contentlayer 管线 | ballgames R1 不允许博客 URL 扩大 sitemap | **Compatibility gap** | 删除过度，直接暴露也违规 | P1 | 保留能力但从 ballgames 导航/索引排除 | Proposed |
| ACM-026 | Structured Data generator | ballgames 要求按 page type 集中生成 | 当前只有 contentlayer BlogPosting | **Gap** | R1 schema 不存在 | P0 | Phase 4 新增集中生成器，不页内重复手写 | Open |
| ACM-027 | WikiEntry | 章程要求未来 game-wiki 独立模型 | 当前 Kit 仅纲要 | **Deferred gap** | 不影响 ballgames | P2 | Phase 5 由第二原型驱动，不在 R1 抽象 | Deferred |
| ACM-028 | Category model | Kit 有 Category 最小字段 | `/car-soccer` 归类冲突且 R3 未冻结实现 | **Gap** | R3 前需修正 | P1 | 延后到 R3，但先消除 page_type 冲突 | Deferred |
| ACM-029 | Validation / tests | Spec 要求 URL/index/sitemap 可重复校验 | package 无 test，CI 只 build | **Gap** | 回归依赖人工与 build | P2 | Phase 3 添加最小确定性校验，不预设测试框架 | Open |
| ACM-030 | Template Audit drift | 最新审计记录 `start` 实为 `next dev` | 旧审计写 `next start` | **Verified documentation drift** | 运维命令可能误用 | P2 | 单独文档任务修正，不属于 R1 架构 | Open |

## 2. Priority Summary

### P0

- ACM-002、003、006、008–013、018–020、026。
- 理由：会阻止 R1 的正式 URL、索引面、页面资格、iframe 安全或结构化数据按 Spec 上线。

### P1

- ACM-001、004、005、014–017、021–025、028。
- 理由：必须在消费该契约的 Phase 或 Release 前解决，但不全部阻塞 Phase 3 起步。

### P2

- ACM-007、027、029、030。
- 理由：属于后续治理、第二原型或维护质量改进。

## 3. Resolution Rules

1. ballgames 产品行为冲突时，采用 ballgames Instance Spec。
2. 安全、许可和禁止虚构事实不是可被实例静默覆盖的“默认值”。
3. 模板实现与 Spec 冲突时，记录模板 Gap，不削弱业务需求。
4. 本矩阵的 `Proposed` 只表示存在建议 ADR，不表示已接受。
5. 修改现有 Spec、Legacy 文档或状态文件必须另获授权。
