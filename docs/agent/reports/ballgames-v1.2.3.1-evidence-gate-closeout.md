# BG-1.2.3.1 — Evidence Gate Closeout

## A. Baseline

| 项 | 值 |
| --- | --- |
| Branch | `main` |
| HEAD（任务起始） | `c04ae75bdc8108cb60b05504fb9212f11fdb4604` |
| Node | 24.9.0 |
| Package manager | npm 11.6.0（仓库声明 Yarn 3.6.1；本机无 `yarn` CLI） |
| Working tree | BG-1.2.3.1 白名单修改；用户 `app/tag-data.json` 未动 |

## B. Change Scope

| 文件 | 原因 |
| --- | --- |
| `lib/catalog/validate.ts` | `isReservedHost`；`isVerifiedFreeOfferEligible` 复用 `assertFreeOfferEvidence` |
| `lib/site/validate-site-instance.ts` | `isVerifiedOrganizationEvidenceEligible` 复用 `assertOrganizationEvidence` |
| `lib/seo/structured-data.ts` | 生成器资格；Organization JSON-LD name/url 与证据一致 |
| `scripts/validate-seo-entry.ts` | 首页 JSON-LD 精确类型集合 + 证据契约（非硬编码禁 Organization） |
| `scripts/phase4.6-test-entry.ts` | P46-09 按证据决定 offers；PATH-B fixture |
| `scripts/phase4.5-test-entry.tsx` | 合成 fixture URL 迁移；ORG-C / OFF-C |
| `scripts/catalog-test-entry.ts` | OFF-C 矩阵；保留域名负面 |
| `docs/agent/STATUS.md`、`WORKLOG.md` | 状态勘误 |
| `docs/agent/reports/ballgames-v1.2.3-offer-organization.md` | Commit 状态附录 |

## C. Root Cause Matrix

| ID | 问题 | 修复 |
| --- | --- | --- |
| P1-01 | `validate:seo` / P46-09 硬编码无 Organization、无 offers |  multiset + `assertJsonLdBlocksMeetEvidenceContract` + `isVerified*Eligible` |
| P1-02 | `isVerified*Eligible` 仅看 `status: verified` | 资格函数调用完整 `assert*Evidence`；生成器经资格判断 |
| P1-03 | `.example` / `.test` 等未完整拦截 | 导出 `isReservedHost`；Launch 占位错误码兼容保留 |
| P2-01 | Organization 仅检查类型允许 | `assertJsonLdBlocksMeetEvidenceContract` 比对 name/url |
| P2-02 | 正反路径覆盖不足 | OFF-C / ORG-C / PATH-B 测试 |
| P2-03 | STATUS 仍写 BG-1.2.3 未 commit | 勘误为 `c04ae75` on main + 1.2.3.1 本地 |

## D. Evidence Gate Design

- **入口：** `validateCatalog` / `validateSiteInstance`（入库）；`isVerifiedFreeOfferEligible` / `isVerifiedOrganizationEvidenceEligible`（JSON-LD）；`assertJsonLdBlocksMeetEvidenceContract`（导出与测试）。
- **缺证据 / unverified：** 安全省略 Offer / Organization。
- **非法 verified：** Catalog `CatalogError` / Site `SiteConfigError`（资格函数传播）。
- **Organization 输出：** 必须与 `organizationEvidence.name` / `.url` 字符串一致（trim 后）。
- **保留域名：** URL `hostname` 经 `isReservedHost`；Launch 仍用 `CATALOG_LAUNCH_URL_PLACEHOLDER`。
- **iframe：** 与 Offer/Organization 证据独立；未改 EmbedPermission。

## E. PATH-A Result（生产无证据）

| 检查 | 结果 |
| --- | --- |
| 首页 JSON-LD | WebSite×1, ItemList×1, FAQPage×1, Organization×0, Offer×0 |
| Hockey Bros JSON-LD | VideoGame×1, FAQPage×1, BreadcrumbList×1, offers absent |
| `EXPORT=1 UNOPTIMIZED=1 npm run build` | exit 0 |
| `validate:seo --export-dir=out` | exit 0 |
| `test:phase4.6` | 42 tests pass |

## F. PATH-B Result（TEST FIXTURE ONLY — NOT PRODUCTION EVIDENCE）

| 检查 | 结果 |
| --- | --- |
| 合成 `freeOffer` + `organizationEvidence`（内存） | 生成器输出最小 Offer / Organization |
| `assertJsonLdBlocksMeetEvidenceContract` | PASS |
| PATH-B-03 注入 export HTML **拷贝** 解析 | PASS |
| 生产 instances / `out/` 真实构建 | **未**启用 verified 证据 |

## G. Negative Test Matrix（新增/增强摘要）

| ID | 结果 |
| --- | --- |
| OFF-C-P01–P02 | PASS |
| OFF-C-N01, N03, N09, N10, N09b | PASS |
| ORG-C-P03, OFF-C-P03 | PASS |
| ORG-C-N07, N08, N09 | PASS |
| PATH-B-01–03 | PASS |
| 既有 OFF-N / ORG-N / LD-N | 未回归 |

## H. Commands

| 命令 | Exit |
| --- | --- |
| `git diff --check` | 0 |
| `npm run typecheck` | 0 |
| `npm run test:catalog` | 0（62 tests） |
| `npm run validate:catalog` | 0 |
| `npm run test:phase4.5` | 0（42 tests） |
| `npm run validate:seo` | 0 |
| `npm run test:batch1` | 0 |
| `npm run test:batch2` | 0 |
| `npm run test:phase4.3` | 0 |
| `npm run test:phase4.4` | 0 |
| `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; npm run build` | 0 |
| `npm run validate:seo -- --export-dir=out` | 0 |
| `npm run test:phase4.6` | 0（42 tests） |

## I. Manual Review Gates

MR-01–MR-08 **全部保留**；本任务**未**清除任何人工门禁。

## J. Final Verdict

| Gate | Result |
| --- | --- |
| BG-1.2.3.1 Engineering | **PASS WITH MANUAL REVIEW** |
| Verified Offer Contract | **PASS** |
| Organization Contract | **PASS** |
| Evidence-On Fixture Validation | **PASS** |
| Production No-Evidence Export | **PASS** |
| Ballgames R1 Product Acceptance | **CONDITIONAL ACCEPTANCE** |
| Production iframe | **BLOCKED** |
| R1 Production Release | **NOT VERIFIED** |