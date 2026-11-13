# ballgames.io — 实例 Spec 索引

| 项 | 值 |
|---|---|
| **站点 ID** | `ballgames` |
| **Archetype** | `game-portal` |
| **域名（目标）** | `https://ballgames.io` |
| **R1 范围** | indexable：**`https://ballgames.io`**（路由 `/`）与 **`https://ballgames.io/hockey-bros`**；sitemap **2 条 canonical**；首页 **目标 15–20** 卡 + 单 iframe；Catalog 可多于 2 条 launch 数据 |

## 产品 Spec 权威

| 文档 | 角色 |
|---|---|
| [`ballgames-specs-v1.2.md`](../../ballgames/ballgames-specs-v1.2.md) | **active** Ballgames 产品规范（BG-1.2.0 对齐 P0/P1 决策） |
| [`ballgames-specs-v1.md`](../../ballgames/ballgames-specs-v1.md) | **historical reference**（Phase 4 工程验收对照用） |
| [`content/homepage-r1.md`](../../ballgames/content/homepage-r1.md) | R1 首页 **逐字**交付正文 |
| [`content/hockey-bros-r1.md`](../../ballgames/content/hockey-bros-r1.md) | R1 `/hockey-bros` **逐字**交付正文 |

**冲突处理：** 产品需求以 **v1.2** 为准。Kit 共享 URL/SEO/真实性契约继续适用；安全与 embed 授权不得由实例内容覆盖。层级：

```text
Game Site Kit Shared Contracts
  + Ballgames v1.2 Product Requirements
  + Accepted ADR Security Constraints
  + Verified Data and Content
```

## 文档分层（Kit）

| 层级 | 文档 | 内容 |
|---|---|---|
| **Game Site Kit** | [`specs/01-site-archetypes.md`](../../01-site-archetypes.md) | portal 页面类型与 Launcher 能力 |
| | [`specs/04-config-and-content-models.md`](../../04-config-and-content-models.md) | Catalog / Detail / PageSEO |
| | [`specs/seo/*`](../../seo/) | URL、索引、sitemap、metadata、内链、verified offer |
| | [`specs/phases/04.1-catalog-architecture-alignment.md`](../../phases/04.1-catalog-architecture-alignment.md) | Catalog 架构、校验分级 |
| | [`lib/catalog/README.md`](../../../lib/catalog/README.md) | R1 数据契约与 Adapter |
| **ADR** | [`0004-ballgames-launcher-embed-policy.md`](../../../docs/agent/decisions/0004-ballgames-launcher-embed-policy.md) | Demo-first + embed 门禁 |
| | [`0003-site-instance-url-and-seo-source.md`](../../../docs/agent/decisions/0003-site-instance-url-and-seo-source.md) | `gameUrl` / `gamePath` |

## Release 映射

| Release | 实例 Spec | 实现状态 |
|---|---|---|
| **R1** | v1.2 §4–§8 | Phase 4 **工程验收完成**（见 Phase 4.7 报告）；**v1.2 产品对齐** BG-1.2.0 文档化；代码适配 **未开始**（BG-1.2.1+） |
| **R2** | v1.2 §9 | 仅文档 |
| **R3** | v1.2 §9 | 仅文档 |

## 人工决策 / 外部证据（阻塞生产）

- 生产 HTTPS 与 canonical 源
- Embed **商业授权** 与 **生产 CSP**（ADR 0004；Football Bros 技术 Demo passed，授权/CSP **Not Yet Verified**）
- 域名归属 ballgames.io
- Organization 法人级证据（若需扩展 JSON-LD）
- Verified Offer 可审计 `evidenceUrl`（实施录入）
- R1 首页/内页 **LCP** 实测与放行

## 状态

- **Phase 4.7：** 工程验收报告已交付（`main` 基线见 STATUS）
- **BG-1.2.0：** Spec v1.2 决策收口文档（2026-11-13）
- **Ballgames v1.2 代码实施：** NOT STARTED
