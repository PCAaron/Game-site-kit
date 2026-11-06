# ADR 0002：Portal 内容与 Catalog 边界

- **Status：** **Accepted**（R1 实施路径）；Alternatives B/C 仍有效作后续迁移
- **Date：** 2026-11-02（R1 路径修订 2026-11-06）
- **Decision owner：** Game Site Kit 维护者

## Context

当前 contentlayer2 管线仅包含 `Blog` 与 `Authors`。ballgames R1 需要：

- 15–20 条 Catalog Item（**产品设计目标**；数据层不伪造凑数）；
- 仅 `hockey-bros` 具有完整 Game Detail Content；
- PortalHome 的长正文、FAQ 与 PageSEO；
- 可选 Provider、LaunchConfig 与 EmbedPermission；
- Catalog、Detail、Indexable Page 保持逻辑独立。

`specs/04-config-and-content-models.md` 允许 contentlayer document type、JSON/YAML adapter 或混合存储。ADR 0001 已接受保留 contentlayer2 管线，除非独立决策批准替换。

## Decision

### R1 已采用（2026-11-04 实施，2026-11-06 文档对齐）

1. 保留 `Blog` / `Authors` 和既有 MDX 管线，不用 Blog 文档表示 Game。
2. **R1 Catalog 物理存储：TypeScript modules**（`lib/catalog/instances/*`），**不**强制新增 contentlayer `Game` document type。
3. **Catalog Adapter**（`lib/catalog/adapter.ts`）为业务侧 **唯一**读取入口；页面/组件不直接依赖实例模块或 `contentlayer/generated`。
4. 逻辑上仍可合并 Catalog + Detail 字段组（单条 `CatalogGame` + 可选 `detail`）；与 contentlayer 文档类型 **解耦**。
5. **Provider 与 EmbedPermission 为可选关联**（Optional Relationship + Conditional Validation）：
   - 未声明 **不**自动判无效；
   - 声明 `providerId` / `embedPermissionId` 须可解析且关联正确；
   - `external-link` **不**强制 EmbedPermission；
   - iframe 模式与 **生产 iframe 门禁** 见 ADR 0004。
6. PortalHome 使用独立内容包，不伪装成 Game 或 Blog。
7. `seo.indexable` 保持 **页面级**属性；Catalog 行 **无** indexable；**published ⇏ indexable**。
8. ballgames 实例不启用 Blog/Tags 页面类型；是否最终删除博客能力另行决定。

**说明：** 此路径是 R1 **架构决策**，不是 contentlayer 的临时 workaround。后续可迁移至 Alternative B（contentlayer Game）或 C（JSON + adapter），**不得**改变 Adapter 上层消费契约。

### 长期推荐（非 R1 阻塞）

- Alternative **B**（contentlayer Game + adapter）仍适合长正文 MDX 与构建时校验扩展。
- 迁移时保留 adapter 边界，替换 `instances/*` 数据源即可。

## Alternatives

### A. 复用 Blog 作为 Game

- 优点：代码改动最少。
- 缺点：无法清晰表达 launcher-only、Provider、运行配置与页面资格；把博客 schema 强加给 portal。
- 评估：不推荐。

### B. Contentlayer Game + Catalog adapter

- 优点：复用已验证 MDX/SSG 管线；长正文自然；adapter 隔离存储实现。
- 缺点：嵌套结构和跨记录校验需要单独构建检查。
- 评估：**R2+ 可选**；R1 未选用。

### C. JSON/YAML / TS module Catalog + adapter

- 优点：Catalog 结构明确；跨记录校验与 Embed 门禁易表达。
- 缺点：长正文若同文件会膨胀；可拆 Detail MDX。
- 评估：**R1 已采用（TS modules）**。

### D. 数据库或外部 CMS

- 优点：运行时查询与后台编辑。
- 缺点：超出静态 R1 需求，引入部署和依赖成本。
- 评估：当前不考虑。

## Consequences

### Positive

- 保留模板已验证 contentlayer 管线，R1 不阻塞于 Game document type 设计。
- Catalog、Detail 与 SEO 页面资格不会因物理存储合并而混淆。
- 后续可替换存储而不重写页面层（adapter 契约稳定）。
- Blog/Authors 的保留不会迫使 ballgames 暴露博客 URL。

### Negative

- 需要 adapter、schema 校验和跨记录唯一性检查（已实现于 `lib/catalog/validate.ts`）。
- 合并 Game 记录仍需明确 Detail 发布态继承 Catalog 单一 `publicationStatus`（R1 已统一）。
- Provider / EmbedPermission 可选化要求校验器与文档同步（**代码对齐进行中** — 见 Phase 4.1 对齐报告）。

## Related Specs

- `specs/phases/04.1-catalog-architecture-alignment.md`
- `lib/catalog/README.md`
- `specs/00-project-charter.md`
- `specs/01-site-archetypes.md`
- `specs/04-config-and-content-models.md`
- `specs/seo/05-content-quality-and-validation.md`
- `specs/ballgames/ballgames-specs-v1.md` §3
- `docs/agent/decisions/0001-template-baseline.md`
- `docs/architecture/architecture-consistency-review.md`

## Approval Required

~~是否采用 contentlayer `Game` + Catalog adapter~~ — **R1 已批准 TS module + adapter**（Phase 4.1）。

仍待用户/运营确认：

- Detail 是否在未来拥有独立 `publicationStatus`（R1：**否**，单字段）；
- Blog/Authors 是长期可选能力还是 ballgames 稳定后移除。
