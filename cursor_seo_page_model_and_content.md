# SEO page model and content
_Exported on 10/31/2026 at 14:58:10 GMT+8 from Cursor (3.27.22)_

---

**User**

@c:\Users\KSO\.cursor\projects\d-Person-Game-Site-Kit\agent-transcripts\e4635365-b1b2-4118-9820-efbb699ef9b0\e4635365-b1b2-4118-9820-efbb699ef9b0.jsonl 继续Phase 2 — SEO 页面模型与内容契约

---

**Cursor**

继续 Phase 2 前，先读取项目状态、阶段 Spec 与上一轮对话记录。


正在建立 Phase 2 的 Kit 级 SEO 契约，并与 `ballgames-specs-v1.md` 对齐；随后更新 `STATUS`、`AGENTS` 与 `WORKLOG`。


## Phase 2 完成报告

已按 SEO 指南 §19 与 [上一轮 Phase 1 会话](e4635365-b1b2-4118-9820-efbb699ef9b0) 的约定，补齐 **SEO 页面模型与内容契约**（**仅文档**，未改 `package.json` 与应用代码）。`docs/agent/STATUS.md` 已从旧的「Car Soccer 单站」表述同步为 **ballgames.io · game-portal** 路线。

### 文档分层

| 层级 | 作用 |
|---|---|
| **Kit** | 可复用的 portal 页面类型、逻辑实体、URL/索引/sitemap/metadata/内链规则 |
| **实例** | 已有 [`specs/ballgames/ballgames-specs-v1.md`](specs/ballgames/ballgames-specs-v1.md) 承载 P0 冻结 TDK、英文正文、Launcher、DoD |

二者关系见 [`specs/instances/ballgames/README.md`](specs/instances/ballgames/README.md)。实例 Spec 顶部已加 Kit 引用；**索引 / sitemap / 禁止编造 structured data** 以 Kit 为准，**P0 文案与字数** 以实例 Spec 为准。

### 新建文件

- [`specs/phases/02-seo-page-model-and-content-contract.md`](specs/phases/02-seo-page-model-and-content-contract.md) — 阶段范围与验收
- [`specs/01-site-archetypes.md`](specs/01-site-archetypes.md) — 三类原型页面类型（portal 详、wiki/embedded 纲要）
- [`specs/04-config-and-content-models.md`](specs/04-config-and-content-models.md) — `Game` / `LaunchConfig` / `Provider` / `Category`（**proposed**）
- [`specs/seo/01-search-intent-and-page-types.md`](specs/seo/01-search-intent-and-page-types.md) — 含 P0 策略表（`/`、`/hockey-bros`）
- [`specs/seo/02-url-canonical-indexing.md`](specs/seo/02-url-canonical-indexing.md) — canonical、noindex、`/search` 屏蔽
- [`specs/seo/03-metadata-structured-data.md`](specs/seo/03-metadata-structured-data.md) — 按 `page_type` 的 metadata / JSON-LD
- [`specs/seo/04-internal-linking-sitemap.md`](specs/seo/04-internal-linking-sitemap.md) — 内链图与 sitemap 条件（P0 仅 2 URL）
- [`specs/seo/05-content-quality-and-validation.md`](specs/seo/05-content-quality-and-validation.md) — 发布门槛 + 指向实例 DoD
- [`specs/instances/ballgames/README.md`](specs/instances/ballgames/README.md)

### 已更新

- [`AGENTS.md`](AGENTS.md) — Phase 2 Spec 路径
- [`docs/agent/STATUS.md`](docs/agent/STATUS.md) — 当前 Phase 3 **not started**，Phase 2 **completed**
- [`docs/agent/WORKLOG.md`](docs/agent/WORKLOG.md)、[`specs/architecture/01-system-overview.md`](specs/architecture/01-system-overview.md)、[`specs/phases/01-agent-workflow-foundation.md`](specs/phases/01-agent-workflow-foundation.md)

### 设计要点（便于 Phase 3/4）

1. **`indexable` 默认 false**，且 `published && indexable` 才进 sitemap（与 ballgames §2 一致）。
2. **`/search` 永不索引**；tags 不出页；分类需 **≥12 游戏 + ≥600 词** 才发布。
3. **iframe** 作为 ballgames 实例决策，与 AGENTS「默认新标签页」并存：须 `Provider.embedPermission` + 依据。
4. **游戏源失效仍 200 + 正文**（实例规则 8），与 Kit 404 默认并存时按实例优先。

### 验证

| 项 | 结果 |
|---|---|
| 12 个引用路径存在 | **PASS** |
| `git diff` 无 package/应用代码 | **PASS** |
| `yarn build` | **N/A**（文档任务，未重跑） |

### 需人工决策（不阻塞 Phase 3 准备）

- 生产 `https://ballgames.io` 与 canonical
- Hockey Bros **embed 许可** 书面记录
- P0 上线前对 `/`、`/hockey-bros` 的 **`indexable` 人工放行**

### 建议下一步

**Phase 3 — 最小 SEO Foundation**（§20）：在代码中落实 `siteUrl`、canonical、robots/indexable 与 sitemap 过滤，对齐 [`specs/seo/02`](specs/seo/02-url-canonical-indexing.md)、[`specs/seo/04`](specs/seo/04-internal-linking-sitemap.md)。

若要继续 Phase 3，直接说明即可；若要先把 Phase 2 文档提交到 Git，也可以说一声我帮你写 commit message。

