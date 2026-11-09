# Specs 索引

Agent 按需读取；**不必**每次打开 SEO 长文或全部 Phase 历史文档。

## 规范优先级（冲突时）

1. `AGENTS.md`、[`00-project-charter.md`](00-project-charter.md) — 治理与安全  
2. [`docs/agent/STATUS.md`](../docs/agent/STATUS.md) — 当前进度与授权（**不**替代 Phase 4 批次范围表）  
3. [`ballgames/ballgames-specs-v1.md`](ballgames/ballgames-specs-v1.md) — ballgames **产品**权威  
4. Kit 契约 — [`04-config-and-content-models.md`](04-config-and-content-models.md)、[`seo/`](seo/)、[`01-site-archetypes.md`](01-site-archetypes.md)  
5. 阶段 Spec — [`phases/`](phases/)；**Phase 4.x 子批次以 [`phases/04-ballgames-r1.md`](phases/04-ballgames-r1.md) §13 为准**  
6. ADR — [`docs/agent/decisions/`](../docs/agent/decisions/)  
7. 代码契约 — 如 [`lib/catalog/README.md`](../lib/catalog/README.md)  
8. [`docs/agent/WORKLOG.md`](../docs/agent/WORKLOG.md) — 验证证据  

## 按类型定位

| 类型 | 位置 |
|---|---|
| Charter | `00-project-charter.md` |
| Architecture | `architecture/`、`04-config`、`01-site-archetypes`、`seo/` |
| Instance | `instances/ballgames/README.md` → `ballgames/ballgames-specs-v1.md` |
| Phase | `phases/` |
| 治理审计 | [`docs/agent/reports/specs-governance-review.md`](../docs/agent/reports/specs-governance-review.md) |

## Phase 4 批次（R1）— 权威表

摘自 [`phases/04-ballgames-r1.md`](phases/04-ballgames-r1.md) §13（**勿**将 4.2 与 4.3 UI 合并）：

| Batch | 名称 | 要点 |
|---|---|---|
| 4.1 | Catalog / Data Contract | **DONE**（含 4.1.2 / 4.1.3） |
| **4.2** | **Route / Metadata Integration** | `app/[slug]`、`isAppRoutePath`、descriptors、metadata；**仅** hockey-bros 静态详情 |
| 4.3 | Homepage / PlayFrame | GameCard、Grid、Launcher、首页可玩区 |
| 4.4 | Hockey Bros Page | 详情模板、正文、Related |
| 4.5 | Content / SEO Integration | production exact-two sitemap、页面 JSON-LD |
| 4.6–4.7 | Validation / Acceptance | export 集成、DoD |

## Phase 4.2 最小读取清单

**必读：** `AGENTS.md` → `docs/agent/STATUS.md` → `phases/04-ballgames-r1.md`（§6.1、§6.3、§13 Batch 4.2、§5 Out of scope）→ `phases/04.1-catalog-architecture-alignment.md`（§4–5、§11）→ `docs/agent/decisions/0003-site-instance-url-and-seo-source.md` → `lib/catalog/README.md` → 快读 `lib/seo/routes.ts`、`lib/seo/production-state.ts`、`lib/seo/metadata.ts`、`lib/seo/resolve-page-seo.ts`

**部分：** `04-config-and-content-models.md`（PageSEO、indexable）、`ballgames-specs-v1.md`（§2 URL、§4.1 平台 SEO）、`seo/02`、`seo/03`、`phases/03-minimum-seo-foundation.md`（已有机制、勿重做）

**不读（4.2）：** `ballgames-specs-v1` §5–6 正文、`04-ballgames-r1` §8–9 组件实现、SEO 长文全文、冲突矩阵全文

**4.2 明确不做：** 首页 UI、GameCard/GameGrid、PlayFrame/Launcher、Hockey Bros 详情正文、production sitemap/JSON-LD 集成

**建议验证（4.2 完成后）：** `yarn typecheck`、`yarn test:batch1`、`yarn test:batch2`、`yarn validate:seo`、`yarn validate:catalog`
