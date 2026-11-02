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

| Check | Result |
|---|---|
| `git diff --check` | PASS（编辑中与最终范围复核均执行） |
| 分支 / HEAD | `spec` / `aca82e6b0c8c8467295fba274777ac6b043948e1` |
| 应用代码、package、lockfile、业务 Spec diff | 无 |
| Build / lint / typecheck | **Not Run**（文档规划任务） |

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

| Check | Result |
|---|---|
| `git diff --check` | PASS（编辑中与最终复核） |
| Matrix row/priority targeted checks | PASS：31 rows；P0 11、P1 16、P2 4；ACM-019 P0；ACM-031 P1 |
| ADR / Phase 3 contract targeted checks | PASS：PortalHome fields、URL helper ownership、mapping 与 DEC-003-E gate 均存在 |
| `yarn prettier --check`（六个目标文档） | FAIL：5 个既有 Markdown 文件有格式差异；未运行 `--write`，避免无关整篇重排 |
| Build / lint / typecheck / deployment | **Not Run**（文档 remediation；`yarn lint` 含 `--fix`） |

### Pending decisions

- DEC-003-A–D 仍为 Proposed / Pending user decision。
- DEC-003-E 调查授权仍为 Pending；未授权修改 `trailingSlash`、static export、部署或 redirect。
- ADR 0003 仍为 Proposed；Phase 3 为 specified / implementation gated / not started。
