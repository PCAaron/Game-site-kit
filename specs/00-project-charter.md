# Game Site Kit — 项目章程

## 愿景与长期目标

Game Site Kit（GSK）是一套**可复用的游戏站点工程工具包**，用于在共享平台能力之上，快速、可维护地交付多种形态的游戏网站。长期目标：

1. 以 **ballgames.io**（`game-portal`）为首个验证实例，完成球类游戏盒子聚合站。
2. 构建第二个在类型或用户旅程上显著不同的站点，验证抽象是否成立。
3. 在验证通过后再沉淀稳定模块，避免过早通用化。

技术基座来自 [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) lineage；**当前仓库仍是博客信息架构**，三类站点原型尚未实现（见 [`docs/agent/reports/template-audit.md`](../docs/agent/reports/template-audit.md)）。

## Game Site Kit 是什么 / 不是什么

| 是 | 不是 |
|---|---|
| 可配置的站点工程基座与文档化阶段路线 | 单个 Car Soccer 或单游戏落地页项目 |
| 共享 SEO、构建、Agent 工作流的**平台层** | 强迫所有站点共用一种业务内容 schema 的 CMS |
| 支持多站点实例、配置隔离的模板演进方向 | 多个完整 Starter 模板的拼接产物 |
| 以实际审计与验证为依据的迭代 | 未实现能力被描述为「已上线」 |

## 三类站点原型（Site Archetypes）

站点类型由**主要产品目标与用户旅程**决定，而不是由是否使用 iframe 决定。

### `game-portal` — 游戏发现与聚合

**主旅程：** 浏览 → 分类/筛选 → 查看游戏详情 → **Play**（默认新标签页打开外部 URL）。

常见页面：首页、分类、游戏详情、专题；搜索与推荐为产品能力，不默认可索引 SEO 落地页。

**首个验证实例：** **ballgames.io** Ball Games 球类游戏盒子（参考 [Poki 球类频道](https://poki.com/zh/%E7%90%83%E7%B1%BB) 的发现体验，非复刻第三方站点）。

### `game-wiki` — 结构化游戏知识

**主旅程：** 按主题导航 → 阅读攻略/机制/条目 → 沿内链深入相关知识点。

常见页面：Wiki 首页、攻略、角色/物品/任务/机制条目。内容模型与 portal 的「游戏目录」不同，**不得**用单一 `Blog` 文章结构替代完整 Wiki 模型。

### `embedded-game` — 站内运行游戏

**主旅程：** 进入游戏落地页 → 在站内运行区体验 → 必要时查看说明与回退。

常见页面：落地页、运行容器、操作说明、错误回退。依赖嵌入许可、CSP 与 `frame-src` 策略；基线模板当前 **X-Frame-Options: DENY**，嵌入前须 ADR。

## 共享平台能力 vs 原型专属能力

**共享（跨原型，逐步沉淀）：**

- 站点/环境配置边界（`siteUrl`、feature flags、品牌元数据）
- SEO Foundation：metadata、canonical 规则、sitemap/robots、结构化数据**机制**（非各原型页面策略表本身）
- 构建/ lint / typecheck / 部署模式（Yarn、Next SSG/export）
- Content System **基础设施**：MDX/contentlayer 管线（**validated** 于基线）；具体文档类型按原型扩展
- Agent 工作流：阶段 Spec、STATUS、验证与 ADR

**原型专属（不得强行统一为一种业务模型）：**

- 页面类型与 URL 策略表
- 内容字段与校验规则（游戏目录 vs Wiki 条目 vs 运行配置）
- 游戏启动器 vs Wiki 内链 vs iframe 运行适配器
- 各原型的索引资格与薄内容门槛

## 横切关注点

### SEO

SEO 是**系统级能力**：搜索意图 → 页面类型 → URL/canonical → 索引资格 → sitemap/metadata/JSON-LD → 验收，贯穿 Platform 与 Content。不是仅在 layout 里加几个 meta 标签。

详细迭代路线见 [`docs/game-site-kit-seo-architecture-and-template-iteration-guide.md`](../docs/game-site-kit-seo-architecture-and-template-iteration-guide.md)。

### Monetization（变现）

广告与付费位属于 **Monetization & UX** 域：位置、性能、合规与「不干扰 Play/阅读」的边界。默认**关闭**广告与数据分析；启用须 per-site 配置并记录政策审查。

## 非目标与范围边界

- 不在未立项阶段替换 contentlayer2 / MDX 管线。
- 不擅自升级 Next、React、Tailwind 或批量换依赖。
- 不编造游戏数据、搜索量、授权或许可状态。
- 不将三个原型硬编码为同一套「Game」表驱动所有页面。
- Phase 文档中列出的「proposed」架构不得当作已实现。

## 架构原则

1. **先验证，再抽象** — 至少两个差异站点实例后再提取共享模块。
2. **配置隔离** — 各站点实例独立 brand、canonical、launchUrl、feature flags。
3. **默认安全 Play** — 新标签页外链；iframe 需许可 + CSP ADR。
4. **SEO 一致性** — URL、canonical、sitemap、内链策略同源规则。
5. **证据驱动** — 能力状态标为 `proposed` / `experimental` / `validated`。
6. **保护用户变更** — Agent 任务不得丢弃无关本地修改。
7. **遵守第三方许可** — 保留 LICENSE；素材复用须记录审查。

## 项目整体验收标准（高层）

- [ ] 基线 commit 与审计可复现（**validated** — Phase 0）。
- [ ] Agent 文档骨架与阶段 Spec 可用（Phase 1）。
- [ ] 首个 `game-portal` 实例（ballgames.io）具备页面策略表与可索引核心 URL（Phase 2+）。
- [ ] 最小 SEO Foundation 在实例域名上验证通过（Phase 3+）。
- [ ] 第二原型验证跨站点共享边界（Phase 5 方向）。
- [ ] 自动化验证可重复（当前：`yarn lint`、`yarn typecheck`、`yarn build`；无 `test` 脚本）。

## 相关文档索引

| 文档 | 用途 |
|---|---|
| [`AGENTS.md`](../AGENTS.md) | Agent 入口与执行规则 |
| [`specs/README.md`](README.md) | Specs 索引、优先级、Phase 4.2 最小读取清单 |
| [`specs/architecture/01-system-overview.md`](architecture/01-system-overview.md) | 逻辑架构与能力状态 |
| [`specs/phases/`](../specs/phases/) | 分阶段任务 Spec |
| [`docs/agent/STATUS.md`](../docs/agent/STATUS.md) | 当前阶段与阻塞项 |
| [`docs/agent/reports/template-audit.md`](../docs/agent/reports/template-audit.md) | Phase 0 技术基线 |
| [`docs/game-site-kit-seo-architecture-and-template-iteration-guide.md`](../docs/game-site-kit-seo-architecture-and-template-iteration-guide.md) | SEO 与阶段路线图（长文参考） |
