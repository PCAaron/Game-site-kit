# Agent Project Status

- **Current phase:** Phase 3 — 最小 SEO Foundation（**implemented — PASS WITH LIMITATIONS**）
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Phase 3 commits：** `4514c3f` · `0f74c67` · `8b3f51a` · `1ef3f2e` · **`29e526b`**（priority/lastmod 边界，**HEAD / `main`**）
- **Last updated:** 2026-11-04
- **Current reviewed branch:** `main`
- **Pages deployment branch:** `main`（[`.github/workflows/pages.yml`](../../.github/workflows/pages.yml)）
- **工作区：** 干净（与 `pcaaron/main` 同步）

## Phase summary

| Phase | 名称 | 状态 | 证据 |
|---|---|---|---|
| 0 | 模板基线审计 | **completed** / **validated** | [`template-audit.md`](reports/template-audit.md) |
| 1 | Agent 文档与工作流基础 | **completed** / **validated** | Phase 1 Spec |
| 2 | SEO 页面模型与内容契约 | **completed**（文档） | Phase 2 Spec |
| 2.2 | Instance-to-Kit 契约对齐 | **completed**（文档） | Phase 2 §2.2 |
| 3 | 最小 SEO Foundation | **completed**（**PASS WITH LIMITATIONS**） | Batch 0–3；[`phase-3-final-validation.md`](reports/phase-3-final-validation.md) v4 |
| 4 | ballgames R1 页面 | **not started** | 须单独授权；Spec §13 未勾选项 |
| — | Shared Core | **deferred** | 非获批阶段 |

## Phase 3 能力摘要（与 Spec §13.1 一致）

| 区域 | 状态 | 说明 |
|---|---|---|
| SiteInstance / PortalHomeContent / URL helpers | **PASS** | `test:batch1`、`validate:seo` |
| Metadata / canonical / OG / robots | **PASS** | `test:batch2`、export HTML 校验 |
| Sitemap eligibility + XML | **PARTIAL** | 机制 PASS（Strictness + 边界 @ `29e526b`）；**production 0 URL** |
| JSON-LD | **PARTIAL** | fixture PASS；FAQ/页面集成 **Phase 4** |
| Legacy indexability | **PASS** | DEC-003-F；`LEGACY_PAGE_ROBOTS` |
| Static export 本地校验 | **PARTIAL** | `validate:seo --export-dir=out`（@ `8b3f51a` §C 矩阵） |
| Pages live HTTP | **BLOCKED** | 未 host 实测 |

## ADR 0003（摘要）

DEC-003-A–C **Applied**；DEC-003-D **Partial**；DEC-003-E **F1 applied**；**DEC-003-F applied**。Pages live HTTP **BLOCKED**。

## Blockers（R1 上线 / Phase 4，非 Phase 3 机制）

- 生产 **exact-two sitemap** 与页面 JSON-LD **集成**依赖 Phase 4。
- **MANUAL REVIEW：** HTTPS、embed 许可、OG 素材、`launchUrl` 核验。
- GitHub Pages **live HTTP** 未实测。
- GitHub Actions：**configure-pages** 基础设施阻塞 — **CI green NOT VERIFIED**（非 Node 20 build 结果）。

## Recommended next action

1. 用户决定是否 commit 边界修正工作区。
2. 修复 GitHub Pages「Build with Actions」后确认 Node 20 workflow 跑到 `yarn build`。
3. Phase 4 须单独授权。

## Last verified checks

**边界修正 @ `29e526b`（Node 22.14.0，2026-11-04）** — [`phase-3-final-validation.md`](reports/phase-3-final-validation.md) §E。

| Command | Exit | Result |
|---|---|---|
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch2` | 0 | PASS（**19** tests） |
| `yarn validate:seo` | 0 | PASS |
| `git diff --check` | 0 | PASS |

**历史：** Batch 3 @ `4514c3f`（Node 18）；Final Remediation @ `8b3f51a` §C；Strictness @ `1ef3f2e` §D（18 tests，提交时记录）。

**CI：** **BLOCKED / NOT VERIFIED**。**HTTP：** **BLOCKED**。

详见 WORKLOG。
