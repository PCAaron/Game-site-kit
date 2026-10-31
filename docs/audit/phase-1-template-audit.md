# Game Site Kit 仓库审计报告（阶段 1 · 只读）

> **审计日期：** 2026-10-24  
> **审计范围：** 基于 [timlrx/tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) v2.4.0 的当前检出  
> **审计环境：** Node v22.14.0 / Yarn 3.6.1 / Windows  
> **约束：** 未修改任何代码、未升级依赖

---

## 1. 当前架构说明

### 1.1 技术栈概览

| 类别 | 版本/工具 | 说明 |
|------|-----------|------|
| 框架 | Next.js **15.5.12** | App Router + RSC |
| UI | React **19.2.4** | 与 Next 15 配套 |
| 样式 | Tailwind CSS **4.1.18** | `@tailwindcss/postcss` + typography/forms 插件 |
| 内容 | **contentlayer2** 0.5.8 | MDX 编译、类型生成、构建时索引 |
| 工具库 | **pliny** 0.4.1 | 分析、评论、Newsletter、搜索、MDX 插件 |
| 语言 | TypeScript **5.9.3** | `strict: false`，`strictNullChecks: true` |
| 包管理器 | **Yarn 3.6.1** | `packageManager: yarn@3.6.1`，`nodeLinker: node-modules` |
| 锁文件 | `yarn.lock` | 存在且完整；无 `package-lock.json` / `pnpm-lock.yaml` |

**Node 版本要求：** `package.json` 未声明 `engines`。Next.js 15 官方建议 Node ≥ 18.18；当前 v22.14.0 可用。

### 1.2 目录职责

```
Game-Site-Kit/
├── app/              # App Router 路由、根 layout、SEO 端点、API
├── components/       # 通用 UI（Header/Footer/MDX/Image/Search 等）
├── layouts/          # 博客/列表/作者页布局壳
├── data/             # ★ 内容 + 站点配置（无独立 content/ 目录）
├── public/           # 静态资源 + 构建产物（search.json、feed.xml）
├── css/              # Tailwind 入口与 Prism 样式
├── scripts/          # postbuild RSS 生成
├── faq/              # 模板 FAQ 文档
├── docs/             # 项目自建指南
└── .contentlayer/    # 构建生成（gitignore）
```

| 目录 | 职责 | 游戏站适配度 |
|------|------|-------------|
| `app/` | 页面路由：`/`、`/blog`、`/tags`、`/projects`、`/about`；`sitemap.ts`、`robots.ts`；`/api/newsletter` | 需大幅改造首页与路由结构 |
| `components/` | 导航、主题、搜索、MDX 组件、社交图标 | 部分可复用，需新增 Game 相关组件 |
| `layouts/` | `PostLayout` / `ListLayout` / `AuthorLayout` 等 | 攻略页可复用；首页需新 layout |
| `lib/` | **不存在** | 后续可新建共享工具层 |
| `content/` | **不存在** | 内容实际在 `data/` |
| `data/` | `siteMetadata.js`、MDX 文章/作者、`headerNavLinks.ts`、`projectsData.ts` | 核心配置入口，优先改造 |
| `public/static/` | favicon、示例图片（12 张） | 需替换为 Car Soccer 品牌素材 |

### 1.3 内容 / MDX 系统工作流

```
data/blog/*.mdx + data/authors/*.mdx
        ↓
contentlayer.config.ts（defineDocumentType + MDX 插件链）
        ↓
.contentlayer/generated（类型 + 编译后 MDX）
        ↓
├── app/blog/[...slug]/page.tsx（generateStaticParams → SSG）
├── onSuccess → app/tag-data.json
├── onSuccess → public/search.json
└── scripts/rss.mjs（postbuild → feed.xml）
        ↓
layouts + MDXLayoutRenderer 渲染
```

**文档类型：**

- `Blog`：`data/blog/**/*.mdx`，字段含 `title`、`date`、`tags`、`summary`、`draft`、`layout`、`canonicalUrl` 等
- `Authors`：`data/authors/**/*.mdx`

**MDX 管道：** remark（GFM、数学、代码标题、图片转 JSX、GitHub Alert）→ rehype（slug、自动链接、KaTeX、引用、Prism 高亮、压缩）

**路由映射：**

- 文章 URL：`/blog/{slug}/`（`trailingSlash: true`）
- 标签 URL：`/tags/{tag}/`
- 分页：`/blog/page/{n}/`、`/tags/{tag}/page/{n}/`

**布局可选值：** `PostLayout`（默认）、`PostSimple`、`PostBanner`

### 1.4 页面与数据流

- 首页 `app/page.tsx` → `Main.tsx`：展示最新 5 篇博客摘要
- 博客列表 `/blog`：带标签侧栏的分页列表
- 文章页：JSON-LD `BlogPosting` + 可选 layout
- 项目页 `/projects`：读取 `data/projectsData.ts` 静态数组
- 关于页 `/about`：渲染 `authors/default.mdx`

**当前形态：** 个人博客，不是游戏落地页。与 `car-soccer.top` 目标（Play、Controls、Guides、FAQ）差距较大。

### 1.5 构建模式

- **默认：** SSG 为主（60 个静态页面），`/api/newsletter` 标记为 Dynamic
- **静态导出：** 通过 `EXPORT=1` + `UNOPTIMIZED=1` 启用 `output: 'export'`，产物在 `out/`（实测 244 个文件，构建成功）
- **可选：** `BASE_PATH` 子路径部署；`ANALYZE=true` 包分析

---

## 2. 关键依赖与兼容性风险

### 2.1 高风险（P0）

| 风险 | 详情 | 影响 |
|------|------|------|
| **Windows 脚本不兼容** | `dev`/`build` 使用 `cross-env INIT_CWD=$PWD`，在 Windows PowerShell 下报 `Unbound variable "PWD"` | `yarn dev`、`yarn build` **直接失败**；需手动设 `INIT_CWD` 或改脚本 |
| **contentlayer2 + Windows** | 构建时出现 `Contentlayer might not work as expected on Windows` | 开发/CI 在 Windows 上可能有路径或 watch 问题；建议 Linux CI |
| **无 typecheck 脚本** | `package.json` 无 `typecheck` | 需手动 `yarn tsc --noEmit`（本次通过） |

### 2.2 中风险（P1）

| 风险 | 详情 |
|------|------|
| **React 19 + 生态** | 部分第三方库可能未完全适配 React 19；当前 lint/build/tsc 均通过 |
| **Next.js 16 迁移** | `next lint` 已 deprecated，需迁移 ESLint CLI |
| **静态导出限制** | `headers()` CSP、`/api/newsletter`、Newsletter 表单、Giscus 评论、Umami 分析在纯静态托管上不可用或需替代方案 |
| **iframe 游戏嵌入** | `X-Frame-Options: DENY` + CSP `frame-src giscus.app` 禁止本站被嵌入，也未白名单游戏域名 |
| **canonicalUrl 未接入** | schema 有字段，`generateMetadata` 未读取；文章级 canonical 自定义无效 |
| **post canonical 缺失** | 文章 metadata 无 `alternates.canonical`；依赖 layout 默认 `./`，分页/标签页可能不准确 |

### 2.3 低风险 / 需知悉

| 项 | 说明 |
|----|------|
| Tailwind v4 | 使用 `@import 'tailwindcss'` + `@theme`，与 v3 配置方式不同 |
| `strict: false` | TS 严格模式未全开，重构期可能隐藏类型问题 |
| `picsum.photos` | `next.config.js` 允许远程图，示例 MDX 可能引用 |
| pliny 紧耦合 | 分析/评论/搜索/Newsletter 均依赖 pliny，抽象多站时需封装边界 |

### 2.4 命令可执行性（实测）

| 命令 | 结果 | 备注 |
|------|------|------|
| `yarn dev` | ❌ 失败 | `Unbound variable "PWD"` |
| `yarn build` | ❌ 失败 | 同上 |
| `yarn lint` | ✅ 通过 | 无 warning/error；提示 Next 16 将移除 `next lint` |
| `yarn tsc --noEmit` | ✅ 通过 | 非官方脚本 |
| `npx next build`（手动设 `INIT_CWD`） | ✅ 通过 | 60 页 SSG |
| `EXPORT=1 UNOPTIMIZED=1 npx next build` | ✅ 通过 | 静态导出到 `out/` |

---

## 3. SEO 实现现状

| 能力 | 实现位置 | 现状 | 游戏站缺口 |
|------|----------|------|-----------|
| **title** | `app/layout.tsx`、`app/seo.tsx`、各页 metadata | ✅ template `%s \| siteTitle` | 需改为 Car Soccer 品牌 |
| **description** | 同上 + 文章 `summary` | ✅ | 需重写 |
| **canonical** | `layout.tsx` 默认 `./`；标签页有设置 | ⚠️ 部分页面；文章 `canonicalUrl` 字段未用 | 需全站指向 `car-soccer.top` |
| **Open Graph** | layout + `genPageMetadata` + 文章页 | ✅ website/article 类型 | 需游戏截图/品牌图 |
| **Twitter Card** | 同上 | ✅ summary_large_image | 需替换 socialBanner |
| **robots** | `app/robots.ts` | ✅ allow all + sitemap 链接 | 可按环境区分 staging |
| **sitemap** | `app/sitemap.ts` | ✅ 首页/博客/标签/项目 + 文章 | 需加入 Controls/FAQ 等新路由 |
| **JSON-LD** | `contentlayer.config.ts` → 文章页注入 | ✅ BlogPosting | 需 WebSite/VideoGame/FAQPage |
| **RSS** | `scripts/rss.mjs` postbuild | ✅ feed.xml + 标签 RSS | 游戏站可选保留 |
| **metadataBase** | `new URL(siteMetadata.siteUrl)` | ✅ | 当前仍指向模板域名 |

**当前 siteUrl：** `https://tailwind-nextjs-starter-blog.vercel.app` — 必须替换，否则 sitemap/canonical/OG 全部错误。

---

## 4. 静态生成 / 静态导出兼容性

### 4.1 已兼容（SSG / export）

- 所有博客、标签、分页路由（`generateStaticParams`）
- `robots.txt`、`sitemap.xml`（`force-static`）
- RSS 通过 postbuild 写入 `public/` 或 `out/`
- Kbar 本地搜索（`public/search.json` 构建时生成）

### 4.2 静态导出不兼容或需处理

| 功能 | 问题 | 建议 |
|------|------|------|
| `headers()` CSP | 静态 export 不支持自定义 headers | 部署到 CDN 时在边缘配置 CSP |
| `/api/newsletter` | 无 serverless 运行时 | 移除或改第三方表单 |
| Newsletter 组件 | 依赖 API | 默认关闭（`siteMetadata.newsletter.provider`） |
| Giscus 评论 | 客户端嵌入，build 可过但需配置 | 游戏站初期建议关闭 |
| Umami 等分析 | 客户端脚本，需 CSP 白名单 | 按需配置 |
| `next/image` 优化 | export 需 `UNOPTIMIZED=1` 或外部 CDN | 已文档化 |
| 游戏 iframe | CSP `frame-src` 需扩展 | 仅白名单游戏域名 |

---

## 5. 许可与第三方素材

### 5.1 原项目许可（必须保留）

| 项 | 许可 | 要求 |
|----|------|------|
| **tailwind-nextjs-starter-blog** | **MIT** © 2021–2025 Timothy Lin | 保留 `LICENSE` 及版权声明；Footer 已有主题链接，可保留或按 MIT 要求署名 |
| **pliny** | MIT（同作者生态） | 保留依赖声明即可 |
| **contentlayer2** | MIT | 同上 |

### 5.2 字体

| 字体 | 来源 | 许可 |
|------|------|------|
| **Space Grotesk** | `next/font/google` | SIL Open Font License（Google Fonts） |
| Inter | `LayoutWrapper.tsx` 引用但未在根 layout 使用 | 同上 |

### 5.3 图标与 UI 资源

| 资源 | 许可/风险 |
|------|-----------|
| Heroicons SVG（contentlayer 标题链接图标） | MIT |
| 社交图标 `components/social-icons/` | 模板自带，需确认各平台商标使用规范 |
| `data/logo.svg` | 模板 logo，需替换 |
| `public/static/favicons/*` | 模板 favicon，需替换 |

### 5.4 示例图片（应替换，不宜直接用于 car-soccer.top）

Git 跟踪 12 张示例图（Canada 风景、avatar、google.png、twitter-card.png 等）：

- **google.png** — Google 商标，不可用于生产项目展示
- **Canada 系列 / time-machine.jpg 等** — 模板演示素材，版权归属不明，应替换为自有或已授权素材
- **picsum.photos** — 远程占位图服务，仅适合开发

### 5.5 示例 MDX 内容

11 篇博客 + 2 个作者均为模板演示（Tailwind 介绍、数学公式、GitHub Markdown 等），**上线前应全部删除或替换**，避免与 Car Soccer 主题无关的 SEO 噪音。

### 5.6 外部服务（需各自 ToS/隐私合规）

Giscus（GitHub Discussions）、Umami、Buttondown Newsletter、Algolia（可选）— 启用前需配置 `.env` 并更新 CSP。

---

## 6. 文件分类清单

### 6.1 可直接复用

| 路径 | 用途 |
|------|------|
| `contentlayer.config.ts` | MDX 管道、tag 索引、search 索引、JSON-LD 生成 |
| `app/seo.tsx` | 页面 metadata 辅助函数 |
| `app/sitemap.ts`、`app/robots.ts` | SEO 端点（改 siteUrl 后） |
| `scripts/rss.mjs`、`scripts/postbuild.mjs` | RSS 生成 |
| `components/Image.tsx`、`Link.tsx`、`Tag.tsx` | 基础组件 |
| `components/MDXComponents.tsx` | MDX 组件映射 |
| `components/ThemeSwitch.tsx` | 暗色模式 |
| `layouts/PostLayout.tsx` 等 | 攻略/指南文章页 |
| `css/tailwind.css` | 主题色与 typography |
| `next.config.js` | export/basePath/图片/CSP 框架 |
| `.yarnrc.yml`、`yarn.lock` | 包管理配置 |
| `eslint.config.mjs`、`tsconfig.json` | 工程配置 |
| `LICENSE` | MIT 许可文件 |

### 6.2 需要修改

| 路径 | 修改原因 |
|------|----------|
| `data/siteMetadata.js` | 域名、品牌、SEO、关闭 newsletter/comments 或改配置 |
| `data/headerNavLinks.ts` | 博客导航 → 游戏站导航（Play、Guides、FAQ 等） |
| `data/projectsData.ts` | 模板项目 → 相关游戏/模式卡片或删除 |
| `app/page.tsx`、`app/Main.tsx` | 博客首页 → 游戏落地页 |
| `app/layout.tsx` | metadata、字体、布局结构 |
| `components/Header.tsx`、`Footer.tsx` | 品牌、链接、移除模板署名或保留 MIT 署名 |
| `data/logo.svg` | Car Soccer logo |
| `public/static/images/*` | 品牌图、OG 图、游戏截图 |
| `data/authors/*` | 替换为站点作者/编辑信息 |
| `next.config.js` | CSP（iframe 白名单）、远程图片域名 |
| `package.json` scripts | 修复 Windows `INIT_CWD`；添加 `typecheck` |
| `app/sitemap.ts` | 新路由、移除废弃路由 |
| `app/blog/[...slug]/page.tsx` | 接入 `canonicalUrl`；Guides 路由别名（可选） |
| `css/tailwind.css` | 游戏站配色 |

### 6.3 应该删除（或移出生产构建）

| 路径 | 原因 |
|------|------|
| `data/blog/*.mdx`（全部 11 篇） | 模板演示内容 |
| `data/references-data.bib` | 学术论文引用示例 |
| `app/projects/page.tsx` + `projectsData.ts` | 除非改造为「相关游戏/模式」 |
| `app/api/newsletter/route.ts` | 静态站不需要；或后期重做 |
| `components/Comments.tsx` 引用链 | 若关闭评论 |
| `README.md` 大量模板链接 | 可替换为项目 README（非必须删） |
| `.github/ISSUE_TEMPLATE/*` | 可选，与游戏站无关 |

### 6.4 后续需要新增

| 路径/模块 | 用途 |
|-----------|------|
| `site.config.ts`（或扩展 `siteMetadata`） | 游戏 URL、iframe 开关、功能 flags |
| `app/play/page.tsx` 或首页 Play CTA | 新标签打开游戏 |
| `components/GameLauncher.tsx` | Play 按钮 + 可选 iframe |
| `components/FAQSection.tsx` | FAQ 区块 |
| `data/guides/*.mdx` 或保留 `data/blog/` 改 slug 前缀 | 攻略内容 |
| `app/controls/`、`app/faq/` 等 | 静态指南页 |
| `lib/seo.ts` 或 `packages/seo` | 结构化数据生成器（阶段 5） |
| `scripts/create-site.ts` | 多站脚手架（阶段 5） |
| `apps/car-soccer/` | Monorepo 迁移目标（阶段 5） |
| `THIRD_PARTY_NOTICES.md` | 汇总 MIT/OFL 等许可 |

---

## 7. 按优先级排列的修改清单

### P0 — 阻塞开发与部署

1. **修复 Windows 构建脚本** — `INIT_CWD=$PWD` 改为跨平台写法
2. **建立 Git 基线 commit** — 当前有 staged 的 `docs/`、未提交的 `layouts/*.tsx` 改动
3. **替换 `data/siteMetadata.js`** — `siteUrl` → `https://car-soccer.top`，title/description/locale

### P1 — 站点核心改造

4. **首页游戏落地页** — 替代 `Main.tsx` 博客列表
5. **导航与路由** — Header 链接、新增 Controls / How to Play / FAQ / Guides
6. **清除模板 MDX** — 删除 11 篇示例文章，新建 Car Soccer 内容
7. **替换 public 静态素材** — logo、favicon、OG 图；移除 google.png 等
8. **SEO 全站修正** — canonical、JSON-LD（WebSite + FAQPage）、sitemap 新路由
9. **关闭非必要功能** — newsletter、comments、多余社交链接

### P2 — 体验与安全

10. **GameLauncher** — 默认 `target="_blank"` + `rel="noopener noreferrer"`
11. **CSP / X-Frame-Options** — 若启用 iframe，白名单游戏域名
12. **添加 `typecheck` 脚本** — `"typecheck": "tsc --noEmit"`
13. **选择部署模式** — Vercel（SSR/API）vs 静态 export（`EXPORT=1`）

### P3 — 模板化 / Monorepo（阶段 5）

14. 抽取 `@game-site/ui`、`site-core`、`content-engine`、`seo`
15. `apps/car-soccer` 独立 app + `site.config.ts`
16. 统一包管理器（指南建议后续 pnpm + turbo）

---

## 8. 预计涉及的文件路径（阶段 2–4 汇总）

```
package.json
next.config.js
data/siteMetadata.js
data/headerNavLinks.ts
data/logo.svg
data/projectsData.ts          # 改或删
data/blog/**                  # 全删后新建 guides
data/authors/**
app/layout.tsx
app/page.tsx
app/Main.tsx                  # 改或替为 GameHome
app/seo.tsx
app/sitemap.ts
app/blog/[...slug]/page.tsx
components/Header.tsx
components/Footer.tsx
components/GameLauncher.tsx   # 新增
components/FAQSection.tsx     # 新增
layouts/GameLanding.tsx       # 新增
public/static/images/**
public/static/favicons/**
css/tailwind.css
LICENSE                       # 保留
docs/game-site-kit-build-guide.md
```

---

## 9. 仓库当前状态备注

- **Git：** 有 remote `pcaaron/main`；工作区含 staged `docs/game-site-kit-build-guide.md`、未提交 `layouts/` 3 文件微调
- **本地改动：** `layouts/AuthorLayout.tsx`、`ListLayout.tsx`、`ListLayoutWithTags.tsx` 各 1–2 行（疑为格式或 import 调整），建议纳入基线 commit 前 review
- **构建产物：** 审计过程中生成了 `.next/`、`out/`、`.contentlayer/`（均在 gitignore）

---

## 10. 验收检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 依赖与版本清单 | PASS | 见 §1.1 |
| LICENSE 与素材风险 | PASS | 见 §5；`MANUAL REVIEW`：示例图片需替换 |
| 目录职责说明 | PASS | 见 §1.2 |
| MDX 内容系统 | PASS | 见 §1.3 |
| SEO 实现审计 | PASS | 见 §3 |
| 静态生成/导出 | PASS | 见 §4 |
| `yarn lint` | PASS | 无 warning/error |
| `yarn tsc --noEmit` | PASS | 退出码 0 |
| `yarn dev` | FAIL | Windows `PWD` 脚本问题 |
| `yarn build` | FAIL | 同上；绕过方式可用 |
| `npx next build`（设 INIT_CWD） | PASS | 60 页 SSG |
| 静态导出 | PASS | `out/` 244 文件 |

---

## 11. 结论

当前仓库是 **功能完整的 Next.js 15 博客模板**，Contentlayer2 + MDX + SEO 基础良好，**SSG 与静态导出均已验证可行**。与 `car-soccer.top` 目标的主要差距在于：

1. **产品形态** — 博客首页 vs 游戏落地页
2. **内容** — 11 篇无关示例文章 vs Car Soccer 攻略
3. **配置** — 模板域名/品牌 vs 独立 SEO
4. **工程** — Windows 下 `yarn dev/build` 脚本失败，需优先修复
5. **游戏特性** — 缺 GameLauncher、FAQ、Controls 路由及 iframe/CSP 策略

**建议下一步（阶段 2）：** 先修复 Windows 脚本 + 提交基线 → 替换 `siteMetadata` 与静态素材 → 改造首页与导航 → 清除示例 MDX 并写入首批 Car Soccer 内容。Monorepo 抽象应在单站验收通过后再做。
