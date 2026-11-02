# 内容质量与结构校验

SEO 指南 §11。自动化可检结构；事实与许可须人工 **MANUAL REVIEW**。

---

## Kit 校验 vs 实例 Editorial 政策

| 层级 | 负责方 | 示例 |
|---|---|---|
| **Kit 校验** | 所有 portal 实例 | 必填字段、URL 格式、slug 唯一、canonical 与 helper 一致、indexable⇔published、结构化数据语法与可见内容一致、sitemap 规则、内链目标存在性 |
| **实例 Editorial** | 单站点 Spec | 正文字数配额、主词词频、分类 ≥12 款 + ≥600 词、R1/R2/R3 scope、首页区块顺序、DoD 清单 |

Kit **不得**把 ballgames 词数/分类阈值写成所有未来实例的硬编码默认值；实例 Spec 引用 Kit 校验并在其之上追加政策。

---

## 发布流水线（proposed）

```text
Draft
  → Kit schema / 字段校验（Catalog vs Detail 分层）
  → 实例 editorial 门槛（若适用）
  → PageSEO / JSON-LD 一致性校验
  → indexable 人工放行
  → Published + SitemapCandidate
  → 监控（Search Console 等，Phase 3+）
```

---

## Kit 级门槛

### Catalog Item

| 检查 | 规则 |
|---|---|
| 标识 | `slug` 唯一；`launch.primaryUrl` 格式合法 |
| 发布 | `published` 出现在 launcher/grid 前须有 URL 或降级文案 |
| 许可 | iframe 模式：`EmbedPermission` 非 denied；unknown 不得当 granted |
| 索引 | Catalog 行 **无** `indexable`；index 仅页面级 |

### Game Detail / indexable 页面

| 检查 | 规则 |
|---|---|
| 独立价值 | 非仅游戏名 + iframe |
| 正文 | indexable 前须有 Detail Content 字段组（见 [`04-config-and-content-models.md`](../04-config-and-content-models.md)） |
| 启动 | `launch.primaryUrl` 可访问或降级 UI；iframe `load`/timeout **非**可玩性证明 |
| 索引 | 默认 false；放行前全文与 PageSEO 就绪 |

### PortalHome

| 检查 | 规则 |
|---|---|
| PageSEO | title/description/canonical/indexable |
| ItemList JSON-LD | 仅含 indexable 详情 canonical URL |

---

## ballgames 实例门槛（R1 Editorial）

验收权威：**实例 DoD** — [`ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md) §2、§5–§8。Kit 摘要（非替代 DoD）：

| 项 | 规则 |
|---|---|
| indexable 页面 | 2（origin + `/hockey-bros`） |
| 英文 SEO 正文 | 首页 ≈950 词（五 H2；导语 55 + FAQ **另计**，见实例 §1.1） |
| 主词词频 | 实例 §7 |
| 首页 SEO 块 | `hockey bros` = 0 |
| Launcher | 首页单 iframe；桌面 min-height 480px；窄屏 16:9（**实例 CSS**，非 Kit 默认） |
| iframe load | 8s onload 兜底 = UX；须保留新窗口回退 |

---

## Category 发布门槛（ballgames editorial）

- 游戏数 ≥ **12**
- 手写正文 ≥ **600** 词
- 否则不发布 / 不 indexable

---

## 禁止（Kit）

- 模板化替换游戏名的批量薄页
- 编造评分、评论、搜索排名
- 无来源的 `datePublished` / 发行方信息
- 将 `EmbedPermission.unknown` 当作可 iframe 依据

---

## Phase 3–4 实现建议

- 构建前 script：Catalog/Detail 分层校验、indexable 与 status 一致性、`gameUrl` 唯一 URL
- 可选：内链目标 slug 存在性（仅 `<a href>` 目标）

**Phase 2.2：** 仅文档；不添加校验脚本。
