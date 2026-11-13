# Ballgames Spec v1.2 — BG-1.2.0 决策收口与影响审查

**批次：** BG-1.2.0 Spec Alignment & Decision Closeout  
**日期：** 2026-11-13  
**性质：** 文档落地；**无**产品/测试/部署代码变更

---

## A. Baseline

| 项 | 值 |
|---|---|
| Branch | `main` |
| Before HEAD | `5b6003afa4f1288df4456075a2c1caeb960728b1`（`docs(ballgames): add Spec v1.2 and R1 delivery copy`） |
| Working tree（收口前） | 含 v1.2 与 content 稿；BG-1.2.0 修订为本地未提交文档 |
| Phase 4.7 | **PRESERVED** — 工程验收见 [`phase-4-final-validation.md`](phase-4-final-validation.md) @ 历史 SHA `339250d` / 报告链 |
| 授权范围 | BG-1.2.0 only；BG-1.2.1–1.2.4 **未授权** |

---

## B. Spec Authority

| 关系 | 说明 |
|---|---|
| v1 vs v1.2 | **v1.2 = active** 产品规范；**v1 = historical**（不删档） |
| 正文 | **homepage-r1.md**、**hockey-bros-r1.md** = 逐字交付；v1.2 Spec = 约束与路由，长正文以 content 稿为准 |
| Kit vs 实例 | Kit SEO/URL/真实性 + Accepted ADR；实例 v1.2 定 R1 产品与文案；冲突时 v1.2 产品 vs Kit 技术规则见实例 README |

---

## C. Confirmed Decision Matrix

| ID | 决策摘要 | 文档落地 |
|---|---|---|
| **P0-01** | Demo-first iframe 验证；技术 passed 不推授权/CSP | ADR 0004 §3.1；v1.2 §7.4 |
| **P0-02** | ItemList → 真实详情页；`DEFAULT_PLAYER_GAME` 解耦 | v1.2 §2.1、§4.9；homepage-r1 §七；seo 03 |
| **P0-03** | 条件 verified 免费 Offer；Organization 证据门控 | **新建** seo/06；v1.2 §4.9、§5.3；hockey-bros-r1 §七 |
| **P1-04** | `gameUrl` 绝对 SEO；拟 `gamePath` 站内导航 | ADR 0003 DEC-003-G；v1.2 §2.1；seo/02 |
| **P1-05** | 首页页脚无 Hockey Bros；词频边界 | v1.2 §4.8、§4.5；homepage-r1 §六、§八 |
| **P1-06** | 键位已核实；正文权威 content 稿 | v1.2 §5.2；hockey-bros-r1 〇、§二 |
| **P1-07** | R1 无 search/games/分类；R2 search noindex | v1.2 §4.10、§6、§9；homepage FAQ 8 |

---

## D. ADR Change Summary

| ADR | 变更 |
|---|---|
| **0004** | **增补** Demo-first、三维候选状态、Football Bros 标注、验收四句；Status 仍 Accepted |
| **0003** | **增补** DEC-003-G `gamePath`；澄清 `gameUrl` 用途；**未删**历史 |
| **0005** | **未改**（仍 Proposed） |
| 新 ADR | **无** |

---

## E. SEO Contract（本批新增/修订要点）

- **ItemList：** published + indexable + **real** `game_detail` URL；R1 1× Hockey Bros
- **Offer：** doc 06；代码仍禁至 BG-1.2.2+
- **Organization：** 可省略；禁止虚构法人
- **URL：** canonical/JSON-LD/sitemap → `gameUrl`；导航 → `gamePath`（待实施）
- **Search R2：** `noindex, follow`；禁止 Disallow 挡 noindex

---

## F. Code Impact Matrix（后续；本批 **未改**）

| 路径 | 预期变更 |
|---|---|
| `lib/urls/site-url.ts` | 新增 `gamePath()` |
| `components/portal/GameCard.tsx` | `Link` → `gamePath` |
| `lib/seo/structured-data.ts` | 条件 `offers`；ItemList 数据源；Organization 门控 |
| `lib/portal/play-presentation.ts` | DEFAULT_PLAYER vs ItemList |
| `lib/catalog/*` | 可选 embed 验证状态字段（BG-1.2.1+ 设计） |
| `components/portal/Launcher.tsx` | Demo 记录（可选） |

---

## G. Validation Impact Matrix

| 套件 | BG-1.2.0 | 后续 |
|---|---|---|
| `test:batch1` | 不变 | `gamePath` 单测 |
| `test:batch2` | 不变 | URL helper |
| `test:catalog` | 不变 | embed 状态字段 |
| `test:phase4.3`–`4.6` | **保留**历史断言；不因 v1.2 文案删 Kit 安全门 | ItemList URL、footer、词频、OFF-N |
| `validate:catalog` / `validate:seo` | 不宣称 v1.2 已实现 | offers 条件、Organization 省略 |

区分：**实例内容断言**可随 v1.2 替换；**Kit 真实性/禁止虚构**保留并加负面测试。

---

## H. Implementation Plan

### BG-1.2.1 — Catalog & Default Player

- **边界：** `DEFAULT_PLAYER_GAME`、ItemList 资格分离；embed 候选状态（只读扩展设计）
- **文件：** `lib/catalog/instances/ballgames.ts`、`lib/portal/*`、fixtures
- **依赖：** BG-1.2.0 文档
- **风险：** ItemList 与播放器默认游戏混淆回归
- **验收：** `test:catalog`、`validate:catalog`
- **DoD：** Catalog 与 v1.2 §2.1、§4.9 一致；无虚构详情 URL

### BG-1.2.2 — Homepage / Launcher

- **边界：** `gamePath`、首页 JSON-LD（ItemList/Org）、页脚、词频、Launcher Demo 门控
- **文件：** `site-url.ts`、`GameCard`、`structured-data.ts`、首页 route/content
- **依赖：** 1.2.1
- **风险：** 本地导航跳生产域；过早生产 iframe
- **验收：** `test:phase4.5`、`validate:seo`、export HTML 抽检
- **DoD：** homepage-r1 + v1.2 §4 对齐；MR-05 仍 gate 生产 embed

### BG-1.2.3 — Hockey Bros Detail

- **边界：** content 稿集成、verified Offer、面包屑/FAQ
- **文件：** game detail route、structured-data VideoGame 管道
- **依赖：** 1.2.2、doc 06
- **风险：** offers 放开误伤 FORBIDDEN_KEYS
- **验收：** `test:phase4.4`、`validate:seo`
- **DoD：** hockey-bros-r1 自检表 PASS（工程侧）

### BG-1.2.4 — Regression & Acceptance

- **边界：** 全量回归、Phase 4.7 对标、更新验收报告（不抹历史）
- **依赖：** 1.2.1–1.2.3
- **验收：** 全 `package.json` 相关脚本 + 可选 fresh export
- **DoD：** v1.2 DoD 可核项有证据；生产 release 仍 **NOT VERIFIED** 直至 MR/部署证据

---

## I. Unresolved External Evidence

| 项 | 状态 |
|---|---|
| Football Bros / 其他游戏 **商业 embed 授权** | Not Yet Verified |
| 生产 **CSP frame-src** | Not Yet Verified |
| **ballgames.io 域名归属** | 待核实 |
| Organization **法人级**证据 | 无则省略 |
| Hockey Bros **VerifiedFreeOffer.evidenceUrl** | 实施时录入 |
| 其余卡片 **Technical Demo** | 除 Spec 列举外多为 untested |
| Cloudflare / live HTTPS | NOT VERIFIED |

**不重新列为待用户决策：** P0/P1 七项产品决策（本批已落档）。

---

## J. Final Verdict

```text
BG-1.2.0: PASS WITH EXTERNAL EVIDENCE PENDING

BG-1.2.1 Readiness: READY WITH GATES
  (gates: gamePath + ItemList/catalog 设计已文档化；无代码先行)

Phase 4.7 Historical Acceptance: PRESERVED
Ballgames Spec v1.2 Implementation: NOT STARTED
Production Release: NOT VERIFIED
```

---

## Changed files（BG-1.2.0）

见任务收尾 `git diff --stat`；允许范围内 Spec、ADR、STATUS、WORKLOG、本报告。
