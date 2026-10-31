# ballgames.io — 实例 Spec 索引

| 项 | 值 |
|---|---|
| **站点 ID** | `ballgames` |
| **Archetype** | `game-portal` |
| **域名（目标）** | `https://ballgames.io` |
| **P0 范围** | 仅 `/` 与 `/hockey-bros` |

## 文档分层

| 层级 | 文档 | 内容 |
|---|---|---|
| **Game Site Kit** | [`specs/01-site-archetypes.md`](../../01-site-archetypes.md) | portal 页面类型目录 |
| | [`specs/04-config-and-content-models.md`](../../04-config-and-content-models.md) | Game / Category / Provider 逻辑字段 |
| | [`specs/seo/*`](../../seo/) | URL、索引、sitemap、metadata、内链 |
| **实例（冻结）** | [`ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md) | TDK 定稿、区块顺序、英文正文、Launcher、DoD |

**冲突处理：** 实例 Spec 在 P0 文案与字数上优先；Kit SEO 规则在索引、sitemap、搜索 noindex、结构化数据诚实性上优先。

## Phase 2 映射

| Kit 交付 | 实例对应 |
|---|---|
| 页面策略表 | Spec §1 词表 + [`seo/01-search-intent-and-page-types.md`](../seo/01-search-intent-and-page-types.md) |
| 内容契约 | Spec §3、§7 |
| Metadata / JSON-LD | Spec §5.3、§6.6 + [`seo/03-metadata-structured-data.md`](../seo/03-metadata-structured-data.md) |
| Sitemap | Spec §2 规则 1 + [`seo/04-internal-linking-sitemap.md`](../seo/04-internal-linking-sitemap.md) |
| 验收 | Spec §8 DoD |

## 人工决策（阻塞上线，不阻塞 Phase 3 文档/代码准备）

- 生产 HTTPS 与 canonical 源
- `hockeybros.io` 等 **embed 许可** 书面依据
- 品牌素材、OG 图许可

## 状态

- **Phase 2：** 契约已与 Kit 对齐（2026-10-31）
- **实现：** **not started**（Phase 4）
