# Batch 0 — Static Export 与 URL 技术探针报告（DEC-003-E）

- **任务：** Phase 3 Batch 0（仅调查，无正式业务实现）
- **仓库分支 / HEAD：** `main` / `7bdc5f7ba13a2b17575826d47b9ae4ba25d1469e`
- **探针执行日期：** 2026-11-03
- **探针脚本：** [`scripts/probe/batch0-export-url-probe.mjs`](../../scripts/probe/batch0-export-url-probe.mjs)
- **机器可读证据：** [`batch0-evidence/manifest.json`](batch0-evidence/manifest.json) 及各场景 `summary.json`
- **正式配置变更（Batch 0）：** **无**（探针前后 SHA256 一致，见 manifest）
- **F1 落地（2026-11-03）：** 用户批准后 `next.config.js` → `trailingSlash: false`（见 WORKLOG F1 条目）
- **ADR：** DEC-003-E **F1 applied**；Pages live HTTP 仍 Pending

---

## A. 环境基线

| 项 | 实测值 | 说明 |
|---|---|---|
| Next.js | **15.5.12** | `package.json` / build 日志 |
| Node.js（探针） | **v18.20.0** | `nvm use 18.20.0`；满足 Next 15 引擎要求 |
| Node.js（探针前默认） | v16.17.0 | **无法**运行 Next 15 build |
| CI Node（Pages workflow） | **20** | [`.github/workflows/pages.yml`](../../../.github/workflows/pages.yml) |
| 包管理器 | Yarn **3.6.1** | `packageManager` 字段 |
| Build 入口 | `node scripts/next-with-init-cwd.mjs build` + `scripts/postbuild.mjs` | 与 `package.json` 一致 |
| `trailingSlash`（正式） | **`true`** | `next.config.js` L70 |
| `basePath` | `process.env.BASE_PATH \|\| undefined` | 未设置时无 basePath |
| Static export | `EXPORT=1` → `output: 'export'` | `next.config.js` L57–67 |
| 图片 | `UNOPTIMIZED=1` → `images.unoptimized: true` | 与 CI 一致 |
| 部署 | GitHub Pages：`EXPORT=1` + `UNOPTIMIZED=1` + `BASE_PATH=${{ configure-pages.outputs.base_path }}`，产物 `./out` | 仓库 `origin`: `PCAaron/Game-site-kit` |
| 当前 SEO origin（模板） | `https://tailwind-nextjs-starter-blog.vercel.app` | `data/siteMetadata.js` — **非** ballgames |

**探针统一命令（每场景）：**

```powershell
nvm use 18.20.0
$env:EXPORT='1'; $env:UNOPTIMIZED='1'
# 场景 C 额外：$env:BASE_PATH='/Game-site-kit'
node scripts/probe/batch0-export-url-probe.mjs
```

脚本在**内存中临时**改写 `trailingSlash` 后 build，将 `out/` 快照写入 `batch0-evidence/`，删除 `out/` 并**恢复** `next.config.js`（manifest 中 `configRestored: true`）。

**副作用处理：** build 曾改写 `app/tag-data.json`（contentlayer）；已 `git checkout -- app/tag-data.json` 恢复，工作区除探针新增文件外干净。

**未实测项（仍须标记）：**

- 真实 GitHub Pages 部署 URL 上的 HTTP 状态与地址栏最终 URL（无 live host 探针）
- `configure-pages.outputs.base_path` 与本地 `/Game-site-kit` 是否逐字一致（推断自仓库名，**Pending User Approval** 若用于生产断言）
- 自定义域 `ballgames.io` apex 行为

---

## B. 探针结果（分场景）

### 场景 A — `trailingSlash: true`，无 `BASE_PATH`

| 字段 | 结果 |
|---|---|
| **测试配置** | `trailingSlash: true`, `EXPORT=1`, `UNOPTIMIZED=1`, `BASE_PATH` 未设置 |
| **执行命令** | 见上；场景 id `scenario-a-trailing-true-root` |
| **Exit Code** | **0**（build 约 119s） |
| **Static Export** | **成功**（`✓ Exporting (2/2)`） |
| **导出结构（代表）** | 目录式：`blog/index.html`, `about/index.html`, `projects/index.html`；根 `index.html`；**无** `blog.html` |
| **代表公开 URL（推断）** | 站点根 `/`；列表页倾向 **`/blog/`**（目录索引）；Posts 如 `/blog/code-sample/` 或 `/blog/code-sample` 取决于 host |
| **Canonical（首页 `index.html`）** | `https://tailwind-nextjs-starter-blog.vercel.app/` — **根 URL 带尾斜杠** |
| **Canonical（`blog/index.html`）** | `.../blog/` — **非根 path 带尾斜杠** |
| **内链 `href`（首页抽样）** | `/blog/`, `/tags/`, `/projects/`, `/about/` — **带尾斜杠** |
| **Sitemap `<loc>`** | `.../blog`, `.../projects` — **无尾斜杠**（与 canonical `/blog/` **不一致**） |
| **ballgames 无尾斜杠 canonical** | **不满足**（metadata 与内链均倾向尾斜杠；sitemap 仅部分无尾斜杠） |
| **GitHub Pages 兼容性** | 目录 + `index.html` 与 Pages 常见模式**较匹配**；**未 host 实测** `/blog` vs `/blog/` |
| **风险** | 地址栏/sitemap/canonical/内链 **四套规则混用**；未来 `/hockey-bros` → `hockey-bros/index.html` → 公开 URL 常为 **`/hockey-bros/`** |

证据：[`batch0-evidence/scenario-a-trailing-true-root/summary.json`](batch0-evidence/scenario-a-trailing-true-root/summary.json)

---

### 场景 B — `trailingSlash: false`，无 `BASE_PATH`

| 字段 | 结果 |
|---|---|
| **测试配置** | `trailingSlash: false`, `EXPORT=1`, `UNOPTIMIZED=1` |
| **Exit Code** | **0**（build 约 64s） |
| **Static Export** | **成功** |
| **导出结构（代表）** | 扁平 `.html`：`blog.html`, `about.html`, `blog/code-sample.html`；**无** `blog/index.html` |
| **代表公开 URL（推断）** | `/blog.html` 或 host 对 clean URL 的解析；内链为 **`/blog`**（无 `.html` 后缀） |
| **Canonical（首页）** | `https://tailwind-nextjs-starter-blog.vercel.app` — **无尾斜杠**（符合 ballgames 根 URL 方向） |
| **Canonical（blog）** | `.../blog` — **无尾斜杠** |
| **内链 `href`** | `/blog`, `/tags`, `/projects` — **无尾斜杠** |
| **Sitemap `<loc>`** | `.../blog`, `.../`（首页 loc 仍带 `/` 后缀）— 与 B 的内链/canonical **较一致** |
| **ballgames 无尾斜杠 canonical** | **方向正确**（仍依赖 Phase 3 `siteUrl()` + 换 origin；当前仍为 starter 域名） |
| **GitHub Pages 兼容性** | **待验证**：内链 `/blog` 与磁盘 `blog.html` 是否 200 **未在 live Pages 实测**（存在 404 风险） |
| **风险** | 若 Pages 不将 `/blog` 映射到 `blog.html`，需 redirect 或 `trailingSlash` 与 host 规则对齐 |

证据：[`batch0-evidence/scenario-b-trailing-false-root/summary.json`](batch0-evidence/scenario-b-trailing-false-root/summary.json)

---

### 场景 C — `trailingSlash: true`，`BASE_PATH=/Game-site-kit`

| 字段 | 结果 |
|---|---|
| **测试配置** | `trailingSlash: true`, `BASE_PATH=/Game-site-kit`（模拟 project Pages 子路径） |
| **Exit Code** | **0**（build 约 52s） |
| **Static Export** | **成功** |
| **导出结构** | 与场景 A 相同（相对 `out/` 根）；**非** `out/Game-site-kit/...` 物理前缀 |
| **资源与内链** | `/_next/...` → **`/Game-site-kit/_next/...`**；导航 **`/Game-site-kit/blog/`** 等 — **basePath 注入正确** |
| **Canonical / OG** | 仍为 `https://tailwind-nextjs-starter-blog.vercel.app/` 与 `.../blog/` — **未含 `/Game-site-kit`** |
| **Sitemap `<loc>`** | 仍为 `https://tailwind-nextjs-starter-blog.vercel.app/blog` — **无 basePath、无尾斜杠策略与 A 相同** |
| **robots（代码行为）** | `app/robots.ts` 使用 `siteMetadata.siteUrl` — 探针期同样**不会**反映 `BASE_PATH` |
| **子路径一致性** | **不满足**：公开链接与静态资源知悉 basePath，**canonical / sitemap / robots 不知悉** |
| **GitHub Pages** | 若站点挂在 `https://<user>.github.io/Game-site-kit/`，当前 metadata **会指向错误 origin/path** |
| **风险** | 在未改 `siteMetadata` / URL helper 前，**不得**声称子路径 SEO 正确 |

证据：[`batch0-evidence/scenario-c-trailing-true-subpath/summary.json`](batch0-evidence/scenario-c-trailing-true-subpath/summary.json)

---

### 场景 D — URL 与导出文件一致性（横切结论）

| 维度 | 场景 A (`true`) | 场景 B (`false`) | 场景 C (+ basePath) |
|---|---|---|---|
| **App 路由 `/blog`** | 导出 `blog/index.html` | 导出 `blog.html` | 同 A + 内链前缀 `/Game-site-kit` |
| **内链 vs 磁盘** | 内链 `/blog/` ↔ 目录式 | 内链 `/blog` ↔ `blog.html`（**host 依赖**） | 内链含 basePath ↔ 磁盘仍在 `out/blog/...` |
| **Canonical vs 内链** | canonical `/blog/` ↔ href `/blog/` **一致** | canonical `/blog` ↔ href `/blog` **一致** | canonical 无 basePath ↔ href 有 basePath **冲突** |
| **Sitemap vs Canonical** | sitemap `.../blog` vs canonical `.../blog/` **冲突** | sitemap 与 canonical 均为无尾斜杠 **较一致** | sitemap 缺 basePath **冲突** |
| **Sitemap vs 公开 URL（A）** | 用户可能访问 `/blog/`，sitemap 报 `/blog` | 用户可能访问 `/blog`，sitemap 报 `/blog` | sitemap 与可访问 URL **均不可信** |
| **未来 `/hockey-bros`（推断）** | `hockey-bros/index.html` → URL `/hockey-bros/` | `hockey-bros.html` → URL `/hockey-bros`（若 host 支持） | 内链 `/Game-site-kit/hockey-bros/`，canonical 仍可能缺 prefix |
| **ballgames 目标** | **公开 URL 与 canonical 易漂移** | **更接近** `https://ballgames.io/hockey-bros` | 需 `siteUrl()` + `canonicalOrigin` + basePath 策略，**当前未实现** |

**重要说明：** 本批 **未** 添加 `/hockey-bros` 路由；上表对游戏详情路径为基于 Next export 规则的**推断**，非本仓库实测 HTML。

---

## C. 技术方案对比（F1–F4 与 Architecture Review §20 对齐）

| 方案 | 公开 canonical（ballgames 无尾斜杠） | Static export | GitHub Pages | 子路径 `BASE_PATH` | Sitemap 一致 | 多 SiteInstance 可迁移 |
|---|---|---|---|---|---|---|
| **F2** 保持 `trailingSlash: true` | **差**（实测 canonical/内链带尾斜杠；sitemap 混用） | **好**（本次 build PASS） | **较匹配**目录式 export | 需 URL helper 修 canonical/sitemap（当前**未**修） | **差** | 仅换 `canonicalOrigin` **不够** |
| **F1** `trailingSlash: false` | **较好**（实测 B 下 canonical/内链无尾斜杠） | **好**（本次 build PASS） | **待 host 实测** clean URL | 同上，必须统一 helper | **较好** | **推荐**配合 `siteUrl()` |
| **F3** 部署层 redirect | 可强制无尾斜杠 | 依赖 F1 或 F2 产物 | **超出**当前纯 GHPages workflow | 可处理 apex/子路径 | 可补 301 | 运维成本 + ADR 0005 |
| **F4** 仅 SEO 层无尾斜杠 | metadata 可写无尾斜杠 | 任意 | 地址栏仍可能 `/path/` | 不解决 basePath | **仍差** | **不推荐**为最终态 |

**ballgames 生产目标：** apex `https://ballgames.io`（非本仓库 Pages 子路径）；Kit 实例仍须支持 **其他** SiteInstance 的 `BASE_PATH` 部署（CI 已启用）。

---

## D. 推荐方案

### 1. 推荐 URL 策略（调查结论，**Pending User Approval**）

**优先采用 F1：** 将正式 `next.config.js` 的 `trailingSlash` 设为 **`false`**，并保留 `output: 'export'` + 现有 Pages workflow；在 **Phase 3 Batch 1+** 用 **`siteUrl()` / `gameUrl()`** 统一 canonical、sitemap、OG、JSON-LD 与（在策略明确后）内链。

**不建议**长期维持 F2 + F4（当前正式配置方向）。

**若 F1 在目标 GitHub Pages / 自定义域上 clean URL 实测 FAIL：** 再立项 **F3**（Cloudflare/Workers、非 Pages 托管等），而非长期依赖带尾斜杠公开 URL + 无尾斜杠 canonical 双轨。

### 2. 推荐理由（证据摘要）

- 场景 **B** 在**同一 build** 下 canonical、OG、主导航 href 与 sitemap 对 `/blog` 等路径 **均无尾斜杠**，与 ballgames §2 / ADR **`urlPathStyle: 'no-trailing-slash'`** 一致。
- 场景 **A** 明确出现 **canonical `/blog/`**、**sitemap `.../blog`**、**href `/blog/`** 混用 — 与 DEC-003-E 风险描述一致，**不能**靠「只改 metadata 字符串」消除公开 URL 漂移。
- 场景 **C** 证明：**仅** `BASE_PATH` 不足以 SEO；必须 **`canonicalOrigin` + helper + sitemap/robots 消费 helper**（Phase 3 范围，本批未做）。

### 3. 需修改的正式配置（实施时，**Pending User Approval**）

| 变更 | 目的 |
|---|---|
| `next.config.js` → `trailingSlash: false` | 导出 `*.html`、内链与 ballgames canonical 对齐 |
| `data/siteMetadata.js` / SiteInstance → ballgames origin | 消除 starter 域名 |
| `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, RSS 等 → `siteUrl()` | 单一 URL 事实源 |
| （可选）Pages `BASE_PATH` 与 ballgames apex 策略 | 生产 ballgames 可能 **无** basePath；CI 子路径仅 Kit 验证实例 |

### 4. 对架构的影响

- DEC-003-A–D **不变**；Batch 1 可并行推进 SiteInstance 与 helper，**但**内链与 export 行为在 `trailingSlash` 批准前不得宣称「生产 URL 已对齐」。
- ACM-010（配置 vs 产品 canonical）在 F1 批准并落地前仍为 **Open**。
- Phase 3 验收须增加：**host 级**或 **CI 部署预览** 对 `/`、`/hockey-bros`（Phase 4 路由后）的 HTTP 检查。

### 5. 潜在风险

- F1 + GHPages：`/blog` 是否解析到 `blog.html` **未 live 实测** — 批准 F1 后应在 Pages 预览 URL 记录 HTTP。
- Windows + contentlayer 警告仍存在；探针在 Node 18 下三次 export **均成功**。
- `headers()` / CSP 在 export 下 **不生效**（build stderr 已警告）— 与 ADR 0005 一致，非 DEC-003-E 范围。
- 探针使用 Node **18**，CI 使用 **20** — 建议在 Batch 3 用 Node 20 复跑 export 作为回归。

### 6. 是否建议批准 DEC-003-E？

| 问题 | 状态 |
|---|---|
| DEC-003-E **调查**（E-1） | **已完成**（本报告 + §20 只读调查 + 本次 build 实测） |
| DEC-003-E **实施方案**（F1/F2/F3 选型） | **建议用户批准 F1** — 标记 **`Pending User Approval`** |
| 是否修改 ADR Status | **否**（本任务禁止） |

**Agent 建议措辞（供用户决策）：**  
「基于 HEAD `7bdc5f7` 的三次 CI 等价 static export 实测，建议批准将正式 `trailingSlash` 调整为 `false`（F1），并在 Phase 3 以 `siteUrl()` 统一 SEO URL；批准前建议在 GitHub Pages 预览对 `/blog` 与根路径做一次 HTTP 复核。」

---

## E. 决策状态

| 项 | 状态 |
|---|---|
| F1 `trailingSlash: false` | **Pending User Approval** |
| F2 维持 `trailingSlash: true` | **Pending User Approval**（不推荐） |
| F3 部署 redirect / 换托管 | **Pending User Approval** |
| F4 仅 metadata 无尾斜杠 | **Pending User Approval**（不推荐） |
| ADR 0003 DEC-003-E 文档状态 | **未改**（仍为 Investigation recorded / 实施方案未批准） |
| Batch 1 启动 | **未授权** |

---

## F. Batch 0 完成核对

| 完成标准 | 状态 |
|---|---|
| 真实环境基线 | **PASS** |
| 必要技术探针（A/B/C + D 横切） | **PASS** |
| 实际构建产物证据 | **PASS**（`batch0-evidence/`） |
| URL 方案比较 | **PASS** |
| 明确技术建议 | **PASS**（F1 推荐，**Pending User Approval**） |
| 无未经批准的正式配置变更 | **PASS**（`next.config.js` SHA256 恢复） |

**本批次结束 — 不进入 Batch 1。**

---

## 附录：恢复与文件清单

| 文件 | 作用 |
|---|---|
| `scripts/probe/batch0-export-url-probe.mjs` | 隔离探针 runner |
| `docs/agent/reports/batch0-evidence/**` | 各场景 `summary.json` + `manifest.json` |
| `next.config.js` | 探针前后 SHA256: `7e2aeb991f1a3c7f53488800cf6b981010eebffa71a4c1b893b1ca37354db115` |

**未提交变更（探针交付物）：** `scripts/probe/`、`docs/agent/reports/batch0-evidence/`、本报告。
