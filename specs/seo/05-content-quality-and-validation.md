# 内容质量与结构校验

SEO 指南 §11。自动化可检结构；事实与许可须人工 **MANUAL REVIEW**。

---

## 发布流水线（proposed）

```text
Draft
  → Schema / 字段校验（content model）
  → 正文与主词门槛（实例规则）
  → SEO 元数据 / JSON-LD 校验
  → indexable 人工放行
  → Published + Sitemap
  → 监控（Search Console 等，Phase 3+）
```

---

## Kit 级门槛（game_detail）

| 检查 | 规则 |
|---|---|
| 独立价值 | 非仅游戏名 + iframe |
| 必填字段 | [`04-config-and-content-models.md`](../04-config-and-content-models.md) Game 表 |
| 启动 | `launch.primaryUrl` 可访问或降级文案就绪 |
| 许可 | Provider 与 embed 模式一致 |
| 索引 | 默认 false；放行前全文与 metadata 就绪 |

---

## ballgames 实例门槛（P0）

实例 **DoD** 为验收权威，见 [`ballgames-specs-v1.md`](../ballgames/ballgames-specs-v1.md) §2、§7、§8，摘要：

| 项 | 规则 |
|---|---|
| 英文正文词数 | ≥ **800**（首页目标 **900**，内页 **~1000**）；`wc -w` 去标签 |
| 主词词频 | 正文名词短语第一 = 该页主词 |
| 首页 | 正文搜索 `hockey bros` = **0** |
| H1 | 唯一且 = 主词策略 |
| iframe | 无 sandbox / lazy；16:9；8s 回退 |
| 首页 | 无 iframe（LCP） |

---

## Category 发布门槛

- 游戏数 ≥ **12**（ballgames）
- 手写正文 ≥ **600** 词
- 否则 `status` 保持 draft 且 `indexable` false

---

## 禁止

- 模板化替换游戏名的批量薄页
- 编造评分、评论、搜索排名
- 无来源的 `datePublished` / 发行方信息

---

## Phase 3–4 实现建议

- 构建前 script：校验 frontmatter/JSON、词数、indexable 与 status 一致性
- 可选：链式检查内链目标存在性（防死链）

**本阶段：** 仅文档；不添加校验脚本。
