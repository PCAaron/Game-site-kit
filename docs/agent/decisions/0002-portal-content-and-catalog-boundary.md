# ADR 0002：Portal 内容与 Catalog 边界

- **Status：** Proposed
- **Date：** 2026-11-02
- **Decision owner：** Game Site Kit 维护者

## Context

当前 contentlayer2 管线仅包含 `Blog` 与 `Authors`。ballgames R1 需要：

- 15–20 条 Catalog Item；
- 仅 `hockey-bros` 具有完整 Game Detail Content；
- PortalHome 的长正文、FAQ 与 PageSEO；
- Provider、LaunchConfig 与 EmbedPermission；
- Catalog、Detail、Indexable Page 保持逻辑独立。

`specs/04-config-and-content-models.md` 允许 contentlayer document type、JSON/YAML adapter 或混合存储，但尚未选定实现。ADR 0001 已接受保留 contentlayer2 管线，除非独立决策批准替换。

## Decision

建议：

1. 保留 `Blog` / `Authors` 和既有 MDX 管线，不用 Blog 文档表示 Game。
2. 新增独立 `Game` 内容类型；单条记录可以同时承载 Catalog 字段与可选 Detail 字段组。
3. 业务页面只通过只读 Catalog adapter 消费逻辑模型，不直接依赖 `contentlayer/generated` 类型。
4. Provider 与 EmbedPermission 使用结构化、可校验的数据源；不把许可只写在注释或正文中。
5. PortalHome 使用独立内容包，不伪装成 Game 或 Blog。
6. `seo.indexable` 保持页面级属性；Catalog 行没有 indexable。
7. ballgames 实例不启用 Blog/Tags 页面类型；是否最终删除博客能力另行决定。

本 ADR 不固定最终目录、函数签名或 Provider 的物理文件格式；这些由 Phase 4 task Spec 在不增加新依赖的前提下确定。

## Alternatives

### A. 复用 Blog 作为 Game

- 优点：代码改动最少。
- 缺点：无法清晰表达 launcher-only、Provider、运行配置与页面资格；把博客 schema 强加给 portal。
- 评估：不推荐。

### B. Contentlayer Game + Catalog adapter

- 优点：复用已验证 MDX/SSG 管线；长正文自然；adapter 隔离存储实现。
- 缺点：嵌套结构和跨记录校验需要单独构建检查。
- 评估：推荐。

### C. JSON/YAML Catalog + 独立 MDX Detail

- 优点：Catalog 结构明确。
- 缺点：同一游戏跨两份数据时需要关联和同步；R1 规模尚不足以证明复杂度合理。
- 评估：保留为后续替代。

### D. 数据库或外部 CMS

- 优点：运行时查询与后台编辑。
- 缺点：超出静态 R1 需求，引入部署和依赖成本。
- 评估：当前不考虑。

## Consequences

### Positive

- 保留模板已验证能力，不替换 contentlayer2。
- Catalog、Detail 与 SEO 页面资格不会因物理存储合并而混淆。
- 后续可替换存储而不重写页面层。
- Blog/Authors 的保留不会迫使 ballgames 暴露博客 URL。

### Negative

- 需要 adapter、schema 校验和跨记录唯一性检查。
- 合并 Game 记录仍需明确 Detail 发布态是独立字段还是继承 Catalog。
- Provider / EmbedPermission 的结构化来源仍需 Phase 4 task Spec 细化。

## Related Specs

- `specs/00-project-charter.md`
- `specs/01-site-archetypes.md`
- `specs/04-config-and-content-models.md`
- `specs/seo/05-content-quality-and-validation.md`
- `specs/ballgames/ballgames-specs-v1.md` §3
- `docs/agent/decisions/0001-template-baseline.md`
- `docs/architecture/architecture-consistency-review.md`

## Approval Required

需要用户确认：

- 是否采用 contentlayer `Game` + Catalog adapter；
- Detail 是否拥有独立 `publicationStatus`；
- Blog/Authors 是长期可选能力还是 ballgames 稳定后移除。
