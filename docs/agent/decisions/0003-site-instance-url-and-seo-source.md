# ADR 0003：SiteInstance、URL 与 SEO 单一事实源

- **Status：** Proposed
- **Date：** 2026-11-02
- **Decision owner：** Game Site Kit 维护者

## Context

当前运行时只有 `data/siteMetadata.js`。正式 URL 分别在 layout、sitemap、contentlayer structured data 和 RSS 中拼接；`next.config.js` 还设置 `trailingSlash: true`。

ballgames 要求：

- canonical origin 为 `https://ballgames.io`，生产前人工核验；
- 首页与 path canonical 均无尾斜杠；
- 内链、canonical、sitemap、JSON-LD、OG 统一使用 `siteUrl()` / `gameUrl(slug)`；
- 页面默认不可索引，只允许显式放行；
- 不同实例隔离品牌、URL、功能开关和页面类型。

## Decision

建议建立类型化 `SiteInstance`，作为下列站点级信息的唯一事实源：

- identity：`siteId`、`archetype`；
- brand：名称、标题、描述、语言、locale、logo、OG 素材；
- URL：`canonicalOrigin`、`urlPathStyle`；
- page policy：`defaultIndexable`、`enabledPageTypes`；
- navigation 与实例素材；
- organization Structured Data 的可验证字段；
- feature flags：analytics、comments、newsletter、search、pagination、ads、homeLauncher；
- 部署能力声明仅记录预期，不把外部平台状态伪装成已验证。

同时：

1. `siteUrl(path?)` 负责正式 absolute URL。
2. `gameUrl(slug)` 负责游戏详情 path 规则。
3. metadata、canonical、OG、JSON-LD、sitemap 和可导航内链消费同一 helper。
4. ballgames 的 `urlPathStyle` 为无尾斜杠，模板默认不能覆盖。
5. 环境秘密和服务 token 不进入公开 SiteInstance。
6. `siteMetadata.js` 可在迁移期成为适配输出，但新 portal 代码不直接读取分散常量。

## Alternatives

### A. 继续扩展 `siteMetadata.js`

- 优点：改动最少。
- 缺点：缺类型、实例边界和页面策略；URL 仍可能散落。
- 评估：不足以满足多实例契约。

### B. 类型化 SiteInstance + URL helpers

- 优点：最小且可验证；不要求 Monorepo；支持实例覆盖。
- 缺点：需要迁移模板消费者并决定兼容适配期。
- 评估：推荐。

### C. 环境变量驱动全部配置

- 优点：部署切换简单。
- 缺点：复杂结构难校验，内容与秘密混淆。
- 评估：只用于环境差异和秘密，不作为主配置。

### D. 每个实例复制一套配置和 helper

- 优点：短期直观。
- 缺点：URL 与 SEO 规则分叉，违反 Kit 目标。
- 评估：不推荐。

## Consequences

### Positive

- 防止 canonical、sitemap、JSON-LD 和内部链接格式漂移。
- feature flags 可真正按实例默认关闭。
- ballgames path style 不受博客模板默认值覆盖。
- 后续第二实例可验证配置边界，而无需先迁移 Monorepo。

### Negative

- Phase 3 需要迁移现有 `siteMetadata` 消费点。
- RSS 和 Blog 等 legacy 能力需要明确是否继续消费适配配置。
- SiteInstance 字段不能无限增长；原型专属配置仍应留在对应域。

## Related Specs

- `specs/00-project-charter.md`
- `specs/04-config-and-content-models.md`
- `specs/seo/02-url-canonical-indexing.md`
- `specs/seo/03-metadata-structured-data.md`
- `specs/seo/04-internal-linking-sitemap.md`
- `specs/ballgames/ballgames-specs-v1.md` §2
- `docs/architecture/architecture-consistency-review.md`

## Approval Required

需要用户确认：

- 是否接受 SiteInstance 的最小字段边界；
- 是否允许 Phase 3 让 `siteMetadata.js` 成为兼容适配层；
- ballgames 的博客路由是保留但 noindex，还是完全不启用。
