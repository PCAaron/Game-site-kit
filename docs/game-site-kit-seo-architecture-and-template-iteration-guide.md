# Game Site Kit：SEO 架构与开源模板迭代指南

- 版本：v1.0
- 整理日期：2026-10-31
- 基座：Tailwind Nextjs Starter Blog
- 用途：架构走查、阶段实施、Cursor / AI Coding Agent 参考

> 本文是目标架构与迭代建议，不代表现有仓库已经具备文中描述的文件、脚本或能力。执行代码变更前，必须审计实际仓库和所选模板版本。

## 0. 执行摘要

Game Site Kit 的目标不是复刻一个游戏网站，而是逐步形成可复用、可验证、由 AI Agent 辅助构建的游戏站工程。

目标覆盖三类站点：

1. `game-portal`：盒子聚合站，重点是游戏发现、分类、搜索、推荐和启动。
2. `game-wiki`：Wiki 游戏攻略站，重点是结构化知识、内容关联、检索和维护。
3. `embedded-game`：嵌入式小游戏站，重点是游戏运行容器、加载恢复、响应式体验和安全策略。

工程模块清单只是基础。SEO 必须贯穿页面规划、内容模型、URL、抓取与索引、内链、发布验证和运营监控。

推荐采用六个协作领域：

1. Platform Engineering
2. SEO Foundation
3. Content System
4. Site Archetypes
5. Monetization & User Experience
6. Agent Workflow & Quality Assurance

这六个领域是责任边界，不要求机械地对应六个代码包。

### 关键决策

- 以 Tailwind Nextjs Starter Blog 为候选基座，先审计所选分支、标签、依赖和内容管线，不直接假设模板状态。
- 保留经过验证的 Next.js、Tailwind、Markdown/MDX、主题、基础布局、内容渲染和 SEO 机制。
- 不把博客的文章、标签、作者等数据模型直接扩展成所有游戏站的万能模型。
- 不在第一阶段实现三个完整站点类型；先形成架构契约，再以真实站点验证。
- SEO 不等同于 title、description、sitemap；还需要页面策略、URL、索引资格、内容质量、内部链接、渲染和上线监控。
- 先让第二个显著不同的站点验证抽象是否成立，再将稳定能力沉淀为模板。
- **首个验证实例**为 `game-portal`：**ballgames.io** 球类游戏盒子聚合站（参考 [Poki 球类频道](https://poki.com/zh/%E7%90%83%E7%B1%BB) 的发现/分类体验），不是单游戏攻略站或 Car Soccer 类单游戏落地页。

---

# 第一部分：目标架构

## 1. 项目定位与成功标准

### 1.1 项目定位

Game Site Kit 是一个以共享工程能力为基础、支持多种游戏站点类型、由 AI Coding Agent 按规范逐步构建和验证的工程模板。

第一个站点是 **`game-portal` 验证实例**：以 **ballgames.io** 为域名的 Ball Games 球类游戏盒子聚合站（多游戏目录、分类、发现与 Play 启动；产品参考 [Poki 球类游戏](https://poki.com/zh/%E7%90%83%E7%B1%BB)）。它是验证实例，而不是整体架构边界。

### 1.2 成功标准

- 通过配置和内容创建站点实例，避免复制整套代码。
- 三种站点类型有清晰的产品边界、内容模型和验收契约。
- 共享能力与类型专属能力有明确的所有权和依赖关系。
- URL、索引策略、Sitemap、Canonical、内链和页面元数据保持一致。
- 内容发布流程有结构校验与质量门槛。
- 至少通过两个有实质差异的站点实例验证共享能力。
- Agent 任务有明确范围、验证命令、验收标准和真实报告。
- 版权、嵌入权限、第三方资源与安全策略可追溯。

## 2. 三类站点定义

### 2.1 game-portal：盒子聚合站

**目标：** 帮助用户发现、筛选并启动游戏。

常见页面：首页、游戏分类页、游戏详情页、搜索结果页、专题页。

核心能力：游戏目录与元数据、分类和筛选、游戏搜索、推荐与相关游戏、游戏启动器、详情页 SEO、分类页索引资格判断。

SEO 风险：

- 大量空分类页。
- 搜索参数与筛选组合产生重复 URL。
- 仅有游戏名称、缺少独立信息价值的薄内容页。
- 所有详情页套用相同描述。
- Sitemap 收录不应索引的 URL。

### 2.2 game-wiki：Wiki 游戏攻略站

**目标：** 帮助用户获取可靠、可检索、相互关联的游戏知识。

常见页面：Wiki 首页、攻略页、角色页、物品页、技能页、任务页、机制说明页。

核心能力：结构化内容模型、内容分类与导航、文章间引用、相关知识推荐、搜索、内容版本与更新时间、失效引用/孤立页面/重复内容检查。

SEO 风险：

- 只为关键词创建大量相似文章。
- 没有来源依据的游戏机制信息。
- 失效内部引用。
- 过时攻略长期不维护。
- 内容模型被单一博客文章结构限制。

### 2.3 embedded-game：嵌入式小游戏站

**目标：** 让用户在站内直接体验游戏。

常见页面：游戏落地页、游戏运行区域、操作说明、游戏介绍、故障回退信息、相关游戏或攻略。

核心能力：游戏运行容器、iframe/托管 HTML5 等运行适配器、加载/超时/错误/重试、响应式运行区域、支持时的全屏、外部回退、运行安全和来源校验。

SEO 风险：

- 页面主体只有第三方 iframe，缺少独立价值。
- 游戏加载失败后页面没有有用内容。
- 运行资源或关键内容无法被抓取。
- 移动端体验差或布局偏移严重。
- 未确认第三方是否允许嵌入或分发。

> 站点类型由主要产品目标和用户旅程决定，而不是由页面是否含 iframe 决定。聚合站可以嵌入某些游戏，但仍然属于 `game-portal`。

## 3. 六个协作架构领域

### Platform Engineering
站点/环境配置、路由与页面布局、设计系统与主题、内容加载基础设施、资源管理、构建/测试/部署。

### SEO Foundation
搜索意图与页面类型映射、URL 规范化与 Canonical、抓取与索引资格、Metadata、Structured Data、内部链接、Sitemap、渲染与可抓取性、SEO 验收、上线后监控。

### Content System
游戏元数据、Wiki 内容模型、内容分类与关系、来源/更新时间/发布状态、内容结构校验、内容质量流程、内容加载与渲染。

### Site Archetypes
`game-portal`、`game-wiki`、`embedded-game`。每种类型定义页面类型、必需能力、内容契约、SEO 策略和验收标准。

### Monetization & User Experience
广告接入边界、展示位置、广告与主要内容/游戏操作的关系、性能、移动端体验、广告政策和站点合规检查。

### Agent Workflow & Quality Assurance
仓库审计、站点类型判定、能力规划、受控实施、自动化验证、代码差异审查、报告与状态更新、架构决策记录。

## 4. 逻辑架构

```text
Game Site Kit
├── Platform Engineering
│   ├── Site / Environment Config
│   ├── Routing & Layout
│   ├── Design System
│   ├── Content Loading
│   ├── Asset Management
│   └── Build / Test / Deploy
├── SEO Foundation
│   ├── Search Intent & Page Types
│   ├── URL / Canonical
│   ├── Crawl / Index Policy
│   ├── Metadata / Structured Data
│   ├── Internal Linking / Sitemap
│   └── Validation / Monitoring
├── Shared Game Domain
│   ├── Game Metadata
│   ├── Optional Game Catalog
│   ├── Category Infrastructure
│   ├── Game Launcher
│   └── Related Content
├── Site Archetypes
│   ├── game-portal
│   ├── game-wiki
│   └── embedded-game
└── Site Instances
    ├── Config
    ├── Content & Assets
    ├── Page / Search Intent Map
    └── Monetization Config
```

这是逻辑架构，不是必须照搬的目录树。代码边界应由现有模板审计和真实复用需求决定。

## 5. 核心架构原则

1. 先验证，再抽象。
2. 共享能力只拥有真正共享的规则，不强迫所有站点使用同一种业务模型。
3. SEO 技术基础设施可以共享，但各类型的页面策略与内容质量标准必须不同。
4. 站点实例通过配置和内容差异化，不应把实例专属逻辑塞进共享核心。
5. URL、Canonical、内部链接、Sitemap 和索引策略必须一致。
6. 内容规模不能代替内容价值；自动化结构检查不能代替必要的内容审阅。
7. 第三方游戏的 URL、嵌入许可、来源和运行权限必须显式配置。
8. 不修改无关用户代码，不擅自升级框架或替换依赖。
9. 未执行的测试不得报告为通过。
10. 每个阶段结束时更新状态、风险和未决问题。

---

# 第二部分：SEO 基础架构

## 6. 搜索意图与页面类型映射

每个站点实例应建立页面策略表。

推荐字段：

| 字段 | 说明 |
|---|---|
| `intent_id` | 搜索意图标识 |
| `query_cluster` | 查询主题或关键词簇 |
| `intent_type` | 信息型、导航型、行动型等 |
| `page_type` | 对应页面类型 |
| `route_pattern` | URL 模式 |
| `content_requirements` | 页面必须回答的问题 |
| `internal_link_sources` | 哪些页面应链接到此页 |
| `index_policy` | 是否允许索引 |
| `status` | proposed / validated / retired |

规则：

- 不是每个关键词都需要独立页面。
- 只有当页面能满足独立用户需求、具有独立价值时，才考虑独立 URL。
- 搜索结果页和筛选组合不默认成为 SEO 落地页。
- 页面策略应考虑现有内容、竞争情况与真实搜索需求，不得编造搜索量或排名数据。

## 7. URL 与 Canonical

需要定义正式域名与 HTTPS、路径大小写和尾斜杠、URL 编码、查询参数、Canonical、旧 URL 重定向、404/410 使用规则和路由变更兼容策略。

验收：

- 内链、Canonical、Sitemap 使用一致的正式 URL。
- 参数 URL 不会无意中成为重复索引入口。
- 重定向目标明确，不形成循环链。
- 不能仅靠 Canonical 掩盖错误的路由设计。

## 8. 抓取、索引与 Sitemap

必须区分可抓取、允许索引、实际被收录。

| 页面 | 初始策略 |
|---|---|
| 正式首页 | 可索引 |
| 有独立价值的游戏详情页 | 可索引 |
| 有独立价值的分类页 | 可索引 |
| 无结果搜索页 | 通常不索引 |
| 临时筛选组合 | 通常不索引 |
| 空分类页 | 按业务语义处理，不默认索引 |
| 已发布且有价值的 Wiki 页面 | 可索引 |
| 草稿与预览页 | 不进入公开索引；必要时加访问控制 |
| 测试/预发布环境 | 阻止进入正式搜索索引 |
| 永久删除且无替代的页面 | 依据实际情况返回 404 或 410 |

Sitemap 规则：

- 只输出符合资格的正式 URL。
- 排除草稿、重定向 URL 和错误页面。
- `lastmod` 必须来自真实更新时间。
- 生成后检查 URL 合法性、重复项、状态码和 Canonical 一致性。
- Sitemap 帮助发现 URL，不保证收录。

安全提醒：`robots.txt` 主要控制抓取，不是可靠的禁止索引机制；私密内容必须使用访问控制。

## 9. Metadata 与 Structured Data

每种页面类型需要自己的元数据规则，不能只用统一模板替换游戏名称。

基础元数据：title、description、canonical URL、robots、必要时的 Open Graph 字段。

校验：缺失字段、明显重复的 title、Canonical 错误、页面内容与元数据不匹配、草稿或低价值页面错误地允许索引。

Structured Data：

- 根据真实可见内容选择 Schema。
- 只填写真实、可验证的信息。
- 不虚构评分、评论、作者、游戏属性或发布日期。
- 自动化验证 Schema 语法与字段；不承诺获得富媒体展示。
- 不为了“多加 Schema”而强行套用不适用的类型。

## 10. 内部链接

三种关系：导航链接、上下文链接、推荐链接。

聚合站：首页链接重要分类与游戏；分类页链接详情页；详情页关联相关游戏、分类或攻略。

Wiki：内容交叉引用必须准确；检查失效引用与孤立页面；重要知识页应能从相关主题页到达。

嵌入站：游戏容器外应存在可访问内容；不把所有信息藏在 iframe 内；游戏失败时仍提供必要说明与回退路径。

尽可能使用标准 HTML 链接，确保主要导航不是只能通过 JavaScript 事件访问。

## 11. 内容质量与发布门槛

建议流程：

```text
Draft
  -> Schema Validation
  -> Content Quality Review
  -> SEO Validation
  -> Publish
  -> Monitor / Maintain
```

游戏详情页检查：信息真实且有来源依据、玩法和操作准确、页面有独立用户价值、资源和启动链接经过验证、不是简单替换名称的模板化描述、图片版权和嵌入权限有记录。

Wiki 页面检查：直接回答目标问题、结构清晰且准确、需要时记录版本和来源、内部引用有效、过时内容有维护机制。

自动化可以检测结构、重复度、缺失字段和失效链接，但不能完全替代事实核验和内容价值判断。

## 12. 渲染、性能与体验

验收重点：

- 重要内容能在最终 HTML / 渲染结果中访问和理解。
- 标题、正文和关键链接不应不必要地依赖客户端交互才能出现。
- 图片尺寸和加载策略合理。
- 移动端主要内容与桌面端一致。
- 游戏加载失败时页面仍有可用内容。
- 广告不会遮挡主要内容或严重干扰游戏操作。
- 页面性能与布局稳定性有真实测试结果。

不要仅凭浏览器中“看起来正常”就认定 SEO 渲染合格。

## 13. SEO 验收与监控

构建阶段：Metadata / Canonical、索引资格、内链、Sitemap、内容模型、Structured Data 检查。

发布阶段：正式域名与 HTTPS、robots 和索引策略、关键页面 HTTP 状态、Sitemap 可访问性、页面渲染和移动端检查、环境域名索引控制。

运营阶段：Search Console 展示与点击、索引趋势和异常 URL、页面级自然搜索表现、失效链接与过时内容、性能和用户体验指标。

SEO 架构改善抓取、索引和内容组织条件，但不能保证页面一定收录或排名。

---

# 第三部分：Tailwind Nextjs Starter Blog 基座评估

## 14. 模板定位与适用边界

官方仓库：
https://github.com/timlrx/tailwind-nextjs-starter-blog

该模板定位为 Next.js、Tailwind CSS 的博客 starter。所选版本的框架、依赖、内容管线和脚本必须以实际 tag / commit 为准。

可作为起点并逐项审计的能力：

- Next.js 页面与布局基础
- Tailwind 样式与主题
- Markdown / MDX 内容渲染
- 文章元数据和内容列表
- 文章详情布局
- 目录、标签等内容导航
- 基础 SEO 元数据
- Sitemap / RSS 等内容站能力
- 基础分析或扩展集成

不是开箱即用的游戏站能力：

- 游戏目录与游戏元数据
- 游戏分类与筛选
- 游戏启动器
- iframe / hosted game runtime
- Wiki 关系模型
- 搜索意图映射
- 细粒度索引资格
- 游戏站专属内容质量规则
- 广告布局与游戏体验约束
- 多站实例配置和类型边界

## 15. 重要技术风险：内容管线

模板历史版本使用过 Contentlayer；当前官方仓库的 `package.json` 搜索结果显示使用 `contentlayer2` 与 `next-contentlayer2`。原始 Contentlayer 官方仓库说明其不再维护，并指向社区 fork。

因此：

- 不要看到模板支持 MDX，就假定内容管线没有维护风险。
- 先检查所选版本的实际依赖、锁文件、构建脚本和兼容性。
- 做最小安装、开发、构建、内容变更测试。
- 记录内容管线的风险和替换成本。
- 不要在第一步就盲目迁移内容系统。
- 若当前管线稳定且满足首个验证站点，可先保留，同时通过 adapter / 内容访问接口隔离业务代码。
- 如果审计发现安装、构建、Node / Next.js 兼容性或维护风险不可接受，再比较替代方案并做独立 ADR。

参考：

- 模板 README：https://github.com/timlrx/tailwind-nextjs-starter-blog/blob/main/README.md
- 模板 package.json：https://github.com/timlrx/tailwind-nextjs-starter-blog/blob/main/package.json
- 模板 Releases：https://github.com/timlrx/tailwind-nextjs-starter-blog/releases
- Contentlayer 官方仓库：https://github.com/contentlayerdev/contentlayer

## 16. 基座使用原则

保留并审计：已有布局与组件模式、主题和响应式模式、MDX 渲染、Metadata / SEO、Sitemap / RSS、图片处理、分析接入和安全配置。

优先替换或隔离：博客专属数据模型对游戏领域的直接耦合、作者/文章/标签固定页面结构对游戏页面的限制、全局导航中的硬编码博客信息、将单一博客页面当成所有内容类型的做法。

不要立即做：

- 一次性删除全部博客组件。
- 立即升级所有依赖。
- 同时迁移 MDX、路由、样式和 SEO 系统。
- 建立复杂的多租户平台或插件系统。
- 同时实现三类完整站点。
- 将每个站点差异都设计成布尔开关。
- 仅为“可复用”而把所有代码抽象成通用组件。

---

# 第四部分：基于模板的迭代步骤

## 17. Phase 0：固定基座并审计仓库

目标：确定具体使用哪个模板版本，并建立可重复基线。

步骤：

1. 决定使用官方仓库、指定 tag 或固定 commit。
2. 创建自己的仓库，并保留上游来源、许可证和基线 commit 记录。
3. 检查 `package.json`、锁文件、Node 版本要求和包管理器。
4. 检查所有 scripts，不能假设命令存在。
5. 安装依赖并运行现有开发、构建、lint / typecheck（若存在）。
6. 记录页面、内容目录、元数据、Sitemap、RSS、图片、分析和安全机制。
7. 保存基线测试结果和已知问题。
8. 此阶段不改写业务架构。

交付：

- `docs/agent/reports/template-audit.md`
- `docs/agent/STATUS.md`
- `docs/agent/decisions/0001-template-baseline.md`

验收：

- 具体 commit / tag 已记录。
- 运行命令来自实际仓库。
- 基线结果真实可复现。
- 现有功能和风险已列出。
- 没有无关代码修改。

## 18. Phase 1：建立 Agent 文档骨架

先创建最少但必要的文件：

```text
AGENTS.md
specs/
├── 00-project-charter.md
├── 01-site-archetypes.md
├── 02-capability-matrix.md
├── 03-platform-architecture.md
├── 04-config-and-content-models.md
├── 05-agent-workflows.md
├── 06-quality-and-acceptance.md
├── 07-security-and-compliance.md
├── seo/
│   ├── 00-seo-architecture.md
│   ├── 01-search-intent-and-page-types.md
│   ├── 02-url-canonical-indexing.md
│   ├── 03-metadata-structured-data.md
│   ├── 04-internal-linking-sitemap.md
│   ├── 05-content-quality.md
│   └── 06-seo-validation-monitoring.md
└── phases/
    ├── 00-template-audit.md
    ├── 01-architecture-design.md
    ├── 02-seo-foundation.md
    ├── 03-first-site-archetype.md
    ├── 04-second-archetype-validation.md
    └── 05-template-extraction.md

docs/agent/
├── STATUS.md
├── decisions/
├── reports/
└── templates/
```

这是目标结构。先检查现有文件，复用有效规范，避免重复创建。

`AGENTS.md` 只放全局目标、强约束和文档入口，不复制全部 Spec。Cursor Rules 保持精简，只负责 Cursor 专属行为和指向规范；通用工作流放在 Agent 可复用的文档或 Skills 中。

## 19. Phase 2：定义 SEO 页面模型与内容契约

在大规模写页面前，先确定首个站点需要哪些 URL 和页面类型。

交付：页面类型清单、搜索意图到页面的映射、URL 模式、索引资格规则、内容字段与校验规则、内链关系、Sitemap 资格规则、元数据规则。

只设计首个真实场景所需的最小模型，不提前定义所有未来字段。

## 20. Phase 3：实现最小 SEO Foundation

推荐顺序：

1. 统一正式站点 URL 配置。
2. 统一 metadata / canonical 生成。
3. 定义页面级索引资格。
4. 生成并验证 Sitemap。
5. 定义内链与路由规则。
6. 建立内容结构校验。
7. 建立 SEO 验收脚本或检查清单。
8. 建立部署环境检查。

优先复用模板现有实现。只有发现明确缺口时才新增模块。

验收：

- 页面元数据与正式 URL 一致。
- Sitemap 只包含符合规则的 URL。
- 草稿、搜索参数和临时页面不会无意中进入 Sitemap。
- 内容状态与索引资格规则一致。
- 重要页面可以被正常发现。
- 验证结果可重复执行。

## 21. Phase 4：实现第一个站点类型

首个实例已确定为 **`game-portal`**：**ballgames.io** Ball Games 球类游戏盒子聚合站（多游戏目录与分类浏览，参考 [Poki 球类频道](https://poki.com/zh/%E7%90%83%E7%B1%BB)）。Phase 4 应完整落实聚合站的页面类型、游戏元数据、索引策略与 Play 外链配置，**不要**将其降格为单游戏攻略/wiki 首站。

若未来另有站点实例，再按其主要用户旅程选择 `game-wiki` 或 `embedded-game`；不为文档顺序而强制类型。

实施顺序：

1. 定义页面类型和 URL。
2. 定义游戏元数据及内容 schema。
3. 实现最小数据读取层。
4. 实现页面布局与模板。
5. 实现 SEO 元数据、Canonical、内链和 Sitemap。
6. 实现 Play 行为与外部 URL 配置。
7. 验证移动端、渲染、性能与内容质量。
8. 完成发布前检查。

若 Play 采用外部原始游戏链接，应使用显式配置，并按产品需求打开新标签页；只有在确认游戏允许嵌入并完成安全评估后，才启用嵌入模式。

## 22. Phase 5：第二种类型验证

用第二种显著不同的类型检验现有设计。重点观察：

- 博客文章模型是否限制 Wiki 内容？
- 分类基础设施是否错误绑定了游戏分类？
- SEO 规则是否依赖特定页面组件？
- 站点配置是否出现过多布尔开关？
- 新类型是否必须修改第一个站点代码？
- 是否有大量重复逻辑值得抽象？

输出：

- `docs/agent/reports/cross-archetype-gap-analysis.md`
- 必要的架构决策记录
- 更新后的能力矩阵

## 23. Phase 6：实现第三种类型

实现 `embedded-game` 时验证：

- Runtime adapter 是否有清晰接口。
- iframe 权限是否最小化。
- 来源、外部 URL 和回退目标是否经过校验。
- 加载失败是否有恢复路径。
- 游戏运行区域是否响应式。
- 页面外层是否有独立内容价值。
- 广告是否影响主要操作。
- 是否存在版权、许可和服务条款限制。

不要为支持一种 iframe 游戏就将 iframe 假设写入所有游戏数据和页面模板。

## 24. Phase 7：模板提取与稳定化

经过多种站点验证后，再评估是否抽象：

- 站点配置契约
- 内容加载接口
- 页面类型与 SEO 元数据接口
- 分类基础设施
- 游戏启动接口
- 内链与相关内容接口
- 内容校验流程
- 站点实例创建脚本

每个抽象都记录实际重复场景、当前实现、抽象后接口、使用者、兼容性影响、验收方式和未解决问题。

## 25. Phase 8：发布和运营

每个站点实例独立完成正式域名、HTTPS、robots / Sitemap、Canonical、Search Console、分析工具、404 / 重定向、移动端与性能、广告与隐私政策（适用时）、内容更新与异常监控。

平台可以提供共用检查工具，但各实例的域名、内容、索引规则和 Search Console 数据不能混为一谈。

---

# 第五部分：Agent 执行规范

## 26. 每个阶段的 Agent 循环

```text
读取项目规范
  -> 检查仓库事实
  -> 明确本次范围
  -> 制定实施计划
  -> 修改代码 / 文档
  -> 运行实际验证
  -> 审查 diff
  -> 更新报告与 STATUS
```

任何阶段不得跳过仓库检查、范围声明或验证报告。

## 27. Agent Task 必须包含的字段

```markdown
# Agent Task

## Objective
本次任务的目标。

## Required Context
必须先读取的项目规范和阶段 Spec。

## Repository Inspection
必须检查的文件、依赖、脚本和实现。

## Scope
本次允许修改的内容。

## Out of Scope
本次禁止实施的内容。

## Plan
实施步骤。

## Validation
实际执行的验证命令。

## Acceptance Criteria
客观、可验证的完成标准。

## Report
修改文件、测试结果、风险、未决问题和下一步。
```

## 28. 状态管理

`docs/agent/STATUS.md` 建议包含当前阶段、最近完成任务、已验证能力、未验证假设、阻塞项、最近命令及结果、架构决策链接和下一项明确任务。

使用 `proposed`、`experimental`、`validated` 等状态区分设计、试验和验证，不将计划中的能力写成已完成能力。

---

# 第六部分：首个 Cursor 任务

可将以下任务直接交给 Cursor / AI Coding Agent：

```text
Task: Audit the selected Tailwind Nextjs Starter Blog baseline for Game Site Kit.

Objective:
Establish a factual baseline before designing or implementing the reusable game-site architecture.

Required:
1. Read existing project instructions and specifications.
2. Identify the exact template source, tag/commit, package manager and runtime requirements.
3. Inspect package.json, lockfile, build configuration, route structure, content pipeline, metadata, sitemap, RSS, image handling, analytics and security headers.
4. Execute only scripts that actually exist in the repository.
5. Record successful and failed checks with real output.
6. Identify which capabilities should be retained, adapted, isolated or considered risky.
7. Pay special attention to content-pipeline maintenance and compatibility risk.
8. Create or update:
   - docs/agent/reports/template-audit.md
   - docs/agent/STATUS.md
   - docs/agent/decisions/0001-template-baseline.md
9. Preserve existing user changes.
10. Do not implement archetypes, replace the content system, upgrade dependencies or redesign SEO in this task.

Acceptance:
- Exact baseline revision is recorded.
- Commands are based on the actual repository.
- Existing SEO and content capabilities are documented.
- Content-pipeline risks are explicit.
- Every test result is real and reproducible.
- No unrelated code is modified.
- The report recommends the next task without silently starting it.
```

---

# 第七部分：架构走查清单

## 29. 产品与类型边界

- [ ] 三类站点的目标和用户旅程已明确。
- [ ] 每种类型有必需能力、可选能力和非目标。
- [ ] 首个实例被正确分类，没有将“游戏站”一概当成聚合站。
- [ ] 页面类型与用户搜索意图有明确映射。

## 30. SEO 基础设施

- [ ] URL 与 Canonical 规则一致。
- [ ] 页面级索引资格有定义。
- [ ] Sitemap 按真实发布状态生成。
- [ ] Metadata 规则按页面类型区分。
- [ ] Structured Data 与实际页面内容一致。
- [ ] 内链可抓取且有校验机制。
- [ ] 内容质量有发布门槛。
- [ ] 生产与预发布环境索引控制清晰。
- [ ] 性能与移动端体验有可执行的验收方法。
- [ ] 有上线后监控和内容维护流程。

## 31. 模板基座

- [ ] 所选 tag / commit 固定并记录。
- [ ] 包管理器与 Node 版本要求已确认。
- [ ] 开发、构建、lint、typecheck 等实际脚本已审计。
- [ ] 现有内容管线的维护风险已评估。
- [ ] 没有未经评估就迁移或替换依赖。
- [ ] 模板原有 SEO 功能有清单并完成回归验证。
- [ ] 博客专属数据模型与游戏领域模型已分离。
- [ ] 共享能力的抽象有真实多站点验证依据。

## 32. Agent 工程化

- [ ] `AGENTS.md` 是入口而非所有规范的重复副本。
- [ ] 阶段 Spec 有范围和验收标准。
- [ ] Skill 描述可复用流程，而不是替代正式规范。
- [ ] 每个任务都有实际验证记录。
- [ ] STATUS 区分 proposed、experimental 和 validated。
- [ ] 未经批准不跨阶段扩展工作。
- [ ] 重要决策记录了背景、选择和影响。

---

# 第八部分：参考资料

1. Tailwind Nextjs Starter Blog README  
   https://github.com/timlrx/tailwind-nextjs-starter-blog/blob/main/README.md

2. 模板 package.json  
   https://github.com/timlrx/tailwind-nextjs-starter-blog/blob/main/package.json

3. 模板 Releases  
   https://github.com/timlrx/tailwind-nextjs-starter-blog/releases

4. Contentlayer 官方仓库（原项目已停止维护，并指向社区 fork）  
   https://github.com/contentlayerdev/contentlayer

5. Google Search Central SEO Starter Guide  
   https://developers.google.com/search/docs/fundamentals/seo-starter-guide

6. Google Search Central Crawling and Indexing  
   https://developers.google.com/search/docs/crawling-indexing

7. Google Search Central Links Best Practices  
   https://developers.google.com/search/docs/crawling-indexing/links-crawlable

8. Google Search Essentials  
   https://developers.google.com/search/docs/essentials

---

## 最终实施原则

不要先写一个庞大的“通用游戏站框架”，再尝试把所有站点塞进去。

正确顺序是：

1. 固定并审计开源模板基线。
2. 明确 SEO 页面策略与三类站点边界。
3. 建立最小、可验证的 SEO Foundation。
4. 用第一个真实站点验证。
5. 用第二种明显不同的站点检验架构。
6. 用第三种站点验证运行容器与安全边界。
7. 根据真实重复点提取共享能力。
8. 形成可重复的站点实例化、验收和维护流程。

模板是否成功，不以抽象层数量或文档数量衡量，而以新站能否更快、安全地搭建，SEO 基础是否可靠，以及已有站点是否可以独立演进来衡量。
