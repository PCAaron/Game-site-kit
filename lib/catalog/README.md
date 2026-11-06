# Catalog — R1 数据契约与读取架构

**Phase：** 4.1 / 4.1.2 · **实例：** ballgames · **Archetype：** `game-portal`

本目录是 R1 **Catalog 逻辑模型、校验与只读 Adapter** 的实现位置。架构权威见 [`specs/phases/04.1-catalog-architecture-alignment.md`](../../specs/phases/04.1-catalog-architecture-alignment.md)。

## 数据源（R1）

| 项 | 说明 |
|---|---|
| 物理格式 | **TypeScript modules**（`instances/ballgames.ts` 等） |
| 读取入口 | **`adapter.ts`** — `getBallgamesCatalog()`、`getProductionHomeCatalog()` 等 |
| PortalHome | **独立** — `lib/site/get-portal-home-content.ts` → `getPortalHomeContent()`；**不**经 Catalog adapter |
| Contentlayer | **R1 不要求** `Game` document type |
| ADR | [0002](../../docs/agent/decisions/0002-portal-content-and-catalog-boundary.md) |

**禁止：** UI 或路由直接 deep-import `instances/*` 绕过 adapter（测试与脚本应使用 `lib/catalog/index` / `lib/site/index` 公开 API）。

## 逻辑模型（摘要）

- **`CatalogGame`** — `providerId` / `embedPermissionId` **可选**；声明时必须可解析且关联正确
- **`Provider`** / **`EmbedPermission`** — 可选关联实体；external-link **不**强制二者
- **`LaunchConfig`** — verified / unverified；iframe 与 external-link 各自规则

**Site Archetype**（`game-portal`）与 **`LaunchConfig.mode`** 是 **两个独立维度**。

## Publication vs SEO Indexability

- `publicationStatus` — 是否可对外展示（首页 grid：`published` + `showOnHome` + 已核实 launch）
- `detail.seo.indexable` — **页面级**；默认 **false**（`DEFAULT_SEO_INDEXABLE`）
- **`published` 不隐含 `indexable`**  
- Sitemap：仅 **published + indexable + route exists**（R1 exact-two）

## Validation 分层

### Schema — `validateCatalog()` / `validateGame()`

结构性 **Error**（`CatalogError`，exit 非 0）：重复 slug、非法 mode、已声明 provider/embed 无法解析、错误关联、R1 indexable 违规（非 hockey-bros 设 true）等。

**不**因缺少可选 `providerId` / `embedPermissionId` 失败；**不**因 published 但 Detail 不完整失败。

### SEO — `validateCatalogSeo()`

仅对 **`detail.seo.indexable === true`** 的游戏执行：`published` + 完整 Detail（intro、howToPlay、sections、faq、controls）。

### Content quality — `collectCatalogContentQualityIssues()`

Editorial 完整度 → **WARNING**；不阻止 Catalog 读取或 launch。

### Readiness — `buildCatalogVerificationReport()`

运营与生产提示；严重级别 **`INFO` | `WARNING` | `MANUAL REVIEW` | `BLOCKED`**（**不是** schema Error）。

| 级别 | 示例 |
|---|---|
| **INFO** | 首页 `published` 行数低于 15–20 **设计目标**（`HOME_CARD_COUNT_BELOW_TARGET`） |
| **WARNING** | 草稿行待核实、Detail 不完整（非 indexable） |
| **BLOCKED** | **仅生产 iframe** 未就绪（`PRODUCTION_IFRAME_NOT_READY`） |

`yarn validate:catalog`：schema PASS 后打印 readiness JSON；**exit 0** 表示 schema 合法。

## 脚本

| 命令 | 作用 |
|---|---|
| `yarn test:catalog` | schema + 契约测试 |
| `yarn validate:catalog` | `validateCatalog` + JSON readiness 报告 |
| `yarn validate:seo` | Phase 3 SEO 契约检查 + **`validateCatalog` + `validateCatalogSeo`**（`indexable === true` 时的 Detail 完整度门禁） |

## Embed 与生产门禁

`isProductionEmbedAllowed()` — **仅** iframe-official / iframe-provider；须 `granted` + `cspFrameSrcVerified` + `sourceUrl` 与 launch 一致。**不**阻止 Catalog 读取或 external-link；**不**将 unknown/requested 当作 granted。

详见 ADR [0004](../../docs/agent/decisions/0004-ballgames-launcher-embed-policy.md)。
