# Game Site Kit — Agent 执行指令

## 项目目标（Project Goal）

构建**可复用的游戏站点工程工具包（Site Kit）**，支持三种站点原型：

| 原型 | 说明 |
|---|---|
| `game-portal` | 游戏发现、分类、搜索与 Play 启动（聚合站） |
| `game-wiki` | 结构化攻略与游戏知识 |
| `embedded-game` | 站内 iframe/托管运行时体验 |

**首个验证实例：** `game-portal` · **ballgames.io** 球类游戏盒子（参考 [Poki 球类频道](https://poki.com/zh/%E7%90%83%E7%B1%BB) 的发现/分类体验）。第二个显著不同的站点用于验证 Kit 通用性。

技术基线：Tailwind Nextjs Starter Blog lineage，commit 见 [`docs/agent/STATUS.md`](docs/agent/STATUS.md) 与 [`docs/agent/reports/template-audit.md`](docs/agent/reports/template-audit.md)。

## 执行变更前必须阅读的资料（Required Context）

1. [`specs/00-project-charter.md`](specs/00-project-charter.md) — 愿景、原型、非目标、验收。
2. [`docs/agent/STATUS.md`](docs/agent/STATUS.md) — 当前阶段、基线、阻塞项。
3. **本任务对应的阶段 Spec** — 见下文「如何定位阶段 Spec」。
4. 若涉及架构边界：[`specs/architecture/01-system-overview.md`](specs/architecture/01-system-overview.md)。
5. 若 `.agents/skills/` 存在与任务匹配的工作流，遵循该工作流。
6. 检查 **`package.json` 脚本与依赖**；不得假设路径、版本或命令存在。

**长文参考（不替代阶段 Spec）：** [`docs/game-site-kit-seo-architecture-and-template-iteration-guide.md`](docs/game-site-kit-seo-architecture-and-template-iteration-guide.md)。

## 如何定位阶段 Spec（Phase Spec）

1. 从 STATUS 的 **Current phase** 与用户任务描述确认阶段编号。
2. 打开 [`specs/phases/`](specs/phases/) 下对应文件（命名：`NN-*.md`）。**Phase 4** 的子批次（4.2–4.7）以 [`specs/phases/04-ballgames-r1.md`](specs/phases/04-ballgames-r1.md) **§13** 为权威，勿与本文 Phase 表或其他文档中的「4.2」章节编号混淆。
3. 若目录中尚无该阶段文件，以 SEO 指南「第四部分」同名 Phase 为准，并用 [`specs/templates/agent-task-template.md`](specs/templates/agent-task-template.md) 起草任务 Spec，**勿**跳过章程与 STATUS。Spec 索引与按需阅读见 [`specs/README.md`](specs/README.md)。

| Phase | Spec 文件 | 说明 |
|---|---|---|
| 0 | [`specs/phases/00-template-audit.md`](specs/phases/00-template-audit.md) | 基线审计（已完成） |
| 1 | [`specs/phases/01-agent-workflow-foundation.md`](specs/phases/01-agent-workflow-foundation.md) | Agent 文档骨架 |
| 2 | [`specs/phases/02-seo-page-model-and-content-contract.md`](specs/phases/02-seo-page-model-and-content-contract.md) | SEO 页面模型与内容契约 |
| 3+ | SEO 指南 §20 起 | 后续按需新增 `specs/phases/` 文件 |

## 执行规则（Operating Rules）

- **修改前先汇报计划。** 说明范围、预计文件、风险、验证命令。
- **严格限定任务范围。** 未经授权不得启动后续阶段。
- **保护用户已有的修改。** 不得丢弃无关修改或重写 Git 历史。
- **优先沿用现有模板实现。** 新依赖或替换方案前先复用已验证实现。
- **禁止拼接多个完整 Starter Template。**
- **禁止编造事实。** 不得虚构游戏、URL、测试或许可。
- **默认新标签页 Play；** 未核实许可不得 iframe 嵌入。
- **默认关闭广告与数据分析**（除非目标站点已明确启用）。
- **严格隔离各站点配置**（品牌、canonical、launchUrl、feature flags）。
- **遵守第三方资源许可；** 保留 LICENSE，素材须记录审查。
- **验证须实际执行** 并检查退出码后再声称 PASS。

## 任务完成规范（Completion Protocol）

1. 运行相关验证并报告**准确**结果与命令。
2. 区分 **PASS / FAIL / MANUAL REVIEW**。
3. 列出已改文件、遗留风险、需人工决策项。
4. 阶段里程碑完成时更新 [`docs/agent/STATUS.md`](docs/agent/STATUS.md) 与 [`docs/agent/WORKLOG.md`](docs/agent/WORKLOG.md)。
5. **不得提前宣布阶段完成**（阻塞验收未满足时）。

## 详细规范索引

| 主题 | 位置 |
|---|---|
| 章程与原型 | [`specs/00-project-charter.md`](specs/00-project-charter.md) |
| 逻辑架构与 validated/proposed | [`specs/architecture/01-system-overview.md`](specs/architecture/01-system-overview.md) |
| 任务 Spec 模板 | [`specs/templates/agent-task-template.md`](specs/templates/agent-task-template.md) |
| ADR | [`docs/agent/decisions/`](docs/agent/decisions/) |
| 审计与报告 | [`docs/agent/reports/`](docs/agent/reports/) |
| Cursor 专属 | [`.cursor/rules/project-workflow.mdc`](.cursor/rules/project-workflow.mdc) |
