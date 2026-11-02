# ADR 0004：ballgames Launcher 与 Embed 安全策略

- **Status：** Proposed
- **Date：** 2026-11-02
- **Decision owner：** Game Site Kit 维护者

## Context

项目治理默认使用新标签页打开第三方游戏；iframe 需要许可、CSP 和明确的安全决策。ballgames R1 作为实例覆盖，要求首页单 iframe、详情页 iframe、卡片换源、8 秒 UX 回退以及新窗口 fallback。

当前仓库：

- 没有 Launcher / PlayFrame；
- CSP `frame-src` 只允许 `giscus.app`；
- `X-Frame-Options: DENY` 只限制本站被嵌入；
- 静态导出部署没有仓库内可验证的响应头配置；
- Hockey Bros 与其他 Catalog 游戏的 embed 许可仍是 MANUAL REVIEW。

## Decision

建议保留 ballgames Spec 的 iframe 产品行为，但设置不可绕过的发布门：

1. 每个 iframe source 必须映射到 `Provider`、`LaunchConfig` 和可追溯 `EmbedPermission`。
2. 只有 `EmbedPermission.status === "granted"` 且匹配 game、source URL 和 embed domain 时，生产构建才允许 iframe 模式。
3. `unknown`、`requested`、`denied` 均不得被解释为 granted。
4. 生产部署必须验证允许该 source 的 CSP `frame-src`；不使用宽泛 `*` 作为替代。
5. 始终提供 `target="_blank"`、`rel="noopener noreferrer"` 的新窗口回退。
6. 8 秒 onload 计时只控制 UX，不作为跨域内容可玩、许可有效或安全的证据。
7. 保持 `X-Frame-Options: DENY` 或等价 `frame-ancestors` 保护本站，除非另有需求。
8. ballgames R1 按实例要求不添加 iframe `sandbox` 与 `loading="lazy"`；该例外不成为 Kit 全局默认。
9. 源失效时 `/hockey-bros` 保持 200、正文与回退，不因游戏 availability 自动删除页面。

## Alternatives

### A. 无条件按实例 URL 启用 iframe

- 优点：最快满足 UI。
- 缺点：许可和 CSP 风险不可接受，违反治理。
- 评估：不推荐。

### B. 只允许外链

- 优点：安全边界简单。
- 缺点：擅自削弱已冻结的 ballgames 产品要求。
- 评估：不能作为默认决策；可作为未获许可时的非发布降级。

### C. 许可 + CSP gate + 外链回退

- 优点：保留实例需求并落实治理约束。
- 缺点：需要人工证据与部署验证。
- 评估：推荐。

### D. 重新托管第三方游戏

- 优点：运行控制更强。
- 缺点：授权、更新和安全责任显著增加，且当前禁止未经许可托管。
- 评估：不在范围。

## Consequences

### Positive

- 不为适配模板而删除 R1 iframe。
- 许可状态成为可验证数据，而非注释。
- Launcher 失败仍有用户可用回退。
- Kit 默认与 ballgames 实例覆盖保持清晰。

### Negative

- 在许可和生产 CSP 未确认前，R1 不能宣布可上线。
- 不使用 sandbox 是实例要求带来的风险，需要 source 级信任与人工审查。
- 多游戏换源需要每个 source 独立许可，不能由 provider 级推断无限扩张。

## Related Specs

- `AGENTS.md`
- `specs/00-project-charter.md`
- `specs/01-site-archetypes.md`
- `specs/04-config-and-content-models.md`
- `specs/ballgames/ballgames-specs-v1.md` §2、§3、§5、§6、§7.1
- `docs/architecture/architecture-consistency-review.md`

## Approval Required

需要用户确认本策略；同时仍需人工提供：

- 游戏 URL 与 embed 许可证据；
- commercial use 范围；
- 生产域名匹配；
- 部署后的 CSP 与实际 iframe 行为证据。
