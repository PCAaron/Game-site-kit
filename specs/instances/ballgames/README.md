# ballgames.io — 实例 Spec 索引

| 项 | 值 |
|---|---|
| **站点 ID** | `ballgames` |
| **Archetype** | `game-portal` |
| **域名（目标）** | `https://ballgames.io` |
| **R1 范围** | indexable：**`https://ballgames.io`**（路由 `/`）与 **`https://ballgames.io/hockey-bros`**；sitemap **2 条 canonical**；首页 **15–20** 卡 + 单 iframe；Catalog 可多于 2 条 launch 数据 |

## 文档分层

| 层级 | 文档 | 内容 |
|---|---|---|
| **Game Site Kit** | [`specs/01-site-archetypes.md`](../../01-site-archetypes.md) | portal 页面类型与 Launcher 能力 |
| | [`specs/04-config-and-content-models.md`](../../04-config-and-content-models.md) | Catalog / Detail / PageSEO |
| | [`specs/seo/*`](../../seo/) | URL、索引、sitemap、metadata、内链 |
| **实例** | [`ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md) | R1 产品权威：结构、TDK、正文、Launcher、DoD；§9 R2/R3 |

**冲突处理（Phase 2.2）：** [`ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md) 为 **ballgames 产品行为与 R1 配置权威**。Kit 文档定义可复用契约与校验机制。安全、许可、禁止虚构 structured data、未知 embed 不得视为批准 — **双方均须遵守**。Kit 默认**不得**静默覆盖实例已写明的 product 要求。

## Release 映射

| Release | 实例 Spec | 实现状态 |
|---|---|---|
| **R1** | §5–§8 | **not started**（Kit Phase 4） |
| **R2** | §9（5–6 bros 内页） | 仅文档 |
| **R3** | §9（分类页 + 控规模） | 仅文档 |

## 人工决策（阻塞上线）

- 生产 HTTPS 与 canonical 源（首页 **无**尾斜杠）
- `hockeybros.io` 等 **embed 许可** 书面依据
- 品牌素材、OG 图许可
- R1 首页/内页 **LCP**（含 iframe）实测与放行
- §7.1 **VERIFICATION REQUIRED** 事实逐项核验

## 状态

- **Phase 2.2（Kit）：** Instance-to-Kit 契约对齐（2026-11-02）
- **ballgames-specs-v1：** v1.1 + Phase 2.2 修订
- **实现：** **not started**
