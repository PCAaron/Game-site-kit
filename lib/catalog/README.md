# Catalog — R1 数据契约与读取架构

**Phase：** 4.1 · **实例：** ballgames · **Archetype：** `game-portal`

本目录是 R1 **Catalog 逻辑模型、校验与只读 Adapter** 的实现位置。架构权威见 [`specs/phases/04.1-catalog-architecture-alignment.md`](../../specs/phases/04.1-catalog-architecture-alignment.md)。

## 数据源（R1）

| 项 | 说明 |
|---|---|
| 物理格式 | **TypeScript modules**（`instances/ballgames.ts` 等） |
| 读取入口 | **`adapter.ts`** — 页面与脚本应通过 `getBallgamesCatalog()` / adapter 导出消费 |
| Contentlayer | **R1 不要求** `Game` document type；后续可换存储，**不改变** Adapter 消费契约 |
| ADR | [0002](../../docs/agent/decisions/0002-portal-content-and-catalog-boundary.md) — R1 Accepted：TS module + adapter |

**禁止：** UI 或路由直接 deep-import `instances/*` 绕过 adapter（测试与脚本可 import index 公开 API）。

## 逻辑模型（摘要）

- **`CatalogGame`** — Catalog 行 + 可选 `detail`（R1 仅 `hockey-bros` 允许完整 Detail）  
- **`Provider`** — 可选关联；声明 `providerId` 时必须可解析  
- **`EmbedPermission`** — 可选关联；声明 `embedPermissionId` 时必须可解析且关联正确  
- **`LaunchConfig`** — `verified` / `unverified`；iframe / external-link 模式各自规则见 Spec  

**Site Archetype**（`game-portal`）与 **`LaunchConfig.mode`**（单游戏启动能力）是 **两个独立维度**。

## Publication vs SEO Indexability

- `publicationStatus` — 是否可对外展示（含首页 grid 资格，另见 launch 核实规则）  
- `detail.seo.indexable` — **页面级**；默认 **false**  
- **`published` 不隐含 `indexable`**  
- Sitemap：仅 **published + indexable + route exists**（R1 exact-two）

## Validation 分层

### Schema（Error）

`validateCatalog()` / `validateGame()` — 失败则抛 **`CatalogError`**，exit 非 0（`yarn test:catalog`）。

结构性 Error 示例：重复 slug、非法 mode、已声明 provider/embed 无法解析、R1 indexable 违规等。

**目标契约（文档）：** `providerId` / `embedPermissionId` **可选**；仅在有声明或 iframe 模式要求时强制。**当前实现仍对全部 Game 必填二者** — 见 Spec 对齐报告「代码差异」。

### Readiness 报告（非 schema）

`buildCatalogVerificationReport()` — 运营与 **生产 iframe** 提示；使用 `BLOCKED` / `MANUAL REVIEW` 严重级别。

| 目标 Spec 级别 | 语义 |
|---|---|
| **Info** | 首页 `published` 行数低于 15–20 **设计目标** |
| **Warning** | 内容/核实待办（draft 行、Editorial 缺口） |
| **生产门禁** | 生产 iframe：embed granted + CSP `frame-src` 已验证 |

**注意：** readiness 的 `BLOCKED` **不等于** schema Error；`yarn validate:catalog` 在 schema PASS 后仍可能打印 readiness 提示。

## 脚本

| 命令 | 作用 |
|---|---|
| `yarn test:catalog` | 单元/约束测试（schema） |
| `yarn validate:catalog` | `validateCatalog` + JSON readiness 报告 |

## Embed 三维度（记录用）

1. **官方是否支持 iframe**（技术能力 — 勿与下列两项混同）  
2. **当前 URL + CSP 是否能在 ballgames.io 实际嵌入**（`frame-ancestors` / 本站 `frame-src`）  
3. **商业使用许可**（`commercialUse`、证据链）

`isProductionEmbedAllowed()` 仅用于 **生产 iframe 门禁**；不阻止 Catalog 读取或 external-link。

## Launcher UX（Spec；组件在 Phase 4.3+）

- 始终提供 `target="_blank"` `rel="noopener noreferrer"` 回退  
- 8s timeout：UX 兜底，**非**精确失败检测  
- iframe `load` **≠** 游戏 ready（除非 postMessage handshake）

详见 ADR [0004](../../docs/agent/decisions/0004-ballgames-launcher-embed-policy.md)。
