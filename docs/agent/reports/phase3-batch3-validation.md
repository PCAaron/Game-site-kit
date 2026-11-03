# Phase 3 Batch 3 — 验证记录

- **日期：** 2026-11-03
- **Node：** 18.20.0（本机）；CI workflow 声明 Node **20**
- **CI 等效 export：** `EXPORT=1` `UNOPTIMIZED=1` `BASE_PATH=/Game-site-kit`（与 Batch 0 探针及仓库名 `Game-site-kit` 一致；Actions 运行时值为 `configure-pages.outputs.base_path`）

## Git 工作区（构建前）

已存在 Phase 0–2 未提交变更（Batch 0–2 交付物）；构建后已 `git checkout -- app/tag-data.json` `tsconfig.tsbuildinfo`；`out/` 在 `.gitignore`。

## 验证矩阵

| 验证项目 | 执行命令 | Exit | 结果 | 证据 |
|---|---|---:|---|---|
| Typecheck | `yarn typecheck` | 0 | PASS | |
| URL（Batch 1） | `yarn test:batch1` | 0 | PASS | 9 tests |
| Metadata/Sitemap/JSON-LD（Batch 2） | `yarn test:batch2` | 0 | PASS | 9 tests |
| SEO 确定性脚本（契约） | `yarn validate:seo` | 0 | PASS | `scripts/validate-seo.mjs` |
| SEO 脚本 + 导出根路径 | `node scripts/validate-seo.mjs --export-dir=out`（EXPORT 根 build 后） | 0 | PASS | 空 sitemap；robots ballgames.io |
| SEO 脚本 + 子路径 | 同上（`BASE_PATH=/Game-site-kit` build 后） | 0 | PASS | index.html 含 `/Game-site-kit/_next/` |
| Lint（只读） | `yarn next lint --dir lib` | 0 | PASS | 未使用 `yarn lint --fix` |
| Normal Build | 清除 `EXPORT`/`UNOPTIMIZED`/`BASE_PATH` 后 `yarn build` | 0 | PASS | 无 `Exporting` 阶段 |
| Static Export（CI 根） | `EXPORT=1 UNOPTIMIZED=1 yarn build` | 0 | PASS | `out/blog.html` |
| Static Export（CI 子路径） | 上式 + `BASE_PATH=/Game-site-kit` | 0 | PASS | 资源前缀探针 |

## Phase 3 最终状态

**PASS WITH LIMITATIONS**

- **机制：** SiteInstance、URL helpers、metadata/sitemap/robots/JSON-LD 生成与 `validate:seo` 已落地。
- **生产 R1 sitemap exact-two / 页面 JSON-LD 集成：** 仍依赖 Phase 4（当前生产 sitemap **0 URL** 为预期）。
- **GitHub Pages live HTTP（F1 clean URL）：** 未 host 实测。
- **文档 Prettier：** 未在本批次 `--write` 全库（WORKLOG 历史项仍 open）。
