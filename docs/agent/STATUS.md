# Agent Project Status

- **Current phase：** Phase 4 **ENGINEERING COMPLETE — READY WITH MANUAL BLOCKERS** @ `339250db53cbd48e7b816b10a73f4730146ca89b`（历史工程指针 **保留**）
- **Product alignment：** **BG-1.2.3** @ `c04ae75`；**BG-1.2.3.1** Evidence Gate Closeout（2026-11-14，**ON MAIN**，见下方 commit）
- **Prior：** **BG-1.2.2.1** @ `129961e`；**BG-1.2.2** @ `200280f`；**BG-1.2.1** @ `7521011`；**BG-1.2.0** @ `a8b4f59`
- **Active product Spec：** [`specs/ballgames/ballgames-specs-v1.2.md`](../specs/ballgames/ballgames-specs-v1.2.md)
- **Phase 4.7：** Final acceptance report on `main`；见 [`phase-4-final-validation.md`](reports/phase-4-final-validation.md)
- **BG-1.2.2.1 evidence：** [`ballgames-v1.2.2.1-homepage-closeout.md`](reports/ballgames-v1.2.2.1-homepage-closeout.md)
- **BG-1.2.3 evidence：** [`ballgames-v1.2.3-offer-organization.md`](reports/ballgames-v1.2.3-offer-organization.md)
- **BG-1.2.3.1 evidence：** [`ballgames-v1.2.3.1-evidence-gate-closeout.md`](reports/ballgames-v1.2.3.1-evidence-gate-closeout.md)
- **Last updated:** 2026-11-14（BG-1.2.3.1 证据门控收口）
- **Current reviewed branch:** `main` @ `c04ae75` + BG-1.2.3.1 白名单变更（用户另有 `app/tag-data.json` 未纳入本任务）

## Phase summary

| Phase | 名称 | 状态 | 证据 |
| ----- | ---- | ---- | ---- |
| 4.5 | Content / SEO Integration | **ON MAIN** @ `386a8b7` | [`phase4.5-content-seo-integration.md`](reports/phase4.5-content-seo-integration.md) |
| 4.5.1 | Spec consistency closeout | **ON MAIN** @ `4f8bcabb` | [`phase4.5.1-spec-consistency-closeout.md`](reports/phase4.5.1-spec-consistency-closeout.md) |
| 4.6 | Export / SEO integration validation | **ON MAIN** @ `8bdb3e8` | [`phase4.6-validation.md`](reports/phase4.6-validation.md) |
| 4.7 | 最终验收 | **DONE (local report)** | [`phase-4-final-validation.md`](reports/phase-4-final-validation.md) |

## BG-1.2.3.1 摘要（本地）

| 项 | 状态 |
| --- | --- |
| P1 双路径 SEO 校验（Organization / offers 非硬编码） | **DONE** |
| P1 生成器完整证据资格（`isVerified*Eligible`） | **DONE** |
| P1 保留域名 `isReservedHost` | **DONE** |
| P2 Organization JSON-LD 与证据 name/url 一致 | **DONE** |
| PATH-A 生产无证据静态导出 | **PASS** |
| PATH-B 内存合成证据 fixture | **PASS**（**非生产证据**） |

## BG-1.2.3 摘要（main @ c04ae75）

| 项 | 状态 |
| --- | --- |
| `VerifiedFreeOffer` / `freeOffer` 类型与 Catalog 校验 | **DONE** |
| `OrganizationEvidence` / `organizationEvidence` 类型与 Site 校验 | **DONE** |
| 条件化 `VideoGame.offers` 与首页 `Organization` JSON-LD | **DONE** |
| 证据门控 `assertJsonLdBlocksMeetEvidenceContract` | **DONE** |
| 生产 Hockey Bros / 首页默认 **省略** Offer 与 Organization | **EXPECTED** |
| 生产 iframe | **BLOCKED**（未因免费事实而改变 embed） |

## Verdicts（分层）

| Gate | Result |
| --- | --- |
| Phase 4 Engineering Acceptance | **PASS WITH MANUAL REVIEW**（未覆盖） |
| BG-1.2.3 Engineering | **PASS WITH MANUAL REVIEW**（`c04ae75` on main） |
| BG-1.2.3.1 Engineering | **PASS WITH MANUAL REVIEW** |
| BG-1.2.2.1 Engineering | **PASS WITH MANUAL REVIEW**（`129961e` on main） |
| BG-1.2.2 Closeout | **CLOSED**（产品 manual gates 保留） |
| Ballgames R1 Product Acceptance | **CONDITIONAL ACCEPTANCE** |
| R1 Production Release | **NOT VERIFIED** |

## Blockers（R1 上线）

- **MR-01** 首页正文长度与产品目标差异
- **MR-02** Organization 真实品牌依据 — 无入库证据，JSON-LD **省略**
- **MR-03** 导语 “loads in place” vs 生产 external-only → **EDITORIAL REVIEW REQUIRED**
- **MR-04** 首页 verified 卡 **1** vs 15–20
- **MR-05** 生产 iframe / CSP / embed 证据 → **BLOCKED**
- **MR-06** 卡片 mode 标签证据缺口
- **MR-07** Cloudflare / live HTTPS → **NOT VERIFIED**
- **MR-08（扩展）** 免费游玩 `VerifiedFreeOffer` 人工事实审计 — 工程已就绪，**生产无记录**

## Recommended next action

1. 产品 / 运营审阅 BG-1.2.3.1 收口报告；按需开启经审计的生产证据入库。
2. 产品侧提供经审计的 `freeOffer` / `organizationEvidence` 入库依据（单独授权，非本任务默认）。
3. Embed/CSP 外部证据；补充 verified 首页卡片（不虚构）。

## Last verified checks（2026-11-14，Node **见 BG-1.2.3.1 报告**，基线 `c04ae75` + BG-1.2.3.1 变更）

`npm run typecheck`、`test:batch1/2`、`test:catalog`、`test:phase4.3/4/4.5/4.6`、`validate:catalog`、`validate:seo`、`EXPORT=1 UNOPTIMIZED=1 npm run build`、`validate:seo --export-dir=out` — **exit 0**。详见 [`ballgames-v1.2.3.1-evidence-gate-closeout.md`](reports/ballgames-v1.2.3.1-evidence-gate-closeout.md) §E–H。