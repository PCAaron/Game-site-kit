# Agent 任务 Spec 模板

复制本文件并按任务填写。删除说明性括号。

---

## 1. 任务标题与阶段

- **标题：**
- **阶段：** Phase N — （名称）
- **阶段 Spec：** `specs/phases/XX-....md`

## 2. 目标（Objective）

（一句话可验收的结果。）

## 3. 背景与引用（Context）

- **STATUS：** [`docs/agent/STATUS.md`](../../docs/agent/STATUS.md)
- **章程：** [`specs/00-project-charter.md`](../00-project-charter.md)
- **架构：** [`specs/architecture/01-system-overview.md`](../architecture/01-system-overview.md)
- **基线审计：** [`docs/agent/reports/template-audit.md`](../../docs/agent/reports/template-audit.md)（如涉及实现）
- **其他：**

## 4. 范围（In Scope）

-

## 5. 范围外（Out of Scope）

-

## 6. 强制检查（Mandatory Inspection）

实施前必须：

1. 阅读 `AGENTS.md` 与对应阶段 Spec。
2. 检查 `package.json` 脚本与依赖，**不假设**命令存在。
3. 阅读 `docs/agent/STATUS.md` 中的 blockers 与 baseline。
4. 查看 Git 工作区，保留用户无关修改。
5. （任务特定项）

## 7. 实施计划（Implementation Plan）

1.
2.
3.

## 8. 约束（Constraints）

- 不替换 contentlayer 管线（除非 ADR 批准）。
- 不擅自升级框架/依赖。
- 不编造游戏、URL、测试结果或许可。
- Play 默认新标签页；iframe 需许可与 CSP ADR。
- 默认关闭广告与分析（除非本任务明确启用某实例）。

## 9. 验证命令（Validation）

仅使用仓库真实脚本：

| 命令 | 预期 |
|---|---|
| `yarn typecheck` | exit 0 |
| `yarn lint` | exit 0 |
| `yarn build` | exit 0（若任务涉及构建） |
| （其他） | |

文档任务额外检查：引用路径存在、术语与章程一致。

## 10. 验收标准（Acceptance Criteria）

-

## 11. 风险与回滚（Risks & Rollback）

| 风险 | 缓解 / 回滚 |
|---|---|
| | |

## 12. 完成报告（Completion Report）

任务结束时提供：

1. 创建/修改的文件列表
2. **PASS / FAIL / MANUAL REVIEW** 验证项
3. 架构或流程决策摘要
4. 遗留问题与需人工决策项
5. 更新 `docs/agent/STATUS.md` 与 `docs/agent/WORKLOG.md`（若完成阶段里程碑）

**不得**在阻塞验收未满足时宣布阶段完成。
