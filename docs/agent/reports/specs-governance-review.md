# Game Site Kit — Specs Governance Review

- **审计日期：** 2026-11-09
- **审计类型：** 只读审计 + P0 文档补丁（CON-01）
- **当前阶段（审计时）：** Phase 4.1.3 **DONE**；Phase 4.2 **NOT STARTED**
- **相关补丁：** [`docs/agent/STATUS.md`](../STATUS.md)、[`specs/phases/04.1-catalog-architecture-alignment.md`](../../specs/phases/04.1-catalog-architecture-alignment.md)、[`specs/README.md`](../../specs/README.md)、[`AGENTS.md`](../../AGENTS.md)

---

## 1. Executive Summary

**[Verified Fact]** 仓库已形成「章程 → 架构/SEO 契约 → 实例产品 Spec → Phase Spec → ADR → STATUS/WORKLOG → 代码 README」链条；Phase 4 主 Spec 将 R1 拆为 4.0–4.7 批次，4.1 系列已在代码与验证脚本中落地。

**[Conflict]（已 P0 修补）** Phase 4.2 定义曾在 `STATUS` 与 `04.1` 状态表中误写为「Portal Home / Game Detail UI」，与 [`specs/phases/04-ballgames-r1.md`](../../specs/phases/04-ballgames-r1.md) §13 Batch **4.2 = Route / Metadata Integration** 冲突。

**[Verified Fact]** Phase 4.2 代码起点：`lib/seo/routes.ts` 中 `/hockey-bros` 的 `isAppRoutePath` 仍为 **false**；`app/[slug]` 详情路由未实现。

**[Recommendation]** **可以进入 Phase 4.2**；批次权威以主 Spec §13 + [`specs/README.md`](../../specs/README.md) Phase 4.2 读取清单为准。

**三问结论（§12）：** 无技术契约阻塞；**不需要**目录大迁移；**可以**用索引 + 最小上下文清单支撑 4.2。

---

## 2. 当前 Specs 文档地图

| 文件路径 | 文档类型 | 核心职责 | 权威/状态 | 维护建议 |
|---|---|---|---|---|
| `AGENTS.md` | Agent | 入口、纪律 | Active | 保留；Phase 4 子批次见 §13 |
| `specs/00-project-charter.md` | Charter | 愿景、非目标 | Active | 保留 |
| `specs/architecture/01-system-overview.md` | Architecture | 逻辑域 validated/proposed | Active | 与 STATUS 同步 |
| `specs/01-site-archetypes.md` | Architecture | page_type、Launcher | Proposed | 保留 |
| `specs/04-config-and-content-models.md` | Architecture | Catalog/Detail 契约 | Proposed | 保留 |
| `specs/seo/01`–`05` | Architecture | SEO 策略表 | Proposed | 保留 |
| `specs/ballgames/ballgames-specs-v1.md` | Instance | R1 产品权威 | Active | 保留路径 |
| `specs/instances/ballgames/README.md` | Instance | 实例索引 | Active | 更新实现状态（P1） |
| `specs/phases/00`–`03` | Phase | 已完成阶段 | Completed | 按需读 |
| `specs/phases/04-ballgames-r1.md` | Phase | **R1 批次 §13 权威** | Active | 保留 |
| `specs/phases/04.1-catalog-architecture-alignment.md` | Phase | Catalog 4.1 冻结 | Active | 已修 4.2 行 |
| `docs/agent/STATUS.md` | Agent | 进度、阻塞 | Active | 已修下一步 |
| `docs/agent/WORKLOG.md` | Agent | 验证证据 | Active | 读相关条目 |
| `docs/agent/decisions/0001`–`0005` | Decision | ADR | Active | 保留 |
| `docs/agent/reports/*` | Agent | 审计报告 | 混合 | 保留 |
| `docs/architecture/architecture-conflict-matrix.md` | Reference | ACM | 部分过时 | P1 顶栏状态 |
| `docs/game-site-kit-seo-architecture-and-template-iteration-guide.md` | Reference | 长文路线 | Reference | 不替代 phases |
| `docs/game-site-kit-agent-ready-spec.md` | Reference | 理想目录 | Historical | P2 superseded |
| `lib/catalog/README.md` | Code-Contract | Adapter、校验 | Active | 实现权威 |
| `.agents/skills/template-audit/` | Skill | 模板审计 | Active | 非 phase 任务不用 |

**[Gap]** 审计前无 `specs/README.md` — 已新增最小索引。

---

## 3. 文档职责边界审计（摘要）

- **Charter：** 合格，无阶段实现细节。
- **Architecture：** Kit vs Instance 在 Phase 2.2 / `04-config` 已分层；冲突矩阵顶栏仍写「实现未完成」（P1）。
- **Instance：** 产品 Spec 在 `specs/ballgames/`；索引在 `instances/ballgames/` — 路径分裂但职责清晰。
- **Phase：** 主 Spec 过长；§4.2 节标题「内容与 Catalog」与 Batch 4.2 编号易混（P1 改名）。
- **Agent：** WORKLOG 过长；STATUS 曾为 4.2 范围唯一错误入口（已修）。

---

## 4. 重复规则清单（高影响节选）

| ID | 主题 | 建议权威 | 引用方式 |
|---|---|---|---|
| DUP-01 | published ≠ indexable、Catalog 分层 | `04.1` + `lib/catalog/README` | Phase 链到 §4–5 |
| DUP-02 | R1 exact-two sitemap | ballgames §4.1 + Phase 4 §10 | seo/04 通用 predicate |
| DUP-03 | Archetype vs Launch mode | `04.1` §8 | archetypes 能力目录 |
| DUP-04 | siteUrl/gameUrl | ballgames §2 + `lib/urls` | 验收 grep |
| DUP-05 | lib/seo 集成点 | Phase 4 §6.1 | Phase 3 标机制已完成 |
| DUP-06 | TDK/正文 | **仅** ballgames-specs-v1 | 禁止 Phase 复制 |

---

## 5. 规范冲突清单

| ID | 冲突 | 状态 | 阻塞 4.2？ |
|---|---|---|---|
| **CON-01** | 4.2 = Route vs UI（STATUS/4.1 vs 主 Spec §13） | **P0 已修** | 否（若读主 Spec） |
| **CON-02** | instance README「实现 not started」vs Catalog DONE | Open（P1） | 否 |
| **CON-03** | 冲突矩阵顶栏过时 | Open（P1） | 否 |
| **CON-04** | agent-ready 首站 car-soccer | Open（P2） | 否 |
| **CON-05** | ACM-004 vs Phase 4 R1 单 publicationStatus | 已策略化 | 否 |
| **CON-06** | SEO 01 `/car-soccer` page_type（ACM-001） | R3 | 否 |

---

## 6. 规范缺失清单

| ID | 缺失 | 优先级 | 状态 |
|---|---|---|---|
| GAP-01 | `specs/README.md` | P1 | **已增最小版** |
| GAP-02 | `04.2-route-metadata.md` 独立子 Spec | P1 | 未建 |
| GAP-03 | Architecture/Instance 边界单页 | P1 | 未建 |
| GAP-04 | 优先级成文（AGENTS） | P1 | **已补 Phase 4 §13 句** |
| GAP-05 | `decisions/README.md` | P2 | 未建 |

---

## 7. 推荐目标目录结构

不强制迁移。短期：**索引 + 子批次 Spec 增量**；长期：`instances/ballgames/` 拆分产品 Spec（P2）。

详见审计会话完整 §7；原则为职责单一、权威明确，不以减少文件数为目。

---

## 8. 规范优先级与引用机制

1. 治理与安全 — `AGENTS.md`、Charter  
2. 用户授权 + STATUS（进度，非替代批次范围表）  
3. 实例产品 — `ballgames-specs-v1`  
4. Kit — `04-config`、`seo/*`、`01-site-archetypes`  
5. Phase — **`04-ballgames-r1.md` §13 为 Phase 4.x 批次权威**  
6. ADR — `docs/agent/decisions/`  
7. 代码 README — `lib/catalog/README` 等  
8. WORKLOG / reports — 证据  
9. Skills — 方法，不扩大范围  

实例 product 覆盖 Kit 默认；安全、许可、禁止虚构 structured data **不可**覆盖。

---

## 9. Phase 4.2 最小上下文读取清单

**范围：** `app/[slug]`、`isAppRoutePath`、production descriptors、metadata resolver、`generateStaticParams`；静态详情 **仅 hockey-bros**。  
**不含：** Homepage UI、GameCard/Grid、PlayFrame/Launcher、详情正文、sitemap/JSON-LD 生产集成（4.5–4.6）。

完整表格与读取顺序见 [`specs/README.md`](../../specs/README.md)「Phase 4.2 最小读取清单」。

---

## 10. P0 / P1 / P2 优化清单

### P0（本落盘已执行）

- P0-1：统一 Phase 4.2 定义 — `STATUS.md`、`04.1` 状态表、`04.1` §11  
- P0-2：任务 Prompt 须写明 Out of Scope — 见 `specs/README.md`

### P1（建议）

- `instances/ballgames/README` 实现状态  
- 冲突矩阵顶栏  
- `specs/phases/04.2-route-metadata.md`  
- 主 Spec §4.2 节标题改名  

### P2

- 目录迁移、Legacy 文档 superseded、ADR 索引 CI  

---

## 11. 迁移风险与兼容策略

- 不移动 `ballgames-specs-v1` 路径，避免断链。  
- 新文档只增；历史 WORKLOG 不改。  
- 不为减篇幅删除 §7.5、Embed 门禁、exact-two 约束。  

---

## 12. 最终建议

1. **阻塞 4.2？** 无技术契约阻塞；CON-01 已文档修补。  
2. **4.2 前调目录？** 不需要；最小调整为 P0 补丁 + `specs/README.md`。  
3. **不调目录能否推进？** 能 — 用 README 读取清单 + 主 Spec §13。  

---

## 附录：证据索引

- `lib/seo/routes.ts` — `isAppRoutePath('/hockey-bros')` → false  
- `specs/phases/04-ballgames-r1.md` §13 — Batch 4.2 定义  
- `docs/agent/STATUS.md` — Phase 4.1.3 DONE、4.1 FROZEN  
