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

| Check | Result |
|---|---|
| `git diff --check` | PASS |
| Matrix structure / priorities | PASS：31 rows；每行 12 列；P0 11、P1 16、P2 4 |
| ACM classifications | PASS：ACM-003/009 `Pending decision`；ACM-013 `Implementation gap` |
| PortalHome contract cross-check | PASS：required title/description、OG fallback、helper canonical、updatedAt 单一映射均一致 |
| `yarn prettier --check docs/architecture/architecture-consistency-review.md docs/architecture/architecture-conflict-matrix.md docs/agent/decisions/0003-site-instance-url-and-seo-source.md specs/phases/03-minimum-seo-foundation.md docs/agent/STATUS.md docs/agent/WORKLOG.md` | FAIL：Architecture Review、Conflict Matrix、Phase 3 Spec、STATUS、WORKLOG；ADR 0003 PASS |
| Build / lint / typecheck / deployment | **Not run — documentation-only scope**；`yarn lint` 含 `--fix` |

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

| ID | Option | Documentation |
|---|---|---|
| DEC-003-A | A-1 | ADR Accepted；ACM-008/011 Decision resolved |
| DEC-003-B | B-1 | PortalHomeContent；`status` → `publicationStatus` 映射 |
| DEC-003-C | C-1 | Blog 保留；R1 不读 allBlogs |
| DEC-003-D | D-1 | Phase 3/4 边界 |
| DEC-003-E | E-1 | §20 调查；**实施方案未批准** |

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

### Validation

| Check | Result |
|---|---|
| `git diff --check` | 见任务 Final Report |
| `git diff specs/ballgames/ballgames-specs-v1.md` | 无变更（预期） |
| `git diff package.json next.config.js .github/` | 无变更（预期） |
| `yarn prettier --check`（六文档） | 见 Final Report |
| `yarn build` / lint / typecheck | **Not run**（文档 + 只读调查） |

### Outstanding

- Phase 3 应用实现 **not started**。
- Trailing-slash **implementation** 须单独用户批准。
- ACM-010 仍为 **Open**（配置与产品冲突未消除）。
