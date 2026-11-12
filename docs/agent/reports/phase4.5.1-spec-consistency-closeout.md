# Phase 4.5.1 — Spec Consistency Closeout

**日期：** 2026-11-12  
**分支：** `main`  
**Before HEAD：** `386a8b763912d79854b7a860da0571517736e39c`  
**After HEAD：** 同（本批次**未** commit；工作区含 4.5.1 测试/治理 diff）  
**结论：** **PASS WITH MANUAL REVIEW**

---

## A. Git Baseline

| 项 | 值 |
| --- | --- |
| Branch | `main` |
| 审查基线 / 起始 HEAD | `386a8b7`（`feat(phase4.5): integrate portal SEO content…`） |
| 工作区（4.5.1 后） | `.gitignore`、`scripts/phase4.5-*`（测试+词数）、`tsconfig.tsbuildinfo` 取消跟踪（index `D`） |
| 无关噪声 | 启动时曾有 `app/tag-data.json` 脏改；收口时 **已恢复干净** |
| `git diff --check` | **exit 0** |

Phase 4.5 实现 **已在 main**；本批次不重复 4.5 功能开发。

---

## B. Scope and Constraints

| 在范围 | 不在范围 |
| --- | --- |
| Spec 对照矩阵、词数/关键词实测 | Phase 4.5 全文扩写凑 950 词 |
| 嵌入门禁与文案冲突登记 | Phase 4.6 全量集成验收 |
| P45-21–24 测试增强；词数脚本分桶 | 放宽 embed / CSP |
| STATUS/WORKLOG 与 `tsbuildinfo` 治理 | 改写冻结 FAQ/H2 标题 |
| 静态导出 + `validate:seo --export-dir=out` 回归 | Organization JSON-LD 补全 |

**Spec First：** 未修改 `ballgames-portal-home-production.ts` 产品正文。

---

## C. Spec Consistency Matrix（首页）

权威：`specs/ballgames/ballgames-specs-v1.md` §5；实现：`lib/site/instances/ballgames-portal-home-production.ts`。

| 字段 | Spec 原文（摘要） | 当前实现 | 差异类型 | 建议 | 状态 |
| --- | --- | --- | --- | --- | --- |
| H1 | `Ball Games` | 同（组件冻结） | EXACT | — | PASS |
| 副标题 `<p>` | Pick a game… | 同 | EXACT | — | PASS |
| Section 顺序 | Launcher → 导语 → 5×H2 → FAQ | `PortalHome.tsx` 同序 | EXACT | — | PASS |
| 五个 H2 标题/顺序 | §5.5 冻结五标题 | `PORTAL_HOME_SECTION_HEADINGS` | EXACT | — | PASS |
| 导语 §5.4 | 57 词定稿 | 逐字一致 | EXACT | — | PASS |
| H2① 正文 | 游玩量排序、加拿大工作室、同 frame | `homeSort`、R1 单 verified、审慎表述 | FACTUAL_ADJUSTMENT | 保留 Phase 4.5 审慎版；产品稿差异需 PO 对齐 | MANUAL REVIEW |
| H2②–⑤ | 冻结长文（网格满、两玩家网格筛选等） | 缩短+事实审慎（无虚构 grid 满员） | FACTUAL_ADJUSTMENT | 不自动恢复未经核实的 Spec 叙事 | MANUAL REVIEW |
| FAQ 1–4,6–8 | §5.6 定稿 | 6 条逐字；7–8 同 Spec | EXACT / MIXED | — | PASS |
| FAQ 5 Chromebook | “Yes, on any machine…” | 网络过滤 + 硬件能力区分 | FACTUAL_ADJUSTMENT | 与 §7 待核实一致；优于绝对承诺 | ACCEPTED |
| 首页 SEO 块 `hockey bros` | 0 | 实测 0 | EXACT | — | PASS |
| 五 H2 词数目标 | ≈950（§1.1） | 实测 **682**（不含 FAQ） | SPEC_DEVIATION（目标 vs 定稿文本） | **`SPEC WORD TARGET DIFFERENCE — MANUAL REVIEW`**；**禁止**代码凑词 | BLOCKED — EDITORIAL |

Hockey Bros 详情：§6 定稿与 `hockey-bros-detail.ts` 仍由 Phase 4.4 承载；本批次 spot-check：**body 988 词、FAQ 7 条**，无扩写。

---

## D. Content Word Count and Keyword Analysis

口径：`wc -w` 等价（`scripts/phase4.5-word-count-lib.ts`）；SEO 正文 = 导语 + 五 H2 段落（**不含** H1 副标题、导航、卡片、Launcher、FAQ）。

```json
{
  "homepage": {
    "introWordCount": 57,
    "fiveH2WordCount": 682,
    "seoBodyExcludingFaqWordCount": 739,
    "faqWordCount": 209,
    "primaryKeywordBallGames": 3,
    "hockeyBrosInSeoBody": 0,
    "faqCount": 8
  },
  "hockeyBros": {
    "bodyWordCount": 988,
    "primaryKeywordHockeyBros": 5,
    "faqCount": 7
  }
}
```

| 产品目标 | 实测 | 记录 |
| --- | --- | --- |
| 导语 ~55 | 57 | 在容差内 |
| 五 H2 ~950 | **682** | **SPEC WORD TARGET DIFFERENCE — MANUAL REVIEW** |
| 内页 ~980 | 988 | 达标（已存在内容，本批次未改） |

---

## E. Factual Accuracy and Embed Policy Review

### 生产 embed 状态（只读核查）

| 证据 | 结论 |
| --- | --- |
| `lib/catalog/instances/ballgames.ts` → `embed-hockey-bros.status: 'unknown'`, `cspFrameSrcVerified: false` | **未 granted** |
| `isProductionEmbedAllowed(hockey, catalog)` | **false**（P45-23） |
| `resolvePlayPresentation` → `external-only` | PlayFrame **无**生产 iframe |
| 全局 CSP / X-Frame-Options | **未**为本批次修改 |

### 文案 vs 运行事实

| 文案 | 冲突 | 类型 | 处理 |
| --- | --- | --- | --- |
| 导语 §5.4：“Every game on this page **runs inside the tab** you already have open.” | 生产为 **external-only**（新窗口/外链兜底） | **SAFETY_CONFLICT** | **未改**冻结导语（P45-22 锁定 Spec 逐字）；需 **BLOCKED — EDITORIAL APPROVAL** 修订为与 embed 状态一致的兜底表述后方可标 VERIFIED |
| H2① “Other verified titles… **load in the single play frame**” | R1 仅 1 条 verified；embed 关闭时无 iframe 帧内加载 | SAFETY_CONFLICT / FACTUAL_ADJUSTMENT | 已比产品稿审慎，但在 embed blocked 时仍偏乐观 → **MANUAL REVIEW** |
| “Ad blockers… **most common causes we see**” | 无故障统计证据 | EDITORIAL_REVIEW | 未改为虚构数据；保留审慎语气 |
| “Every title… **runs on their servers**” | 外链模式仍成立（官方 URL） | 部分 VERIFIED | OK |
| FAQ Chromebook / 手机 / 双人 | 见 §C 矩阵 | FACTUAL_ADJUSTMENT vs Spec | Chromebook 已软化；手机/双人 FAQ 与 Spec 一致部分保留 |

**不得**通过改 `unknown`→`granted` 使上述导语成立。

---

## F. Changes Applied

| 文件 | 变更 |
| --- | --- |
| `scripts/phase4.5-word-count-lib.ts` | **新增** — 无副作用 `countWords` / `countPhrase` |
| `scripts/phase4.5-word-count-entry.ts` | 分桶输出 intro / fiveH2 / faq / seoBodyExcludingFaq |
| `scripts/phase4.5-test-entry.tsx` | **P45-21–24**（词数分桶、冻结导语、embed 门禁、契约校验） |
| `.gitignore` | 加入 `tsconfig.tsbuildinfo` |
| Git index | `git rm --cached tsconfig.tsbuildinfo`（本地缓存保留） |
| `docs/agent/STATUS.md` | Phase 4.5 **ON MAIN** + 4.5.1 摘要 |
| `docs/agent/WORKLOG.md` | 追加 4.5.1 条目 |

**未改：** Portal 生产正文、Launcher/PlayFrame 安全逻辑、Catalog embed 状态。

### 测试映射（任务 C）

| ID | 覆盖 |
| --- | --- |
| C01 H2 标题顺序 | P45-03（既有） |
| C02 FAQ ↔ JSON-LD | P45-05 |
| C03 `hockey bros` = 0 | P45-06 |
| C04 词数分桶、无 950 硬失败 | P45-21 + 词数脚本 |
| C05 Legacy noindex | P45-19 + batch2 导出 head 解析 |
| C06 JSON-LD 安全 | P45-05/14/17/18 |

---

## G. Tests and Exit Codes

**Node：** 22.14.0（`--import` 与 DOM 测试需要；Node 16 下 phase4.3+ **失败** — 环境项）

| Command | Exit | 结论 |
| --- | ---: | --- |
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS |
| `yarn test:batch2` | 0 | PASS |
| `yarn test:catalog` | 0 | PASS |
| `yarn test:phase4.3` | 0 | PASS（22） |
| `yarn test:phase4.4` | 0 | PASS（25） |
| `yarn test:phase4.5` | 0 | PASS（**24**，+P45-21–24） |
| `yarn validate:catalog` | 0 | PASS（含 PRODUCTION_IFRAME_NOT_READY） |
| `yarn validate:seo` | 0 | PASS |
| `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; yarn build` | 0 | PASS |
| `yarn validate:seo --export-dir=out` | 0 | PASS |

Sitemap：**exact-two**（`https://ballgames.io` + `/hockey-bros`）。

---

## H. Documentation and Git Hygiene

| 项 | 状态 |
| --- | --- |
| Phase 4.5 on `main` @ `386a8b7` | **IMPLEMENTED ON MAIN** |
| STATUS「工作区未提交」 | **已纠正** — 4.5 已推送；4.5.1 为本地收口 diff |
| `tsconfig.tsbuildinfo` | 曾误跟踪于 4.5 提交；**已** `.gitignore` + 停止跟踪（构建仍可用增量本地缓存） |
| Phase 4.6 报告 | **未**创建 |

---

## I. Unresolved Manual Review Items

| ID | 项 | 影响生产索引放行？ |
| --- | --- | --- |
| MR-01 | 五 H2 **682** vs 目标 **~950** | 否（技术 gate 已过；SEO 产品目标未达） |
| MR-02 | Organization JSON-LD 省略 | 否（Spec 列出但 R1 实现选择省略 — 延续 4.5） |
| MR-03 | 导语「同 tab 内运行」vs **embed blocked** | **是 — 诚实性/误导风险**；需编辑批准后再标 VERIFIED |
| MR-04 | 首页卡 **1/15–20** | 否（已知 R1 数据实况） |
| MR-05 | 生产 iframe **unknown** | 否（预期 BLOCKED 至许可核实） |

---

## J. Phase Gate Conclusion

```text
Phase 4.5.1: PASS WITH MANUAL REVIEW
Phase 4.5:   IMPLEMENTED ON MAIN @ 386a8b7 — 技术集成 PASS（含 MANUAL REVIEW 项）
Phase 4.6:   NOT STARTED
```

**Phase 4.6 进入条件（建议）：**

1. 产品/编辑对 MR-03（导语与 embed 一致性）给出批准修订或接受风险的书面决定。  
2. 词数目标（MR-01）若仍为 R1 硬 KPI，需 **Spec/PO 授权** 的正文定稿（非 Agent 扩写）。  
3. 4.5.1 工作区 diff **commit** 后 main 可继续 4.6 任务书。

---

*本报告不替代 `ballgames-specs-v1.md`；冲突以产品 Spec 为准，待 PO 裁决。*
