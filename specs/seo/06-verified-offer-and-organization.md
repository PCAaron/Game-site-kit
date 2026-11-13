# Verified Offer 与 Organization 证据门控

**状态：** **proposed**（契约）；BG-1.2.0 文档落地；**代码**仍按 `lib/seo/structured-data.ts` 现有 `FORBIDDEN_KEYS`（含 `offers`）至 BG-1.2.2/1.2.3。

**背景：** Ballgames v1.2 允许在 **有真实证据** 时为 `VideoGame` 输出免费 `Offer`；`Organization` 不得虚构法人主体。与禁止虚构 `aggregateRating` / `review` 原则一致。

---

## 1. 使用场景

| 场景 | 允许 |
|---|---|
| `game_detail` 页，游戏可免费游玩且事实已核实 | 条件输出 `Offer`（price `0`） |
| `portal_home` R1 | **不**输出 `Offer`（首页无单一 VideoGame 实体） |
| 站点级品牌展示名 | 条件输出 `Organization`（非法人等同） |
| 无证据的促销/价格/主体 | **禁止** |

## 2. 适用页面类型

| page_type | Offer | Organization |
|---|---|---|
| `portal_home` | 否 | 可选（证据门控） |
| `game_detail` | 条件允许 | 否（除非未来独立规范） |
| 其他 | 默认否 | 默认省略 |

## 3. 允许的 Offer 结构

Schema.org `Offer`，最小字段（无额外未经核实交易属性）：

```json
{
  "@type": "Offer",
  "price": "0",
  "priceCurrency": "USD"
}
```

不得同时输出未核实的 `availability`、`seller`、`url` 等易误导字段，除非实例 Spec 单列证据要求。

## 4. 免费事实核实依据

须能对应 **当前游戏** 与 **当前来源**（官方站、可玩嵌入源、或经审计的书面说明）。页面正文 H2「是否免费」与 JSON-LD **不得矛盾**。

## 5. 数据契约（拟实施，非 BG-1.2.0 代码）

```ts
interface VerifiedFreeOffer {
  status: 'verified'
  price: '0'
  priceCurrency: 'USD'
  evidenceUrl: string
  verifiedAt: string // ISO 8601 — 实际核实免费游玩事实的日期，非内容定稿日
}
```

`status !== 'verified'` 时 **不**输出 Offer。

## 6. 输出条件（须同时满足）

1. 游戏具真实可审计来源
2. 免费游玩事实已核实
3. 证据对应当前 slug 与 launch URL
4. 数据状态为 `verified`
5. Offer 结构符合 Schema.org
6. 未引入未经核实的其他交易属性

## 7. 缺失证据时的降级

- **不输出** `offers` 节点（优于编造）
- VideoGame 其余允许字段照常
- Validator：**不**因缺 Offer 判 FAIL（R1 允许无 Offer 的合法 VideoGame）

## 8. 负面测试规范（后续批次）

| ID | 断言 |
|---|---|
| OFF-N-01 | 无 `VerifiedFreeOffer` 记录 → JSON-LD 无 `offers` |
| OFF-N-02 | `status: unverified` → 无 `offers` |
| OFF-N-03 | 仍禁止 `aggregateRating` / `review` |
| ORG-N-01 | 无 Organization 证据 → 首页可无 Organization 块 |
| ORG-N-02 | 禁止虚构 `legalName` / 未核实 `sameAs` |

## 9. 与 Kit JSON-LD 安全校验的关系

当前 `FORBIDDEN_KEYS` 含 `offers`（Kit 保守默认）。BG-1.2.2+ 实施时：

1. 将 `offers` 从绝对禁止改为 **条件允许**（经 verified 管道）
2. 保留 `aggregateRating`、`review` 禁止
3. `validate:seo` / phase4 测试增补 OFF-N / ORG-N

**BG-1.2.0 不得修改** `FORBIDDEN_KEYS` 或生成函数。

---

## Organization

| 规则 | 说明 |
|---|---|
| 展示名 ≠ 法人 | `BallGames.io` 等品牌名可记录，**不得**冒充未核实的运营主体 |
| 输出条件 | 有经核实的品牌 URL/名称依据；无则 **省略** |
| 禁止 | 虚构地址、法人、DUNS、未核实 social `sameAs` |
| 首页 JSON-LD | **不**将「四类型齐全」设为无条件构建门禁 |

### 验收口径（BG-1.2.0）

```text
Verified Free Offer: ALLOWED CONDITIONALLY
Unverified Offer: FORBIDDEN
AggregateRating without evidence: FORBIDDEN
Review without evidence: FORBIDDEN
Organization: EVIDENCE-GATED
```

## Related

- [`03-metadata-structured-data.md`](03-metadata-structured-data.md)
- [`specs/ballgames/ballgames-specs-v1.2.md`](../ballgames/ballgames-specs-v1.2.md) §4.9、§5.3
- [`specs/ballgames/content/hockey-bros-r1.md`](../ballgames/content/hockey-bros-r1.md) §七
