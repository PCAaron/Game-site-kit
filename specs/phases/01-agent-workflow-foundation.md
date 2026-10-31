# Phase 1 — 建立 Agent 友好工作流基础

- **阶段编号：** 1（对应 SEO 指南 §18）
- **状态：** **completed** / **validated**（2026-10-31）

## 目标

建立一致、可维护、Agent 友好的**文档与工作流基础**；不实现 portal/wiki/embedded 业务功能，不替换 contentlayer，不升级依赖。

## 交付物

| 文件 | 用途 |
|---|---|
| [`AGENTS.md`](../../AGENTS.md) | 工具无关 Agent 入口 |
| [`specs/00-project-charter.md`](../00-project-charter.md) | 项目章程 |
| [`specs/architecture/01-system-overview.md`](../architecture/01-system-overview.md) | 逻辑架构 |
| [`specs/templates/agent-task-template.md`](../templates/agent-task-template.md) | 任务 Spec 模板 |
| [`.cursor/rules/project-workflow.mdc`](../../.cursor/rules/project-workflow.mdc) | Cursor 专属规则 |
| [`docs/agent/STATUS.md`](../../docs/agent/STATUS.md) | 项目状态 |

SEO 指南 §18 中的完整 `specs/` 树为**长期目标**；本阶段只交付上表核心文件，其余阶段在 Phase 2+ 按需增量添加。

## 验收标准

- [x] `AGENTS.md` 指向真实存在的 spec 路径
- [x] 三类 archetype 定义与章程、架构文档一致
- [x] 共享 vs 原型专属职责清晰
- [x] 未将 proposed 架构描述为已实现
- [x] 引用路径存在；无无关代码或依赖变更
- [x] STATUS 标记 Phase 0 completed、Phase 1 结果准确

## 明确不在范围

SEO 实现、内容模型、游戏页、wiki 页、iframe 运行时、广告、依赖升级、Phase 2+ 实施。

## 下一阶段

[`02-seo-page-model-and-content-contract.md`](02-seo-page-model-and-content-contract.md) — **completed**（2026-10-31）。
