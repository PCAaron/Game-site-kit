# ADR 0004：ballgames Launcher 与 Embed 安全策略

- **Status：** **Accepted**（策略原则）；生产 iframe 启用仍 **MANUAL REVIEW**（证据 + CSP）
- **Date：** 2026-11-02（修订 2026-11-06）
- **Decision owner：** Game Site Kit 维护者

## Context

项目治理默认使用新标签页打开第三方游戏；iframe 需要许可、CSP 和明确的安全决策。ballgames R1 作为实例覆盖，要求首页单 iframe、详情页 iframe、卡片换源、8 秒 UX 回退以及新窗口 fallback。

当前仓库：

- Launcher / PlayFrame 组件 **Phase 4.3+**；
- CSP `frame-src` 只允许 `giscus.app`；
- `X-Frame-Options: DENY` 只限制 **本站被嵌入**（与目标站 `frame-ancestors` 不同）；
- 静态导出部署没有仓库内可验证的响应头配置；
- Embed 许可与 CSP 部署验证仍为 MANUAL REVIEW。

**用户确认：** 相关官方平台 **支持** iframe 内嵌（维度 A）。**不得**由此自动认定：生产 CSP 已配置、所有 URL 可嵌入、商业许可已 granted。

## Decision

建议保留 ballgames Spec 的 iframe **产品**行为，并区分 **Catalog 可读**、**页面展示**、**生产 iframe 启用** 三层门禁：

### 1. Launch modes（Game Launch Capability — 与 Site Archetype 独立）

| Mode | 行为 |
|---|---|
| `iframe-official` | 优先 iframe；**始终**提供新窗口打开 |
| `iframe-provider` | 同上 |
| `external-link` | 新窗口打开；**不**要求 EmbedPermission 记录 |
| `hosted` | 本站托管资源 |

同一 `game-portal` 站点可混用多种 mode。

### 2. EmbedPermission（可选记录 + 条件校验）

- EmbedPermission **不是**每个 Game 的强制字段。
- 显式引用 `embedPermissionId` 时：须可解析、关联正确；**granted** 须有 `permissionBasis`；`evidenceUrl` / `reviewedAt` 在需要审计依据时填写。
- **生产 iframe**（`isProductionEmbedAllowed` 等价逻辑）仅当：
  - launch 为 iframe 模式且 URL 已 verified；
  - `EmbedPermission.status === "granted"` 且与 `primaryUrl` 等匹配；
  - 部署侧 CSP **`frame-src`** 已验证（`cspFrameSrcVerified === true` 表示部署记录，**不能**由 status 推断）。
- `unknown`、`requested`、`denied` **均不得**解释为 granted。
- **无** EmbedPermission 时：仍允许 **展示** Catalog 与 **external-link**；**不**自动禁止 `published`（若 launch 已核实）。

### 3. 三维度验证（勿混为一谈）

| 维度 | 内容 |
|---|---|
| A | 官方是否提供 iframe / 技术嵌入（已确认支持 — 见 Context） |
| B | 当前 URL 在 ballgames.io 是否可嵌入（目标 `X-Frame-Options` / `frame-ancestors` + 本站 `frame-src` + 浏览器行为） |
| C | 商业使用许可范围 |

A **不**推出 B 或 C 已满足。

### 4. 浏览器与 Launcher 现实边界

1. `X-Frame-Options` / CSP `frame-ancestors` 可能阻止第三方 iframe。
2. 父页面通常 **无法**读取跨域 iframe 内部状态。
3. iframe `load` **不能**证明游戏已成功运行；`error` **不能**覆盖全部失败场景。
4. fetch/HEAD **不能**证明 URL 一定可被 iframe 嵌入。
5. **8s timeout** = 尚未确认可用的 UX 兜底，**非**精确失败检测。
6. 若支持 postMessage ready handshake，**可**用于就绪；否则 **不得**将 load 当作 ready。
7. 始终提供 `target="_blank"`、`rel="noopener noreferrer"` 回退；timeout 时清晰提示 + 新窗口操作。
8. `fallbackUrls` 可选；无独立 fallback 时是否复用 `primaryUrl` 由安全与业务规则在实例 Spec 中明确。

### 5. 本站与目标站 CSP

- **本站 `frame-src`：** 控制允许加载哪些 iframe 来源。
- **目标站 `frame-ancestors` / XFO：** 控制允许哪些站点嵌入 **该** URL。

### 6. 其他

- 保持本站 `X-Frame-Options: DENY` 或等价 `frame-ancestors` 保护，除非另有需求。
- ballgames R1 不添加 iframe `sandbox` 与 `loading="lazy"`（实例例外，非 Kit 默认）。
- 源失效时 `/hockey-bros` 保持 200、正文与回退，不因 availability 自动删页。

## Alternatives

### A. 无条件按实例 URL 启用 iframe

- 评估：不推荐。

### B. 只允许外链

- 评估：未获许可时的降级；**不能**作为唯一产品方案（实例需 iframe UX）。

### C. 许可 + CSP gate + 外链回退

- 评估：**推荐**（生产 iframe）；Catalog/展示层与 gate **解耦**。

### D. 重新托管第三方游戏

- 评估：不在范围。

## Consequences

### Positive

- 不为适配模板而删除 R1 iframe 产品行为。
- 许可与 CSP 成为可验证数据与部署记录，而非注释。
- Launcher 失败仍有用户可用回退；Spec 不承诺不可能的检测精度。

### Negative

- 生产 iframe 在许可与 CSP 确认前不能宣称可上线。
- 多游戏换源需要各 source 独立核实；provider 级 **不能**无限推断。

## Related Specs

- `specs/phases/04.1-catalog-architecture-alignment.md`
- `lib/catalog/README.md`
- `AGENTS.md`
- `specs/00-project-charter.md`
- `specs/01-site-archetypes.md`
- `specs/04-config-and-content-models.md`
- `specs/ballgames/ballgames-specs-v1.md` §2、§3、§5、§6、§7.1
- `docs/architecture/architecture-consistency-review.md`

## Approval Required

策略原则 **Accepted**；仍须人工提供：

- 各 `primaryUrl` 的 embed 与商业使用证据（维度 B/C）；
- 生产域名与部署后 CSP、实际 iframe 行为证据。
