# Agent Project Status

- **Current phase:** Phase 3 — 最小 SEO Foundation（**implemented — PASS WITH LIMITATIONS**）
- **Baseline commit:** `723499bf9e590b398ed888cffc834a9c54274d00`（`v2.4.0-9-g723499b`）
- **Current HEAD：** `d02c69e7c2a9de29a97fe25547f57ff7abc6a4b3`（`docs(seo): record 29e526b push…`，文档同步）
- **Phase 3 代码验证基线：** `29e526bf0dc819e7e3c1357502b124d3fb39064f`（priority/lastmod 边界）· 更早：`1ef3f2e` · `8b3f51a` · `0f74c67` · `4514c3f`
- **Last updated:** 2026-11-04
- **Current reviewed branch:** `main`
- **Pages deployment branch:** `main`（[`.github/workflows/pages.yml`](../../.github/workflows/pages.yml)）
- **工作区：** lastmod 无时区兼容修正 **未提交**（基于 HEAD `d02c69e`）

## Phase summary

| Phase | 名称 | 状态 | 证据 |
|---|---|---|---|
| 0 | 模板基线审计 | **completed** / **validated** | [`template-audit.md`](reports/template-audit.md) |
| 1 | Agent 文档与工作流基础 | **completed** / **validated** | Phase 1 Spec |
| 2 | SEO 页面模型与内容契约 | **completed**（文档） | Phase 2 Spec |
| 2.2 | Instance-to-Kit 契约对齐 | **completed**（文档） | Phase 2 §2.2 |
| 3 | 最小 SEO Foundation | **completed**（**PASS WITH LIMITATIONS**） | [`phase-3-final-validation.md`](reports/phase-3-final-validation.md) v4 + §F |
| 4 | ballgames R1 页面 | **not started** | 须单独授权 |
| — | Shared Core | **deferred** | 非获批阶段 |

## Phase 3 能力摘要（与 Spec §13.1 一致）

| 区域 | 状态 | 说明 |
|---|---|---|
| SiteInstance / PortalHomeContent / URL helpers | **PASS** | `test:batch1`、`validate:seo` |
| Metadata / canonical / OG / robots | **PASS** | `test:batch2`、export HTML 校验 |
| Sitemap eligibility + XML | **PARTIAL** | 机制 PASS（@ `29e526b` + 收尾工作区）；**production 0 URL** |
| JSON-LD | **PARTIAL** | fixture PASS；页面集成 **Phase 4** |
| Legacy indexability | **PASS** | DEC-003-F |
| Static export 本地校验 | **PARTIAL** | `@8b3f51a` §C 矩阵 |
| Pages live HTTP | **BLOCKED** | 未 host 实测 |

## ADR 0003（摘要）

DEC-003-A–C **Applied**；DEC-003-D **Partial**；DEC-003-E **F1**；DEC-003-F **Applied**。Live HTTP **BLOCKED**。

## Blockers（R1 / Phase 4，非 Phase 3 机制）

- Production exact-two sitemap + 页面 JSON-LD → **Phase 4**。
- GitHub Actions：**configure-pages** — **CI NOT VERIFIED**（非 Node 20 build 结论）。
- Live HTTP **BLOCKED**。

## Recommended next action

1. 用户决定是否 commit/push 本次 lastmod 兼容收尾（工作区）。
2. 修复 GitHub Pages「Build with Actions」后在对应 SHA 上确认 Node 20 workflow 跑到 `yarn build`（**NOT VERIFIED**）。
3. Phase 4 须单独授权；**Phase 3 机制可冻结**（见终验 §F）。

## Last verified checks

**lastmod 兼容收尾 @ `d02c69e` + 工作区（Node 22.14.0，2026-11-04）** — [`phase-3-final-validation.md`](reports/phase-3-final-validation.md) **§F**。

| Command | Exit | Result |
|---|---|---|
| `yarn typecheck` | 0 | PASS |
| `yarn test:batch2` | 0 | PASS（**20** tests） |
| `yarn validate:seo` | 0 | PASS |
| `git diff --check` | 0 | PASS |

**历史验证：** `@29e526b` §E · `@1ef3f2e` §D · `@8b3f51a` §C · Batch 3 `@4514c3f`。

**CI / HTTP：** **BLOCKED / NOT VERIFIED**。

详见 WORKLOG。
