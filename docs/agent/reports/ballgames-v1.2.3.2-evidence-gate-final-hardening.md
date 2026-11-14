# BG-1.2.3.2 — Evidence Gate Final Hardening

## A. Baseline

| 项                    | 值                                                             |
| --------------------- | -------------------------------------------------------------- |
| Branch                | `main`                                                         |
| HEAD（任务起始/结束） | `18b43bab112f2db4f14ebe5301cc26067a8538e3`                     |
| BG-1.2.3.1            | **ON MAIN** @ `18b43bab`                                       |
| 起始工作区            | 干净                                                           |
| 结束状态              | implementation `b5c26fe` 已推送 `origin/main`                  |
| Runtime               | Windows / PowerShell；Node 24.9.0；npm 11.6.0；Yarn CLI 不可用 |
| 验证日期              | 2026-11-14                                                     |

## B. Change Scope

| 文件                                 | 变更理由                                                     |
| ------------------------------------ | ------------------------------------------------------------ |
| `lib/catalog/validate.ts`            | Offer 资格复用完整 Launch 校验；Reserved Host DNS 根点规范化 |
| `lib/site/validate-site-instance.ts` | Site 与 Organization 资格共享 canonical Origin 断言          |
| `lib/seo/structured-data.ts`         | 递归 Organization / `@type` 数组 / 循环引用证据门禁          |
| `scripts/catalog-test-entry.ts`      | OFF-C-N11–N17、P04–P05                                       |
| `scripts/phase4.5-test-entry.tsx`    | ORG-C-N10–N20、P04                                           |
| `scripts/phase4.6-test-entry.ts`     | PATH-B-04 Detail export HTML + Offer + FAQ parity            |
| `docs/agent/STATUS.md`               | main SHA、BG-1.2.3.2 提交状态与验证结果                      |
| `docs/agent/WORKLOG.md`              | 独立工作记录                                                 |
| 本报告                               | 收口证据                                                     |

未修改 `package.json` / lockfile、`.github/**`、`app/**`、`components/**`、`public/**`、`data/**`、`specs/**`、生产 Catalog / SiteInstance、CSP 或部署配置。

## C. Root Cause Matrix

| ID        | 根因                                                                         | 修复                                                                                                              |
| --------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| BG1232-01 | Offer 资格只校验证据与 verified 标志，直接生成器未覆盖 Launch mode/URL 结构  | verified 路径先调用现有 `assertLaunch()`，再调用 `assertFreeOfferEvidence()`                                      |
| BG1232-02 | Organization 资格未验证 canonicalOrigin 是无 path/query/hash 的 HTTPS Origin | 抽取唯一 `assertCanonicalOrigin()`，由 Site 校验和 verified 资格共同复用                                          |
| BG1232-03 | 证据门禁只统计顶层字符串 `@type` Organization                                | 正式门禁递归全部对象/数组，识别 `@type` 数组、任意属性与 `@graph`；只允许首页顶层单一字符串类型 Organization      |
| BG1232-04 | Reserved Host 比对前未移除合法 FQDN 单个尾随根点                             | 小写化并仅移除一个尾随根点；空值、多尾随点、空根 fail closed                                                      |
| BG1232-05 | PATH-B 只有 Detail 内存块，没有真实 Detail export HTML round trip            | 读取新构建 `out/hockey-bros.html`，在 HTML 字符串副本中替换 JSON-LD，重新解析并核验 Offer/FAQ/Breadcrumb/禁止字段 |

## D. Evidence Gate

- **Offer：** missing/unverified 安全省略；verified 必须同时通过完整 Launch、免费证据、verified launch 与 source URL 一致性。非法 verified 输入继续抛 `CatalogError`，既有错误码语义保留。
- **Organization：** missing/unverified 安全省略；verified 必须通过 canonical Origin 与证据断言。非法输入继续抛 `SiteConfigError`。
- **Nested Organization：** 首页只允许恰好一个经证据验证的顶层字符串 `@type: Organization`；详情页及所有嵌套位置禁止。错误包含 JSON 路径。
- **Traversal：** 遍历任意对象/数组深度；当前递归栈用 `WeakSet` 检测循环，离栈时删除，因此正常共享对象不会被误判。
- **Reserved Host：** `example.com.`、`audit-fixture.example.`、`localhost.` 与无尾点版本结果一致；`ballgames.io.` 不被误判。

## E. PATH-A — Production No-Evidence

全新静态构建使用真实生产 Catalog 与 SiteInstance：

| 检查                | 结果                                                                |
| ------------------- | ------------------------------------------------------------------- |
| Homepage JSON-LD    | WebSite + ItemList + FAQPage；Organization 0；Offer 0               |
| Hockey Bros JSON-LD | VideoGame + FAQPage + BreadcrumbList；offers absent；Organization 0 |
| 评分/评论           | 无 `aggregateRating` / `review`                                     |
| Sitemap             | 恰好 `https://ballgames.io`、`https://ballgames.io/hockey-bros`     |
| 结论                | **PASS**                                                            |

## F. PATH-B — TEST ONLY / SYNTHETIC VERIFIED STATE / NOT PRODUCTION EVIDENCE

| 检查                                | 结果                                                         |
| ----------------------------------- | ------------------------------------------------------------ |
| Homepage 合成 verified Organization | 顶层最小 Organization 通过                                   |
| Detail 合成 verified freeOffer      | 最小 Offer 通过                                              |
| Homepage HTML 副本 round trip       | PATH-B-03 PASS                                               |
| Detail HTML 副本 round trip         | PATH-B-04 PASS                                               |
| Detail FAQ parity                   | JSON-LD 7 问逐项匹配真实导出 HTML 可见 FAQ                   |
| Detail BreadcrumbList               | 两级 canonical item 正确                                     |
| Detail Organization / rating        | 无 Organization、aggregateRating、review                     |
| 隔离                                | 未修改生产数据或实际 `out/` 文件；只替换内存 HTML 字符串副本 |

## G. Negative Test Matrix

| ID                    | 场景                                                 | 结果 |
| --------------------- | ---------------------------------------------------- | ---- |
| OFF-C-N11 / N12 / N13 | invalid mode / missing URL / invalid URL             | PASS |
| OFF-C-N14             | 直接生成器 + malformed verified Launch               | PASS |
| OFF-C-N15 / N16 / N17 | 保留域名尾随根点                                     | PASS |
| OFF-C-P04 / P05       | 真实域名尾随根点 / 大小写一致                        | PASS |
| ORG-C-N10 / N11       | malformed canonicalOrigin 资格/直接生成器            | PASS |
| ORG-C-N12 / N13       | URL mismatch / unverified 安全省略                   | PASS |
| ORG-C-N14 / N15       | 无证据嵌套 / 有证据深层自定义嵌套                    | PASS |
| ORG-C-N16 / N17 / N18 | `@type` 数组 / `@graph` / publisher 与 author        | PASS |
| ORG-C-P04             | 合法顶层 Organization + 正常共享非 Organization 对象 | PASS |
| ORG-C-N19 / N20       | Detail 嵌套 / 循环 JSON-LD                           | PASS |

编号说明：任务文本同时把 `ORG-C-N13` 分配给“unverified”与“无证据嵌套”，故后者及其后续编号顺延为 N14–N20；`OFF-C-P03` 已被既有 Phase 4.5 测试占用，Reserved Host 正向测试顺延为 P04–P05。

## H. Commands

| 命令                                                       | Exit | 结果                                                |
| ---------------------------------------------------------- | ---: | --------------------------------------------------- |
| `git diff --check`                                         |    0 | PASS                                                |
| `npm.cmd run typecheck`                                    |    0 | PASS                                                |
| `npm.cmd run test:catalog`                                 |    0 | PASS（71）                                          |
| `npm.cmd run validate:catalog`                             |    0 | PASS（schema；readiness 保留 INFO/WARNING/BLOCKED） |
| `npm.cmd run test:phase4.5`                                |    0 | PASS（54）                                          |
| `npm.cmd run validate:seo`                                 |    0 | PASS                                                |
| `npm.cmd run test:batch1`                                  |    0 | PASS（12）                                          |
| `npm.cmd run test:batch2`                                  |    0 | PASS（30）                                          |
| `npm.cmd run test:phase4.3`                                |    0 | PASS（28；happy-dom iframe 警告非失败）             |
| `npm.cmd run test:phase4.4`                                |    0 | PASS（25）                                          |
| `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; npm.cmd run build` |    0 | PASS（新 `out/index.html` 时间戳晚于构建开始）      |
| `npm.cmd run validate:seo -- --export-dir=out`             |    0 | PASS                                                |
| `npm.cmd run test:phase4.6`                                |    0 | PASS（43；另含 hardcoded-path 14 项 PASS）          |

PowerShell 直接解析 `npm` 时被本机 execution policy 拦截在 `npm.ps1`，测试未启动；随后使用同一 Node 安装的 `npm.cmd` 成功执行全部项目脚本，未改系统或项目配置。

## I. Manual Review Gates

| ID                                    | 状态                       |
| ------------------------------------- | -------------------------- |
| MR-01 首页正文长度                    | 保留                       |
| MR-02 Organization 品牌证据           | 保留；生产无记录           |
| MR-03 loads in place vs external-only | 保留                       |
| MR-04 verified 首页卡数量             | 保留；当前 1 vs 15–20 目标 |
| MR-05 生产 iframe / CSP               | **BLOCKED**                |
| MR-06 mode 标签                       | 保留                       |
| MR-07 Cloudflare / Live HTTPS         | **NOT VERIFIED**           |
| MR-08 免费游玩事实人工核实            | 保留；生产无 freeOffer     |

## J. Final Verdict

| Gate                            | Result                        |
| ------------------------------- | ----------------------------- |
| Engineering                     | **PASS**                      |
| Offer Evidence Gate             | **PASS**                      |
| Organization Evidence Gate      | **PASS**                      |
| Nested Organization Gate        | **PASS**                      |
| Reserved Host Gate              | **PASS**                      |
| PATH-A                          | **PASS**                      |
| PATH-B                          | **PASS**（test fixture only） |
| Ballgames R1 Product Acceptance | **CONDITIONAL ACCEPTANCE**    |
| Production iframe               | **BLOCKED**                   |
| R1 Production Release           | **NOT VERIFIED**              |

**BG-1.2.3.2 最终结论：PASS WITH MANUAL REVIEW。** implementation commit `b5c26fe` 已推送 `origin/main`；未建 PR、未部署，也未解除 MR-01–MR-08。
