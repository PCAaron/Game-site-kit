# Agent Work Log

按里程碑追加；不记录无验收意义的琐碎编辑。

---

## 2026-11-14 — BG-1.2.3.2：Evidence Gate Final Hardening

**范围：** Offer / Organization 直接生成器门禁、递归嵌套 Organization、Reserved Host DNS 根点、PATH-B Detail HTML + FAQ parity；**未**改生产 instances、冻结正文、UI、embed/CSP、依赖或 workflow。

**分支：** `main` · **基线/当前 HEAD：** `18b43bab112f2db4f14ebe5301cc26067a8538e3`（BG-1.2.3.1 已在 main）· **Git 状态：** 本地未提交/未推送

### 交付

- `lib/catalog/validate.ts`：verified Offer 资格复用完整 `assertLaunch()`；Reserved Host 单 DNS 根点与大小写规范化，非法尾随点 fail closed。
- `lib/site/validate-site-instance.ts`：Site 校验与 Organization 资格共享唯一 canonical Origin 断言，不引入循环或无关字段门禁。
- `lib/seo/structured-data.ts`：正式证据门禁递归对象/数组，拒绝任意深度、`@graph`、自定义属性与 `@type` 数组中的 Organization；递归栈检测循环且允许正常共享对象。
- 测试：Catalog 71、Phase 4.5 54、Phase 4.6 43（含 PATH-B-04）；PATH-B 只使用内存合成证据并读取真实新构建 HTML。
- 文档：`STATUS.md`、本 WORKLOG、[`ballgames-v1.2.3.2-evidence-gate-final-hardening.md`](reports/ballgames-v1.2.3.2-evidence-gate-final-hardening.md)。

### 验证

- Node **24.9.0** · npm **11.6.0**；本机无 Yarn CLI，使用等价 `npm.cmd run` 脚本。
- typecheck、batch1/2、catalog、phase4.3–4.6、validate:catalog/seo、`git diff --check` — **exit 0**。
- `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; npm.cmd run build` + export SEO — **exit 0**；`out/index.html` 时间戳晚于构建开始时间。

### 未解决 / 人工门禁

- MR-01–MR-08 全部保留；生产 Organization / freeOffer 仍无入库证据；生产 iframe/CSP 仍 BLOCKED；Cloudflare/live HTTPS 未验证。
- 未 commit、未 push、未建 PR、未部署；GitHub Pages `configure-pages@v5` 已知阻塞不在本任务范围。

### 结论

- **BG-1.2.3.2 Engineering：PASS WITH MANUAL REVIEW**
- **Ballgames R1 Product Acceptance：CONDITIONAL ACCEPTANCE**

---

## 2026-11-14 — BG-1.2.3.1：Evidence Gate Closeout

**范围：** 证据门控定点修复（P1/P2）— 双路径 SEO 校验、生成器资格、`isReservedHost`、Organization 输出一致性、OFF/ORG/PATH-B 测试；**未**改生产 instances、`app/**`、冻结正文、embed/CSP。

**分支：** `main` · **基线 HEAD：** `c04ae75bdc8108cb60b05504fb9212f11fdb4604`

### 交付

- `lib/catalog/validate.ts`：`isReservedHost`、`isVerifiedFreeOfferEligible` 完整校验
- `lib/site/validate-site-instance.ts`：`isVerifiedOrganizationEvidenceEligible` 完整校验
- `lib/seo/structured-data.ts`：Organization name/url 与证据一致；生成器走资格函数
- 测试：`scripts/validate-seo-entry.ts`、`scripts/phase4.5/4.6/ catalog-test-entry.ts`
- 文档：`STATUS.md`、[`ballgames-v1.2.3.1-evidence-gate-closeout.md`](reports/ballgames-v1.2.3.1-evidence-gate-closeout.md)、BG-1.2.3 报告勘误

### 验证

- Node **24.9.0** · npm **11.6.0**
- typecheck、batch1/2、catalog（62）、phase4.3–4.6（含 PATH-B）、validate:catalog/seo — **exit 0**
- `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; npm run build` + export SEO — **exit 0**

### PATH

- **PATH-A：** 生产无证据 — 首页无 Organization、Hockey Bros 无 offers — **PASS**
- **PATH-B：** 内存合成 verified fixture — **PASS**（**TEST FIXTURE ONLY，非生产证据**）

### 结论

- **BG-1.2.3.1 Engineering：** PASS WITH MANUAL REVIEW

---

## 2026-11-14 — BG-1.2.3：Verified Offer / Organization evidence-gated JSON-LD

**范围：** `FreeOfferEvidence` / `OrganizationEvidence` 可选类型；Catalog 与 SiteInstance 校验；`lib/seo/structured-data.ts` 条件化 `VideoGame.offers` 与首页 `Organization`；`assertJsonLdBlocksMeetEvidenceContract`；OFF/ORG 与 P46 导出测试。**未**改生产 instances、冻结正文、`app/**`、embed/CSP。

**分支：** `main` · **基线 HEAD（任务书）：** `129961e1207a9e7be5a19a00a7c9ed94ba39e31d`

### 交付

- 类型：`lib/catalog/types.ts`、`lib/site/types.ts`
- 校验：`lib/catalog/validate.ts`、`lib/site/validate-site-instance.ts`
- SEO：`lib/seo/structured-data.ts`、`lib/seo/index.ts`
- 测试：`scripts/catalog-test-entry.ts`、`scripts/phase4.5-test-entry.tsx`、`scripts/phase4.6-test-entry.ts`
- 文档：`docs/agent/STATUS.md`、`docs/agent/reports/ballgames-v1.2.2.1-homepage-closeout.md`（提交状态勘误）、[`ballgames-v1.2.3-offer-organization.md`](reports/ballgames-v1.2.3-offer-organization.md)

### 验证

- Node **24.9.0** · npm **11.6.0**
- typecheck、batch1/2、catalog、phase4.3–4.6、validate:catalog、validate:seo — **exit 0**
- 全新 `EXPORT=1 UNOPTIMIZED=1 npm run build` + `validate:seo --export-dir=out` — **exit 0**

### 证据状态

- 生产 Hockey Bros：**无** `freeOffer` → VideoGame **无** `offers`
- 生产 Site：**无** `organizationEvidence` → 首页 **无** Organization
- 免费事实核实 ≠ iframe 授权（EmbedPermission 仍为 unknown / BLOCKED）

### 结论

- **BG-1.2.3 Engineering：** PASS WITH MANUAL REVIEW
- **Verified Offer Contract：** PASS（工程；生产数据省略）
- **Organization Contract：** PASS（工程；生产数据省略）
- **未 commit/push**

---

## 2026-11-14 — BG-1.2.2.1：Homepage closeout（Footer/Header/Legacy 隔离）

**范围：** 唯一站点 Footer（`resolveSiteChrome`）；Ballgames 隐藏 Legacy Search 与 About 导航；`PortalHome` 移除重复页脚；双游戏 granted iframe 换源测试；Level-2 产品可见词频与 Footer 结构测试；`isValidIsoCalendarDate`；人工产品能力门禁文档。**未**改冻结正文、生产 Catalog embed、CSP、BG-1.2.3。

**分支：** `main` · **基线 HEAD：** `200280fc93492e16fd389ed5f3d52e4c9ebb398c`

### 交付

- Chrome：`lib/site/types.ts`、`lib/site/resolve-site-chrome.ts`
- UI：`Footer.tsx`、`Header.tsx`、`MobileNav.tsx`、`SearchButton.tsx`、`PortalHome.tsx`、`PortalHomeSiteFooter.tsx`
- Catalog：`lib/catalog/validate.ts`（`isValidIsoCalendarDate`）
- 测试：`phase4.3-component-tests.tsx`、`phase4.6-test-entry.ts`、`catalog-test-entry.ts`
- 报告：[`ballgames-v1.2.2.1-homepage-closeout.md`](reports/ballgames-v1.2.2.1-homepage-closeout.md)

### 验证

- 全量 typecheck、batch、catalog、phase4.3–4.6、validators — **exit 0**
- 全新 static export + `validate:seo --export-dir=out` — **exit 0**

### 结论

- **BG-1.2.2.1：** PASS WITH MANUAL REVIEW
- **BG-1.2.2 Closeout：** CLOSED（产品 manual gates 保留）
- **BG-1.2.3：** NOT STARTED（本节历史记录；工程后见上文 BG-1.2.3 条目）
- **Production iframe：** BLOCKED
- **后续：** 变更已提交为 `129961e` on `main`（见 closeout 报告 Commit status update）

---

## 2026-11-14 — BG-1.2.2：Homepage / Launcher / v1.2 文案

**范围：** Catalog 默认玩家与 technical embed 校验；homepage-r1 正文/TDK/H2/FAQ；副标题与 Portal 页脚；Launcher 默认 Football Bros；`iframe#player`；SEO-HOME 导出词频测试；phase4.3/4.5/4.6 与 catalog 负面用例。**未**改 Hockey Bros 详情、Offer JSON-LD、生产 embed 授权、15–20 卡片数据。

**分支：** `main` · **基线 HEAD：** `7521011665bb1251046b6b76c474ab3c591d33f1`

### 交付

- 内容与契约：`lib/site/instances/ballgames*.ts`、`portal-home-editorial-contract.ts`
- UI：`PortalHome.tsx`、`PortalHomeSiteFooter.tsx`、`PlayFrame.tsx`（`id="player"`）
- Catalog：`lib/catalog/validate.ts`、adapter 报告
- 测试：`scripts/catalog-test-entry.ts`、`phase4.3/4.5/4.6`
- 报告：[`ballgames-v1.2.2-homepage-launcher.md`](reports/ballgames-v1.2.2-homepage-launcher.md)

### 验证

- 全量 typecheck、batch、catalog、phase4.3–4.6、validators — **exit 0**
- 全新 static export + `validate:seo --export-dir=out` — **exit 0**

### 结论

- **BG-1.2.2：** PASS WITH MANUAL REVIEW
- **BG-1.2.3：** NOT STARTED
- **Production iframe：** BLOCKED
- **未 commit/push**

---

## 2026-11-13 — BG-1.2.1：Catalog & Default Player + `gamePath`

**范围：** 四项 Spec 定点修订；`gamePath`/`validateGameSlug`；`GameCard` 相对导航；`defaultPlayerGameSlug` + Football Bros Catalog；`pickDefaultLauncherGame(catalog)`；可选 `technicalEmbedVerification`；测试与全新 static export。**未**改首页正式 SEO 正文、PortalHome UI、JSON-LD 生成器、CSP、生产 embed 授权。

**分支：** `main` · **基线 HEAD：** `a8b4f59f34a490cefc503f05d47d1aa041e10efa`

### 交付

- 代码：`lib/urls/site-url.ts`、`lib/catalog/*`、`lib/portal/play-presentation.ts`、`components/portal/{GameCard,Launcher}.tsx`
- 规范：`ballgames-specs-v1.2` §2.3/§7.1/§7.3、`hockey-bros-r1` Offer 表、`seo/02`、`seo/06`
- 报告：[`ballgames-v1.2.1-catalog-default-player.md`](reports/ballgames-v1.2.1-catalog-default-player.md)

### 验证

- 全量 `yarn typecheck`、batch、catalog、phase4.3–4.6、validators — **exit 0**
- `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; yarn build` + `validate:seo --export-dir=out` — **exit 0**

### 结论

- **BG-1.2.1：** PASS WITH MANUAL GATES
- **BG-1.2.2：** NOT STARTED
- **Production iframe：** BLOCKED
- **未 commit/push** — 待用户授权

---

## 2026-11-13 — BG-1.2.0：Ballgames Spec v1.2 决策落地与规范对齐

**范围：** P0-01～P1-07 文档落地；修订 v1.2 Spec、R1 content 稿、实例索引、seo/02–03、**新建** seo/06、ADR 0003/0004 增补、收口报告。**未**改 `app/`、`lib/`、`components/`、`scripts/`、测试或部署。

**分支：** `main` · **基线 HEAD：** `5b6003afa4f1288df4456075a2c1caeb960728b1`

### 交付

- [`specs/ballgames/ballgames-specs-v1.2.md`](../../specs/ballgames/ballgames-specs-v1.2.md)（ItemList、`gamePath`、页脚、Demo、正文权威）
- [`specs/ballgames/content/homepage-r1.md`](../../specs/ballgames/content/homepage-r1.md)、[`hockey-bros-r1.md`](../../specs/ballgames/content/hockey-bros-r1.md)
- [`specs/seo/06-verified-offer-and-organization.md`](../../specs/seo/06-verified-offer-and-organization.md)
- [`specs/instances/ballgames/README.md`](../../specs/instances/ballgames/README.md)（v1.2 权威）
- ADR 0003 DEC-003-G、ADR 0004 Demo-first
- [`ballgames-v1.2-impact-review.md`](reports/ballgames-v1.2-impact-review.md)
- `docs/agent/STATUS.md`（本条目）

### 验证

- `git diff --check` · `git status --short` · `git diff --stat` — 仅文档；**未**运行产品 build 作为 v1.2 实现证明

### 结论

- **BG-1.2.0：** PASS WITH EXTERNAL EVIDENCE PENDING
- **BG-1.2.1 Readiness：** READY WITH GATES
- **Phase 4.7 历史验收：** 未修改报告正文，指针保留

**未 commit/push** — 待用户授权。

---

## 2026-11-13 — Phase 4.7：Ballgames R1 最终工程验收

**范围：** 只读产品代码；`ballgames-specs-v1` §8 + `04-ballgames-r1` §14；全量回归；全新 `EXPORT=1 UNOPTIMIZED=1` 静态导出；`out/` HTML/XML/SEO 证据；MR-01…05 终态分类。**未**扩写正文、**未**改 Catalog/CSP/embed、**未**部署。

**分支：** `main` · **Validated SHA：** `339250db53cbd48e7b816b10a73f4730146ca89b`（= 授权审查基线；工作区验收时 **clean**）

### 交付

- 报告 [`phase-4-final-validation.md`](reports/phase-4-final-validation.md)
- `docs/agent/STATUS.md`、`docs/agent/WORKLOG.md`（本条目）

### 验证（Node 22.14.0 @ `339250d`）

| Command | Exit |
| --- | --- |
| `yarn typecheck` + batch/catalog + phase4.3–4.6 + validators | 0 |
| `EXPORT=1 UNOPTIMIZED=1 yarn build` + `validate:seo --export-dir=out` + `test:phase4.6` | 0 |

### 结论（分层）

- **Phase 4 Engineering Acceptance：** **PASS WITH MANUAL REVIEW**
- **Ballgames R1 Product Acceptance：** **CONDITIONAL ACCEPTANCE**（MR-01/03/04）
- **R1 Production Release：** **NOT VERIFIED**

**未 commit/push** — 待用户授权。

---

## 2026-11-13 — Phase 4.6 Validation Hardening（P1-01 / P1-02 / P2-01）

**范围：** 增强 `phase4.6-hardcoded-paths`（TypeScript AST + 情境 allowlist）；导出 HTML 全量 JSON-LD 禁止字段与类型 multiset；首页 SEO 正文从 `out/index.html` 提取。**未**改产品代码、Spec、内容。

**分支：** `main` · **Before HEAD：** `4fe7d4f8fe79aca2b581320f8993daf1a52d554c` · **After HEAD：** `bb5aa55`（pushed）

### 交付

- `scripts/phase4.6-hardcoded-paths.mjs`（AST 扫描）
- `scripts/phase4.6-hardcoded-paths.test.mjs`（Case 1–11 + allowlist 负例）
- `scripts/phase4.6-test-entry.ts`（HTML JSON-LD / SEO body + LD-N / SEO-N）
- `scripts/phase4.6-tests.mjs`（接线 hardcoded 单测）
- 报告 [`phase4.6-validation.md`](reports/phase4.6-validation.md) §N

### 验证（Node 22.14.0）

全量回归与 §N 表一致 — **exit 0**。

结论：**Validation Hardening PASS**；**Phase 4.6 Technical Validation** 仍为 **PASS WITH MANUAL REVIEW**（MR-01…05 保留）

---

## 2026-11-13 — Phase 4.6：静态导出与 SEO 独立集成验证

**范围：** 基于 `4f8bcabb` 重新 `EXPORT=1 UNOPTIMIZED=1 yarn build`；核验 `out/` sitemap/metadata/JSON-LD/FAQ；硬编码路径扫描；`test:phase4.6`；全量回归。**未**改产品内容/Launcher/CSP；**未**启动 4.7。

**分支：** `main` · **HEAD：** `4f8bcabbb01a6411d0cb0089632d3418c83e4888`（仅新增验证脚本与 Agent 文档）

### 交付

- `scripts/phase4.6-hardcoded-paths.mjs`、`phase4.6-test-entry.ts`、`phase4.6-tests.mjs`
- `package.json` → `test:phase4.6`
- 报告 [`phase4.6-validation.md`](reports/phase4.6-validation.md)

### 验证（Node 22.14.0）

| Command | Exit |
| --- | --- |
| `yarn typecheck` + batch/phase 4.3–4.6 + validators | 0 |
| `EXPORT=1 UNOPTIMIZED=1 yarn build` + `validate:seo --export-dir=out` | 0 |

结论：**Phase 4.6 PASS WITH MANUAL REVIEW**（MR-01、MR-03 等保留）

---

## 2026-11-12 — Phase 4.5.1：Spec 一致性定点收口

**范围：** 对照 `ballgames-specs-v1` 审查首页/详情实现；词数实测；embed 文案冲突登记；P45-21–24；`tsconfig.tsbuildinfo` 治理；Agent 报告。**未**扩写正文、**未**启动 4.6。

**分支：** `main` · **HEAD 基线：** `386a8b763912d79854b7a860da0571517736e39c`（4.5 已在 main）· **工作区：** 测试/词数脚本、`.gitignore`、取消跟踪 `tsbuildinfo`

### 要点

- Spec 矩阵：H2/导语/结构 **PASS**；五 H2 词数 **682 vs ~950** → `SPEC WORD TARGET DIFFERENCE — MANUAL REVIEW`。
- **SAFETY_CONFLICT：** 冻结导语 §5.4「同 tab 内运行」与生产 `external-only`（embed `unknown`）→ **BLOCKED — EDITORIAL APPROVAL**；未改冻结文案。
- `tsconfig.tsbuildinfo` → `.gitignore` + `git rm --cached`。

### 验证（Node 22.14.0）

| Command | Exit |
| --- | --- |
| `yarn typecheck` + batch/phase tests + validators | 0 |
| `EXPORT=1 UNOPTIMIZED=1 yarn build` + `validate:seo --export-dir=out` | 0 |

报告：[`phase4.5.1-spec-consistency-closeout.md`](reports/phase4.5.1-spec-consistency-closeout.md) · 结论：**PASS WITH MANUAL REVIEW**

---

## 2026-11-12 — Phase 4.5：Content / SEO Integration

**范围：** Portal Home 正文/FAQ、索引放行、页面 JSON-LD、production sitemap exact-two、P45 测试、静态导出冒烟。**不含** Phase 4.6+。

**分支：** `main` · **审查基线：** `6b54c66` · **最终 commit：** `386a8b7`（已推送 main）

### 要点

- `ballgamesPortalHomeContent`：`published` + `indexable: true`；导语 + 5×H2 + 8 FAQ（事实审慎改写）。
- `PortalHome` 渲染 SEO 区块；`JsonLd` + `buildPortalHomeJsonLdBlocks` / `buildGameDetailJsonLdBlocks`。
- `validate-seo` 生产 sitemap 断言更新为 exact-two。

### 验证

| Command | Exit |
| --- | --- |
| `yarn typecheck` | 0 |
| `yarn test:batch1` / `batch2` / `catalog` / `phase4.3` / `phase4.4` / `phase4.5` | 0 |
| `yarn validate:catalog` / `validate:seo` | 0 |
| `EXPORT=1 UNOPTIMIZED=1 yarn build` | 0 |
| `yarn validate:seo --export-dir=out` | 0 |

报告：[`phase4.5-content-seo-integration.md`](reports/phase4.5-content-seo-integration.md) · 结论：**PASS WITH MANUAL REVIEW**（五 H2 词数低于 Spec 目标；Organization 省略）。

---

## 2026-11-12 — Phase 4.4.1：Related 自引用收口 + 构建验收

**范围：** `GameDetailTemplate` 使用 `excludeSlug`；空 Related 不渲染；修订 D13/D15/D18；新增 D21–D26；Agent 文档同步；在 `60ee012d` 上重建静态 `out/` 并跑 SEO 契约。**不含** Phase 4.5。

**分支：** `main` · **审查基线 / HEAD：** `60ee012d8704245db2494261ac1e5e74b579d30f`（已推送 `origin/main`）· **状态：** **DONE**（代码已上 `main`；导出验收本日完成）

### RelatedGames 决策

- `getProductionRelatedCatalogGames(catalog, { excludeSlug: game.slug })`。
- R1 仅 1 条 `published` + `showOnHome` → Related **0** 张、整区隐藏。
- 测试 Catalog 使用 `phase44-*` slug 夹具，不写入正式实例。

### 修改文件

- `components/portal/GameDetailTemplate.tsx`
- `scripts/phase4.4-component-tests.tsx`
- `docs/agent/STATUS.md`、`WORKLOG.md`、`reports/phase4.4-hockey-bros-detail.md`、`reports/phase4.4.1-closeout.md`

### 验证

| Command | Exit | Result |
| --- | --- | --- |
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` / `batch2` / `catalog` / `phase4.3` | 0 | PASS |
| `yarn test:phase4.4` | 0 | PASS（25） |
| `yarn validate:catalog` / `validate:seo` | 0 | PASS |
| `validate:seo --export-dir=out`（旧 `out/`） | 0 | PASS |
| 预检：无 dev `:3000`；删 `.next` | — | PASS |
| `EXPORT=1 UNOPTIMIZED=1 yarn build`（Node 22.14.0） | 0 | PASS — `out/index.html`、`out/hockey-bros.html` |
| `validate:seo --export-dir=out`（新 `out/`） | 0 | PASS |

**`_document` 历史失败：** 并行 `yarn dev` + 脏 `.next` → `PageNotFoundError`；停 dev 并清 `.next` 后未复现。

报告：[`phase4.4.1-closeout.md`](reports/phase4.4.1-closeout.md)

### 阶段结论

- **4.4.1 代码/测试：** PASS  
- **4.4.1 导出门禁：** PASS  
- **R1 生产上线：** BLOCKED（iframe、4.5+ SEO）  
- **总体：** CONDITIONAL PASS

### 人工验收（保留）

- 响应式视觉、生产 iframe/CSP、Related 数量 vs 12–16 设计目标（INFO）。

### 建议下一步

- 授权 **Phase 4.5 — Content / SEO Integration**（勿提前 exact-two / 页面 JSON-LD）。

---

## 2026-11-12 — Phase 4.4：Hockey Bros Detail UI

**范围：** `/hockey-bros` 详情模板、面包屑、PlayFrame 复用、正文/FAQ、RelatedGames button + `scrollIntoView`、广告静态壳、D01–D20 测试；**不含** Phase 4.5。

**分支：** `main` · **基线：** `703118f9cf9f8bf5afc895d57cea7a5d46232405` · **状态：** 工作区已改、**未 commit**

### 摘要

- 替换 Phase 4.2 `MinimalGameDetailShell` 为 `GameDetailTemplate` 全家桶。
- `GameCard` / `GameGrid` 增加 `displayContext=related`；首页 Link 行为回归通过。
- Related 数据仅 `getProductionRelatedCatalogGames()`（当前 1 条）；未伪造 draft。
- 生产 iframe 仍 **external-only**（ADR 0004）。

### 验证

| Command | Exit | Result |
| --- | --- | --- |
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS |
| `yarn test:batch2` | 0 | PASS |
| `yarn test:catalog` | 0 | PASS |
| `yarn test:phase4.3` | 0 | PASS |
| `yarn test:phase4.4` | 0 | PASS（20） |
| `yarn validate:catalog` | 0 | PASS |
| `yarn validate:seo` | 0 | PASS |
| `yarn build` + static export | 0 | PASS（`out/hockey-bros.html`） |

报告：[`phase4.4-hockey-bros-detail.md`](reports/phase4.4-hockey-bros-detail.md)

---

## 2026-11-12 — Phase 4.3.1：PlayFrame / 测试 / 首页文案定点修复

**范围：** `PlayFrame` 8s timeout 与 generation、`PortalHome` 冻结 H1/副标题、Phase 4.3 真实组件测试（T01–T07）、文档状态与 Git 对齐；**不含** Phase 4.4。

**分支：** `main` · **Phase 4.3 基线（已推 main）：** `c73884296ffb644fe7cdf7a28428229edd3505ae` · **4.3.1 commit：** `b1a3f33`（已推送 `origin/main`）

### 修复摘要

- **P1-01 / P2-01：** `loaded-event` 不再取消 8s 计时；`loaded-event` / `loading` 在超时前未 `ready` 时进入 `timeout`；`activeGenerationRef` 防陈旧 onLoad/timeout。
- **P1-02：** `@testing-library/react` + happy-dom；`test:phase4.3` 增至 22 条（含 T01–T07）。
- **P2-02：** H1 `Ball Games` + §5.2 冻结副标题（独立 `<p>`）。
- **P2-03：** STATUS / 本报告更新；Phase 4.3 标记为已推 `main`。

### 验证

| Command | Exit | Result |
| --- | --- | --- |
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS（10） |
| `yarn test:batch2` | 0 | PASS（30） |
| `yarn test:catalog` | 0 | PASS（34） |
| `yarn test:phase4.3` | 0 | PASS（22） |
| `yarn validate:catalog` | 0 | PASS |
| `yarn validate:seo` | 0 | PASS |
| `yarn build` | 0 | PASS |
| Static export + `validate:seo --export-dir=out` | 0 | PASS |
| `git diff --check` | 0 | PASS |

**Commit：** `b1a3f33` — `fix(phase4.3.1): harden PlayFrame timeout and add RTL component tests`（已 push）

---

## 2026-11-11 — Phase 4.3：Homepage / PlayFrame

**范围：** 首页 Portal UI、`GameCard` / `GameGrid` / `PlayFrame` / `Launcher`、`lib/portal/play-presentation`、Phase 4.3 测试与 export SEO 预期更新；**不含** Phase 4.4 详情正文、生产 indexable、生产 iframe 放行。

**分支：** `main` · **基线：** `7d3ef1146a4edaa8a72467e59fe9452fc2b39be6`

### 交付摘要

- `app/page.tsx` 消费 `getPortalHomeContent()` + `getProductionHomeCatalog()`，移除 Blog 首页数据源。
- 首页 metadata 经 `resolvePortalHomePageSeo` / `resolvedSeoToMetadata`（仍为 `noindex`）。
- 生产 embed 未获批时 PlayFrame **external-only** + 新标签链接（ADR 0004）。

### 验证

| Command | Exit | Result |
| --- | --- | --- |
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS |
| `yarn test:batch2` | 0 | PASS |
| `yarn test:catalog` | 0 | PASS |
| `yarn test:phase4.3` | 0 | PASS（15） |
| `yarn validate:catalog` | 0 | PASS |
| `yarn validate:seo` | 0 | PASS |
| `yarn build` | 0 | PASS |
| Static export + `validate:seo --export-dir=out` | 0 | PASS |

**报告：** [`reports/phase4.3-homepage-playframe.md`](reports/phase4.3-homepage-playframe.md)

**Commit：** 未创建（待用户授权）

---

## 2026-11-11 — Phase 4.2.1：Targeted Fixes & Validation Closure

**范围：** SEO Title `absolute`（P1-01）、R1 生产详情路由 allowlist（P1-02）、Batch 2 / `validate:seo` 补强（P2-01）、STATUS / Spec 状态漂移修正（P2-02）；**不含** Phase 4.3+。

**分支：** `main` · **基线（审查）：** `97fec3de1db2b31bbed9a012ee1497dc5604062d`

### 问题与修复

| ID | 问题 | 修复 |
| --- | --- | --- |
| P1-01 | `resolvedSeoToMetadata` 字符串 title 被 root `title.template` 重复追加品牌 | `title: { absolute: resolved.title }` |
| P1-02 | 生产路由仅依赖 Catalog 能力，未区分 R1 批准范围 | `isProductionRoutableGameDetail` + `R1_DETAIL_CONTENT_SLUG` |
| P2-01 | export 仍 BLOCK `hockey-bros.html` | `validate-seo` 在 `--export-dir` 下校验 Hockey Bros head |
| P2-02 | `04-ballgames-r1.md` 仍将 4.2 NOT STARTED | 顶部与 Entry 表最小修正 |

### 修改文件

- `lib/seo/metadata.ts`、`lib/seo/production-game-routes.ts`、`lib/seo/index.ts`
- `scripts/batch2-test-entry.ts`、`scripts/validate-seo-entry.ts`
- `docs/agent/STATUS.md`、`docs/agent/WORKLOG.md`、`specs/phases/04-ballgames-r1.md`

### 验证

| Command | Exit | Result |
| --- | --- | --- |
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS（10） |
| `yarn test:batch2` | 0 | PASS（**30**，含 4.2.1 用例） |
| `yarn test:catalog` | 0 | PASS（34） |
| `yarn validate:catalog` | 0 | PASS |
| `yarn validate:seo` | 0 | PASS（contract） |
| `yarn build` | 0 | PASS（SSG `/[slug]` → `/hockey-bros`） |
| `git diff --check` | 0 | PASS |
| `$env:EXPORT=1; yarn build` + `yarn validate:seo --export-dir=out` | 0 | PASS（`hockey-bros.html` title/canonical/robots） |

**Commit：** `5937b18`（`fix(seo): Phase 4.2.1 title absolute and R1 detail route gate`）· **父提交（审查基线）：** `97fec3de1db2b31bbed9a012ee1497dc5604062d`

### 遗留（非阻塞）

- Phase 4.6：Cloudflare live HTTP、全站 export 终验仍 **NOT VERIFIED**
- Portal Home `published` + indexable 切换 → Phase 4.5

---

## 2026-11-09 — Phase 4.2：Route / Metadata Integration

**范围：** `app/[slug]/page.tsx`、`lib/seo/routes.ts`、`production-game-routes.ts`、`production-state.ts`、`resolve-page-seo.ts`（Game Detail）、Batch 2 契约测试；**不含** 首页 UI、PlayFrame、详情正文、页面 JSON-LD、exact-two export 终验。

**分支：** `main`（工作区未提交）

### 交付

- 生产可路由游戏 slug 门禁（Catalog Adapter：`published` + `navigate-to-detail` + `detail.seo`）
- `/hockey-bros` App Route 识别、`GameDetailPageDescriptor`、`resolveGameDetailPageSeo` + `generateMetadata`
- `generateStaticParams` 仅 `hockey-bros`；`dynamicParams = false`
- `getProductionPortalDescriptors()` 接入 Catalog 游戏行

### 验证

| Command | Exit | Result |
| --- | --- | --- |
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch1` | 0 | PASS（10） |
| `yarn test:batch2` | 0 | PASS（**26**） |
| `yarn test:catalog` | 0 | PASS（34） |
| `yarn validate:catalog` | 0 | PASS |
| `yarn validate:seo` | 0 | PASS |
| `yarn build` | 0 | PASS（SSG `/[slug]` → `/hockey-bros`） |
| `git diff --check` | 0 | PASS |

---

## 2026-11-03 — Phase 3 Batch 0：Static Export 与 URL 技术探针

**范围：** DEC-003-E 实测探针；**未**修改正式 `next.config.js`、部署 workflow、Phase 3 业务实现、ADR 状态。

**HEAD：** `main` / `7bdc5f7ba13a2b17575826d47b9ae4ba25d1469e`

### 交付

- [`docs/agent/reports/batch0-static-export-url-probe.md`](reports/batch0-static-export-url-probe.md)
- [`scripts/probe/batch0-export-url-probe.mjs`](../../scripts/probe/batch0-export-url-probe.mjs)
- [`docs/agent/reports/batch0-evidence/`](reports/batch0-evidence/)（三场景 `summary.json` + `manifest.json`）

### 探针命令

```powershell
nvm use 18.20.0
node scripts/probe/batch0-export-url-probe.mjs
```

### 验证

| Check                                                             | Exit | Result                                   |
| ----------------------------------------------------------------- | ---- | ---------------------------------------- |
| 场景 A build（`trailingSlash: true`, 无 BASE_PATH）               | 0    | PASS                                     |
| 场景 B build（`trailingSlash: false`, 无 BASE_PATH）              | 0    | PASS                                     |
| 场景 C build（`trailingSlash: true`, `BASE_PATH=/Game-site-kit`） | 0    | PASS                                     |
| `next.config.js` 恢复（SHA256 前后一致）                          | —    | PASS（manifest `configRestored: true`）  |
| `app/tag-data.json`                                               | —    | build 副作用已 `git checkout` 恢复       |
| GitHub Pages live HTTP                                            | —    | **NOT RUN**                              |
| ADR DEC-003-E 实施方案批准                                        | —    | **Pending User Approval**（报告建议 F1） |

### 结论摘要

- **F1**（`trailingSlash: false`）+ Phase 3 `siteUrl()` 为推荐方向；**未**改正式配置。
- Batch 1 **未启动**。

---

## 2026-11-03 — DEC-003-E F1 批准与落地

**用户决策：** 批准 Batch 0 推荐 **F1**（`trailingSlash: false`）。

### 变更

- `next.config.js`：`trailingSlash: true` → **`false`**
- ADR 0003、Conflict Matrix（ACM-009/010）、STATUS、Phase 3 Spec §13 同步 F1 状态

### 验证（Node 18.20.0）

| Command                                             | Exit | Result                                                                 |
| --------------------------------------------------- | ---- | ---------------------------------------------------------------------- |
| `yarn typecheck`                                    | 0    | PASS                                                                   |
| `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; yarn build` | 0    | PASS；`out/blog.html` 存在（F1 扁平 export）；无 `out/blog/index.html` |
| `git checkout -- app/tag-data.json`                 | 0    | build 副作用已恢复                                                     |
| GitHub Pages live HTTP                              | —    | **NOT RUN**                                                            |

**未启动 Batch 1。** F3 **未**批准。

---

## 2026-11-03 — Phase 3 Batch 1：SiteInstance 与 URL 基础能力

**前置：** Batch 0 PASS；F1 已批准（2026-11-03）。

**范围：** SiteInstance、PortalHomeContent 契约与校验、`siteUrl()` / `gameUrl()`（canonical 门户 URL，非第三方 launchUrl）；**未**接 layout/sitemap/metadata/JSON-LD。

### 新增

- `lib/site/*` — 类型、ballgames 实例、校验、`getSiteInstance()`
- `lib/urls/*` — `siteUrl()`、`gameUrl()`
- `scripts/batch1-test-entry.ts`、`scripts/batch1-url-tests.mjs`；`package.json` → `test:batch1`
- `tsconfig.json` → `@/lib/*`

### 验证

| Command                    | Exit | Result          |
| -------------------------- | ---- | --------------- |
| `yarn typecheck`           | 0    | PASS            |
| `yarn test:batch1`         | 0    | PASS（9 tests） |
| `yarn next lint --dir lib` | 0    | PASS            |

**Batch 2 未启动**（metadata/sitemap 等仍待授权）。

---

## 2026-11-03 — Phase 3 Batch 2：SEO 核心能力

**前置：** Batch 1 PASS；F1 已批准。

**范围：** Metadata/canonical/OG（SiteInstance + PortalHome 契约）、R1 sitemap 机制、robots、JSON-LD 生成器；**未**实现 Catalog/Detail/Launcher/iframe。

### 要点

- `lib/seo/*` — eligibility、sitemap、metadata、JSON-LD、production vs contract fixtures
- `app/layout.tsx`、`app/sitemap.ts`、`app/robots.ts`、`app/seo.tsx` — 统一 `siteUrl()` / ballgames origin
- Legacy blog/tags/projects/about — **noindex**、**不进** R1 sitemap；路由保留
- 生产 sitemap **空**（portal draft + `/hockey-bros` 不存在）；contract fixture 验证 exact-two

### 验证

| Command                                          | Exit | Result                            |
| ------------------------------------------------ | ---- | --------------------------------- |
| `yarn typecheck`                                 | 0    | PASS                              |
| `yarn test:batch1`                               | 0    | PASS                              |
| `yarn test:batch2`                               | 0    | PASS（9 tests）                   |
| `EXPORT=1 UNOPTIMIZED=1 yarn build`              | 0    | PASS；`out/sitemap.xml` 空 urlset |
| `yarn next lint --dir lib --dir app/seo.tsx ...` | 0    | PASS                              |

**Batch 3 未启动**（`validate-seo.mjs`、CI export 验收）。

---

## 2026-11-03 — Phase 3 Batch 3：自动化验证与构建验收

**范围：** `scripts/validate-seo.mjs` + `validate:seo`；全量 typecheck / batch tests / normal + CI export build；**未**启动 Phase 4。

### 新增

- `scripts/validate-seo.mjs`、`scripts/validate-seo-entry.ts`
- `package.json` → `validate:seo`
- [`docs/agent/reports/phase3-batch3-validation.md`](reports/phase3-batch3-validation.md)

### 验证（Node 18.20.0）

| Command                                                              | Exit | Result                        |
| -------------------------------------------------------------------- | ---- | ----------------------------- |
| `yarn typecheck`                                                     | 0    | PASS                          |
| `yarn test:batch1` / `test:batch2`                                   | 0    | PASS                          |
| `yarn validate:seo`                                                  | 0    | PASS                          |
| `yarn build`（清除 EXPORT）                                          | 0    | PASS（无 static export 阶段） |
| `EXPORT=1 UNOPTIMIZED=1 yarn build`                                  | 0    | PASS                          |
| `EXPORT=1 UNOPTIMIZED=1 BASE_PATH=/Game-site-kit yarn build`         | 0    | PASS                          |
| `node scripts/validate-seo.mjs --export-dir=out`（根与子路径各一次） | 0    | PASS                          |
| `yarn next lint --dir lib`                                           | 0    | PASS                          |

构建后已恢复 `app/tag-data.json`（若被 contentlayer 改动）。

### Phase 3 结论

**PASS WITH LIMITATIONS** — 机制与确定性验证完成；生产 R1 exact-two / 页面 JSON-LD **集成**仍属 Phase 4。

**Phase 4 未启动。**

---

## 2026-10-30 — Phase 1 收尾（Task A）

**范围：** 修复 Windows 下 `yarn dev` / `yarn build`；补充 `typecheck`；建立 Agent 状态文件。

### 修改摘要

- 新增 `scripts/next-with-init-cwd.mjs`：在调用 Next 前将 `INIT_CWD` 设为项目根目录，替代 `$PWD`。
- 更新 `package.json` 的 `dev` / `build` 脚本；新增 `typecheck`。
- `eslint.config.mjs`：忽略对新启动脚本的 TS project 解析（仅此文件）。
- `README.md`：移除 Windows 手动设置 `$env:PWD` 的说明。
- 新增 `docs/agent/STATUS.md`、`docs/agent/WORKLOG.md`。
- 还原误改的 `app/tag-data.json`（未纳入本次 intentional 变更）。

### 验证命令与结果

| Command          | Exit | Result                     |
| ---------------- | ---- | -------------------------- |
| `yarn lint`      | 0    | PASS                       |
| `yarn typecheck` | 0    | PASS                       |
| `yarn build`     | 0    | PASS（约 60 静态页 + RSS） |
| `yarn dev`       | —    | PASS（进程启动；Ready）    |

### 遗留

- `specs/`、`.agents/skills/` 仍缺失（Agent-Ready 第二步，非 Phase 1 范围）。
- Phase 1 收尾已纳入 Git 基线 commit（见 `git log -1`）。

---

## 2026-10-31 — Phase 2：SEO 页面模型与内容契约（文档）

**范围：** Kit 级 portal 页面类型、逻辑内容模型、SEO 子 Spec（01–05）；与 [`specs/ballgames/ballgames-specs-v1.md`](../../specs/ballgames/ballgames-specs-v1.md) 分层对齐。**未**改应用代码或依赖。

### 交付

- `specs/phases/02-seo-page-model-and-content-contract.md`
- `specs/01-site-archetypes.md`、`specs/04-config-and-content-models.md`
- `specs/seo/01`–`05-*.md`
- `specs/instances/ballgames/README.md`
- 更新 `AGENTS.md`、`docs/agent/STATUS.md`、`ballgames-specs-v1` 顶部 Kit 引用

### 验证

| Check                          | Result             |
| ------------------------------ | ------------------ |
| 文档引用路径存在性             | PASS               |
| `git diff` 无 package/应用代码 | PASS               |
| `yarn build`                   | 未执行（文档任务） |

### 遗留

- Phase 3：代码层 SEO Foundation（含 `trailingSlash` 与 ballgames canonical 统一）。
- Phase 4：R1 两页实现与 DoD。

---

## 2026-11-02 — Phase 2.2：Instance-to-Kit Contract Alignment（文档）

**范围：** Catalog/Detail/Indexable 分层；Launcher 与导航语义；PageSEO/SitemapCandidate；ballgames v1.1 优先级与 canonical（首页 `https://ballgames.io` 无尾斜杠）；§7.1 VERIFICATION REQUIRED。**未**改应用代码。

### 修改文件

- `specs/01-site-archetypes.md`、`specs/04-config-and-content-models.md`
- `specs/seo/01`–`05`
- `specs/phases/02-seo-page-model-and-content-contract.md`
- `specs/instances/ballgames/README.md`、`specs/ballgames/ballgames-specs-v1.md`
- `docs/agent/STATUS.md`

### 验证

| Check                                               | Result                     |
| --------------------------------------------------- | -------------------------- |
| `git diff` 无 package.json / app 源码               | PASS                       |
| 术语交叉检索（Rich Results 承诺、首页无 iframe 等） | PASS（已修正 SEO 05）      |
| 自动化 md lint                                      | 无仓库脚本；人工一致性审查 |

### 遗留

- **技术风险：** `next.config.js` `trailingSlash: true` vs ballgames 无尾斜杠 canonical → Phase 3。
- ballgames §7.1 事实与 embed 许可 → **MANUAL REVIEW** 阻塞上线。

---

## 2026-11-02 — Architecture Review Remediation & Phase 3 Planning（文档）

**范围：** 修正 Architecture Consistency Review 与 Conflict Matrix；细化 Proposed ADR 0003；创建 Phase 3 — Minimum SEO Foundation Spec。**未**实现 Phase 3/4，未修改应用代码、依赖、业务 Spec 或部署配置。

### Reviewed

- 治理：`AGENTS.md`、Charter、STATUS、WORKLOG。
- 架构：system overview、config/content models、Architecture Review/Matrix、ADR 0002–0005。
- 实例与 SEO：ballgames authoritative Spec、instance README、SEO 01–05、Phase 2 Spec。
- 实现事实：当前 routes、metadata/sitemap/robots/JSON-LD、Contentlayer、Next config、package scripts 与 Pages workflow。

### Changed

- 修正 `docs/architecture/architecture-consistency-review.md`：
  - ACM-006 类治理问题不再按 P0；
  - 分离 Phase 3、Phase 4 与 Shared Core readiness；
  - 明确 PortalHome、publication terminology、Catalog/Detail lifecycle 和 iframe/deployment 证据边界。
- 重构 `docs/architecture/architecture-conflict-matrix.md` 的分类、owner、blocking phase 和状态；保留 ACM-001–030，并增加 ACM-031 phase boundary。
- 细化 `docs/agent/decisions/0003-site-instance-url-and-seo-source.md`；状态仍为 **Proposed**。
- 新建 `specs/phases/03-minimum-seo-foundation.md`；状态为 **planned / implementation gated / not started**。
- 更新 `docs/agent/STATUS.md`：区分当前 review branch `spec` 与 Pages deployment branch `main`；将下一动作改为 Recommended。

### Key outcomes

- 推荐 Phase 3 最小 SiteInstance；PortalHome publication/PageSEO 推荐使用独立内容对象。
- `publicationStatus` 为推荐标准术语，但未修改权威 ballgames Spec。
- Phase 3 只验证 sitemap/JSON-LD 机制与 fixture；Phase 4 页面存在后才验收 production exact-two 与 page JSON-LD。此拆分仍待用户批准。
- Static export PASS 不等于 host headers、production CSP、embed/commercial permission 或 iframe runtime PASS。
- Shared Core 不是已批准阶段；现有 Phase 1 编号和名称保持不变。

### Validation

| Check                                       | Result                                              |
| ------------------------------------------- | --------------------------------------------------- |
| `git diff --check`                          | PASS（编辑中与最终范围复核均执行）                  |
| 分支 / HEAD                                 | `spec` / `aca82e6b0c8c8467295fba274777ac6b043948e1` |
| 应用代码、package、lockfile、业务 Spec diff | 无                                                  |
| Build / lint / typecheck                    | **Not Run**（文档规划任务）                         |

### Outstanding user decisions

- ADR 0003 DEC-003-A–E：最小 SiteInstance、PortalHome source、Blog isolation、Phase 3/4 integration split、trailing-slash 实施调查授权。
- ADR 0002 的 Content/Catalog 物理存储与 archived lifecycle（Phase 4 前）。
- iframe 与商业许可、生产 CSP/headers、广告槽语义（Phase 4/R1 release）。

---

## 2026-11-02 — Phase 3 Readiness Remediation（文档）

**Remediation baseline：** `spec` / `aa8e1db5c1fd670b9ad0db7d5a4990f754891a51`；编辑前工作区干净。

**范围：** 修正独立 Phase Spec 状态、Conflict Matrix 结构/优先级、PortalHomeContent/PageSEO 责任边界与 DEC-003-E entry gate。未开始 Phase 3/4，未修改应用代码、依赖、Next 配置、部署 workflow 或 ballgames 产品 Spec。

### Findings remediated

1. Architecture Review 已改为 Phase 3 独立 Spec 存在，并明确 Phase 4 尚无独立 Spec；历史 `c6cc024` / `aca82e6` baseline 均保留。
2. ACM-019 已补齐 12 列并保持 P0；ACM-031 依据“phase decision blocker，而非独立 release risk”调整为 P1。汇总为 P0 11 项、P1 16 项、P2 4 项。
3. ADR 0003 与 Phase 3 Spec 统一：SiteInstance 提供站点默认 metadata；PortalHomeContent 提供首页 publication 与 PageSEO；canonical 只由 URL helper 生成。`status` → `publicationStatus` 仅为 Proposed mapping。
4. DEC-003-E 已单列为 Phase 3 Pending entry gate；只请求调查授权，最终技术方案仍需证据和独立授权。

### Files changed

- `docs/architecture/architecture-consistency-review.md`
- `docs/architecture/architecture-conflict-matrix.md`
- `docs/agent/decisions/0003-site-instance-url-and-seo-source.md`
- `specs/phases/03-minimum-seo-foundation.md`
- `docs/agent/STATUS.md`
- `docs/agent/WORKLOG.md`

### Validation

| Check                                   | Result                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `git diff --check`                      | PASS（编辑中与最终复核）                                                        |
| Matrix row/priority targeted checks     | PASS：31 rows；P0 11、P1 16、P2 4；ACM-019 P0；ACM-031 P1                       |
| ADR / Phase 3 contract targeted checks  | PASS：PortalHome fields、URL helper ownership、mapping 与 DEC-003-E gate 均存在 |
| `yarn prettier --check`（六个目标文档） | FAIL：5 个既有 Markdown 文件有格式差异；未运行 `--write`，避免无关整篇重排      |
| Build / lint / typecheck / deployment   | **Not Run**（文档 remediation；`yarn lint` 含 `--fix`）                         |

### Pending decisions

- DEC-003-A–D 仍为 Proposed / Pending user decision。
- DEC-003-E 调查授权仍为 Pending；未授权修改 `trailingSlash`、static export、部署或 redirect。
- ADR 0003 仍为 Proposed；Phase 3 为 specified / implementation gated / not started。

---

## 2026-11-02 — Phase 3 Final Documentation Consistency Pass（文档）

**Reviewed revision：** `spec` / `534db2c7bf55b1c43b727bd50949fff594ba8e79`；与独立评审指定 HEAD 一致，编辑前工作区干净。

**范围：** 最终修复六项文档一致性问题。未批准 ADR 0003，未开始 Phase 3/4，未修改应用代码、配置、依赖、workflow 或权威 ballgames 产品 Spec。

### Findings remediated

1. Architecture Review 将 PortalHome 更正为 **Proposed Contract / Pending Approval**，区分通用模型未集成、ADR/Phase 3 已指定、用户未批准、应用未实现。
2. Conflict Matrix 定义 issue type taxonomy；ACM-003 为 `Pending decision`、ACM-009 为 `Pending decision`、ACM-013 为 `Implementation gap`；矩阵级复核另更正 ACM-007/016/017/026/028/029，优先级与 11/16/4 汇总不变。
3. ADR 0003 与 Phase 3 Spec 统一 PortalHome SEO：title/description 是必填页面字段，缺失即 validation failure；SiteInstance 仅提供站点级默认值，不静默补齐；`ogImage` 可回退 `socialBanner`；canonical 仅由 `siteUrl()` 生成。
4. 两文档统一 `ResolvedPageSEO.updatedAt = PortalHomeContent.updatedAt`；根字段为单一来源，不在 `seo` 重复，缺失时不以构建时间伪造。
5. STATUS 将 `aa8e1db...` 明确为 Phase 3 readiness remediation base commit，并记录 latest reviewed HEAD `534db2c...` 与分支 `spec`。
6. Prettier 精确失败清单与范围已记录；不运行 `--write`，不做整篇格式化。

### Files changed

- `docs/architecture/architecture-consistency-review.md`
- `docs/architecture/architecture-conflict-matrix.md`
- `docs/agent/decisions/0003-site-instance-url-and-seo-source.md`
- `specs/phases/03-minimum-seo-foundation.md`
- `docs/agent/STATUS.md`
- `docs/agent/WORKLOG.md`

### Validation

| Check                                                                                                                                                                                                                                                                             | Result                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                                                                                                                                | PASS                                                                                      |
| Matrix structure / priorities                                                                                                                                                                                                                                                     | PASS：31 rows；每行 12 列；P0 11、P1 16、P2 4                                             |
| ACM classifications                                                                                                                                                                                                                                                               | PASS：ACM-003/009 `Pending decision`；ACM-013 `Implementation gap`                        |
| PortalHome contract cross-check                                                                                                                                                                                                                                                   | PASS：required title/description、OG fallback、helper canonical、updatedAt 单一映射均一致 |
| `yarn prettier --check docs/architecture/architecture-consistency-review.md docs/architecture/architecture-conflict-matrix.md docs/agent/decisions/0003-site-instance-url-and-seo-source.md specs/phases/03-minimum-seo-foundation.md docs/agent/STATUS.md docs/agent/WORKLOG.md` | FAIL：Architecture Review、Conflict Matrix、Phase 3 Spec、STATUS、WORKLOG；ADR 0003 PASS  |
| Build / lint / typecheck / deployment                                                                                                                                                                                                                                             | **Not run — documentation-only scope**；`yarn lint` 含 `--fix`                            |

Prettier 分类证据：使用当前仓库 Prettier 配置与 API 对 `aa8e1db5c1fd670b9ad0db7d5a4990f754891a51` 的六个 Git blob 做只读 `prettier.check`，当时与当前相同的五文件 FAIL，ADR 0003 PASS；当前 reviewed HEAD / 编辑前与最终检查仍是同一清单。因此现存五项是 **早于本轮且早于最近 Phase 3 readiness remediation 的格式差异**，不是本轮引入；没有证据显示 formatter 不可用或配置故障。建议单独 formatting-only 任务审阅整篇重排。

### Remaining decisions

- ADR 0003 仍为 **Proposed**；DEC-003-A–D 均 Pending user decision。
- DEC-003-E 仍仅等待调查授权；未批准任何 trailing-slash、export、部署或 redirect 变更。
- `status` → `publicationStatus` 仍为 Proposed mapping，未修改权威产品 Spec。
- Phase 3 仍为 **specified / implementation gated / not started**；Phase 4 仍为 **not started**；Shared Core 仍非获批阶段。

---

## 2026-11-02 — ADR 0003 决策落地与 DEC-003-E 只读调查（文档）

**编辑基线：** `spec` / `04a61a5bab09bdb7977dc67c56b581f90cb59c3d`；编辑前工作区干净。

**范围：** 用户已批准 DEC-003-A–E（A-1–E-1）。更新 ADR 0003、Architecture Review/Matrix、Phase 3 Spec、STATUS；执行 DEC-003-E 只读调查并写入 Architecture Review §20。**未**修改应用代码、依赖、`next.config.js`、workflow、ballgames 产品 Spec；**未**运行 `yarn build`；**未** commit/push。

### Decisions recorded

| ID        | Option | Documentation                                          |
| --------- | ------ | ------------------------------------------------------ |
| DEC-003-A | A-1    | ADR Accepted；ACM-008/011 Decision resolved            |
| DEC-003-B | B-1    | PortalHomeContent；`status` → `publicationStatus` 映射 |
| DEC-003-C | C-1    | Blog 保留；R1 不读 allBlogs                            |
| DEC-003-D | D-1    | Phase 3/4 边界                                         |
| DEC-003-E | E-1    | §20 调查；**实施方案未批准**                           |

### Files changed

- `docs/agent/decisions/0003-site-instance-url-and-seo-source.md` — Status **Accepted**；Approved Decisions 表
- `docs/architecture/architecture-consistency-review.md` — DEC-003 结论；新增 §20 调查
- `docs/architecture/architecture-conflict-matrix.md` — ACM-002/003/008–012/025/026/031 Decision resolved；ACM-010 Open + 调查完成
- `specs/phases/03-minimum-seo-foundation.md` — 入口条件与 §7.4 同步
- `docs/agent/STATUS.md` — ADR 状态、HEAD 区分、blockers
- `docs/agent/WORKLOG.md` — 本条目

### DEC-003-E investigation summary

- **Facts read:** Next 15.5.12；`trailingSlash: true`；`EXPORT=1` → `output: 'export'`；Pages workflow → `./out`；无本地 `out/`。
- **Docs-based:** `trailingSlash: true` + export → `path/index.html`（Next.js 文档）；GHPages 无 Next redirect/headers。
- **Not verified:** export 目录树、Link href 尾斜杠、Pages HTTP 行为、ballgames.io 自定义域。
- **Preliminary recommendation (not approved):** build 实测后优先评估 `trailingSlash: false`（F1）；否则部署层 redirect（F3）。

### Validation（ADR 0003 落地任务 — Previous task validation）

| Validation               | Command                                                   | Actual Result                                                 | Notes                                                                                                         |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Git whitespace check     | `git diff --check`                                        | **Historical execution result not independently verifiable.** | 任务 Final Report 未保留终端输出；编辑基线 `04a61a5` 已不可在本机重放 diff                                    |
| Prettier check           | `yarn prettier --check`（六目标文档，见 Final Pass 条目） | **Historical execution result not independently verifiable.** | 同批文档在 Final Pass 中有可核对 FAIL 清单（5 文件 FAIL、ADR PASS）；ADR 落地 commit 未单独留存 prettier 输出 |
| ballgames Spec 保护      | `git diff specs/ballgames/ballgames-specs-v1.md`          | PASS（无变更）                                                | 2026-11-02 任务范围声明；**本次 remediation 前未重跑**                                                        |
| 应用/配置隔离            | `git diff package.json next.config.js .github/`           | PASS（无变更）                                                | 同上                                                                                                          |
| Build / lint / typecheck | `yarn build` / `yarn lint` / `yarn typecheck`             | **NOT RUN**                                                   | 文档 + 只读调查范围                                                                                           |
| Internal links           | 人工路径存在性                                            | **NOT RUN**                                                   | 未记录独立命令                                                                                                |

### Outstanding

- Phase 3 应用实现 **not started**。
- Trailing-slash **implementation** 须单独用户批准。
- ACM-010 仍为 **Open**（配置与产品冲突未消除）。

---

## 2026-11-02 — Phase 3 Spec 决策状态修正与 WORKLOG 验证记录补全（文档）

**Remediation baseline：** `spec` / `916314c73fd55421caf162bf391021a4f43ec308`；编辑前工作区干净（与 Prior documentation review 指定 HEAD 一致）。

**范围：** 修正 Phase 3 Spec §6.2 / §8.2 / §10 与已批准 ADR 0003（DEC-003-B/C/D）不一致的「待批准」措辞；补全 ADR 0003 落地条目的可追溯验证表；交叉复核 ADR/Matrix/Review/STATUS。**未**修改应用代码、配置、ballgames 产品 Spec；**未** commit/push。

### Findings remediated

1. §6.2：`待用户批准的推荐接口` → **已批准的 PortalHomeContent 契约（DEC-003-B / B-1）**（契约正文已与 ADR 一致，仅状态措辞过期）。
2. §8.2：移除「拆分须由用户批准 / 未批准前 gated」；改为 DEC-003-D / D-1 已批准边界 + Phase 3 实现仍须独立授权。
3. §10：`推荐并等待批准的规则` → **已批准的 Blog / Authors 隔离规则（DEC-003-C / C-1）**；补充不删代码、sitemap≠noindex、legacy 独立决策表述。
4. WORKLOG ADR 0003 条目：将「见 Final Report」改为结构化验证表，历史命令输出标为 **Historical execution result not independently verifiable**。

### Files changed

（与 commit `4e808930f83936eab9ce2687c01a972fe51d9a0b` 一致；原条目曾遗漏 STATUS，见 [WORKLOG 验证证据 remediation](#2026-11-02--worklog-validation-evidence--change-scope-consistency-remediation文档) 追溯修正。）

- `docs/agent/STATUS.md`
- `docs/agent/WORKLOG.md`
- `specs/phases/03-minimum-seo-foundation.md`

### Validation — Current remediation validation

| Validation               | Command                            | Actual Result                      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Git status               | `git status --short`               | PASS（仅授权文档变更）             | 编辑后复核                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Git whitespace check     | `git diff --check`                 | PASS                               | 编辑前基线干净 exit 0；编辑后无 whitespace error                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Diff scope               | `git diff 916314c..4e80893 --stat` | PASS（**retroactive 记录修正**）   | **3 文件**：STATUS、WORKLOG、Phase 3 Spec；**无**应用代码、配置、依赖、ballgames 产品 Spec、部署 workflow。原表「仅 Phase 3 Spec + WORKLOG」与实际上一轮 commit 不符                                                                                                                                                                                                                                                                                                                                                           |
| Decision status phrases  | `rg` 待批准类关键词于 Phase 3 Spec | PASS                               | §6.2/§8.2/§10 已修正；§7.4 trailing-slash **实施方案**单独批准表述保留                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Prettier check           | `yarn prettier --check`（六文档）  | **记录不一致 — 见 reconciliation** | **Previous task（本条目原写）：**「六文件均有格式 warn（含 ADR 0003）」。**Final Pass 历史可核对清单：** Architecture Review、Conflict Matrix、Phase 3 Spec、STATUS、WORKLOG 为 FAIL；ADR 0003 为 PASS（见上文 Final Pass Validation 表）。**本条目 commit 未单独留存 prettier 终端输出**；不得将 ADR 0003 在历史 PASS 与 FAIL 之间无证据改写。逐文件 **2026-11-02 最新只读执行** 见 [WORKLOG Validation Evidence Consistency Remediation](#2026-11-02--worklog-validation-evidence-consistency-remediation)。未运行 `--write` |
| Markdown lint            | 无仓库脚本                         | **NOT RUN**                        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Internal links           | 人工 spot-check 相对路径           | PASS                               | ADR/Matrix/Review/Phase 3 交叉引用未改路径                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Build / lint / typecheck | —                                  | **NOT RUN**                        | documentation-only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

### Cross-document consistency（复核结论）

- ADR 0003：DEC-003-A–E 均为 Accepted / E-1 调查已记录；未重开决策。
- Conflict Matrix：未改；Decision resolved 项未标 Implemented。
- Architecture Review：§20 仍为只读调查；URL 实施方案待单独批准。
- STATUS：**已更新** Last verified checks 与 WORKLOG 验证引用（ADR 0003 落地说明、Phase 3 Spec 决策状态 remediation 行）；Phase 3 仍为 **specified / implementation gated / not started**；Phase 4 仍为 **not started**；ADR 0003 决策状态与实施门禁**未改变**。（原写「未改」不准确，已 retroactive 修正。）
- ballgames-specs-v1.md：**未修改**。

---

## 2026-11-02 — WORKLOG Validation Evidence & Change Scope Consistency Remediation（文档）

**Baseline：** branch `spec`；HEAD `4e808930f83936eab9ce2687c01a972fe51d9a0b`（parent `916314c73fd55421caf162bf391021a4f43ec308`）；编辑前工作区干净；`HEAD` 与 `origin/spec` 一致。

**范围：** 修正上一 WORKLOG 条目（Phase 3 Spec 决策状态修正）中 Files changed、Diff scope、STATUS 描述与 Prettier 记录不一致；补全本任务验证证据。**未**修改应用代码、`package.json`、lockfile、Next/Contentlayer 配置、部署 workflow、权威 `specs/ballgames/ballgames-specs-v1.md`、ADR 0003 已批准决策、Phase 3 技术方案；**未**运行 prettier `--write`；**未** commit/push。

### Changes made

1. **Files changed（retroactive）：** 与 `git diff 916314c..4e80893 --name-only` 对齐，补上 `docs/agent/STATUS.md`。
2. **Diff scope / STATUS 描述：** 如实记录上一轮 commit 含 STATUS 的 Last verified checks 更新；移除错误的「STATUS — 未改」。
3. **Prettier reconciliation：** 保留 Final Pass 与 ADR 落地条目的历史记录；区分 previous task 原写、Final Pass 可核对清单、本任务新执行的逐文件 check。

### Files changed（本任务）

- `docs/agent/WORKLOG.md` — 上述 retroactive 修正 + 本条目
- `docs/agent/STATUS.md` — Last verified checks 增加本 remediation 引用（最小必要）

### Validation

| Validation               | Command                                                                        | Result             | Evidence / Notes                                         |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------ | -------------------------------------------------------- |
| Git baseline             | `git branch --show-current`; `git rev-parse HEAD`; `git rev-parse origin/spec` | PASS               | `spec` / `4e80893` / 与 origin 一致                      |
| Previous commit scope    | `git diff HEAD^ HEAD --name-status`                                            | PASS               | M STATUS、WORKLOG、Phase 3 Spec（3 文件）                |
| Current diff scope       | `git diff --stat`; `git diff --name-only`                                      | PASS（编辑后复核） | 仅 WORKLOG + STATUS                                      |
| Git whitespace           | `git diff --check`                                                             | PASS               | 无 trailing whitespace 类 error                          |
| Prettier 3.8.1           | `yarn prettier --check <file>`（逐文件，见下表）                               | FAIL（6/6）        | 只读 check；未 `--write`                                 |
| Decision consistency     | `rg` 于 Phase 3 Spec / ADR 0003 当前正文                                       | PASS               | 无「待用户批准」等过期 Phase 3 措辞；ADR Status Accepted |
| Build / lint / typecheck | —                                                                              | **NOT RUN**        | documentation-only；`yarn lint` 含 `--fix`               |

#### Prettier — This task newly executed（Prettier **3.8.1**；`prettier.config.js`；无 `.prettierignore`）

| File                                                            | Command                                                                               | Result |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------ |
| `docs/architecture/architecture-consistency-review.md`          | `yarn prettier --check docs/architecture/architecture-consistency-review.md`          | FAIL   |
| `docs/architecture/architecture-conflict-matrix.md`             | `yarn prettier --check docs/architecture/architecture-conflict-matrix.md`             | FAIL   |
| `docs/agent/decisions/0003-site-instance-url-and-seo-source.md` | `yarn prettier --check docs/agent/decisions/0003-site-instance-url-and-seo-source.md` | FAIL   |
| `specs/phases/03-minimum-seo-foundation.md`                     | `yarn prettier --check specs/phases/03-minimum-seo-foundation.md`                     | FAIL   |
| `docs/agent/STATUS.md`                                          | `yarn prettier --check docs/agent/STATUS.md`                                          | FAIL   |
| `docs/agent/WORKLOG.md`                                         | `yarn prettier --check docs/agent/WORKLOG.md`                                         | FAIL   |

**Historical result preservation：**

| Source                                | Prettier summary                                             | Verifiability                          |
| ------------------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| Final Pass 条目                       | 5 FAIL + ADR 0003 **PASS**                                   | 条目内命令与清单可核对                 |
| Phase 3 Spec 决策状态修正条目（原写） | 「六文件均有 warn（含 ADR 0003）」                           | 与 Final Pass 冲突；**无**独立终端输出 |
| ADR 0003 落地条目 Prettier 行         | **Historical execution result not independently verifiable** | 未改                                   |
| **This task**                         | 六文件均 FAIL                                                | 上表命令 exit 1 + `[warn]`             |

本任务新结果与 Final Pass 对 ADR 0003 的 PASS **不一致**；在无 blob/版本 diff 证据前**不得**归因于配置或 Prettier 版本变化。

### Cross-document consistency

| Item                          | Status                                             |
| ----------------------------- | -------------------------------------------------- |
| DEC-003-A–D                   | Accepted / A-1–D-1                                 |
| DEC-003-E                     | E-1 investigation recorded；实施方案未批准         |
| Phase 3                       | Specified / Implementation Gated / **Not Started** |
| Phase 4                       | **Not Started**                                    |
| Shared Core                   | Not an approved phase / Deferred                   |
| Trailing-slash implementation | Requires separate approval                         |
| ballgames-specs-v1.md         | 未修改                                             |

### Remaining findings

- 六文档 Prettier 仍为 FAIL；整篇格式化属单独 formatting-only 任务，本任务未授权。
- Final Pass 与本次 check 对 ADR 0003 结果差异原因未证实。

---

## 2026-11-02 — WORKLOG Validation Evidence Consistency Remediation

### Reviewed baseline

| Item                               | Value                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Branch                             | `spec`                                                                                                                        |
| HEAD（编辑前）                     | `9c24d5349d1fd19908ea61771dfe1ca2f7d9819a`                                                                                    |
| Parent commit                      | `4e808930f83936eab9ce2687c01a972fe51d9a0b`（`docs: Phase 3 spec decision status and WORKLOG verification`）                   |
| Prior remediation commit on branch | `9c24d53`（`docs: WORKLOG validation evidence and change scope consistency`）— 本任务在其上追加独立证据条目并同步 STATUS 引用 |
| Working tree（编辑前）             | 干净（`git status --short` 无输出）                                                                                           |

### Scope

- **仅修改：** `docs/agent/STATUS.md`、`docs/agent/WORKLOG.md`（本条目 + STATUS Last verified checks）。
- **只读校验、未改内容：** Architecture Review、Conflict Matrix、ADR 0003、Phase 3 Spec。
- **未修改：** 应用代码、依赖、lockfile、Prettier 配置、架构文档、ADR 决策正文、Phase 3 实现、部署/Next 配置；**未**运行 `prettier --write`；**未** commit/push。

### Findings

1. **STATUS vs 历史 WORKLOG：** `STATUS.md` Last verified 曾写 Prettier「六文档均 FAIL」，而 Final Pass 条目内可核对清单为 Architecture Review、Conflict Matrix、Phase 3 Spec、STATUS、WORKLOG **FAIL**，ADR 0003 **PASS** — 二者对 ADR 0003 结论冲突。
2. **缺失/不完整追溯：** STATUS 已声明 WORKLOG validation evidence remediation，但权威「最新只读 check + 历史/新结果区分」须由独立 WORKLOG 条目承载；此前存在标题相近的 [Change Scope 条目](#2026-11-02--worklog-validation-evidence--change-scope-consistency-remediation文档)，本条目为 **证据一致性** 的独立复核与 STATUS 指针更新。
3. **未证实项：** Final Pass 对 ADR 0003 的 PASS 与本次（及 Change Scope 条目）对同路径的 FAIL **无法**在无 blob/版本 diff 终端输出下归因；保留 Final Pass 历史表述，标为可核对历史，**不得**无证据改写 ADR 0003 历史 PASS/FAIL。

### Fresh validation results（本任务新执行；**编辑 STATUS/WORKLOG 正文之前**于 HEAD `9c24d53`）

- **Prettier version：** 3.8.1（`yarn prettier --version`）
- **Configuration：** `prettier.config.js`；无 `.prettierignore`；无 Markdown lint 仓库脚本
- **Execution date：** 2026-11-02
- **Combined command：** `yarn prettier --check docs/architecture/architecture-consistency-review.md docs/architecture/architecture-conflict-matrix.md docs/agent/decisions/0003-site-instance-url-and-seo-source.md specs/phases/03-minimum-seo-foundation.md docs/agent/STATUS.md docs/agent/WORKLOG.md`
- **Combined exit code：** 1（六文件均 `[warn]`）

| File                | Fresh result | Evidence                                                                                                                                                        |
| ------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture Review | **FAIL**     | Combined + `yarn prettier --check docs/architecture/architecture-consistency-review.md` → exit 1；`[warn] docs/architecture/architecture-consistency-review.md` |
| Conflict Matrix     | **FAIL**     | Combined + per-file check → exit 1；`[warn] docs/architecture/architecture-conflict-matrix.md`                                                                  |
| ADR 0003            | **FAIL**     | Combined + per-file check → exit 1；`[warn] docs/agent/decisions/0003-site-instance-url-and-seo-source.md`                                                      |
| Phase 3 Spec        | **FAIL**     | Combined + per-file check → exit 1；`[warn] specs/phases/03-minimum-seo-foundation.md`                                                                          |
| STATUS              | **FAIL**     | Combined + per-file check → exit 1；`[warn] docs/agent/STATUS.md`                                                                                               |
| WORKLOG             | **FAIL**     | Combined + per-file check → exit 1；`[warn] docs/agent/WORKLOG.md`                                                                                              |

**Historical vs fresh（摘要）：**

| Source                                | ADR 0003        | Other five  | Verifiability                      |
| ------------------------------------- | --------------- | ----------- | ---------------------------------- |
| Final Pass WORKLOG 表                 | PASS            | FAIL        | 条目内命令与清单可核对             |
| Phase 3 Spec 决策状态修正条目（原写） | 曾写含 ADR warn | 六文件 warn | 与 Final Pass 冲突；无独立终端输出 |
| **This task（fresh @ 9c24d53）**      | FAIL            | FAIL        | 上表命令 exit 1                    |

### Changes

- **`docs/agent/STATUS.md`：** Last verified checks 行改为引用本条目；最新 Prettier 结论与 WORKLOG 逐文件表一致（六 FAIL）；区分 Final Pass 历史 5+1 清单。
- **`docs/agent/WORKLOG.md`：** 追加本条目（Fresh validation、Findings、历史保留说明）。

### Remaining issues

- 六目标文档 Prettier 仍为 **FAIL**；整篇 `--write` 格式化须 **单独 formatting-only 任务** 与用户明确授权。
- Final Pass ADR 0003 **PASS** vs 本次 ADR 0003 **FAIL** 差异 **未证实原因**。

### Phase status（本 remediation 不改变）

| Item        | Status                                             |
| ----------- | -------------------------------------------------- |
| DEC-003-A–D | Accepted                                           |
| DEC-003-E   | Investigation recorded；实施方案未批准             |
| Phase 3     | **specified / implementation gated / not started** |
| Phase 4     | **not started**                                    |
| Shared Core | **not an approved phase / deferred**               |

---

## 2026-11-02 — Documentation Final Post-Edit Verification

### Baseline

- Branch: `spec`
- HEAD: `47e4127cd08531e9195c6247270c90555154a3b1`（与 `origin/spec` 一致）
- Remote origin/spec: `47e4127cd08531e9195c6247270c90555154a3b1`
- Working tree（本任务编辑前）: 干净（`git status --short` 无输出）
- Previous remediation entry: [2026-11-02 — WORKLOG Validation Evidence Consistency Remediation](#2026-11-02--worklog-validation-evidence-consistency-remediation)（commit `47e4127` — `docs: WORKLOG validation evidence consistency remediation`）

### Scope

- Modified: `docs/agent/STATUS.md`、`docs/agent/WORKLOG.md`（本条目 + STATUS Last verified checks）
- Read-only inspected: Architecture Review、Conflict Matrix、ADR 0003、Phase 3 Spec（内容未改）
- Out-of-scope changes: 无（本任务未改应用代码、依赖、Prettier 配置、架构/ADR/Phase 3 Spec 正文）

### Final Post-Edit Validation

#### Prettier（编辑 STATUS/WORKLOG **之前** @ HEAD `47e4127`）

- Version: **3.8.1**（`yarn prettier --version`）
- Configuration: `prettier.config.js`；无 `.prettierignore`；仓库无 Markdown lint 脚本（`package.json` 无 md lint）
- Command: `yarn prettier --check docs/architecture/architecture-consistency-review.md docs/architecture/architecture-conflict-matrix.md docs/agent/decisions/0003-site-instance-url-and-seo-source.md specs/phases/03-minimum-seo-foundation.md docs/agent/STATUS.md docs/agent/WORKLOG.md`
- Exit code: **1**

| File                | Result   |
| ------------------- | -------- |
| Architecture Review | **FAIL** |
| Conflict Matrix     | **FAIL** |
| ADR 0003            | **FAIL** |
| Phase 3 Spec        | **FAIL** |
| STATUS              | **FAIL** |
| WORKLOG             | **FAIL** |

#### Git（编辑 STATUS/WORKLOG **之前** @ HEAD `47e4127`）

| Check         | Command                | Result                  |
| ------------- | ---------------------- | ----------------------- |
| Whitespace    | `git diff --check`     | **PASS**（exit 0）      |
| Changed files | `git diff --name-only` | （无输出 — 工作区干净） |
| Diff summary  | `git diff --stat`      | （无输出）              |
| Working tree  | `git status --short`   | （无输出）              |

#### Prettier（**最终** — STATUS/WORKLOG 更新后；以本节为准）

- Version: **3.8.1**
- Configuration: 同上
- Command: `yarn prettier --check docs/architecture/architecture-consistency-review.md docs/architecture/architecture-conflict-matrix.md docs/agent/decisions/0003-site-instance-url-and-seo-source.md specs/phases/03-minimum-seo-foundation.md docs/agent/STATUS.md docs/agent/WORKLOG.md`
- Exit code: **1**

| File                | Result   |
| ------------------- | -------- |
| Architecture Review | **FAIL** |
| Conflict Matrix     | **FAIL** |
| ADR 0003            | **FAIL** |
| Phase 3 Spec        | **FAIL** |
| STATUS              | **FAIL** |
| WORKLOG             | **FAIL** |

#### Git（**最终** — STATUS/WORKLOG 更新后）

| Check         | Command                | Result                                                |
| ------------- | ---------------------- | ----------------------------------------------------- |
| Whitespace    | `git diff --check`     | **PASS**（exit 0）                                    |
| Changed files | `git diff --name-only` | `docs/agent/STATUS.md`、`docs/agent/WORKLOG.md`       |
| Diff summary  | `git diff --stat`      | 2 files changed, 113 insertions(+), 1 deletion(-)     |
| Working tree  | `git status --short`   | ` M docs/agent/STATUS.md`、` M docs/agent/WORKLOG.md` |

#### Stability confirmation（WORKLOG 定稿后再次执行）

| Check                       | Exit | Result                                                |
| --------------------------- | ---- | ----------------------------------------------------- |
| Combined Prettier（六文件） | 1    | 六文件均 FAIL — 与「Prettier（最终）」一致 **stable** |
| `git diff --check`          | 0    | **PASS** — 与「Git（最终）」一致 **stable**           |

本条目不再因稳定性同步而追加正文；若后续编辑 WORKLOG，须重新执行 Post-Edit 验证。

### Historical Result Reconciliation

- Preserve historical Final Pass result: **5 FAIL + ADR 0003 PASS**（Final Pass WORKLOG 表可核对）。
- Preserve previous remediation's fresh result @ `9c24d53`: **6 FAIL**（[WORKLOG Validation Evidence Consistency Remediation](#2026-11-02--worklog-validation-evidence-consistency-remediation)）。
- Record this task's post-edit @ `47e4127` **before edit**: **6 FAIL**（上表）。
- Record this task's **after STATUS/WORKLOG edit** result independently in「Prettier（最终）」— 不得推断历史差异原因（无 blob/终端 diff 证据）。

### Cross-Document Consistency

| Item                          | Status                                                       |
| ----------------------------- | ------------------------------------------------------------ |
| DEC-003-A                     | Accepted                                                     |
| DEC-003-B                     | Accepted                                                     |
| DEC-003-C                     | Accepted                                                     |
| DEC-003-D                     | Accepted                                                     |
| DEC-003-E                     | Investigation recorded；implementation / 配置方案 **未批准** |
| Phase 3                       | **specified / implementation gated / not started**           |
| Phase 4                       | **not started**                                              |
| Shared Core                   | **not an approved phase / deferred**                         |
| Trailing-slash implementation | 须单独批准（§20 调查 ≠ 实施方案）                            |

### Outstanding Findings

- 六目标文档 Prettier 仍为 FAIL；整篇 `--write` 须单独 formatting-only 任务与用户授权。
- Final Pass ADR 0003 PASS vs fresh checks ADR 0003 FAIL：**未证实原因**。

### Conclusion

- **Documentation final validation execution:** **COMPLETE** — 初始 @ `47e4127` 与最终（本条目定稿后）Prettier/Git 检查均已执行；最终 Prettier **6 FAIL**（exit 1）；最终 `git diff --check` **PASS**；未提交变更仅 STATUS + WORKLOG。
- **Prettier compliance:** **FAIL**（不以格式化修复为本任务范围）。
- **Validation completion ≠ Prettier PASS。**

---

## 2026-11-03 — DEC-003-F：Legacy 页面 indexability（方案 A）

**批准：** 用户确认方案 A — legacy template routes 统一 `noindex, follow`；不进 R1 sitemap；与 sitemap eligibility 独立。

**修改：** ADR 0003 §5 + DEC-003-F 表；`docs/agent/STATUS.md`；`specs/phases/03-minimum-seo-foundation.md` §10；`lib/seo/metadata.ts`（`LEGACY_PAGE_ROBOTS`）；`app/blog/[...slug]/page.tsx`；`scripts/batch2-test-entry.ts`。

**验证（本条目）：** `yarn typecheck` exit 0 PASS；`yarn test:batch2` exit 0 PASS（11 tests）。

---

## 2026-11-03 — Phase 3：SEO 验证增强（sitemap XML + export HTML）

**范围：** `lib/seo/validate-sitemap-xml.ts`、`validate-export-html-meta.ts`；`scripts/validate-seo-entry.ts`、`batch2-test-entry.ts`。**无** sitemap/metadata 业务规则变更。

**验证：** `yarn typecheck` 0；`yarn test:batch2` 0（14 tests）；`yarn validate:seo` 0；`node scripts/validate-seo.mjs --export-dir=out` 0。

**HEAD（已推送 Batch 0–3）：** `4514c3f7361beb59e69f95d7fdae42e377ff6a1a` — 本增强 **未提交**。

---

## 2026-11-03 — Phase 3：Spec / STATUS / ADR 文档同步

**范围：** 仅文档 — `specs/phases/03-minimum-seo-foundation.md`（§3、§13、§13.1）、`docs/agent/STATUS.md`、ADR 0003 Approved Decisions 实现状态、`phase3-batch3-validation.md` follow-up 注记。

**内容：** §13 勾选与 Phase 4 **DEFERRED** 标注；15 项能力状态表；ADR DEC-003-A–D 由 Not started 更正为 Applied/Partial；STATUS 与工作区 follow-up 验证说明。

**验证：** 本任务 **未重跑** build/export；证据引用 Batch 3 报告 + 上述 WORKLOG 条目及工作区已执行的 `validate:seo` 结果。

**Commit：** 无（待用户 `docs(seo): synchronize Phase 3 completion status`）。

---

## 2026-11-03 — Phase 3 终验（Node 22.14.0）

**报告：** [`phase-3-final-validation.md`](reports/phase-3-final-validation.md)

**Node：** v22.14.0（`nvm use 22.14.0` + Corepack yarn 3.6.1）

**HEAD：** `4514c3f`（工作区未提交 follow-up）

**矩阵：** `yarn typecheck`、`test:batch1`（10）、`test:batch2`（14）、`validate:seo`、export×2 + `validate:seo --export-dir=out`×2、normal `yarn build`、`next lint --dir lib` — 均 **exit 0**。

**冻结判断：** **READY TO FREEZE WITH DOCUMENTED LIMITATIONS**（HTTP BLOCKED；CI not independently verified；Node 22 ≠ Actions Node 20）。

**未执行：** commit / push / Phase 4。

---

## 2026-11-03 — Phase 3 Final Remediation（Task A/B/C）

**基线 HEAD：** `0f74c67`（`origin/main` 已同步）

**范围：** URL 输入边界（无 trim 合法化）；`fast-xml-parser` sitemap 结构验证；`phase-3-final-validation.md` v2；测试与 `validate:seo` 扩展。

**Node 22.14.0 验证：** typecheck 0；batch1 10；batch2 17；validate:seo 0；export build 0 + `--export-dir=out` 0。

**Commit：** `8b3f51a63e320e2da5b710f53dd1879075d3923b`（`test(seo): finalize Phase 3 validation`）— **已提交 `main`**。

**冻结：** READY TO FREEZE（机制）；HTTP / CI 仍 DOCUMENTED LIMITATIONS。

---

## 2026-11-03 — Phase 3 收尾：Sitemap XML Strictness + 文档同步

**基线 HEAD（任务开始时）：** `8b3f51a` · **工作区：** Strictness 变更 **未 commit**

**范围（Task A）：** `lib/seo/validate-sitemap-xml.ts` — 关闭 `allowBooleanAttributes`；`urlset`/`url` 属性白名单；`lastmod`/`changefreq`/`priority` 重复与合法值；`scripts/batch2-test-entry.ts` 新增 strict 负/正例。

**范围（Task B）：** `phase-3-final-validation.md` v3、`STATUS.md`、本条目 — 修正「Remediation 未提交」；区分 `@8b3f51a` 与 `@工作区 Strictness`；CI 记为 **configure-pages** 基础设施阻塞（**非** Node 20 build fail/pass）。

**Node 22.14.0 验证：** `yarn typecheck` 0；`yarn test:batch2` 0（**18** tests）；`yarn validate:seo` 0。

**未执行：** export/normal build 重跑（Strictness 未改 export 路径）；commit / push / Phase 4。

**冻结建议：** **READY TO FREEZE**（机制）；CI / HTTP / Phase 4 仍为 documented blockers。

---

## 2026-11-03 — Commit：`1ef3f2e` Sitemap XML Strictness

**Commit：** `1ef3f2ecfc5259270f9c27ba5873607b82f8c1d9` — `test(seo): Phase 3 sitemap XML strictness and doc sync`（5 files，已推送记录以用户 remote 为准）。

**说明：** 承接上文「Strictness 未 commit」条目之计划；Strictness 代码与 v3 文档已进入 `main`。

---

## 2026-11-04 — Phase 3 Sitemap Strictness 边界修正（priority / lastmod）

**基线 HEAD：** `1ef3f2e` · **交付：** `29e526b` 已 commit + push

**代码：** `validate-sitemap-xml.ts` — 空/空白 `priority` 拒绝；lastmod 日历 + 时分秒 + 时区偏移 + 小数秒；`batch2-test-entry.ts` 新增 `priority and lastmod value boundaries` 测试。

**文档：** `phase-3-final-validation.md` v4、`STATUS.md`、本条目。

**Node 22.14.0 验证（本次执行）：** `yarn typecheck` 0；`yarn test:batch2` 0（**19** tests）；`yarn validate:seo` 0；`git diff --check` 0。

**Commit / push：** `29e526bf0dc819e7e3c1357502b124d3fb39064f` → `origin/main`；文档 **`d02c69e`** 单独同步。

---

## 2026-11-04 — Phase 3 收尾：lastmod 无时区兼容

**Git HEAD（任务时）：** `d02c69e7c2a9de29a97fe25547f57ff7abc6a4b3`（文档提交，**非**代码验证 SHA）· **代码基线：** `29e526b` · **工作区未 commit**

**目的：** 修复 `29e526b` 对无时区 W3C datetime 的回归；同步 STATUS / 终验 §F。

**策略依据：** Phase 3 Spec 未强制时区；`1ef3f2e` 正则 `(Z|±HH:MM)?` 曾接受 `2026-01-15T12:30:45`。

**修改：** `validate-sitemap-xml.ts`（时区可选）；`batch2-test-entry.ts`（`lastmod W3C datetime compatibility`）；`STATUS.md`；`phase-3-final-validation.md` §F。

**Node 22.14.0 验证：** typecheck 0；batch2 0（**20** tests）；validate:seo 0；git diff --check 0。

**未验证：** CI Node 20、Live HTTP、export build。

**Commit / push：** `f2ea1b2ecfc5259270f9c27ba5873607b82f8c1d9` → `origin/main`。

---

## 2026-11-04 — Agent 文档同步 @ `5bbda06`（documentation-only）

**Commit：** `5bbda06dd607b16ef4749031f78fcab83b03ab40` — `docs(seo): align agent status with f2ea1b2 on main`

**范围：** `docs/agent/STATUS.md`、`docs/agent/WORKLOG.md`（本条目）、`docs/agent/reports/phase-3-final-validation.md` — 将 Agent 状态与 **`f2ea1b2` 代码验证基线**对齐；**Current HEAD** 更新为 `5bbda06`。

**明确：** 该提交**未**修改 SEO 业务代码；**未**重跑 `yarn test:batch2` / `validate:seo`；**不改变** `f2ea1b2` 所代表的 Phase 3 Code Validation Baseline。

**验证：** 无代码验证命令；仅 Git/文档一致性（后续 Phase 3 文档收尾任务可补 `git diff --check`）。

---

## 2026-11-04 — Phase 3 文档基线最终同步（documentation-only，工作区）

**Current HEAD（执行时）：** `5bbda06dd607b16ef4749031f78fcab83b03ab40`（提交前）；交付 **`330ae02`** 见下文。

**目的：** 四份 Agent/Phase 3 文档统一 **HEAD vs Code Validation Baseline**；Spec §13.1 移除过时「未提交」表述；终验 v5。

**修改：** `STATUS.md`、`WORKLOG.md`、`phase-3-final-validation.md` v5、`specs/phases/03-minimum-seo-foundation.md` §13.1。

**未执行：** SEO 测试重跑；CI / Live HTTP 验证。

**Commit / push：** `330ae02` → `origin/main`；HEAD 指针跟进 `ff59f65`（见 STATUS Current HEAD）。

---

## 2026-11-04 — Phase 4.0 Kickoff：ballgames R1 Spec + 部署 gate 调整

**Git HEAD（任务开始）：** `975f7da8ecd6816ac8d1d0b955237ba0d5d9d344` · **工作区：** 干净（文档变更前）

**用户授权：** 正式启动 Phase 4（Ballgames R1 Implementation）；**本次仅 Phase 4.0** — 无业务代码。

**部署策略决策（用户）：**

- GitHub Pages CI（`configure-pages@v5`）**不再**作为 Phase 4 前置条件。
- 正式部署目标：**Cloudflare Pages**（构建/路由/SEO/域名 → 部署阶段验证）。
- **保留历史事实：** GitHub Pages CI **NOT VERIFIED**；Node 20 Actions build **NOT VERIFIED**；不得改写为 PASS；不删除 Phase 3 验证报告。

**已审查权威文档：** `AGENTS.md` · `specs/00-project-charter.md` · Phase 2/3 Spec · `specs/ballgames/ballgames-specs-v1.md` · `specs/instances/ballgames/README.md` · `specs/04-config-and-content-models.md` · `specs/seo/*` · ADR 0003 · architecture-consistency-review / conflict-matrix · ADR 0002/0004/0005（Proposed 边界记入 Phase 4 Spec）。

**Phase 3 代码集成点（审查 @ HEAD）：**

- `lib/site/instances/ballgames.ts` — SiteInstance + PortalHome **draft** fixture。
- `lib/urls/site-url.ts` — `siteUrl` / `gameUrl`。
- `lib/seo/production-state.ts` — production sitemap **0 URL**（预期）。
- `lib/seo/routes.ts` — `/hockey-bros` routeExists **false**。
- `app/page.tsx` — 仍为 starter 博客首页。
- `contentlayer.config.ts` — 仅 Blog + Authors。
- `lib/seo/structured-data.ts` — PortalHome fixture JSON-LD；Organization **未输出**（缺证据）。

**识别的冲突 / 风险（摘要）：**

- ACM-004 Catalog/Detail 生命周期 — **R1 已写入 Phase 4 Spec**（单一 `publicationStatus`）；矩阵仍为 Pending。
- ACM-018/019 iframe vs embed 许可 — ADR 0004 方案 C；生产 embed **MANUAL REVIEW**。
- ACM-016/017 Organization/VideoGame — 缺证据字段须省略。
- ACM-024 R1 广告 DOM 槽 — **MANUAL REVIEW**。
- conflict-matrix 部分行与 Phase 3 已实现代码 **文档漂移**（以终验 v5 + 代码为准）。

**交付：**

- 新增 [`specs/phases/04-ballgames-r1.md`](../../specs/phases/04-ballgames-r1.md)（Objective、批次 4.0–4.7、验收、Manual review）。
- 更新 `docs/agent/STATUS.md` — Phase 4 **4.0 ACTIVE**；4.1+ **NOT STARTED**。
- 本 WORKLOG 条目。

**未执行：** Phase 4.1+ 业务代码；GitHub Pages workflow 修复；Cloudflare 配置；依赖升级。

**验证（Phase 4.0 Kickoff）：** `git diff --check` **PASS**。Markdown：`yarn prettier --check` **NOT RUN**（Corepack/yarn 路径缺失）；`npx prettier@3.8.1 --write` + `--check` **PASS**（Kickoff 三文件）。详见 [`phase-4.0-review.md`](reports/phase-4.0-review.md)。

**下一步：** 用户审查 Phase 4.0 → 授权 Phase 4.1（内容模型与 Catalog）。

---

## 2026-11-04 — Phase 4.0 定点修订（Review P1/P2）

**Git HEAD（任务开始）：** `866343eb2f2abda9ddc2fee7ee847af1f22f0de1` · **分支：** `main`

**范围：** 仅文档 — `specs/phases/04-ballgames-r1.md`、`docs/agent/STATUS.md`、`docs/agent/WORKLOG.md`、新增 `docs/agent/reports/phase-4.0-review.md`。

**修复：** P1-1 STATUS HEAD/工作区；P1-2 审查报告与 WORKLOG 引用；P1-3 §7.5 Catalog 发布核验；P1-4 ACM-004 R1 单一 `publicationStatus`；P2-1 §14 checkbox/状态表；P2-2 §13.1 批次依赖图。

**未执行：** 业务代码；Phase 4.1；commit/push（除非用户授权）。

**验证：** `git diff --check` PASS；`npx prettier@3.8.1 --check` PASS（四文件）；`yarn prettier` NOT RUN。详见 [`phase-4.0-review.md`](reports/phase-4.0-review.md) §4。

**下一步：** Phase 4.0 文档验收 → 用户授权 Phase 4.1。

---

## 2026-11-04 — Phase 4.1：Catalog / Data Contract

**Git HEAD（任务开始）：** `5e6b6b1b3ac01901ce1fb3aea77ff0495266662b`（pointer-only documentation sync）· **Last substantive Phase 4.0 revision：** `87adf9866c8f8bb6f9eb4898b8618ced8d8abf49` · **分支：** `main` · **工作区：** 未提交（本批次）

**用户授权：** Phase 4.1 Catalog / Data Contract。**未**授权 4.2+ 页面、SEO 集成、Shared Core、CI / Cloudflare。

### Preflight

- **F4.0-FIX-01：** `specs/phases/04-ballgames-r1.md` §7.5 第 5 条「§7.5.2」改为本节第 2 条（该子节不存在）。全文无其他失效 `§7.5.x` 引用。
- **F4.0-FIX-02：** STATUS 不再把 `87adf98` 写成 Current HEAD。字段改为 **Last substantive Phase 4.0 revision** = `87adf98`；`5e6b6b1` 标明 pointer-only。

### 实施选择（相对 Phase Spec 4.1 字面「contentlayer Game」）

- 物理存储采用 **TypeScript 模块 + 只读 adapter**（沿用 Phase 3 `lib/site` 模式），**未**新增 contentlayer `Game` document type。
- 依据：ADR 0002 仍为 Proposed，且不固定物理格式；跨记录唯一性 / Embed / published 约束无法单靠 contentlayer schema 表达；用户任务要求优先复用现有设计，且禁止提前接页面。
- PortalHome 真实内容源仍为 Phase 3 draft fixture → **留待 4.5**（用户 4.1 任务未要求 PortalHome 页面内容）。

### 交付

- `lib/catalog/*` — 类型、校验、adapter、ballgames 实例数据
- `scripts/catalog-tests.mjs` / `test:catalog` — 18 tests（含负向约束）
- `scripts/validate-catalog.mjs` / `validate:catalog` — schema PASS + readiness 报告（BLOCKED / MANUAL REVIEW）

### Catalog 事实

| 项                                  | 结果                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| 生产首页 `published` + `showOnHome` | **1**（`hockey-bros`）                                                                            |
| Spec 列出的其余 Bros slug           | **9** 条 `draft`，无 `primaryUrl`                                                                 |
| 虚构 URL / Provider / granted embed | **无**                                                                                            |
| Embed                               | 全部 `unknown`；`cspFrameSrcVerified: false`                                                      |
| 详情内容                            | 仅 `hockey-bros`（正文来自产品 Spec §6；studio/日期仍 VERIFICATION REQUIRED，未写 `publishedAt`） |

### 验证（Node 22.14.0，本次执行）

| Command                    | Exit | Result                                       |
| -------------------------- | ---- | -------------------------------------------- |
| `yarn typecheck`           | 0    | PASS                                         |
| `yarn test:catalog`        | 0    | PASS（**18**）                               |
| `yarn test:batch1`         | 0    | PASS（**10**）                               |
| `yarn test:batch2`         | 0    | PASS（**20**）                               |
| `yarn validate:seo`        | 0    | PASS                                         |
| `yarn validate:catalog`    | 0    | schema PASS；readiness **BLOCKED**           |
| `yarn next lint --dir lib` | 0    | PASS                                         |
| `git diff --check`         | 0    | PASS                                         |
| export / live HTTP / CI    | —    | **NOT RUN** / **NOT VERIFIED** / **BLOCKED** |

**未执行：** commit / push；Phase 4.2；首页 UI；详情页 UI；contentlayer Game 类型；Shared Core。

**下一步：** 停止。等待用户审查 4.1 并明确授权 4.2。

---

## 2026-11-06 — Phase 4.1：Spec Architecture Alignment（仅文档）

**Git HEAD（任务开始）：** `4ea8e14cb0c3a048029b5cbeca8efa626db91d3d` · **分支：** `main`

**范围：** Phase 4.1 架构决策与 Spec/ADR/Catalog README 一致性；**未**修改 `lib/catalog/` 业务代码、实例数据、页面组件。

### 交付

- 新增 [`specs/phases/04.1-catalog-architecture-alignment.md`](../../specs/phases/04.1-catalog-architecture-alignment.md)
- 新增 [`lib/catalog/README.md`](../../lib/catalog/README.md)
- 修订 ADR [`0002`](decisions/0002-portal-content-and-catalog-boundary.md)、[`0004`](decisions/0004-ballgames-launcher-embed-policy.md) → **Accepted**
- 同步 [`04-ballgames-r1.md`](../../specs/phases/04-ballgames-r1.md)、[`ballgames-specs-v1.md`](../../specs/ballgames/ballgames-specs-v1.md)、[`04-config-and-content-models.md`](../../specs/04-config-and-content-models.md)、[`seo/05`](../../specs/seo/05-content-quality-and-validation.md)、[`01-site-archetypes.md`](../../specs/01-site-archetypes.md)、实例 [`README`](../../specs/instances/ballgames/README.md)、[`STATUS.md`](STATUS.md)

### 八项决策（文档）

| # | 主题 | 文档对齐 |
|---|------|----------|
| 3.1 | R1 TS modules + Adapter | **已对齐** |
| 3.2 | Provider/Embed 可选 + 条件校验 | **已对齐**（**代码未对齐** — 仍必填 providerId/embedPermissionId） |
| 3.3 | Embed 三维度 | **已对齐** |
| 3.4 | Error/Warning/Info | **已对齐**（readiness BLOCKED 映射 **部分** — 代码待改） |
| 3.5 | published ≠ indexable | **已对齐** |
| 3.6 | 首页 15–20 设计目标 | **已对齐**（`HOME_CARD_COUNT_BELOW_TARGET` 代码仍为 BLOCKED） |
| 3.7 | iframe 浏览器边界 | **已对齐** |
| 3.8 | Archetype vs Launch mode | **已对齐** |

### 验证（本任务）

| Command | Result |
|---|---|
| `git diff --check` | 见执行报告 |
| `yarn test:catalog` | **NOT RUN**（无代码变更） |
| Markdown/链接专用脚本 | 仓库 **无** 对应工具 — **NOT RUN** |

**未执行：** commit / push；Catalog 校验器代码修订；Phase 4.2+。

**下一步：** 用户审查架构对齐 → 决定是否先做 Catalog 代码 follow-up → 授权 Phase 4.2。

---

## 2026-11-06 — Phase 4.1.2：Catalog Contract & PortalHome Alignment

**范围：** Catalog 类型/校验/readiness 分层；PortalHome Reader；契约测试 C01–C15；STATUS / Spec / README。

**分支：** `main`（任务完成时本地未 commit）。

### 交付摘要

- `providerId` / `embedPermissionId` 可选；声明时关联校验（Provider 一致、sourceUrl 与 launch）
- Schema / `validateCatalogSeo` / `collectCatalogContentQualityIssues` / readiness 分离
- 首页 15–20 → `HOME_CARD_COUNT_BELOW_TARGET` **INFO**；生产 iframe → `PRODUCTION_IFRAME_NOT_READY` **BLOCKED**
- `getPortalHomeContent()` @ `lib/site/get-portal-home-content.ts`

### 验证

| Command | Exit | Result |
|---|---|---|
| `yarn typecheck` | 0 | **PASS** |
| `yarn test:catalog` | 0 | **PASS**（33 tests） |
| `yarn validate:catalog` | 0 | **PASS** |
| `git diff --check` | 0 | **PASS** |
| `yarn validate:seo` | — | **NOT RUN**（未改 SEO 校验路径） |

**未执行：** commit / push；Phase 4.2 页面。

**下一步：** 用户审查 → 授权 Phase 4.2。

---

## 2026-11-06 — Phase 4.1.3：Validation & Documentation Closure

**范围：** Catalog SEO 专项接入 `yarn validate:seo`；SEO 脚本经 `getPortalHomeContent()` 消费 PortalHome；`lib/site/index` 不再导出 `ballgamesPortalHomeContentFixture`（测试从 `lib/site/instances/ballgames` 引用）；`04.1` Spec / ADR 0002 / STATUS 同步；`hosted` 与 iframe 分类文档修正。

**分支：** `main`

### 变更文件（摘要）

- `scripts/validate-seo-entry.ts` — `validateCatalog` + `validateCatalogSeo`；Portal 元数据检查改用 Reader
- `lib/site/index.ts`、`lib/site/get-portal-home-content.ts` — 导出边界与说明
- `scripts/batch1-test-entry.ts`、`scripts/batch2-test-entry.ts` — fixture 导入路径
- `scripts/catalog-test-entry.ts` — C16：静态断言 `validate-seo-entry` 含 Catalog SEO 调用
- `specs/phases/04.1-catalog-architecture-alignment.md`、`specs/phases/04-ballgames-r1.md`、`docs/agent/decisions/0002-portal-content-and-catalog-boundary.md`、`lib/catalog/README.md`、`docs/agent/STATUS.md`

### 验证

| Command | Exit | Result |
|---|---|---|
| `yarn typecheck` | 0 | **PASS** |
| `yarn test:catalog` | 0 | **PASS**（34 tests） |
| `yarn validate:catalog` | 0 | **PASS**（readiness JSON + schema exit 0） |
| `yarn validate:seo` | 0 | **PASS**（contract；含 `validateCatalog` + `validateCatalogSeo`） |
| `git diff --check` | 0 | **PASS** |

**未执行：** commit / push（用户未要求）；Phase 4.2 页面。

**结论：** Phase **4.1 / 4.1.2 / 4.1.3** 文档与验证收口 **DONE**；Phase **4.2 NOT STARTED**。

---

## 2026-11-09 — Specs 治理审计落盘与 P0 文档补丁

**范围：** 只读 Specs 治理审计；落盘报告；修补 Phase **4.2** 定义不一致（CON-01）。**未**实施 Phase 4.2 代码、**未**迁移 Specs 目录。

### 交付

- [`docs/agent/reports/specs-governance-review.md`](reports/specs-governance-review.md)
- [`specs/README.md`](../../specs/README.md) — 索引、优先级、Phase 4.2 最小读取清单
- P0 补丁：`docs/agent/STATUS.md`（Recommended next action）、`specs/phases/04.1-catalog-architecture-alignment.md`（4.2 状态表与 §11）、`AGENTS.md`（Phase 4 §13 权威）、`specs/00-project-charter.md`（索引链）

### 验证

| Check | Result |
|---|---|
| 文档-only 变更 | **PASS**（无代码/脚本修改） |
| `yarn typecheck` / `validate:*` | **NOT RUN**（本轮无代码变更） |

**结论：** Phase 4.2 批次定义与主 Spec §13 对齐；Agent 入口见 `specs/README.md`。**Phase 4.2 实现仍 NOT STARTED**（须用户授权）。
