# ballgames.io — 实例 Spec 索引

| 项 | 值 |
|---|---|
| **站点 ID** | `ballgames` |
| **Archetype** | `game-portal` |
| **域名（目标）** | `https://ballgames.io` |
| **R1 范围** | indexable：**`/`**、**`/hockey-bros`**（sitemap 2 URL）；首页 **15–20** 卡 + 单 iframe；Catalog 可多于 2 条 launch 数据 |

## 文档分层

| 层级 | 文档 | 内容 |
|---|---|---|
| **Game Site Kit** | [`specs/01-site-archetypes.md`](../../01-site-archetypes.md) | portal 页面类型目录 |
| | [`specs/04-config-and-content-models.md`](../../04-config-and-content-models.md) | Game / Category / Provider 逻辑字段 |
| | [`specs/seo/*`](../../seo/) | URL、索引、sitemap、metadata、内链 |
| **实例** | [`ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md) | R1 页面结构、TDK、正文、Launcher、DoD；**§9 R2/R3** 路线图 |

**冲突处理：** 实例 Spec 在 R1 文案与字数上优先；Kit SEO 规则在索引、sitemap、搜索 noindex、结构化数据诚实性上优先。

## Release 映射

| Release | 实例 Spec | 实现状态 |
|---|---|---|
| **R1** | §5–§8 | **not started**（Kit Phase 4） |
| **R2** | §9（5–6 bros 内页） | 仅文档 |
| **R3** | §9（分类页 + 控规模） | 仅文档 |

## 人工决策（阻塞上线）

- 生产 HTTPS 与 canonical 源
- `hockeybros.io` 等 **embed 许可** 书面依据
- 品牌素材、OG 图许可
- R1 首页/内页 **LCP**（含 iframe）实测与放行

## 状态

- **Phase 2（Kit）：** 契约已与 Kit 对齐（2026-10-31）
- **ballgames-specs-v1：** 2026-11-01 修订（R1 结构 + R2/R3 路线图）
- **实现：** **not started**
