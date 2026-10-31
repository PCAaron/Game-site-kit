# Tailwind Nextjs Starter Blog — 模板基线审计

> **审计日期：** 2026-10-31  
> **审计类型：** 只读（未改依赖、未改内容管线、未实现三类站点原型）  
> **架构参考：** [`docs/game-site-kit-seo-architecture-and-template-iteration-guide.md`](../../game-site-kit-seo-architecture-and-template-iteration-guide.md)  
> **约束：** 以实际仓库检出为准；未执行的检查不得记为通过。

---

## 1. 基线版本（Baseline Revision）

| 项 | 值 |
|---|---|
| **Game Site Kit 基线 commit** | `723499bf9e590b398ed888cffc834a9c54274d00` |
| **Git describe** | `v2.4.0-9-g723499b` |
| **`package.json` version** | `2.4.0`（仍沿用上游包名 `tailwind-nextjs-starter-blog`） |
| **上游模板** | [timlrx/tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) |
| **上游 tag `v2.4.0`** | `de6326a9d8701cdca5907cf2d8822b92c93fb3d4` |
| **与上游 tag 的共同祖先** | `de6326a`（历史包含 tag 之后至 `b45bef6` 等的依赖更新合并） |
| **远程** | `origin` / `pcaaron` → `https://github.com/PCAaron/Game-site-kit.git` |
| **Game Site Kit 专属 commit** | `0e3908d`（初始化文档与少量 layout 调整）、`723499b`（Windows 构建脚本、`typecheck`、Agent 状态文件） |

**相对上游 `v2.4.0` 的 intentional 代码/工程变更（不含仅文档）：**

- `scripts/next-with-init-cwd.mjs`：`INIT_CWD` 设为项目根，替代 `cross-env INIT_CWD=$PWD`（Windows 兼容）。
- `package.json`：`dev` / `build` 走上述脚本；新增 `typecheck`。
- `eslint.config.mjs`：对启动脚本放宽 TS project 解析。
- `layouts/AuthorLayout.tsx`、`ListLayout.tsx`、`ListLayoutWithTags.tsx`：小幅类型/布局修正（`0e3908d`）。
- `AGENTS.md` 及项目文档（路径随仓库演进；本次审计以 `723499b` 树内代码为准）。

**目标三类站点（尚未实现，仅记录差距）：** `game-portal`、`game-wiki`、`embedded-game` — 见 SEO 架构指南第 2 节；当前仓库仍为博客信息架构。

---

## 2. 包管理与运行环境

| 项 | 实测 / 检出 |
|---|---|
| **包管理器** | Yarn **3.6.1**（`packageManager` + `.yarn/releases/yarn-3.6.1.cjs`） |
| **nodeLinker** | `node-modules`（`.yarnrc.yml`） |
| **锁文件** | `yarn.lock`（无 npm/pnpm 锁） |
| **`engines`** | `package.json` **未声明** |
| **Dev Container** | Node **20** 镜像（`.devcontainer/devcontainer.json`） |
| **CI（GitHub Pages）** | Node **20**，`yarn` + `EXPORT=1` + `UNOPTIMIZED=1` + `BASE_PATH` |
| **本机审计环境** | Node **v22.14.0**，Yarn **3.6.1**，Windows |

**脚本（`package.json`）：**

| 脚本 | 命令 | 说明 |
|---|---|---|
| `dev` | `node ./scripts/next-with-init-cwd.mjs dev` | 开发服务器 |
| `build` | `next-with-init-cwd build` + `postbuild.mjs`（RSS） | 生产构建 |
| `typecheck` | `tsc --noEmit` | 类型检查 |
| `lint` | `next lint --fix`（多目录） | ESLint；Next 16 将弃用 `next lint` |
| `start` | `next start` | 未包装 `INIT_CWD` |
| `serve` | 同 `start` | |
| `analyze` | bundle analyzer | |
| **test** | **不存在** | 无单元/e2e 脚本 |

---

## 3. 技术栈与目录职责

| 类别 | 版本/工具 |
|---|---|
| Next.js | **15.5.12**（App Router + RSC） |
| React | **19.2.4** |
| Tailwind CSS | **4.1.18**（PostCSS + typography/forms） |
| 内容 | **contentlayer2** 0.5.8 + **next-contentlayer2** |
| 工具库 | **pliny** 0.4.1（分析、评论、Newsletter、搜索、MDX 插件） |
| TypeScript | **5.9.3**（`strict: false`，`strictNullChecks: true`） |

```
app/           # 路由、layout、seo 端点、newsletter API
components/    # UI、MDX、Image、Search、Header/Footer
layouts/       # 博客/列表/作者布局
data/          # siteMetadata、MDX 内容、导航与 projects 数据
public/        # 静态资源；构建写入 search.json、feed.xml
css/           # tailwind + prism
scripts/       # next-with-init-cwd、postbuild、rss
contentlayer.config.ts
next.config.js
```

**不存在：** 顶层 `lib/`、独立 `content/` 目录（内容在 `data/`）、`specs/`（AGENTS.md 引用但仓库未含）。

---

## 4. App 路由与布局

| 路由 | 文件 | 行为 |
|---|---|---|
| `/` | `app/page.tsx` → `Main.tsx` | 最新 5 篇博客摘要 |
| `/blog/` | `app/blog/page.tsx` + 分页 | 列表 + 标签侧栏 |
| `/blog/[...slug]/` | `app/blog/[...slug]/page.tsx` | SSG；JSON-LD；可选 PostLayout |
| `/tags/`、`/tags/[tag]/` | 标签索引与分页 | SSG |
| `/projects/` | `data/projectsData.ts` | 静态项目卡片 |
| `/about/` | `authors/default.mdx` | 作者页 |
| `/api/newsletter` | `pliny/newsletter` | 标记 `force-static`；export 场景下无运行时 |
| `robots.txt` | `app/robots.ts` | allow `/` + sitemap URL |
| `sitemap.xml` | `app/sitemap.ts` | 静态路由 + 非 draft 文章 |

**Next 配置要点（`next.config.js`）：** `trailingSlash: true`；可选 `output: 'export'`（`EXPORT`）、`basePath`（`BASE_PATH`）、图片 `unoptimized`（`UNOPTIMIZED`）；全局 **CSP** 与 **X-Frame-Options: DENY**。

---

## 5. Markdown / MDX 内容管线（须保留）

```
data/blog/**/*.mdx, data/authors/**/*.mdx
        ↓
contentlayer.config.ts（Blog / Authors + remark/rehype 链）
        ↓
.contentlayer/generated
        ↓
├── 页面：generateStaticParams + MDXLayoutRenderer
├── onSuccess → app/tag-data.json
├── onSuccess → public/search.json（kbar）
└── postbuild → scripts/rss.mjs → feed.xml（及按 tag 的 RSS）
```

**Blog 字段：** `title`, `date`, `tags`, `summary`, `draft`, `layout`, `images`, `authors`, `bibliography`, **`canonicalUrl`**（schema 存在）。

**MDX 插件：** remark GFM / math / alerts / pliny 插件；rehype slug、autolink、KaTeX、citation、Prism、minify。

**布局：** `PostLayout`（默认）、`PostSimple`、`PostBanner`。

---

## 6. SEO、Canonical、结构化数据

| 能力 | 位置 | 现状 | 演进注意（对照 SEO 指南） |
|---|---|---|---|
| **metadataBase** | `app/layout.tsx` | `new URL(siteMetadata.siteUrl)` | 实例须独立 `siteUrl` |
| **title / description** | layout + `app/seo.tsx` + 文章 metadata | 已实现 | 按页面类型拆分规则 |
| **canonical** | layout `alternates.canonical: './'`；标签页 `./` | 相对 canonical | 文章 **`canonicalUrl` 未接入 `generateMetadata`** |
| **Open Graph / Twitter** | layout、`genPageMetadata`、文章页 | website / article | 需品牌图与 per-type 规则 |
| **robots** | layout metadata + `robots.ts` | index/follow | staging 需环境策略 |
| **sitemap** | `app/sitemap.ts` | `''`, `blog`, `projects`, `tags` + 文章 | 游戏站新路由需扩展；`lastmod` 对静态路由用“当天” |
| **RSS** | `scripts/rss.mjs` | `feed.xml` + `/tags/{tag}/feed.xml` | 可选保留 |
| **JSON-LD** | `contentlayer.config.ts` → 文章页 `<script type="application/ld+json">` | **BlogPosting** | 无 WebSite/VideoGame/FAQPage；`url` 为 `${siteUrl}/${flattenedPath}` |
| **siteUrl** | `data/siteMetadata.js` | 仍指向 **模板演示域名** | 未改则 sitemap/OG/canonical 全站错误 |

**分析 / 评论（默认配置仍指向可启用项，非“已启用”）：**

- `siteMetadata.analytics.umamiAnalytics` — 需 `NEXT_UMAMI_ID` + CSP 域名。
- `siteMetadata.comments.provider: 'giscus'` — 需 `.env`；`Comments.tsx` 懒加载。
- `siteMetadata.newsletter.provider: 'buttondown'` — 需 API key；与静态 export 冲突。

根 layout 已挂载 `<Analytics />` 与 `<SearchProvider />`（kbar）；**未配置 env 时通常无有效追踪 ID**，但 CSP 仍预留 `analytics.umami.is`。

---

## 7. 图片与静态资源

- **`components/Image.tsx`：** 为 `next/image` 的 `src` 前缀 `BASE_PATH`。
- **`next.config.js`：** `remotePatterns` 含 `picsum.photos`；export 时常用 `UNOPTIMIZED=1`。
- **`public/static/`：** favicon、演示图（上线前应替换；许可见下文）。
- **构建产物：** `public/search.json`、RSS；`.contentlayer/` gitignore。

---

## 8. 安全与嵌入（与 `embedded-game` 相关）

| 项 | 现状 |
|---|---|
| CSP `frame-src` | 仅 `giscus.app` |
| `X-Frame-Options` | **DENY**（本站不可被 iframe 嵌入） |
| 第三方游戏 iframe | **未白名单**；与 AGENTS「默认新标签页 Play、未核实不 iframe」一致 |
| `connect-src` | `*`（较宽） |

静态 export 时 **`headers()` 不生效**，CSP 需在 CDN/边缘重写。

---

## 9. 可复用能力 vs 需改造（摘要）

**可直接复用（经 build 验证的内容/SEO 基础设施）：**

- contentlayer2 MDX 管线与 `onSuccess` 索引
- `app/seo.tsx`、`sitemap.ts`、`robots.ts`
- RSS postbuild、`components/Image.tsx`、`MDXComponents`、文章 layouts
- 主题切换、Kbar 搜索、Tailwind 主题入口
- `next.config.js` 的 export/basePath 模式
- MIT `LICENSE` 与工程配置（ESLint/TS/Yarn）

**需为 Game Site Kit / 站点实例改造（不在本次实施）：**

- `data/siteMetadata.js`、导航、首页与路由结构
- 演示 MDX / 图片 / favicon
- sitemap 与 metadata 覆盖新页面类型
- 文章 `canonicalUrl` 接入；JSON-LD 类型扩展
- CSP / frame 策略（若将来允许嵌入）
- 关闭或隔离 newsletter/comments/analytics（按实例 feature flags）

---

## 10. 兼容性与维护风险

| 级别 | 风险 | 说明 |
|---|---|---|
| P0（已缓解） | Windows `INIT_CWD` | `723499b` 已修复；`yarn start` 仍直接用 `next` |
| P1 | contentlayer2 on Windows | 构建警告仍存在；建议 Linux CI 为主 |
| P1 | 无 automated test | 回归依赖 lint/typecheck/build |
| P1 | `canonicalUrl` 未用 |  frontmatter 无效 |
| P1 | 模板 `siteUrl` | SEO 输出指向错误域名 |
| P1 | 静态 export | API route、headers、部分 pliny 功能受限 |
| P1 | iframe / CSP | 嵌入游戏前须显式策略与许可 |
| P2 | React 19 / Next 15 | 当前 lint/tsc/build 通过 |
| P2 | `next lint` 弃用 | 需迁移 ESLint CLI |
| P2 | `strict: false` | 重构期类型漏洞 |
| P2 | pliny 耦合 | 多站抽象时需边界层 |

---

## 11. 许可与第三方（摘要）

- 模板：**MIT**（保留 `LICENSE`）。
- 字体：**Space Grotesk** via `next/font/google`（OFL）。
- 演示图片 / `google.png` / 远程 picsum：**不宜用于生产**；须替换并记录许可（见原 `docs/audit/phase-1-template-audit.md` 第 5 节细节，仍适用）。

---

## 12. 验证结果（2026-10-31，本机 Windows）

| 命令 | 退出码 | 结果 | 备注 |
|---|---|---|---|
| `node -v` | 0 | v22.14.0 | |
| `yarn -v` | 0 | 3.6.1 | |
| `yarn typecheck` | 0 | **PASS** | 无输出 |
| `yarn lint` | 0 | **PASS** | 提示 `next lint` 将弃用 |
| `yarn build` | 0 | **PASS** | 60 静态页；Contentlayer Windows 警告；RSS 生成成功 |
| `yarn dev` | — | **PASS** | Ready ~9.2s；3000 占用时使用 **3001** |
| `yarn test` | — | **N/A** | 脚本不存在 |

**未在本轮执行：** `EXPORT=1` 静态导出全量验证、`yarn analyze`、Playwright/e2e。

---

## 13. 与目标架构的对照（只读结论）

| 领域 | 基线现状 |
|---|---|
| **Platform** | 单博客实例；无站点实例配置层 |
| **SEO Foundation** | 博客型 sitemap/metadata/JSON-LD 可用；缺页面策略表、per-archetype 规则 |
| **Content System** | 单一 `Blog` 文档类型；无游戏/Wiki 模型 |
| **Site Archetypes** | **未实现** |
| **Monetization** | 无广告；分析/评论配置存在但未强制关闭于代码层 |
| **Agent QA** | 有 lint/typecheck/build；无 test；`specs/` 缺失 |

---

## 14. 相关文档

- 决策记录：[`docs/agent/decisions/0001-template-baseline.md`](../decisions/0001-template-baseline.md)
- 项目状态：[`docs/agent/STATUS.md`](../STATUS.md)
- 历史审计（`723499b` 树内）：`docs/audit/phase-1-template-audit.md`（内容已收敛至本文；路径以当前分支为准）

---

**审计结论：** 基线为 **上游 Tailwind Nextjs Starter Blog v2.4.0  lineage + commit `723499b`**。内容 MDX 管线与核心 SEO 端点可复用；站点形态仍为博客，距 `game-portal` / `game-wiki` / `embedded-game` 需后续阶段按 SEO 指南扩展，且 **不得**在未审计前提下替换 contentlayer 管线或批量升级依赖。
