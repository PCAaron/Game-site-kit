# Game Site Kit：基于开源模板搭建可复用游戏站工程

> 目标：先把 `car-soccer.top` 做成可上线的游戏介绍与辅助指南站，再抽象为可复用模板，后续能以配置、内容和少量样式调整的方式创建赛车、益智、体育等不同类型的游戏站。
>
> 适用方式：按阶段将本文中的 Cursor 提示词逐一提交；每个阶段先检查产出并通过验收，再进入下一阶段。

---

## 0. 项目边界与技术决策

### 0.1 这次要做什么

- 网站介绍游戏、提供 Controls / How to Play / Guides / FAQ 等辅助内容。
- 点击 Play 后在新标签页打开原游戏；只有游戏运营方允许嵌入并通过实际测试时，才启用 iframe。
- 以自然搜索流量为主要获客渠道，技术上支持 sitemap、canonical、元信息、结构化数据和相关内容内链。
- 先实现一个完整站点，再将重复能力提取为公共模块，最后支持多站点。
- 每站有独立域名、品牌、游戏链接、内容、SEO 配置和部署目标。

### 0.2 当前不做什么

- 不开发或反编译原游戏。
- 第一阶段不做用户系统、在线编辑器、计费、权限管理等完整 SaaS 后台。
- 不要把多个完整的开源模板合并。
- 不要批量替换游戏名称后生成大量相似页面。
- 不要默认复制原网站的商标、图片、Logo、游戏资源或文字；先确认授权或使用自有/获许可素材。

### 0.3 推荐技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- MDX/Markdown 内容
- Git + GitHub
- Vercel 或支持静态文件的托管平台
- 第一阶段沿用所选模板原有包管理器；进入 Monorepo 后统一决定使用 pnpm 或 Yarn，不要长期保留多份冲突锁文件。

### 0.4 开源模板选择

**主底座：** https://github.com/timlrx/tailwind-nextjs-starter-blog

适合从内容站起步，参考其 MDX 内容、文章页面、元信息和站点地图相关实现。仓库使用 MIT License，但必须保留原许可声明，并检查所用依赖、字体和素材的各自许可。

**游戏首页视觉参考：** https://github.com/TencentEdgeOne/game-landing-page

适合参考游戏落地页的视觉结构、响应式布局和模块化组件。使用其代码前，必须在当前检出的版本中检查 LICENSE；如果许可不明确，只参考设计思路，不复制代码或素材。

**可选视觉参考：** https://github.com/Dorian1999/Indie-Game-Website-Next.js-Template

其方向更偏独立游戏产品/品牌官网，不完全等同于小游戏攻略站。可参考页面视觉，但不要直接将它与主底座合并。使用前仍需核对 LICENSE、依赖和素材授权。

**Next.js 静态导出官方说明：** https://nextjs.org/docs/app/guides/static-exports

内容站通常可优先考虑静态生成；在加入 `output: 'export'` 前，需要确认所用路由、图片处理和其他功能都与静态导出兼容。

---

## 阶段 1：拉取开源模板并做仓库审计

### 目标

先保证模板可以安装、运行、构建。不要一开始就重构目录或替换依赖。

### 操作步骤

1. 克隆主模板：

   ```bash
   git clone https://github.com/timlrx/tailwind-nextjs-starter-blog.git game-site-kit
   cd game-site-kit
   corepack enable
   yarn install
   yarn dev
   ```

2. 浏览器打开 `http://localhost:3000`。
3. 运行模板已有的构建命令（通常为 `yarn build`），确认原始模板没有环境问题。
4. 阅读 README、LICENSE、package.json、next.config、内容配置和路由文件。
5. 将初始化后的代码提交一次 Git commit，作为可回退基线。

> 如果当前检出的模板版本修改了包管理器或脚本，以它实际的 README 和 package.json 为准，不要同时混用 npm、Yarn 和 pnpm。

### Cursor 提示词 1：只审计，不修改

```text
你是这个 Next.js 游戏站项目的技术负责人。请先审计当前仓库，暂时不要修改任何代码。

项目目标：基于开源模板搭建 car-soccer.top 的游戏介绍与攻略站，之后将其抽象为可复用的多游戏站模板。

请检查：
1. package.json、锁文件、Node/框架/React/Tailwind 版本及包管理器要求；
2. LICENSE、依赖许可，以及可能涉及的字体、图片或示例素材；
3. app、components、layouts、lib、content、data、public 的目录职责；
4. 现有文章/MDX 内容系统如何工作；
5. title、description、canonical、Open Graph、robots、sitemap 等 SEO 实现；
6. 是否支持静态生成/静态导出，哪些功能可能不兼容；
7. 当前 dev、lint/typecheck、build 命令是否可执行；
8. 可直接复用、需要修改、应该删除、后续需要新增的文件。

输出：
- 当前架构说明；
- 关键依赖和兼容性风险；
- 按优先级排列的修改清单；
- 预计涉及的文件路径；
- 原许可与第三方素材需要保留/核验的事项。

本阶段只输出报告，不修改文件，不升级依赖，不重写架构。
```

### 验收标准

- 本地 dev 可启动。
- 原始构建命令成功，或已明确记录并解决导致失败的原因。
- 清楚知道内容如何添加、页面在哪里、SEO 在哪里配置。
- 保留开源项目的 LICENSE 和版权声明。

---

## 阶段 2：先做成一个完整的 Car Soccer 游戏介绍站

### 目标

先解决单站的功能与页面，不急着抽象所有通用能力。

### 建议页面

| 路径 | 内容 | 必须具备 |
|---|---|---|
| `/` | 游戏首页 | 主要介绍、Play 按钮、简介、操作预览、攻略内链、FAQ |
| `/how-to-play` | 新手指南 | 玩法目标、开始方式、基本操作 |
| `/controls` | 操作指南 | 键盘/鼠标/触屏说明，以实际测试为准 |
| `/guides` | 指南目录 | 文章列表、摘要、分类或标签 |
| `/guides/[slug]` | 指南文章 | 标题、正文、目录、更新时间、相关内容 |
| `/faq` | 常见问题 | 真实、有用的问题和答案 |
| `/about` | 关于本站 | 说明本站定位及与原游戏的关系 |
| `/privacy` | 隐私政策 | 根据实际使用的分析、广告、Cookies 和第三方服务编写 |
| `/contact` | 联系方式 | 可用的联系方法 |
| `/updates` | 更新记录 | 可选；只有确实维护更新记录时再启用 |

如果模板现有路由命名与此不同，可以保留合理现状，但最终 URL 必须统一、稳定且不重复。

### 首页的主要组成

1. Header / 导航。
2. Hero：游戏名称、简短说明、Play 按钮。
3. 游戏信息：玩法类型、平台、操作方式等，只展示已核实的信息。
4. How to Play / Controls 的摘要。
5. 新手指南或热门攻略入口。
6. FAQ。
7. Related Guides。
8. Footer：About、Privacy、Contact 等。
9. 广告位先使用可关闭的占位组件，不加载未经配置的广告脚本。

### 游戏启动规则

- 默认使用 `window.open(url, '_blank', 'noopener,noreferrer')`，或普通外链链接配合 `target="_blank"` 与 `rel="noopener noreferrer"`。
- `launchUrl` 必须通过 URL 校验，并使用 HTTPS（除非有明确必要且已验证的例外）。
- 不允许把用户输入直接作为 iframe 或外链目的地。
- 不要假定任何游戏都允许 iframe。第三方页面可能通过 CSP 或 `X-Frame-Options` 禁止嵌入。
- 如果将来支持 iframe，必须明确允许的域名，并提供打开原站的后备链接。

### Cursor 提示词 2：将模板改造成单游戏站

```text
请基于已审计的开源模板，将其改造为 car-soccer.top 的游戏介绍与攻略站。

要求：
1. 先列出将新增、修改、删除的文件，再实施；尽量复用当前内容系统和构建能力。
2. 页面至少包含首页、How to Play、Controls、Guides 列表、Guide 详情、FAQ、About、Privacy、Contact。
3. 首页需要清晰的 Play CTA，但按钮默认新标签页打开配置的原游戏网址，不要抓取、下载或重新托管原游戏。
4. 所有游戏名称、游戏外链、导航、元信息和功能开关均应集中配置，暂时不要散落硬编码。
5. 删除无关的模板演示内容、占位文章、虚构数据和无关导航。
6. 保留可用的 MDX/Markdown 文章能力；提供至少 2 篇结构不同的示例攻略作为开发样例，但标记为待编辑内容，不要伪造游戏事实。
7. 复用模板现有 SEO 能力；避免重写有效功能。
8. 保持响应式、键盘可访问性和合理的语义化 HTML。
9. 暂不接入真实广告，不添加没有配置的第三方追踪脚本。

完成后运行项目已有的 lint/typecheck/build 检查，汇报通过项、失败项、尚待补充的真实内容与素材。
```

### 验收标准

- 每个计划内的页面都可以访问，导航与内链正确。
- Play 按钮在桌面与移动端都能正常跳转。
- 页面不再出现博客主题原有的无关文案或假数据。
- 360px、768px、1280px 常见宽度下无明显横向溢出。
- 开发服务器、类型检查、构建均通过。

---

## 阶段 3：把每站差异收敛到配置与内容

### 目标

未来新站不应该通过全局搜索替换游戏名称来创建，而应通过配置和内容驱动。

### 初始站点配置示例

```ts
// site.config.ts
export const siteConfig = {
  id: 'car-soccer',
  site: {
    name: 'Car Soccer',
    url: 'https://car-soccer.top',
    locale: 'en-US',
    description: 'Car Soccer controls, tips and guides.',
  },
  archetype: 'single-game',
  game: {
    title: 'Car Soccer',
    launchUrl: 'https://car-soccer.com/',
    launchMode: 'new-tab',
    embedAllowed: false,
  },
  theme: {
    preset: 'arcade-dark',
    accentColor: '#65E572',
  },
  features: {
    guides: true,
    faq: true,
    updates: false,
    gamepad: false,
    gameCatalog: false,
    ads: false,
    analytics: false,
  },
} as const;
```

示例只用于表达配置职责；上线时应根据真实品牌重新设计名称、颜色、文案和资源。

### 配置要包含的内容

- `site`：站点 ID、名称、域名、语言、默认描述。
- `archetype`：`single-game`、`game-portal` 或 `guide-hub`。
- `theme`：颜色、字体、圆角、品牌视觉预设。
- `game`：标题、启动地址、启动方式、是否允许 iframe。
- `navigation`：头部与页脚菜单。
- `features`：攻略、FAQ、手柄检测、游戏目录、广告、分析等开关。
- `seo`：标题模板、默认描述、分享图片、索引策略。
- `monetization`：广告网络配置、广告位开关。
- `analytics`：统计工具开关与事件名。

建议为配置使用 TypeScript 类型；当配置来自 JSON、环境变量或外部输入时，可使用 Zod 一类的 schema 校验工具。公共组件不能直接硬编码站点名称、域名和主题色。

### 内容模型

至少定义以下模型：

- `Game`：游戏标识、标题、描述、类型、启动地址、缩略图、操作说明、相关游戏。
- `Guide`：slug、标题、摘要、发布日期、更新时间、作者、标签、正文、封面、索引开关。
- `FAQItem`：问题、答案、关联页面或分类。
- `NavigationItem`：菜单文字、路径、可选显示条件。

MDX frontmatter 应验证必要字段。不要只通过改标题和关键词复制内容；每站的说明、截图、操作、FAQ 和攻略应独立核实与撰写。

### Cursor 提示词 3：抽取配置和内容 Schema

```text
请在不破坏当前 Car Soccer 站点的前提下，将站点差异抽取为集中配置与经过校验的内容模型。

要求：
1. 创建并定义 site.config.ts，集中管理站点信息、域名、语言、页面类型、主题、导航、游戏地址、功能开关、SEO、广告和分析配置。
2. 将重复硬编码的站点名称、域名、导航与主题色替换为配置读取。
3. 定义 Game、Guide、FAQItem 的类型及必要字段校验。
4. 保留 MDX/Markdown 内容写作流程，明确新文章如何新增、如何通过 slug 生成路由。
5. 缺少必需字段时，在构建或校验阶段给出可读错误，而不是静默生成错误页面。
6. 公共组件不能直接引用 car-soccer 的名称、域名、图片路径或固定颜色。
7. 不要为了抽象而引入数据库、CMS 后台或大型新依赖。

先给出拟修改文件清单和数据流，然后实施。实施后验证原页面与 Play 功能，并运行检查命令。
```

### 验收标准

- 修改站点名称、主域名、主题颜色或游戏链接时，不需要在多个组件中手动查找替换。
- 新增一篇 Guide 只需要添加一份内容文件并通过约定的字段校验。
- 无效 URL、空 slug、缺少必填标题等问题能在构建或校验阶段被发现。

---

## 阶段 4：整理公共组件与功能模块

### 目标

只抽取已经在第一个站点验证过、且很可能被第二个站复用的能力。

### 建议组件

**页面基础组件**

- `SiteHeader`
- `SiteFooter`
- `Breadcrumbs`
- `ResponsiveContainer`
- `SectionHeading`
- `GameCard`
- `RelatedGames`

**游戏功能**

- `GameLauncher`
- `ControlsPanel`
- `MobileInstructions`
- `GamepadMonitor`（仅在实际需要时开发）

**内容与 SEO**

- `GuideList`
- `ArticleLayout`
- `TableOfContents`
- `FAQSection`
- `PageMetadata`
- `BreadcrumbSchema`
- sitemap / robots 生成逻辑

**商业化**

- `AdSlot`（默认关闭）
- `AnalyticsProvider`（默认关闭）
- 点击 Play、外链点击等事件的统一接口

不必马上将这些都拆成独立 npm 包。最开始可先按目录和接口归类，待第二站证明它们确实可以复用后，再迁移到 `packages/`。

### Cursor 提示词 4：提取可复用模块

```text
请审查当前项目中已经稳定运行的代码，将确定可复用的功能整理为公共组件与模块。

原则：
1. 仅抽取至少在两个页面或后续多个站点中有明确复用价值的能力。
2. 公共组件通过 props 或站点配置接收差异；不能硬编码 Car Soccer 的内容。
3. 先处理 SiteHeader、SiteFooter、Breadcrumbs、GameLauncher、GuideList、FAQSection 与 SEO 元信息生成。
4. 广告与分析模块保持默认关闭；不在公共布局中无条件加载外部脚本。
5. 保持语义化 HTML、键盘可访问性、移动端布局与 TypeScript 类型。
6. 不要仅为追求目录好看而拆分过多小包。

输出每个模块的职责、接口、调用示例及依赖关系。完成后运行检查并确认页面外观与功能没有回归。
```

### 验收标准

- 公共组件不包含某个游戏的专属文案。
- 通用组件的变更不会轻易影响不相关页面。
- 功能关闭时，不会出现空菜单、空广告框或指向不存在页面的内链。

---

## 阶段 5：升级为多站点 Monorepo

### 何时开始

建议在第一个站点已能正常构建、路由与配置边界基本稳定后再做。不要在模板刚克隆时就大规模拆包。

### 目标目录

```text
game-site-kit/
├── apps/
│   ├── car-soccer/
│   │   ├── app/
│   │   ├── content/
│   │   ├── public/
│   │   ├── site.config.ts
│   │   └── package.json
│   └── puzzle-demo/
│       ├── app/
│       ├── content/
│       ├── public/
│       ├── site.config.ts
│       └── package.json
├── packages/
│   ├── ui/
│   ├── site-core/
│   ├── content-engine/
│   ├── seo/
│   ├── game-launcher/
│   ├── feature-modules/
│   └── monetization/
├── templates/
│   ├── single-game/
│   ├── game-portal/
│   └── guide-hub/
├── scripts/
│   ├── create-site.ts
│   └── validate-site.ts
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

说明：此为目标形态，不要求一次把所有目录和包都建出来。先迁移当前站点和少量确实通用的模块；`game-portal`、`guide-hub` 等模板在有实际需求时再增加。

### Monorepo 关键约束

- 每个 `apps/*` 是独立 Next.js 应用，可独立 dev、build 和部署。
- `packages/*` 只保存公共逻辑，不保存站点私有内容。
- 每个站点拥有独立域名、元信息、内容目录、资源与发布目标。
- 在整个 Monorepo 内统一包管理器与版本策略，不要遗留多把锁文件造成依赖不一致。
- 迁移前后比较路由清单、生成 HTML、资源路径与 SEO canonical，防止相对路径变化产生回归。

### Cursor 提示词 5：安全迁移到 Monorepo

```text
请将当前已通过验收的 Car Soccer 单站工程逐步整理为 Monorepo。先制定迁移计划和回滚方案，不要一次性大改后再检查。

目标：
- apps/car-soccer：当前完整站点、内容、站点配置和私有资源；
- packages/ui：确定通用的基础 UI；
- packages/site-core：公共布局和页面骨架；
- packages/seo：复用的 SEO 配置与组件；
- packages/game-launcher：游戏启动功能；
- templates/：之后用于创建新站的骨架。

执行要求：
1. 检查当前 Next.js、MDX/Contentlayer、构建脚本和路径别名，明确移动目录后的风险。
2. 先建立 workspace 配置，再逐组迁移文件。
3. 保证 car-soccer 可从 apps/car-soccer 单独运行、构建与部署。
4. 所有 public、MDX、图片、静态导出目录与 alias 路径都必须重新验证。
5. 统一包管理器，不保留相互冲突的锁文件。
6. 先迁移稳定公共模块，暂时不要为了未来可能出现的需求创建空包。
7. 每个迁移步骤后执行相关检查；发生回归时先修复，不要继续叠加改动。

完成后输出最终目录、每个 workspace 的命令、独立构建方式、共享包依赖关系和未解决风险。
```

### 验收标准

- `car-soccer` 能单独启动和构建。
- 公共包没有引用 `apps/car-soccer/content` 或其私有资源。
- 构建产物中不存在错误的旧域名、错误的根路径或资源 404。

---

## 阶段 6：用第二个游戏站验证模板是否真正可复用

### 目标

创建第二个完全不同的示例站点（例如益智游戏站），用来证明工程不是只适配 Car Soccer。

第二站不必马上购买域名上线，可以先以 `puzzle-demo` 形式开发和测试。它应使用不同的站点名、配色、游戏地址、操作说明、内容与导航配置。

### 第二站验证清单

- 修改 `site.config.ts` 就能变更名称、主域名、主题与导航。
- Play 目标不会误指向 Car Soccer。
- 第二站有自己的 Guide、FAQ、封面与图标。
- 不开启的功能不会生成无效链接和空页面。
- SEO title、description、canonical 与 sitemap 均指向第二站。
- 两个站点能分别构建，不需要互相更改内容。

### Cursor 提示词 6：创建第二站，不复制整站代码

```text
请使用当前 Game Site Kit 创建第二个独立示例站 puzzle-demo，用于验证模板能否适应不同类型的游戏。

要求：
1. 使用共享组件与公共包，不能将 apps/car-soccer 整个复制为第二份并形成代码分叉。
2. 创建独立的 site.config.ts、content、public 资源目录与路由配置。
3. 采用适合益智游戏的视觉主题和 Controls/How to Play 结构，不能只把 Car Soccer 文案替换成 Puzzle。
4. 设置独立的游戏启动 URL；如果没有已核实的真实游戏地址，使用明显标注为示例的安全占位配置，避免误导用户。
5. 验证 SEO、canonical、sitemap、页面开关和外链配置完全独立。
6. 输出哪些能力可直接复用、哪些属于模板差异、哪些公共接口需要修改。

完成后分别构建 Car Soccer 和 puzzle-demo，并给出每个站的验收结果。
```

### 验收标准

- 两个站点至少一个核心页面呈现不同布局或主题，同时复用公共代码。
- 两个站点的游戏启动地址、元信息、内容、资源及 canonical 互不串站。
- 添加第二站时，大部分工作是配置、内容和视觉主题，而非复制大量组件代码。

---

## 阶段 7：实现新站脚手架和配置检查工具

### 目标

将人工初始化工作变成可重复命令。此阶段实现脚本后，下面的命令才可以使用；它们不是框架自动提供的命令。

```bash
pnpm create:site
pnpm validate:site car-soccer
pnpm build:site car-soccer
pnpm validate:site puzzle-demo
pnpm build:site puzzle-demo
```

### `create-site` 的职责

1. 询问 site ID、模板类型、域名、语言与主题。
2. 根据 `templates/single-game` 等模板复制最小骨架。
3. 生成 `site.config.ts`、内容目录和基础资源占位。
4. 设置默认关闭的广告与分析开关。
5. 检查 slug、站点 ID 和路由是否冲突。
6. 输出接下来需要人工提供的素材与内容清单。

### `validate-site` 的职责

- 配置字段完整、URL 格式合法。
- 游戏地址协议和域名符合预设安全策略。
- slug 唯一、内部链接有效。
- 内容 frontmatter 必填字段齐全。
- SEO title、description、canonical 与站点域名一致。
- sitemap 不包含草稿、404 或禁止索引的页面。
- 关闭的功能不会产生空页面或错误链接。
- 检查结果包含明确的错误路径和修复方法。

### Cursor 提示词 7：实现初始化及校验脚本

```text
请为 Game Site Kit 实现 create-site、validate-site 和 build-site 项目命令。先说明 CLI 接口和文件变更，再编写实现。

create-site：
- 能选择模板类型、填写站点 ID、名称、域名与语言；
- 为新站生成配置文件、内容目录、资源目录和必要页面；
- 拒绝重复 ID、非法路径和无效域名；
- 不复制其他站的私有内容与品牌资产。

validate-site：
- 验证站点配置、游戏 URL、内容 schema、slug、内部链接、SEO canonical 与功能开关；
- 输出通过项、警告项与失败项，并显示具体文件和字段；
- 对可能需要人工核实的版权、游戏嵌入权限和内容事实输出 warning，不要假装可以自动证明授权。

build-site：
- 能明确指定目标站点，并只构建对应 app；
- 将执行的底层命令写入文档；
- 构建失败时返回非零退出码。

要求使用当前工程已有的脚本体系，避免不必要的大型依赖；为关键校验规则增加测试。完成后用两个现有站点测试所有命令。
```

### 验收标准

- CLI 能创建新站骨架。
- 能检测至少一种无效 URL、重复 slug 和缺失 SEO 字段。
- 指定站点的 build 不会误构建到另一个站点的发布目录。
- 命令帮助和用法文档清楚。

---

## 阶段 8：SEO、性能、广告和正式发布

### 8.1 SEO 发布前检查

- 每个可索引页面都有合适的 title 和 description。
- canonical 指向本站正确的正式 URL，不能残留模板域名或其他站点域名。
- sitemap 包含已发布的规范页面，不包含草稿、内部测试、无效 URL。
- robots 配置正确，不能意外屏蔽整个正式站点。
- Open Graph 图片与品牌相符，图片路径真实存在。
- 结构化数据必须反映页面真实内容；不要为了 SEO 添加不符合页面事实的标记。
- 面包屑和相关内容内链工作正常。
- 每个站点的 About、Privacy、Contact 等页面真实可用。
- 页面正文要回答特定用户意图，不能只重复关键词。

Next.js 官方 sitemap 参考：https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

### 8.2 性能和交互

- 首页核心内容优先服务端渲染或静态输出。
- 非必要组件不要全部使用 Client Component。
- 图片明确尺寸、使用合适格式并提供 alt 文本。
- 移动端 Play 按钮清晰可点，游戏外链行为一致。
- 检查 360px、768px、1280px 三类视口。
- 检查 Console 错误、网络 404、字体和图片加载失败。

### 8.3 广告和分析

- 第一阶段保留 `AdSlot` 占位，但广告默认关闭。
- 正式接入前确认广告平台资格、政策、隐私条款、Cookie/同意机制及地区要求。
- 不要在所有站点共享未经配置的广告账号标识或 analytics ID。
- 广告应避免遮挡 Play、主要内容和移动端交互。
- 分析事件至少区分 Play 点击、内容内链点击与外部链接点击，并避免收集不必要的个人数据。

### 8.4 部署前检查

- 确认每站独立域名、DNS、HTTPS 与重定向规则。
- 确认正式域名已写入站点配置。
- 在正式环境测试 Play、导航、图片、MDX、404 页面和 sitemap。
- 验证 robots、canonical、Open Graph、移动端布局及页面标题。
- 添加站点地图到搜索引擎站长工具，并开始监测抓取与索引状况。
- 保存部署说明、环境变量清单和回滚版本。

### Cursor 提示词 8：发布前全面验收

```text
请对目标站点执行发布前验收，不要为了让检查通过而伪造测试结果或自动修改真实内容。

检查范围：
1. TypeScript、Lint、构建结果；
2. 所有页面路由、导航、内部链接、404 与资源加载；
3. title、description、canonical、Open Graph、robots、sitemap；
4. 移动端与桌面端布局；
5. Play 按钮、新标签页行为、游戏 URL 的安全校验；
6. 无障碍基础项，包括语义化标题、图片 alt、键盘操作与焦点；
7. 广告/analytics 是否只在配置启用时加载；
8. 旧模板名称、旧域名、占位文案、错误 canonical 和不相关内容残留；
9. 开源许可证、字体、图标、图片及第三方游戏素材的授权待办。

请输出：
- PASS / FAIL / MANUAL REVIEW 三类检查结果；
- 每个失败项对应的文件或 URL；
- 发布阻断项与可以后续优化的非阻断项；
- 本次实际执行过的命令和结果。

不要声称做过实际上没有执行的浏览器测试、部署测试或搜索引擎索引测试。
```

---

## 建议执行顺序与阶段门槛

| 阶段 | 主要产出 | 进入下一阶段的条件 |
|---|---|---|
| 1. 模板审计 | 可运行开源底座、审计报告 | dev 和 build 通过，许可与风险明确 |
| 2. 单站完成 | Car Soccer 页面与 Play | 核心页面、响应式、导航与游戏外链通过 |
| 3. 配置/内容模型 | `site.config.ts`、Game/Guide/FAQ schema | 站点差异不再散落硬编码，内容可校验 |
| 4. 公共模块 | 通用 UI、启动器、SEO 等 | 公共组件无游戏专属硬编码 |
| 5. Monorepo | `apps/` 与有限的 `packages/` | 当前站点迁移前后通过同一套验收 |
| 6. 第二站验证 | `puzzle-demo` 或其他类型站点 | 配置和内容可分离，两个站互不串站 |
| 7. 自动化脚本 | create/validate/build | 能创建、检查、单独构建站点 |
| 8. 发布 | 域名、SEO、性能与部署清单 | 无发布阻断项，手工核验项已处理 |

## 推荐的执行纪律

1. 每个阶段开始前，让 Cursor 先列变更计划。
2. 每完成一个阶段，运行检查、查看差异、在浏览器实际测试，再提交 Git commit。
3. 一次只交付一个阶段，不要把“首页改版、Monorepo、广告接入、SEO 重写”放进同一条提示词。
4. 对模板本身的升级单独开分支，不要与站点业务开发混在一起。
5. 先让第二站成功复用，再开发更多模板类型；否则容易过度抽象。
6. 所有游戏信息、截图、商标、字体与第三方资源都应单独核实许可与真实性。

## 项目完成定义

当以下条件全部满足时，才算真正完成 Game Site Kit 的第一版：

- [ ] Car Soccer 站可以单独开发、构建和部署。
- [ ] 第二个不同类型的站可以复用公共能力，并具有独立品牌与内容。
- [ ] 站点域名、主题、游戏链接、导航、SEO 和功能开关均由配置控制。
- [ ] 内容模型和 URL 配置有自动化校验。
- [ ] Play、导航、sitemap、canonical、移动端布局通过验收。
- [ ] 新站骨架可以通过脚本创建，目标站点可以单独构建。
- [ ] 广告与分析默认关闭，且有明确的单站启用配置。
- [ ] 开源许可、游戏嵌入权限及所有第三方素材授权均已核验或明确记录为未解决项。
