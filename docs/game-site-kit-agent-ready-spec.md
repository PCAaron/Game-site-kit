# Game Site Kit：面向编程 Agent 的工程规范

> 版本：Agent-Ready Spec v1.0  
> 基础方案：`game-site-kit-build-guide.md`  
> 适用工具：Cursor 优先，同时尽量兼容支持 `AGENTS.md` / Agent Skills 的其他编码 Agent。  
> 核心原则：一次只推进一个阶段；规则、任务、执行流程和验收彼此分离；所有完成声明必须有实际证据。

## 1. 目标与设计原则

本规范是在现有 Game Site Kit 方案上增加 Agent 工程层，不推翻原有技术路线和 8 阶段建设顺序。

目标是使 Agent 能够：

1. 理解项目愿景、技术边界、当前阶段和禁止事项。
2. 按标准工作流执行审计、开发、重构、迁移、测试和发布准备。
3. 在动手前列出计划、文件范围、风险与验证方式。
4. 根据自动化检查和阶段验收标准判断是否完成，而不是仅凭“代码已生成”。
5. 在新对话或切换编码 Agent 后，通过仓库内的文件恢复上下文。
6. 通过配置和公共模块创建第二个游戏站，而不是复制整个项目再全局替换。

### 1.1 保留原方案的产品边界

- 先完成 `car-soccer.top` 游戏介绍与攻略站，再抽象可复用模块，最后验证第二个不同类型的站点。
- 默认通过新标签页打开原始游戏；只有确认运营方允许且实际测试通过后，才考虑 iframe。
- 不开发、反编译或重新托管原始游戏。
- 不默认复制第三方商标、Logo、图片、游戏资源或文本；使用前核实许可。
- 广告和分析默认关闭。
- 不在第一阶段建设用户系统、计费、权限管理或完整 SaaS 后台。
- 不将多个完整开源模板直接合并；先审计、选择单一主底座，再按需借鉴其他项目。

### 1.2 工程原则

- **仓库是上下文来源**：不能依赖某一次对话的历史记忆。
- **单一事实来源**：技术约束、任务范围和验收标准只维护一份权威版本。
- **小步变更**：先列计划，再改代码；一轮聚焦一个阶段或一个可验证子任务。
- **先验证再扩展**：当前阶段未通过，不自动进入下一阶段。
- **证据优先**：没有执行的测试不能报告为通过；人工核验项不能伪装成自动验证。
- **能脚本化就脚本化**：重复且确定的检查应落入脚本或 CI，而不是只留在提示词里。
- **可移植优先**：通用约束和工作流放到 `AGENTS.md`、`specs/`、`.agents/skills/`；Cursor 专属体验再放到 `.cursor/`。

## 2. Agent 文件的职责边界

| 文件类别 | 推荐位置 | 主要职责 | 不应该承担的职责 |
|---|---|---|---|
| 项目总规约 | `AGENTS.md` | 项目目标、关键边界、开始任务前必须读取的文件、通用执行纪律 | 大段技术细节、每阶段全部步骤 |
| Cursor 工程规则 | `.cursor/rules/*.mdc` | Cursor 中持续适用或按文件范围生效的技术规则 | 重复写完整任务流程 |
| Agent Skills | `.agents/skills/<skill-name>/SKILL.md` | 可重复执行的多步骤流程、工作方法、输入输出和注意事项 | 定义本次需求的最终范围或代替测试 |
| 阶段 Spec | `specs/phases/*.md` | 任务目标、前置条件、范围、产出、验收条件和风险 | 提供一套没有验收标准的泛化提示词 |
| 质量规范 | `specs/quality/*.md` | 跨阶段的验收标准、发布阻断项、人工检查项 | 取代实际 lint / typecheck / build / test |
| 架构决策 | `specs/decisions/ADR-*.md` | 记录重要选型、背景、备选方案和后果 | 记录每个小改动 |
| Agent 状态 | `docs/agent/STATUS.md` | 当前阶段、最近通过的门禁、阻塞项、下一步建议 | 作为代码实现或测试结果的唯一证据 |
| 执行日志 | `docs/agent/WORKLOG.md` | 记录阶段性实际修改、命令和检查结果 | 无证据地写“全部通过” |
| Cursor 自定义命令 | `.cursor/commands/*.md` | 便捷触发常见操作，降低反复输入提示词成本 | 存放唯一版本的工程规则 |
| 自动化脚本 | `scripts/`、`package.json`、CI | 对配置、链接、内容字段、构建和发布前事项执行确定性检查 | 试图自动证明素材授权或内容事实真实性 |

**不要重复维护同一份说明。** 例如，`AGENTS.md` 只要求 Agent 阅读当前阶段 Spec；具体怎么完成模板审计则写在 Skill；需要审计哪些文件和风险则写在对应 Phase Spec。

## 3. 建议项目目录

第一阶段不必一次性创建所有目录。此结构是目标结构，按阶段逐步加入。

```text
game-site-kit/
├── AGENTS.md
├── .cursor/
│   ├── rules/
│   │   ├── 10-nextjs-typescript.mdc
│   │   ├── 20-content-and-seo.mdc
│   │   ├── 30-security-and-assets.mdc
│   │   └── 40-testing-and-release.mdc
│   └── commands/
│       ├── start-current-phase.md
│       ├── verify-current-phase.md
│       └── review-changes.md
├── .agents/
│   └── skills/
│       ├── template-audit/SKILL.md
│       ├── single-game-site/SKILL.md
│       ├── site-config-schema/SKILL.md
│       ├── extract-shared-modules/SKILL.md
│       ├── monorepo-migration/SKILL.md
│       ├── validate-second-site/SKILL.md
│       ├── site-tooling/SKILL.md
│       └── release-audit/SKILL.md
├── specs/
│   ├── 00-project-charter.md
│   ├── architecture/
│   │   ├── target-architecture.md
│   │   ├── site-config-schema.md
│   │   └── content-models.md
│   ├── phases/
│   │   ├── phase-01-template-audit.md
│   │   ├── phase-02-single-site.md
│   │   ├── phase-03-config-schema.md
│   │   ├── phase-04-shared-modules.md
│   │   ├── phase-05-monorepo.md
│   │   ├── phase-06-second-site.md
│   │   ├── phase-07-cli-tooling.md
│   │   └── phase-08-release.md
│   ├── quality/
│   │   ├── acceptance-checklist.md
│   │   ├── seo-checklist.md
│   │   ├── accessibility-checklist.md
│   │   └── asset-license-checklist.md
│   └── decisions/
│       ├── ADR-0001-template-selection.md
│       └── ADR-0002-static-rendering-strategy.md
├── docs/
│   └── agent/
│       ├── STATUS.md
│       └── WORKLOG.md
├── apps/                  # 到 Monorepo 阶段再引入
├── packages/              # 只在确认共享价值后逐步引入
├── templates/             # 有第二站复用验证后再完善
├── scripts/               # 从阶段 7 开始加入校验工具
└── README.md
```

### 3.1 规模控制

- 不要一开始创建几十条 `.mdc` 规则。先保持 4 条左右的主题规则，每条只负责清晰的约束领域。
- 不要把 8 阶段全部复制成 8 份长提示词。使用 Phase Spec 定义任务，Skill 定义操作流程。
- 不要把尚未使用的 `packages/`、模板类型或工具包提前建成空壳。
- `.cursor/commands/` 属于便捷入口，可后续增加；若直接使用 Skills 已足够，不必为了目录完整而创建命令。
- 规则、Spec、Skill 有冲突时，停止扩展变更，指出冲突并以人工确认后的决策为准；不要自行选择一个版本悄悄继续。

## 4. 根目录 `AGENTS.md` 建议模板

将以下内容保存为仓库根目录的 `AGENTS.md`。保持它短小、稳定，主要负责调度 Agent 阅读其他规范。

```markdown
# Game Site Kit — Agent Instructions

## Project Goal
Build a maintainable game-information and guide site for Car Soccer first, then validate the reusable site kit with a second, materially different game site.

## Required Context Before Changes
1. Read `specs/00-project-charter.md`.
2. Read `docs/agent/STATUS.md` if it exists.
3. Read the Spec for the requested phase in `specs/phases/`.
4. Read the matching workflow in `.agents/skills/` when available.
5. Inspect the actual repository and package scripts; do not assume paths, versions, scripts, or dependencies.

## Operating Rules
- Before editing, report the intended scope, files likely to change, risks, and validation commands.
- Work only on the requested phase or explicitly approved subtask. Do not silently start later phases.
- Preserve existing user changes. Never discard unrelated changes or rewrite history.
- Prefer the current template's working patterns and dependencies before introducing replacements.
- Do not copy or merge multiple complete starter templates.
- Do not invent game facts, assets, permissions, URLs, test results, or deployment status.
- The default Play behavior is to open the configured original game URL in a new tab. Do not enable iframe embedding without verified permission and a real test.
- Keep ads and analytics disabled unless explicitly configured for the target site.
- Keep each site's brand, content, canonical URL, launch URL, and feature flags isolated by configuration.
- Do not remove license notices or reuse third-party assets without a recorded license/permission review.
- Prefer deterministic validation scripts for repeatable checks. Do not claim a command passed unless it was actually run and its exit status was checked.

## Completion Protocol
1. Run relevant available checks and report exact commands and outcomes.
2. Separate automated PASS, FAIL, and MANUAL REVIEW items.
3. List files changed, unresolved risks, and required human decisions.
4. Update `docs/agent/STATUS.md` and `docs/agent/WORKLOG.md` when a phase milestone is completed.
5. Do not mark a phase complete when a blocking acceptance criterion fails or has not been checked.
```

## 5. Cursor 专属规则模板

`AGENTS.md` 存放通用项目指令；`.cursor/rules/*.mdc` 只增加 Cursor 专属的作用域控制和更细的工程约束。每条规则需要清楚说明适用范围，避免默认把大量上下文塞入每次对话。

### 5.1 Next.js / TypeScript 规则

文件：`.cursor/rules/10-nextjs-typescript.mdc`

```markdown
---
description: Rules for Next.js App Router, React, and TypeScript implementation.
globs: "app/**/*.{ts,tsx},components/**/*.{ts,tsx},lib/**/*.ts,src/**/*.{ts,tsx}"
alwaysApply: false
---

- Follow the patterns and versions already present in the repository; inspect before changing dependencies.
- Prefer Server Components unless client-side interactivity is required.
- Keep route-specific content separate from reusable UI.
- Use typed configuration and explicit props; avoid site-specific values hardcoded in shared components.
- Preserve accessible semantic HTML, keyboard operation, visible focus states, and responsive layouts.
- Do not add a dependency for a feature that can be implemented safely with existing project capabilities.
- Before changing routing, metadata, static export, image handling, or content loading, identify the affected routes and validate the production build.
```

### 5.2 内容和 SEO 规则

文件：`.cursor/rules/20-content-and-seo.mdc`

```markdown
---
description: Rules for game guides, MDX content, routing, metadata, and technical SEO.
globs: "content/**/*,data/**/*,app/**/page.*,app/**/layout.*,lib/seo/**/*,public/**/*"
alwaysApply: false
---

- Do not fabricate controls, game modes, compatibility, platform support, or gameplay facts.
- Mark illustrative or unverified content clearly; do not present placeholders as factual guidance.
- Keep title, description, canonical, Open Graph metadata, and sitemap URL consistent with the active site's configuration.
- Exclude drafts and non-indexable pages from the public sitemap.
- Verify internal links, slugs, image paths, and configured base URLs.
- Structured data must reflect visible and verified page content.
- Do not create near-duplicate pages by replacing only game names or keywords.
```

### 5.3 安全和第三方素材规则

文件：`.cursor/rules/30-security-and-assets.mdc`

```markdown
---
description: Security and licensing rules for game launch URLs, embeds, assets, and third-party scripts.
globs: "**/*.{ts,tsx,js,jsx,json,md,mdx,svg,html}"
alwaysApply: false
---

- Validate configured launch URLs and allow only approved HTTPS destinations unless an exception is documented.
- Never send arbitrary user-provided URLs directly to iframe src or window.open.
- Use target="_blank" with rel="noopener noreferrer" for external links opened in a new tab.
- Treat third-party iframe embedding as disabled unless permission and compatibility are explicitly verified.
- Do not download, rehost, reverse engineer, or modify the original game as part of the information-site scope.
- Do not add analytics, advertising, remote scripts, or tracking pixels without an explicit per-site configuration.
- Preserve LICENSE and copyright notices; record unresolved asset/license checks as MANUAL REVIEW.
```

### 5.4 测试和发布规则

文件：`.cursor/rules/40-testing-and-release.mdc`

```markdown
---
description: Validation and release requirements for changes to game sites.
globs: "**/*"
alwaysApply: false
---

- Inspect package.json and the lockfile to identify the actual package manager and available checks.
- Run the relevant existing lint, typecheck, test, and production build commands; never invent command names.
- Test the changed behavior and inspect the diff for unrelated or destructive changes.
- Report automated results separately from browser/manual checks and external-system checks.
- For UI work, check narrow mobile, tablet, and desktop widths; report actual viewport checks performed.
- Before release, verify canonical URLs, sitemap, robots, Play behavior, image loading, broken links, and old template/demo content.
- Do not claim deployment, indexing, permission, or license verification without evidence from the relevant system or reviewer.
```

> 说明：规则中的 `globs` 应根据实际模板目录调整。若模板不是上述目录结构，不要直接照搬路径；先审计仓库后再校准。

## 6. Agent Skills：把工作流变成可复用能力

Skills 应描述“遇到这类任务时按什么步骤做”，而不是重新抄写整套项目规则。建议每个 Skill 保持单一职责，引用对应 Spec 作为任务范围和验收标准。

### 6.1 Skill 清单与原方案阶段映射

| Skill | 对应阶段 | 主要输入 | 主要输出 |
|---|---:|---|---|
| `template-audit` | 1 | 已克隆的开源模板 | 架构审计报告、风险、运行结果 |
| `single-game-site` | 2 | 通过审计的模板、Phase 2 Spec | Car Soccer 页面与 Play 功能 |
| `site-config-schema` | 3 | 可运行的单站 | 类型化站点配置和内容校验 |
| `extract-shared-modules` | 4 | 已验证的重复能力 | 去除游戏专属硬编码的公共模块 |
| `monorepo-migration` | 5 | 已稳定的单站和模块 | 可独立构建的 workspace 结构 |
| `validate-second-site` | 6 | 公共模块与模板 | 不同类型的第二站和复用验证报告 |
| `site-tooling` | 7 | 两个可构建的站点 | create / validate / build 工具及测试 |
| `release-audit` | 8 | 目标站点及真实环境配置 | PASS / FAIL / MANUAL REVIEW 发布报告 |

### 6.2 Skill 文件示例

文件：`.agents/skills/template-audit/SKILL.md`

```markdown
---
name: template-audit
description: Audit an existing Next.js starter template before adapting it into Game Site Kit. Use when onboarding a new template or diagnosing its current architecture, licensing, build, content system, and SEO support.
---

# Template Audit

## Required inputs
- Repository root
- `specs/00-project-charter.md`
- `specs/phases/phase-01-template-audit.md`

## Procedure
1. Inspect the repository without editing files.
2. Identify package manager, runtime/framework versions, scripts, lockfiles, and configuration files.
3. Inspect LICENSE, dependency licensing notes, bundled images, fonts, icons, and demo content.
4. Map routing, layouts, components, data/content loading, and public assets.
5. Trace metadata, canonical, robots, sitemap, Open Graph, and static rendering/export behavior.
6. Run only the existing safe install/dev/build checks that are feasible in the current environment. Record commands and exit outcomes exactly.
7. Compare findings with the Phase 1 acceptance criteria.
8. Write the audit report and list unresolved human-review items.

## Constraints
- Do not modify source files during the audit phase.
- Do not upgrade dependencies or refactor architecture.
- Do not assume a license, game-embed permission, or asset permission based on appearance.
- Separate verified facts, inferred risks, and unanswered questions.

## Output
- Architecture summary
- Actual package/runtime/tooling versions
- Commands attempted and results
- Reusable / modify / remove / add file groups
- SEO and content-system findings
- License and asset review list
- Blocking risks and Phase 1 PASS / FAIL / MANUAL REVIEW status
```

### 6.3 Skill 实施要求

每个 Skill 都应包含：

- **When to use**：什么情形触发。
- **Required inputs**：开始前必须读取哪些 Spec、状态或文件。
- **Preconditions**：未满足哪些条件时不能继续。
- **Procedure**：清晰、可执行的步骤。
- **Constraints**：不可越过的边界。
- **Validation**：使用哪些实际可用的检查。
- **Output**：报告、代码、文件或状态更新的格式。
- **Failure path**：检查失败、信息缺失或遇到授权问题时如何停下并报告。

## 7. 阶段 Spec：每个开发阶段都要有验收合约

将现有指南中的每阶段 Cursor 提示词改造为可供不同 Agent 读取的 Spec。提示词只是触发方式，Spec 才是任务范围和验收的权威来源。

### 7.1 推荐的阶段 Spec 模板

```markdown
# Phase NN — <阶段名称>

- Status: Draft | Ready | In Progress | Blocked | Accepted
- Owner: Human + Coding Agent

## Objective
本阶段唯一需要解决的问题。

## Preconditions
必须已完成的阶段、文件、环境或授权核验。

## Inputs
需要读取的配置、现有代码、内容和参考资料。

## In Scope
本阶段允许新增、修改或删除的功能和文件范围。

## Out of Scope
明确不做的事项，尤其是后续阶段的工作。

## Deliverables
要求交付的代码、文档、报告和测试。

## Procedure
1. 先审查现状。
2. 提交变更计划和风险。
3. 分批实施。
4. 执行验证并检查 diff。
5. 更新报告和状态。

## Acceptance Criteria
- [ ] 可验证的条件一
- [ ] 可验证的条件二
- [ ] 所有阻断项都已解决，或清楚标记为未通过

## Validation
列出从 package.json / CI / 实际环境核实过的命令；不要猜测脚本。

## Manual Review
列出需要人类确认的内容事实、商标/素材许可、嵌入许可、生产域名或外部服务事项。

## Completion Report
- Changed files
- Commands actually run and outcomes
- PASS / FAIL / MANUAL REVIEW
- Open risks and human decisions
- Recommended next phase (do not start it automatically)
```

### 7.2 8 阶段的具体门禁

#### Phase 1：模板审计

- 门禁：开发环境启动与生产构建已实际验证，或失败原因已记录并形成修复决策。
- 必须确认：包管理器、依赖版本、路由、内容系统、SEO 能力、静态导出兼容性、许可证与素材待审项。
- 本阶段禁止：业务改造、升级依赖、直接重构目录。

#### Phase 2：完成 Car Soccer 单站

- 门禁：首页、How to Play、Controls、Guides、FAQ、About、Privacy、Contact 等计划页面可访问；Play 行为正确；响应式与主要内链经检查。
- 禁止：直接构建多站 Monorepo、真实广告接入、虚构游戏信息。

#### Phase 3：配置和内容模型

- 门禁：站点名称、域名、主题、游戏外链、导航和功能开关由集中配置控制；内容必填字段、slug 与 URL 可校验。
- 禁止：为尚未证明的需求引入数据库或完整 CMS。

#### Phase 4：提取公共模块

- 门禁：公共组件不硬编码 Car Soccer 品牌、域名或私有资源；回归检查通过。
- 原则：只抽取真实复用的模块，不为了目录整齐拆出大量空包。

#### Phase 5：Monorepo

- 门禁：当前站迁移前后路由、资源、SEO URL 和构建结果得到核对；各 app 可独立构建。
- 禁止：一次性迁移全部架构而不分批验证。

#### Phase 6：第二站验证

- 门禁：第二站有不同主题、内容、配置和游戏目标；两站的 canonical、sitemap、资源和 Play 地址互不串站。
- 判断标准：新增站点主要通过配置、内容和主题完成，而非复制整站源代码。

#### Phase 7：脚手架与校验工具

- 门禁：`create-site`、`validate-site`、`build-site` 的实际命令和测试存在；能检测非法配置或重复 slug，并能单独构建指定站点。
- 注意：在脚本实现之前，文档中的命令只是规划，不得声称可执行。

#### Phase 8：发布验收

- 门禁：构建、页面、Play、SEO、响应式、无障碍、资源、域名和许可证待办均有明确结果。
- 发布状态必须区分：PASS、FAIL、MANUAL REVIEW。
- 不允许 Agent 自行推断生产部署成功、搜索引擎已索引或素材已获授权。

## 8. Agent 状态与跨会话续接

### 8.1 `docs/agent/STATUS.md`

建议维护以下内容：

```markdown
# Agent Project Status

- Current phase: Phase 1 — Template Audit
- Phase status: In Progress
- Last updated: YYYY-MM-DD
- Current branch: <actual branch, if verified>

## Accepted phases
- None

## Current blockers
- To be filled with verified blockers only

## Last verified checks
| Command | Result | Notes |
|---|---|---|
| <actual command> | PASS / FAIL / NOT RUN | <actual evidence> |

## Next approved action
- Complete Phase 1 audit and present the gate report.

## Human decisions required
- List decisions requiring approval; otherwise write `None known`.
```

Agent 不得填入未经实际检查的分支、命令结果或日期。阶段通过后应更新状态，但状态文件不能取代原始测试输出、CI 结果或审查记录。

### 8.2 `docs/agent/WORKLOG.md`

每个重要里程碑追加一段：日期、对应阶段、修改摘要、实际运行命令、结果、剩余问题及人类决策。不要把每次微小文件编辑都写成流水账。

### 8.3 新对话 / 切换 Agent 时的续接规则

Agent 每次开始任务时，都应重新读取 `AGENTS.md`、`STATUS.md` 和当前阶段 Spec。不能只依赖上一轮聊天里的“已完成”描述。若代码现状与状态文件不一致，以实际仓库和可验证测试为准，并先修复状态记录。

## 9. Cursor 自定义命令：只做快捷入口

自定义命令是 Cursor 的可选体验层，不应成为唯一保存业务知识的地方。可从三个命令开始：

### `/start-current-phase`

文件：`.cursor/commands/start-current-phase.md`

```markdown
Read `AGENTS.md`, `docs/agent/STATUS.md`, `specs/00-project-charter.md`, and the Spec for the current approved phase.

Before editing, report:
1. Current phase and its preconditions.
2. Repository facts actually inspected.
3. Proposed file changes and why.
4. Risks, unresolved assumptions, and validation commands.

Then implement only the current approved phase. Do not advance to the next phase automatically.
```

### `/verify-current-phase`

文件：`.cursor/commands/verify-current-phase.md`

```markdown
Read the current phase Spec and its acceptance criteria.

Inspect the current diff, identify the actual available validation scripts, and run relevant checks when safe and feasible. Do not invent commands or results.

Return a table with PASS / FAIL / MANUAL REVIEW, the evidence for each item, the changed files, blockers, and required human decisions. Do not mark the phase accepted if a blocking criterion is unverified.
```

### `/review-changes`

文件：`.cursor/commands/review-changes.md`

```markdown
Review the current working-tree diff for correctness, scope creep, regressions, security issues, accessibility, SEO, licensing risks, and site-specific hardcoding.

Do not edit files unless asked. Report findings by severity, cite exact file paths/lines where possible, and distinguish confirmed defects from risks that need manual review.
```

若更偏好跨工具复用，优先维护 `.agents/skills/` 中的工作流，将命令保留为短小的 Cursor 调用入口；不要在 Skill 和 Command 中分别复制完整的业务流程。

## 10. 建议的人机协作协议

### Agent 负责

- 读取规范并检查真实仓库状态。
- 提出变更计划，按阶段实现代码和文档。
- 运行可执行的检查，提供命令与结果。
- 维护状态、工作日志、技术决策记录。
- 标注不确定内容、阻塞项和需要人工核验的项目。

### 人类负责

- 批准阶段边界和高风险架构变更。
- 确认游戏事实、内容质量、商标与素材许可、嵌入权限。
- 提供域名、生产凭证和第三方服务配置；密钥不应写入 Agent Spec。
- 审核广告、分析、隐私和生产发布决定。
- 根据阶段门禁决定是否进入下一阶段。

### 不应交给 Agent 自行决定的事项

- 是否有权复制第三方素材或嵌入原游戏。
- 是否可以删除用户已有改动或执行破坏性操作。
- 是否启用真实广告、追踪或收集额外用户数据。
- 是否将未通过的阶段标记为完成。
- 是否把演示内容、猜测和占位 URL 当成真实产品事实。

## 11. 实施路线：先建立最小可用 Agent 系统

建议不要在项目第一天就生成所有 Agent 文件后再尝试一次性执行。

### 第一步：为现有指南补上任务契约

1. 建立 `AGENTS.md`。
2. 把原指南的 8 个阶段分别拆成 `specs/phases/phase-01` 至 `phase-08`。
3. 增加 `specs/00-project-charter.md`、`specs/quality/acceptance-checklist.md`、`docs/agent/STATUS.md`。
4. 先使用人工审查和真实构建结果验证这些文件是否清楚、可执行。

### 第二步：先实现三个高价值 Skills

优先建立：

1. `template-audit`：防止 Agent 一上来就改代码。
2. `single-game-site`：标准化第一个站点的实施步骤。
3. `release-audit`：建立可复用的验证与报告能力。

其余 Skills 在相应阶段开始时创建或细化，避免没有真实使用经验便过度设计流程。

### 第三步：增加少量 Cursor 规则和命令

- 配置 3–4 条职责明确的 `.mdc` 规则。
- 根据实际使用频率增加 `/start-current-phase`、`/verify-current-phase` 等快捷命令。
- 检查规则触发范围是否正确，避免每轮对话都加载大量与任务无关的约束。

### 第四步：把可重复检查转为自动化

等内容模型、站点配置和构建方式稳定后，再将 URL、slug、canonical、站点 ID、功能开关和独立构建检查写进 `scripts/` 与 CI。

### 第五步：通过第二站检验 Agent 体系

创建一个不同类型的示例站，检验 Agent 是否只需要新站配置、内容、主题和必要的专属组件即可完成开发。如果每个站仍需要复制公共代码或频繁修改全局规则，就说明抽象边界或 Agent 说明还不够清晰。

## 12. Game Site Kit Agent-Ready 完成定义

只有满足以下条件，才算完成 Agent-Ready v1：

- [ ] 新 Agent 能通过 `AGENTS.md`、项目状态和阶段 Spec 恢复上下文，无需依赖历史对话。
- [ ] 8 个阶段均有目标、前置条件、范围、交付物、验收标准和人工审核项。
- [ ] 至少有模板审计、单站实施、发布验收三项可复用 Skills。
- [ ] Cursor 规则精简、分工明确，并在实际路径下触发。
- [ ] Agent 的完成报告区分自动 PASS、FAIL 与 MANUAL REVIEW。
- [ ] 阶段门禁能够阻止未通过的任务被直接标记为完成。
- [ ] 状态文件只记录可核实的事实，工作日志包含实际命令和结果。
- [ ] 第二个不同类型的站可以通过配置与内容验证公共架构，而不是全量复制项目。
- [ ] 确定性检查已逐步落地为脚本或 CI，而不是只依赖提示词。
- [ ] 许可证、第三方素材和游戏嵌入权限的未决事项被明确列出，未被 Agent 当作已通过。

## 13. 官方参考

- Cursor Rules：<https://cursor.com/docs/rules>
- Cursor Agent Skills：<https://cursor.com/docs/skills>
- Cursor Commands：<https://docs.cursor.com/en/agent/chat/commands>
- Agent Skills 目录及使用方式应以所使用的 Agent 当前版本官方文档为准。

---

**推荐落地顺序：`AGENTS.md` → 8 份 Phase Spec → `STATUS.md` / `WORKLOG.md` → 3 个基础 Skills → 少量 `.mdc` 规则 → Cursor Commands → 自动化校验脚本。**
