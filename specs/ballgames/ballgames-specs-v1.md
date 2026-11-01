# ballgames.io 开发 Spec v1

> **Kit 契约：** 跨实例 SEO 与逻辑内容模型见 [`specs/phases/02-seo-page-model-and-content-contract.md`](../phases/02-seo-page-model-and-content-contract.md)、[`specs/instances/ballgames/README.md`](../instances/ballgames/README.md)。本文档为 **R1 实例层**（TDK 定稿、正文、DoD）；与 Kit 冲突时以 Kit 索引/sitemap/诚实 structured data 规则为准。

> **R1 范围冻结：** 仅实现两个 **indexable** 页面（`/`、`/hockey-bros`）与最小支撑系统；sitemap **只含 2 条 URL**。Catalog 可录入 **15–20** 款游戏的 launch 数据，但 **仅 hockey-bros 具备完整 SEO 正文字段**。R2/R3 见 [§9 Release 路线图](#9-release-路线图r1-不实现)——文档留存，代码随后续 Release 迭代。

---

## 1. 词表与页面清单

### 1.1 R1（本期实现 + 索引）

| URL          | 主词        | 美国月搜索量                        | 正文配额（wc -w）             | 结构化数据                           |
| ------------ | ----------- | ----------------------------------- | ----------------------------- | ------------------------------------ |
| /            | ball games  | 27,100（-45%）                      | ≈950（导语 + 5×H2，不含 FAQ） | WebSite + ItemList + Organization + FAQPage |
| /hockey-bros | hockey bros | 基线 8,100 / 9 月峰 40,500，KD 36.2 | ≈980（5×H2 正文）             | VideoGame + FAQPage + BreadcrumbList |

「词」为英文单词数（`wc -w`），不含导航/页脚/卡片/iframe 区/H1 副标题 `<p>`/FAQ 块（FAQ 单独计数）。

### 1.2 R2/R3 预备（R1 不建页，模型须能装）

| Release | URL（示例）                           | 主词参考量                               | 说明                             |
| ------- | ------------------------------------- | ---------------------------------------- | -------------------------------- |
| R2      | `/soccer-bros`、`/basketball-bros` 等 | soccer bros ~135k；basketball bros ~246k | 5–6 个 Bros 详情页，**只填数据** |
| R3      | `/bros-games`                         | bros games ~14.8k                        | 分类页，≥12 款 + ≥600 词         |
| R3      | `/sports-games`                       | sports games ~22.2k                      | 同上                             |
| R3      | `/car-soccer`                         | car soccer ~12.1k，KD 35–44              | 同上；**禁止**新站一次铺 ~280 页 |

---

## 2. 全局硬性约束（验收项）

1. indexable 默认 false；sitemap 只输出 `status === "published" && indexable === true`。
2. R1 **无** `/search` 路由与顶栏搜索；R2 上线 `/search` 后：`noindex,follow`，**不加** robots `Disallow: /search`（与 noindex 策略一致，见 §9 R2）。
3. 分页第 2 页起 noindex, follow，每页 ≥24 张卡（R1 无分页）。
4. tags 不出页面；categories 须 ≥12 款 + ≥600 词手写才可发布。
5. 每页唯一 H1；canonical 自指向；slug 变更走 redirect 表。
6. **首页 SEO 正文块**（导语 + 五个 H2 + FAQ 答案）内 **hockey bros = 0**；允许出现在 **Hockey Bros 卡片 `<a>`**、iframe 区 **非 heading 标题**（`<span>` / `<div>`）。
7. iframe：**不加** sandbox、**不加** `loading="lazy"`、不用固定像素撑高（16:9 自适应）。
8. 游戏源失效不得 404：URL 与正文保留，游戏区降级为「新窗口打开」+ 说明。
9. JSON-LD **禁止**编造 aggregateRating / review。
10. **首页可玩区：** 全页 **唯一** `<iframe>`；默认 `https://www.hockeybros.io/`；屏宽 70%；桌面 `min-height:480px`；窄屏 16:9 自适应（375px 宽约 147px）；8s onload 兜底。
11. **数据只存 `slug`**，不存完整 path；**全站 URL 经 `gameUrl(slug)`**（及 `siteUrl()`）生成：内链、canonical、sitemap、JSON-LD、OG。
12. **禁止硬编码**路径字面量（如 `"/hockey-bros"`）；CI grep 拦截（排除 redirect 表、测试 fixture、`specs/`）。
13. **将来 URL 加前缀：** 只改 `gameUrl` → 批量 301 → sitemap/内链/结构化数据重生成 → GSC 重提 sitemap；模板与正文字段不改。
14. **首页卡位：** 15–20 张；**Hockey Bros** → `<a href={gameUrl('hockey-bros')}>`；其余 → `<button type="button">` **仅替换**上述 iframe 的 `src`（及 iframe 上游戏名）；**不** pushState、**不** `#hash`、**不**第二个 iframe、**不** `<a>` 到未建详情页或官方站。

---

## 3. 数据模型

### 3.1 Game

```json
interface Game {
  id: string;
  slug: string;
  title: string;
  seo: { title: string; description: string; canonical?: string; indexable: boolean };

  intro: string;
  howToPlay: string;
  sections: { heading: string; body: string }[];
  tips?: string[];
  faq: { q: string; a: string }[];
  controls: { label: string; keys: string }[];

  categories: string[];
  tags: string[];
  thumbnail: { src: string; alt: string; width: number; height: number; priority?: boolean };

  provider: string;
  launch: LaunchConfig;
  status: "draft" | "published" | "archived";
  publishedAt: string;
  updatedAt: string;

  showOnHome?: boolean;
  homeSort?: number;
}
```

R1：仅 `hockey-bros` 必填完整正文字段；其余 Catalog 行至少 `slug`、`title`、`launch`、`showOnHome`、`homeSort`。

### 3.2 LaunchConfig

```json
interface LaunchConfig {
  mode: "iframe-official" | "iframe-provider" | "external-link" | "hosted";
  primaryUrl: string;
  fallbackUrls?: string[];
  embedHeight?: number;
  timeoutMs?: number;
}
```

### 3.3 Provider / 3.4 Category / Redirect

（同 v1：`Provider`、`Category`、`Redirect` 结构不变。）

### 3.5 R1 首页卡位清单（实现前人工填满 primaryUrl）

| 优先级 | slug（示例）                                                                                                                                           | R1 详情页 | 卡行为                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------------------------ |
| 1      | `hockey-bros`                                                                                                                                          | 有        | `<a>`                    |
| 2+     | Bros 家族：`basket-bros`、`soccer-bros`、`soccer-bros-2`、`football-bros`、`baseball-bros`、`kart-bros`、`wrestle-bros`、`karate-bros`、`math-bros` 等 | 无        | `<button>` 换 iframe src |
| 补位   | 已有量级 embed 游戏                                                                                                                                    | 无        | `<button>`               |

**禁止**虚构 `primaryUrl`；许可与来源记入 `Provider`。

---

## 4. 组件清单与 Release

> **R1** = 本期必须交付；**R2/R3** = 文档预留、后续 Release 实现（不删项，只延后）。  
> 通用 UI（GameCard / GameGrid 等）不单独承载 SEO，但须与 Launcher、SEOHead 同源数据。

### 4.1 平台与 SEO（Catalog / 元数据）

| 模块                                                             | Release | 说明                                                                                         |
| ---------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| Catalog 数据层（表 + 录入 + `draft` / `published` / `archived`） | **R1**  | R1 无 `/games` 列表页；呈现层仅 `/` grid 与内页 Related                                      |
| `gameUrl(slug)` / `siteUrl()`                                    | **R1**  | 内链、canonical、sitemap、JSON-LD、OG 唯一入口（§2-11–13）                                   |
| SEOHead（title / description / canonical / OG / 默认回退）       | **R1**  | 全页共用                                                                                     |
| JSON-LD 生成器（按页面类型分发）                                 | **R1**  | WebSite / ItemList / Organization / VideoGame / FAQPage / BreadcrumbList；禁止页内手写重复块 |
| Sitemap 生成                                                     | **R1**  | 只收 `published && indexable`；R1 固定 2 URL                                                 |
| Provider 表                                                      | **R1**  | embed 许可状态是**数据字段**，不是注释（§3.3）                                               |
| Redirect 管理（slug 变更 → 301/302 表）                          | **R2**  | R1 仅预留 `Redirect` 模型；无 UI 亦可，但迁移 playbook 须遵守 §2-13                          |

### 4.2 游戏呈现（Launcher / 页面模板）

| 模块                                             | Release | 说明                                                                           |
| ------------------------------------------------ | ------- | ------------------------------------------------------------------------------ |
| Game Launcher（单 iframe + 源切换 + 8s 兜底）    | **R1**  | `/` 与 `/hockey-bros`；首页 button 换 `src` 须复用同一 Launcher 逻辑           |
| PlayFrame（16:9 容器 + 游戏名 `<span>`/`<div>`） | **R1**  | 与 `.game-wrap` 验收一致（§2-7、§6.4）                                         |
| Game Detail 模板                                 | **R1**  | R1 仅路由 `/hockey-bros`；R2 起「填数据即出新页」                              |
| Breadcrumbs（可见） + BreadcrumbList             | **R1**  | 内页两级 Home › {Game}；R3 分类页可加深层级                                    |
| 内页广告槽（300×250 + 336×280，游戏区外）        | **R1**  | iframe 内为发行方广告；站点广告只在游戏区外（§6.3）                            |
| RelatedGames / 相关游戏区                        | **R1**  | 12–16 张，与首页 **同一 GameGrid**；内页行为 §6.7（scrollIntoView，不换 src） |
| GameCard / GameGrid                              | **R1**  | 首页 15–20；卡行为 §2-14；卡片 SEO 锚文本仅游戏名                              |
| Home iframe `src` 切换（无 Modal、无 hash）      | **R1**  | 首页全页唯一 iframe；与 Launcher 共用                                          |

### 4.3 导航、分类与扩展（R1 不做 UI，模型须能装）

| 模块                                             | Release | 说明                                               |
| ------------------------------------------------ | ------- | -------------------------------------------------- |
| Category System（手写 intro + body，≥12 款门槛） | **R3**  | 首批 `/bros-games`、`/sports-games`、`/car-soccer` |
| CategoryNavigation / 分类 chips                  | **R3**  | R1、R2 首页与列表页均不含 chips；仅在分类页启用 |
| 顶栏 Game Search                                 | **R2**  | 顶栏配件；与 `/games` 同期；`/search` 为 noindex,follow（§2-2） |
| 顶栏 Hot / New 导航                              | **R2**  | 仅这两项，链 `/games`（与 R2 列表页同期上线） |
| 顶栏 Sports / 2 Player / .IO 导航                | **R3**  | 与分类页同批上线，避免 R2 死链 |
| 分页（第 2 页起 noindex, follow，≥24 卡/页）     | **R3**  | R1 无分页                                          |
| Featured / Recently Added / Recommended 自动化   | **R3**  | R1 用手工 `homeSort`；自动生成在款数不足时为空壳   |
| tags 筛选（不出 tag 页）                         | **R2**  | 仅 Catalog 字段；R2 上线 `/games` 同期在列表页启用筛选控件，不生成 tag URL |
| `/games` 或等价 Catalog 列表页                   | **R2**  | 非 R1 SEO 入口                                     |

### 4.4 R1 与后续 Release 边界（摘要）

| 能力              | R1                      | R2                       | R3                      |
| ----------------- | ----------------------- | ------------------------ | ----------------------- |
| indexable 页面    | `/`、`/hockey-bros`     | +5–6 游戏详情            | +3 分类页，再小批量扩页 |
| GameGrid 卡 `<a>` | 仅 `hockey-bros`        | 已上线详情页逐张改 `<a>` | 分类页内链进详情        |
| ItemList JSON-LD  | 仅已 indexable 详情 URL | 随新页增加 ListItem      | 分类页另类型            |

---

## 5. 页面规格 A：首页 `/`

### 5.1 TDK（照抄）

```html
<title>Ball Games - Play Free Browser Games | BallGames.io</title>
<meta
  name="description"
  content="Play free ball games right in your browser - hockey, soccer, football, basketball and more. No download, no account, one click to start."
/>
<link rel="canonical" href="https://ballgames.io/" />
```

实现时 canonical 须走 `siteUrl('/')`；上例仅为说明。

### 5.2 H1 与副标题（定稿）

| 元素   | markup              | 定稿英文                                                                                | 约词数 |
| ------ | ------------------- | --------------------------------------------------------------------------------------- | ------ |
| 主标题 | `<h1>`              | Ball Games                                                                              | —      |
| 副标题 | `<p>`（紧接 H1 下） | Pick a game and it starts — hockey, soccer, football, basketball, free in your browser. | ~15    |

```html
<h1>Ball Games</h1>
<p>Pick a game and it starts — hockey, soccer, football, basketball, free in your browser.</p>
```

- 全页唯一 H1；副标题 **必须** `<p>`，**不得**用 `<h2>`–`<h6>`。
- 不写 `<meta name="keywords">`。

### 5.3 Section 顺序（R1）

| 序  | 区块                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | TDK                                                                                                               |
| 2   | H1 + 副标题 `<p>`（§5.2）                                                                                         |
| 3   | **可玩区：** 全页唯一 `<iframe>`，默认 `https://www.hockeybros.io/`；上方当前游戏名 `<span>`/`<div>`；§2-7、§2-10 |
| 4   | **卡片网格 15–20**（§2-14）                                                                                       |
| 5   | **导语 55 词**（§5.4）                                                                                            |
| 6   | 正文五个 H2（§5.5，≈950 词）                                                                                      |
| 7   | FAQ 8 条 + FAQPage（§5.6）                                                                                        |
| 8   | 页脚                                                                                                              |

R1 **不含：** 顶栏 Hot/New 导航、搜索、分类 chips、tab 切换、首页展示广告位。

### 5.4 导语（55 词，位于卡片区之后；`wc -w` 实测回填）

```html
Every game on this page runs inside the tab you already have open. No installer, no sign-up, no
launcher asking for an update. We collect ball games — hockey, soccer, American football,
basketball, baseball, and the odd car-with-a-ball hybrid — and put them behind one click. If it
needs a download, it is not on this site.
```

### 5.5 正文 H2（≈950 词）

#### H2① Ball Games You Can Play Right Now（120 词）

```html
The grid above is the short list: the games people actually come back to, ordered by how much they
get played rather than by which one we like. It changes as new titles arrive, and right now the
newest arrival is an arcade hockey game from a Canadian studio that has been climbing fast since it
launched. Everything here loads in a single click and remembers nothing about you — there is no
account to make, so nothing to lose if you close the tab. Every game named here opens in the same
frame at the top of this page. Pick one and start a round.
```

#### H2② Ball Games by Type（210 词）

```html
Hockey. Ice hockey cut down to a single rink, two teams and one very forgiving body-check. It is the
fastest-growing corner of the site at the moment, mostly because the studio behind it keeps adding
titles with the same controls.
<!--换行-->

Soccer. The classic browser football game: five a side, exaggerated physics, goals that bounce in
off three defenders. This is where most people start, and where the family of games we cover is
largest.
<!--换行-->
American football. Fewer downs, longer passes, more chaos. If you have played a console football
game and found the playbook exhausting, this is the version that fits in a browser tab.
<!--换行-->
Basketball. One-on-one arcade hoops, built around steals and dunks rather than full-court plays.

<!--换行-->
Baseball. Timing at the plate instead of a season. Short innings, big swings.
<!--换行-->
Car ball. Cars with a giant ball in the middle and a goal at each end. Technically a driving game,
practically a physics comedy.
<!--换行-->
Start with the one you already know the rules for — every game here opens in the same frame and
needs nothing installed.
```

#### H2③ How to Pick One（110 词）

```html
Two minutes to kill. Pick anything in the grid. These games are built for short sessions, and most
of them are playable before you have finished reading the controls.
<!--换行-->
Playing with someone next to you. Go for two-player. A shared keyboard is still the best controller
for this kind of game. Several of the titles in the grid below support two players on one keyboard,
so a second person can join without a second machine.
<!--换行-->
On a school or work laptop. Stick to keyboard controls. Anything that wants a mouse camera is going
to be awkward on a trackpad, and anything that wants a mouse and a keyboard wants a desk you
probably do not have.
<!--换行-->
On a phone. The games load, but your thumbs will not thank you. The control schemes assume a
keyboard.
```

#### H2④ How This Site Works（120 词）

```html
We do not make these games. Every title here is built and maintained by the studio that published
it, and it runs on their servers, in their player, with their ads around it. What we do is write the
page you are reading: what the game is, who made it, how the controls work, and what to do when it
will not load.
<!--换行-->
That is why you will sometimes see the studio's own branding inside the frame. It is their game and
their infrastructure — we are not going to pretend otherwise, and we are not going to strip their
ads to make a page look tidier. If a game disappears from the catalogue, it is usually because the
publisher pulled it, not because we did.
```

**H2④ 不得删**（合规 + 发行方姿态）。

#### H2⑤ Playing in the Browser（160 词）

```html
Browser games live or die on two things: whether the frame loads, and whether the keyboard works.
<!--换行-->
It will not load. Usually it is an ad blocker. The frame is served by the publisher, and blockers
treat in-game ads the same as they treat banner ads. Turn it off for this domain and reload. The
other common cause is a school or office network that filters game domains outright — in that case
no amount of refreshing will help.
<!--换行-->
The keyboard does nothing. Click once inside the game frame first. Browsers give keyboard focus to
the page, not to an embedded frame, so until you click the game, your arrow keys are talking to the
wrong window.
<!--换行-->
It runs slowly. Close the other tabs. These games are small, but a machine with thirty tabs open is
not.
<!--换行-->
Chromebooks. Everything here is built on web standards and runs on ChromeOS without extensions. No
Flash, no emulator, no install.
```

### 5.6 FAQ 8 条 + FAQPage

8 个独立 `<details>`，顺序如下。Answer 与 FAQPage JSON-LD 逐字一致。

```html
<details>
  <summary>What are these ball games?</summary>
  <p>
    Browser games built around balls, pucks, and sports physics — hockey, soccer, football,
    basketball, and similar titles you play in one tab.
  </p>
</details>
<details>
  <summary>Are they free?</summary>
  <p>Yes. No account, no download, no trial timer.</p>
</details>
<details>
  <summary>Do I need an account?</summary>
  <p>No. Everything runs in the browser tab without sign-up.</p>
</details>
<details>
  <summary>Why will a game not load?</summary>
  <p>
    Usually an ad blocker or a network filter. Disable the blocker for this domain and refresh.
  </p>
</details>
<details>
  <summary>Will these work on a school Chromebook?</summary>
  <p>Yes, on any machine with a modern browser, including ChromeOS.</p>
</details>
<details>
  <summary>Do these games work on a phone?</summary>
  <p>
    Yes. They load in a phone browser, though the frame is easier to use in landscape — turn the
    phone sideways before you start.
  </p>
</details>
<details>
  <summary>Can I play with a friend on the same keyboard?</summary>
  <p>
    Yes, on the titles that support two-player. Two people, one keyboard, one screen — no second
    device and no account. Check the page of the game you want, since not every title in the grid
    has a two-player mode.
  </p>
</details>
<details>
  <summary>Are these the full versions of the games?</summary>
  <p>
    You get the same player the studio publishes; we do not host stripped-down copies.
  </p>
</details>
```

### 5.7 JSON-LD

R1 **WebSite**（无 `potentialAction` / SearchAction；R2 `/search` 上线后再加回）：

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "BallGames.io",
  "url": "https://ballgames.io/"
}
```

- **ItemList：** R1 **仅 1 项** — `gameUrl('hockey-bros')`；**不得**列未发布分类 URL。
- **Organization**
- **FAQPage**（与 §5.6 八问八答一致）

---

## 6. 页面规格 B：`/hockey-bros`

### 6.1 TDK（照抄）

```html
<title>Hockey Bros Game - Controls, Tips, Fixes | BallGames.io</title>
<meta
  name="description"
  content="Hockey Bros is a free arcade hockey game you play right in your browser. Controls, tips, a look at the studio behind it, and fixes when it will not load."
/>
<link rel="canonical" href="https://ballgames.io/hockey-bros" />
```

### 6.2 H1 与副标题（定稿）

| 元素   | markup              | 定稿英文                                                                         | 约词数 |
| ------ | ------------------- | -------------------------------------------------------------------------------- | ------ |
| 主标题 | `<h1>`              | Hockey Bros                                                                      | —      |
| 副标题 | `<p>`（紧接 H1 下） | One small rink, short matches, and nothing to install. | ~12    |

```html
<h1>Hockey Bros</h1>
<p>One small rink, short matches, and nothing to install.</p>
```

### 6.3 Section 顺序（R1）

| 序  | 区块                                                              |
| --- | ----------------------------------------------------------------- |
| 1   | TDK                                                               |
| 2   | 面包屑 **Home › Hockey Bros**（可见；无 Sports 级）               |
| 3   | H1 + 副标题 `<p>`（§6.2）                                         |
| 4   | 可玩区 iframe（`https://www.hockeybros.io/`，同 §5.3 尺寸与兜底） |
| 5   | **广告：** 300×250 + 336×280（**仅在游戏区之外**）                |
| 6   | 正文五个 H2（§6.5，≈980 词）                                      |
| 7   | FAQ **7** 条 + FAQPage（§6.6）                                    |
| 8   | **相关游戏 12–16 张**（`GameGrid`，§6.7）                         |
| 9   | 页脚                                                              |

R1 **不含：** iframe 下 Controls/Note 两行独立提示（操作说明只在 **H2② Controls** 正文）。

### 6.4 Launcher（示例）

```html
<div class="game-wrap">
  <iframe
    src="https://www.hockeybros.io/"
    title="Hockey Bros"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>
  <div class="game-loading" id="gload">Loading Hockey Bros…</div>
</div>
```

8s 未 onload → 展示「去官方站玩」按钮（`target="_blank"` `rel="noopener"`）。`.game-wrap` 16:9；无 sandbox、无 lazy。

### 6.5 正文配额（≈980 词）

| 区块                            | 配额                                                 |
| ------------------------------- | ---------------------------------------------------- |
| H2① How to Play                 | 150 词，3 段                                         |
| H2② Controls                    | 115 词，3 段                                         |
| H2③ Tips for Winning            | 150 词，5 bullets                                    |
| H2④ About Hockey Bros           | 380 词（180 + H3 unblocked 110 + H3 worth a tab 80） |
| H2⑤ The Rest of the Bros Series | 100 词，5 条列表                                     |

**H2⑤ R1：** 五个游戏名 **纯文本**；R2 改为 `gameUrl(slug)` 内链并删除末段 home 链说明。R1 允许的内链见 H2⑤ 末 `<a href="/">`（§6.5 末段）。

#### H2① How to Play（150 词）

```text
Hockey Bros is a browser ice hockey game: two teams, one rink, and a puck that behaves roughly the way a puck should. You skate, you pass, you shoot, and when you do not have the puck you hit people. The physics are deliberately loose — hits send players tumbling, the puck ricochets off the boards at silly angles, and goalies occasionally wander out of the crease to investigate something.

What makes it work is the size of the rink. It is small enough that you are always in the play and never more than a second away from the goal, which means the game rewards positioning over twitch reflexes. You can lose a match having taken twice as many shots, because the player who stands in the right place gets the rebound.

No account, no download, nothing to configure. You open it, you play a short match, and you are done — which is the whole point of a game that fits in a browser tab.
```

#### H2② Controls（115 词）

```text
One key does three jobs. With the puck you pass or shoot; without it, space is your check. That is the whole control scheme — the game is about position, not about remembering buttons.

A match is split into short periods on a game clock that runs faster than the clock on your wall, so a full game takes less time than the arithmetic suggests. Between periods the ice gets resurfaced and you sit through the break. Whoever is ahead when the clock runs out wins. The studio pitches it as a quick game you can fit into lunch, and the structure is why that works.

There is no practice mode, which sounds like a problem and is not. The first match is the tutorial: the rink is small, the controls are one key, and a full game is short, so you learn by playing rather than by watching a tutorial you will skip anyway.
```

#### H2③ Tips for Winning（150 词）

```text
Stay between the puck and your own net. A lot of goals conceded by new players come from the same two places: chasing the puck into the corner, and skating at the far blue line.

Pass before you shoot. The shot is fast enough to beat a goalie from range, but a pass across the middle pulls the goalie out of position and doubles the chance of a rebound landing on your stick.

Use the check as a reset, not a highlight. Big hits look great and leave you out of position for a beat. Do it in the neutral zone, not in front of your own goal.

Learn the boards. Angles off the side walls are consistent. One bank pass beats three defenders.

Play the closing stretch differently. When the clock is running down, the safe pass is worth less than a bad shot on goal.
```

#### H2④ About Hockey Bros（380 词）

```text
Hockey Bros is made by Blue Wizard Digital, a small independent studio in Canada that has spent years building one very specific thing: arcade sports games with oversized heads, loose physics and short rounds. The same team is behind the football, soccer, basketball, baseball and kart entries in the same family, which is why the control scheme barely changes between them.

The game launched on 1 August 2026, which makes it the newest thing the studio has shipped — and the reason it is the one people are searching for right now. It runs on web standards inside a browser tab, on any machine with Chrome, Edge, Firefox or Safari. No plugin, no launcher, no account.

And it is a browser game that does not feel like a compromise: the load time is short, the frame is stable, and you are in a match quickly after clicking play.

H3｜Hockey Bros unblocked, on a school laptop（110 词）
School Chromebooks cannot install anything, and neither can most work laptops — which is exactly the case a browser game is built for. The network filters anything that looks like a game portal, and half the results are pages that took the game down long ago. What we can tell you is where the block actually sits. The game is served from the studio's own domain rather than from a game portal, so a filter that blocks sites by category may still let it through. If it does not, refreshing will not change anything — the block is on the network, not in your browser. A normal connection with the ad blocker switched off covers the most common cause we have seen.

H3｜Why it is worth a tab（80 词）
What separates it from the other browser hockey games is how directly it responds. Every input lands immediately — no queue, no animation you have to sit through, no cooldown on the check. When you lose the puck it is because you were out of position, not because the game decided to play a two-second tackle you could not cancel. That is what makes the short matches work: you always know why you lost, so you always want one more.
```

#### H2⑤ The Rest of the Bros Series（100 词）

```text
Hockey Bros is the newest member of a family built by the same studio, with the same big-headed athletes and the same short rounds:

- Soccer Bros — the most played of the family, and usually where people start.
- Football Bros — American football cut down to a few downs and a lot of passing.
- Basket Bros — 1v1 arcade basketball, built for steals and dunks.
- Baseball Bros — timing at the plate rather than a full season.
- Kart Bros — the racing branch; same characters, no ball.

If you like the controls here, the others are built on the same control idea, so the habits carry over.

Several of these are playable from the grid on the <a href="/">home page</a>, so you can switch without leaving the site.
```

R1：**H2⑤ 内唯一允许的内链**为 `<a href="/">`（实现须 `siteUrl('/')`）；五个游戏名保持纯文本。

### 6.6 FAQ 7 条（定稿，实测 __ 词，配 FAQPage schema）

问句与 **Answer 原文** 须逐字用于可见 FAQ（`<details>`）与 JSON-LD `FAQPage`。不得编造 aggregateRating。

```html
<details>
  <summary>Is Hockey Bros free?</summary>
  <p>Yes, completely. No account, no download, no trial.</p>
</details>
<details>
  <summary>What are the controls?</summary>
  <p>
    One key does everything. With the puck it passes or shoots; without it, the same key is your
    check. Arrow keys or WASD move your player, and the rink does the rest of the aiming — the game
    is about position, not about remembering buttons.
  </p>
</details>
<details>
  <summary>How long is a match?</summary>
  <p>
    A match runs to the final horn. The studio pitches it as a quick game you can fit into a lunch
    break.
  </p>
</details>
<details>
  <summary>Who makes it?</summary>
  <p>
    Blue Wizard Digital, the Canadian studio behind Soccer Bros, Football Bros, Basket Bros and Kart
    Bros.
  </p>
</details>
<details>
  <summary>Why isn't the game loading?</summary>
  <p>
    Usually an ad blocker or a school/office network filter. Disable the blocker, try Chrome,
    refresh.
  </p>
</details>
<details>
  <summary>Can I play it on a phone?</summary>
  <p>
    It loads in mobile browsers, but the controls are built for a keyboard. Play on a laptop if you
    can.
  </p>
</details>
<details>
  <summary>Can I play with a friend on the same keyboard?</summary>
  <p>
    Yes. Two players, one keyboard, one screen. No second machine and no account needed.
  </p>
</details>
```

（第 7 条为 R1 新增；第 1、2 条 Answer 已按 v1.1 去掉键位名，不再与 v1 定稿一致。）

### 6.7 相关游戏区（R1）

- **12–16 张**，组件与首页 `GameGrid` 相同。
- R1 相关区内 **所有卡片一律 `<button>`**，包括 Hockey Bros：点击后 `scrollIntoView({ behavior: 'smooth' })` 滚回顶部可玩区，**不换** iframe `src`、不 pushState、不加 hash。
- 内页相关区 **唯一 `<a>`** 在 **H2⑤ 末句** 指向 `/`（§6.5）；首页仍为 §2-14（仅 `hockey-bros` 用 `<a>`，其余 button 换 iframe `src`）。

### 6.8 JSON-LD

- **VideoGame**（无 aggregateRating）
- **FAQPage**
- **BreadcrumbList** 两级：

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ballgames.io/" },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Hockey Bros",
      "item": "https://ballgames.io/hockey-bros"
    }
  ]
}
```

---

## 7. 内容规则

- 内页 **hockey bros** 10–12 次 / 字数按 §6.5 实测 `wc -w` 回填（不再重复标注旧口径）
- 词频表（贴在此行下方，作为验收基准）：

```text
hockey bros 出现位置（共 10~12 次）：
title 1 · h1 1 · 副标题 0 · 面包屑 1 · H2④ 正文 3~4 · H2⑤ 1 · FAQ 2 · 相关卡锚文本 1
```

- 首页 **ball games** 12–16 次；导语 + 五 H2 + FAQ 内 **hockey bros = 0**（§2-6）。
- 词频第一名词短语 = 该页主词。
- **Related / 首页 grid：** 锚文本仅游戏名；R1 仅 `/hockey-bros` 用 `<a>`，其余 `<button>` 换 src，不指向未建 slug。

---

## 8. 验收清单（R1 DoD）

- [ ] 全站每页唯一 H1；首页/内页均有 H1 下 **`<p>` 副标题**（§5.2、§6.2）
- [ ] Title ≤60、description ≤155；无 keywords
- [ ] 正文词数：首页实测 __ 词、内页实测 __ 词（上线前 `wc -w` 回填，勿按 950 / 980 凑数）
- [ ] 词频第一短语 = 页主词；首页 SEO 正文块内 hockey bros = 0
- [ ] sitemap **仅 2 URL**；ItemList **仅 hockey-bros**
- [ ] 首页 FAQ **8** 条（8 个独立 `<details>`）；内页 FAQ **7** 条
- [ ] 卡片锚文本仅游戏名，不含 "Play … Free Online" 式长句
- [ ] `/search`、顶栏 Sports / 2 Player / .IO、分类页：**R1 不实现**；`/search` 与 robots Disallow 验收项 **标 R2**（§2-2、§9 R2）
- [ ] 可玩区：桌面 `min-height:480px`；窄屏按 16:9 自适应（375px 下约 147px），不再写「≥210px」
- [ ] 首页 **15–20 卡**；Hockey `<a>`，其余 `<button>` 换 iframe src；无 hash/pushState
- [ ] 首页 **1 个 iframe**；内页 iframe + **双广告位**；无 sandbox/lazy
- [ ] 内页 **无** iframe 下 Controls/Note 两行
- [ ] 内页相关游戏 **12–16**；相关区 **全部 `<button>` + scrollIntoView**（§6.7）；面包屑 **两级**
- [ ] `gameUrl` 统一 URL；CI 无硬编码 path
- [ ] 8s 兜底；源失效时 `/hockey-bros` 200 + 完整正文
- [ ] JSON-LD Rich Results 通过；无 aggregateRating；R1 WebSite **无** SearchAction
- [ ] LCP：首页含 iframe 时 **MANUAL REVIEW**（PageSpeed 截图）或团队自定阈值

---

## 9. Release 路线图（R1 不实现）

### R2（上线后 1–2 周）

- 新增 **5–6** 个 Bros **详情页**（优先 soccer bros、basketball bros 等）；模板 R1 已就绪，只填 Catalog 正文 + indexable。
- 首页 / 内页对应卡：`<button>` → `<a href={gameUrl(slug)}>`。
- H2⑤ 五个游戏名逐条改为内链（`gameUrl(slug)`），纯文本段一并删除。
- 同期上线：`/games` 列表页、顶栏 Game Search（`/search` 此时 `noindex,follow`，**不加 robots Disallow**）、顶栏 Hot / New 两项导航。
- ItemList 随新详情页逐项增加；WebSite 的 `SearchAction` 在 `/search` 上线后再加回。

### R3

- 按序上线 **`/bros-games` → `/sports-games` → `/car-soccer`**（Category 门槛 §2-4）。
- 之后按词表 **小批量** 扩页；禁止一次 ~280 页。

---

## 10. 变更记录

| 日期       | 说明                                                                                                                                               | 核销状态           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 2026-11-01 | R1 冻结：双页 indexable、首页 15–20 卡 + 单 iframe 换 src、URL 四条工程约束、H1 `<p>` 副标题表、内页广告、FAQ 7 定稿全文、相关 12–16、R2/R3 路线图 | 已冻结             |
| 2026-11-01 | 走查：§4 恢复完整组件表并标注 R1/R2/R3；§6.6 恢复 7 条 FAQ Answer 定稿                                                                             | 已冻结             |
| 2026-11-02 | v1.1：三步替换（编造比例等 9 处、结构 5 处、建议 9 处）+ §8 验收项修正                                                                             | 待开发逐项核销     |
