# Agent Work Log

按里程碑追加；不记录无验收意义的琐碎编辑。

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

| Check | Result |
|---|---|
| 文档引用路径存在性 | PASS |
| `git diff` 无 package/应用代码 | PASS |
| `yarn build` | 未执行（文档任务） |

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

| Check | Result |
|---|---|
| `git diff` 无 package.json / app 源码 | PASS |
| 术语交叉检索（Rich Results 承诺、首页无 iframe 等） | PASS（已修正 SEO 05） |
| 自动化 md lint | 无仓库脚本；人工一致性审查 |

### 遗留

- **技术风险：** `next.config.js` `trailingSlash: true` vs ballgames 无尾斜杠 canonical → Phase 3。
- ballgames §7.1 事实与 embed 许可 → **MANUAL REVIEW** 阻塞上线。
