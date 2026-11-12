# Phase 4.5 — Content / SEO Integration

**日期：** 2026-11-12  
**分支：** `main`  
**Before HEAD：** `6b54c666cd1a64478d6a965e34b1236224924a47`  
**After HEAD：** _(未提交 — 工作区实现)_  
**结论：** **PASS WITH MANUAL REVIEW**

---

## A. Git Baseline

| 项 | 值 |
| --- | --- |
| Branch | `main` |
| 审查基线 | `6b54c66` |
| 工作区 | 有未提交变更（见 §C） |
| `git diff --check` | 无冲突空白错误 |

---

## B. Scope and Constraints

- **在范围：** Portal Home 导语 + 5×H2 + 8 FAQ；`published` + `indexable`；页面 JSON-LD；production sitemap exact-two；Legacy `noindex, follow`；P45 测试。
- **不在范围：** Phase 4.6 全量导出扫描、4.7、Cloudflare、生产 iframe 放行、Catalog adapter、新路由。

---

## C. Files Changed

**新增**

- `components/portal/PortalHomeIntro.tsx`、`PortalHomeSeoSections.tsx`、`PortalHomeFaq.tsx`
- `components/seo/JsonLd.tsx`
- `lib/site/instances/ballgames-portal-home-production.ts`
- `lib/site/portal-home-editorial-contract.ts`
- `scripts/phase4.5-test-entry.tsx`、`scripts/phase4.5-tests.mjs`、`scripts/phase4.5-word-count-entry.ts`

**修改（核心）**

- `lib/site/types.ts`、`validate-portal-home-content.ts`、`instances/ballgames.ts`、`get-portal-home-content.ts`
- `components/portal/PortalHome.tsx`
- `app/page.tsx`、`app/[slug]/page.tsx`
- `lib/seo/structured-data.ts`、`index.ts`、`fixtures.ts`
- `scripts/validate-seo-entry.ts`、回归测试（batch2、phase4.3、catalog）
- `package.json`（`test:phase4.5`）
- `docs/agent/STATUS.md`、`WORKLOG.md`

---

## D. Portal Home Content

- **数据源：** `ballgamesPortalHomeContent` + `ballgames-portal-home-production.ts` → `getPortalHomeContent()`。
- **页面顺序：** H1/副标题 → Launcher → 导语 → 5×H2 → 8×`<details>` FAQ（§5.3）。
- **事实审慎改写（相对产品 Spec 冻结正文）：**

| 原文意图 | 处理 |
| --- | --- |
| 按游玩量排序 | 改为 `homeSort` 编辑排序，非实时 popularity |
| 多条可玩 / 加拿大工作室“最新”叙事 | 改为 R1 仅 1 条 verified 行 + 审慎描述 |
| 全文 “Hockey Bros” | SEO 正文内去除（满足 hockey bros = 0） |
| Chromebook FAQ “任意机器均可” | 改为网络过滤与硬件能力区分表述 |

---

## E. Metadata

| 页面 | Title / Description | Canonical | Robots |
| --- | --- | --- | --- |
| `/` | ballgames §5.1 冻结 TDK | `https://ballgames.io`（`siteUrl()`） | `index, follow` |
| `/hockey-bros` | 既有 Catalog detail SEO | `gameUrl('hockey-bros')` | `index, follow` |
| Legacy | — | helpers | `noindex, follow` |

---

## F. JSON-LD

| 页面 | 类型 | 说明 |
| --- | --- | --- |
| `/` | WebSite + ItemList（仅 Hockey Bros）+ FAQPage | 无 SearchAction / Organization |
| `/hockey-bros` | VideoGame + FAQPage + BreadcrumbList | 无 aggregateRating 等禁止字段 |
| 安全 | `serializeJsonLdForHtml` 转义 `<`；`assertNoForbiddenJsonLdFields` |

FAQ 文本与 UI 同源（`portal.faq` / `game.detail.faq`）。

---

## G. Sitemap and Indexability

Production `buildProductionSitemap()` → **exact-two**：

```text
https://ballgames.io
https://ballgames.io/hockey-bros
```

`out/sitemap.xml` 已验证。

---

## H. Legacy Noindex

`LEGACY_PAGE_ROBOTS` 未变；`validate:seo --export-dir=out` 覆盖 blog/about/projects/tags 样本。

---

## I. Content Verification

**统计脚本：** `npx esbuild scripts/phase4.5-word-count-entry.ts` + `node`（whitespace 分词，FAQ 单独计数）

| 页面 | 指标 | 实测 |
| --- | --- | --- |
| 首页 | 导语词数 | **57**（目标 ~55） |
| 首页 | 五 H2 词数 | **682**（目标 ~950 — **低于产品配额**） |
| 首页 | `ball games` | **3** |
| 首页 | SEO 正文 `hockey bros` | **0** |
| 首页 | FAQ | **8** |
| 详情 | 正文词数 | **988**（目标 ~980） |
| 详情 | FAQ | **7** |

**Hockey Bros 详情正文：** Phase 4.4 既有文案含 studio/日期等声明 — 未在本阶段扩写；JSON-LD 仅输出已核实字段子集（name、url、description）。

---

## J. Tests and Exit Codes

| Command | Exit |
| --- | --- |
| `yarn typecheck` | 0 |
| `yarn test:batch1` / `batch2` | 0 |
| `yarn test:catalog` | 0 |
| `yarn test:phase4.3` / `4.4` | 0 |
| `yarn test:phase4.5` | 0（P45-01 … P45-20） |
| `yarn validate:catalog` / `validate:seo` | 0 |
| `EXPORT=1 UNOPTIMIZED=1 yarn build` | 0 |
| `yarn validate:seo --export-dir=out` | 0 |

---

## K. Static Export Smoke Check

- `out/index.html`：`index, follow`、canonical、可见 SEO 块与 FAQ、JSON-LD（WebSite/ItemList/FAQPage）。
- `out/hockey-bros.html`：详情 JSON-LD 三块。
- `out/sitemap.xml`：2 URL。
- 生产 iframe：**仍 BLOCKED**（embed unknown）— 与 Phase 4.3 一致。

---

## L. Risks and Manual Review

- **Organization** JSON-LD：仍省略（无核实法人资料）。
- **首页五 H2 词数**低于 Spec ~950：未为凑字数添加未核实宣传句；可后续 editorial 增补。
- **15–20 首页卡片**、生产 iframe、Cloudflare CSP：仍为外部/后续阶段门禁。
- **详情 “Bros 系列 / 首页 grid” 句：** Catalog 仅 1 条 published — 详情正文部分句子为 Phase 4.4 既有文案，需 editorial 与 Catalog 同步（非本阶段 adapter 范围）。

---

## M. Phase Gate Conclusion

| 门禁 | 状态 |
| --- | --- |
| A01–A16 机制与集成 | **PASS** |
| A17 无未处理重大失实（首页 SEO 块） | **PASS**（审慎改写已落地） |
| 产品词数配额 | **MANUAL REVIEW**（五 H2 偏短） |
| Phase 4.6 边界 | **未启动** |

**最终：** **PASS WITH MANUAL REVIEW**
