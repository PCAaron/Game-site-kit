# ADR 0005：静态导出与部署能力边界

- **Status：** Proposed
- **Date：** 2026-11-02
- **Decision owner：** Game Site Kit 维护者

## Context

当前 GitHub Pages workflow 使用 `EXPORT=1` 生成 `out`。Next.js App Router、`generateStaticParams` 和客户端 Launcher 可以支持 ballgames R1 的静态页面，但以下能力不能仅靠导出文件提供：

- Next `headers()` 定义的 CSP、HSTS 等 HTTP 响应头；
- Newsletter POST Route Handler；
- 未由托管层配置的 301/302 redirects；
- 未在构建时生成的动态路径。

ballgames R1 还要求 iframe，生产发布必须有可验证的 CSP 与 HTTPS。当前仓库没有 GitHub Pages/边缘层响应头配置证据，也没有最终部署平台决策。

## Decision

建议：

1. R1 保留静态导出作为首选构建模式，因为两条 indexable 页面、构建期内容和客户端 Launcher 不要求 Next Server Runtime。
2. 静态导出通过不等于生产部署安全通过。
3. 生产平台必须提供并验证：
   - HTTPS 与正式域名；
   - CSP `frame-src` 和其他必要安全头；
   - 自定义 404；
   - 未来 slug 迁移所需 redirects，或明确替代流程。
4. Newsletter、Comments、Analytics 等能力由 per-site feature flag 控制；依赖 POST 的 Newsletter 在纯静态 R1 中关闭或外置。
5. 若选定平台无法满足 iframe 所需 headers 和后续 redirect 语义，应改用支持响应头/redirect 的静态托管或 Next runtime 部署；不为了保留 GitHub Pages 而削弱实例要求。
6. 最终平台选择保持 Open Question，本 ADR 不把 GitHub Pages 记为已批准生产平台。

## Alternatives

### A. 继续 GitHub Pages，不验证 headers

- 优点：沿用当前 workflow。
- 缺点：无法提供安全响应头证据；不满足发布验收。
- 评估：不推荐。

### B. 静态导出 + 可配置 headers/redirects 的托管层

- 优点：保留静态架构与 CDN 成本优势；满足 R1。
- 缺点：需要选择和验证平台。
- 评估：推荐方向。

### C. Next.js Server Runtime

- 优点：`headers()`、redirects 和 Route Handler 能力更直接。
- 缺点：增加运行时、运维与成本；R1 页面本身不需要服务器。
- 评估：当静态托管不能满足安全/redirect 要求时采用。

### D. 把所有服务能力放在客户端第三方 SDK

- 优点：保持静态。
- 缺点：隐私、CSP、供应商和 feature flag 风险增大。
- 评估：逐服务审查，不作为架构默认。

## Consequences

### Positive

- 继续复用已验证的 export 模式。
- 明确区分 build 成功与 production headers 生效。
- 不让无关 API 阻塞 R1 页面。
- 为未来 redirects 和外部服务保留清晰部署边界。

### Negative

- 上线前必须进行部署环境人工验证。
- 可能需要改变当前 GitHub Pages 生产目标，但本 ADR 不预先选供应商。
- 静态和 server 模式都需保持同一 SiteInstance/URL 契约。

## Related Specs

- `specs/00-project-charter.md`
- `specs/architecture/01-system-overview.md`
- `specs/seo/02-url-canonical-indexing.md`
- `specs/seo/04-internal-linking-sitemap.md`
- `specs/ballgames/ballgames-specs-v1.md`
- `docs/agent/reports/current-architecture-template-baseline-audit.md` §7
- Next.js 15 Static Exports documentation
- `docs/architecture/architecture-consistency-review.md`

## Approval Required

需要用户确认：

- 是否保留静态导出优先；
- 生产托管平台由谁选择；
- GitHub Pages 是否仅作为现有基线而非 ballgames 生产目标；
- redirects 与安全响应头的责任层。
