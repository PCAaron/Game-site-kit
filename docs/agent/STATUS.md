# Agent Project Status

- **Current phase:** Phase 3 — 最小 SEO Foundation（**implemented — PASS WITH LIMITATIONS**）
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Phase 3 commits：** `4514c3f`（Batch 0–3）· `0f74c67`（follow-up）· **`8b3f51a`**（Final Remediation，**HEAD / `main`**）
- **Last updated:** 2026-11-03
- **Current reviewed branch:** `main`
- **Pages deployment branch:** `main`（[`.github/workflows/pages.yml`](../../.github/workflows/pages.yml)）
- **工作区：** Sitemap XML **Strictness** 补丁（`validate-sitemap-xml.ts` + batch2 测试）**未提交** — 见 [`phase-3-final-validation.md`](reports/phase-3-final-validation.md) v3 §D

## Phase summary

| Phase | 名称 | 状态 | 证据 |
|---|---|---|---|
| 0 | 模板基线审计 | **completed** / **validated** | [`template-audit.md`](reports/template-audit.md) |
| 1 | Agent 文档与工作流基础 | **completed** / **validated** | Phase 1 Spec |
| 2 | SEO 页面模型与内容契约 | **completed**（文档） | Phase 2 Spec |
| 2.2 | Instance-to-Kit 契约对齐 | **completed**（文档） | Phase 2 §2.2 |
| 3 | 最小 SEO Foundation | **completed**（**PASS WITH LIMITATIONS**） | Batch 0–3；[`phase-3-final-validation.md`](reports/phase-3-final-validation.md) v3 |
| 4 | ballgames R1 页面 | **not started** | 须单独授权；Spec §13 未勾选项 |
| — | Shared Core | **deferred** | 非获批阶段 |

## Phase 3 能力摘要（与 Spec §13.1 一致）

| 区域 | 状态 | 说明 |
|---|---|---|
| SiteInstance / PortalHomeContent / URL helpers | **PASS** | `test:batch1`、`validate:seo` |
| Metadata / canonical / OG / robots | **PASS** | `test:batch2`、export HTML 校验 |
| Sitemap eligibility + XML | **PARTIAL** | 机制 PASS（含 Strictness 工作区）；**production 0 URL**（draft portal） |
| JSON-LD | **PARTIAL** | fixture PASS；FAQ/页面集成 **Phase 4** |
| Legacy indexability | **PASS** | DEC-003-F；`LEGACY_PAGE_ROBOTS` |
| Static export 本地校验 | **PARTIAL** | `validate:seo --export-dir=out`（@8b3f51a 矩阵） |
| Pages live HTTP | **BLOCKED** | 未 host 实测 |

## ADR 0003（摘要）

DEC-003-A–C **Applied**；DEC-003-D **Partial**（机制 done，production 集成 Phase 4）；DEC-003-E **F1 applied**；**DEC-003-F applied**（Legacy `noindex, follow`）。Pages live HTTP **BLOCKED**。

## Blockers（R1 上线 / Phase 4，非 Phase 3 机制）

- 生产 **exact-two sitemap** 与页面 JSON-LD **集成**依赖 Phase 4 路由与 published/indexable 内容。
- **MANUAL REVIEW：** HTTPS、embed 许可、OG 素材、`launchUrl` 核验。
- GitHub Pages **live HTTP** 未实测。
- GitHub Actions：**configure-pages** 失败（Pages 未按 Actions 配置）— **非** Node 20 build 结果；**CI green NOT VERIFIED**。

## Recommended next action

1. 用户决定是否 commit Strictness 工作区并是否立项 **Phase 4**。
2. 修复 GitHub Pages「Build with Actions」配置后，在对应 SHA 上确认 Node 20 workflow 跑到 `yarn build`。
3. 可选：Pages 预览 HTTP 复核；文档 Prettier 独立任务。

## Last verified checks

**Batch 3 @ 2026-11-03（Node 18.20.0）** — [`phase3-batch3-validation.md`](reports/phase3-batch3-validation.md) @ `4514c3f`。

**Final Remediation @ `8b3f51a`（Node 22.14.0）** — 见 [`phase-3-final-validation.md`](reports/phase-3-final-validation.md) §C。

**Strictness 工作区 @ `8b3f51a` + 本地改动（Node 22.14.0）** — §D：`typecheck` 0、`test:batch2` 0（**18** tests）、`validate:seo` 0。

| Command | Exit | Result |
|---|---|---|
| `yarn typecheck` | 0 | PASS（Strictness 轮） |
| `yarn test:batch1` | — | 未在本轮 Strictness 任务重跑 |
| `yarn test:batch2` | 0 | PASS（18 tests，Strictness 轮） |
| `yarn validate:seo` | 0 | PASS（Strictness 轮） |
| `yarn build` / export 矩阵 | — | 最后完整记录在 `@8b3f51a` §C |

**CI：** configure-pages **BLOCKED** — **NOT VERIFIED**。**HTTP：** **BLOCKED**。

详见 WORKLOG（Final Remediation、Strictness 收尾）。
