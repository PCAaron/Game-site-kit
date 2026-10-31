# ballgames.io 开发 Spec v1

> **Kit 契约：** 跨实例 SEO 与逻辑内容模型见 [`specs/phases/02-seo-page-model-and-content-contract.md`](../phases/02-seo-page-model-and-content-contract.md)、[`specs/instances/ballgames/README.md`](../instances/ballgames/README.md)。本文档为 **P0 实例层**（TDK 定稿、正文、DoD）；与 Kit 冲突时以 Kit 索引/sitemap/诚实 structured data 规则为准。

> 范围冻结：本期只实现两个页面（/、/hockey-bros）和最小支撑系统。其余页面不做，但数据模型和模板必须能直接复用——这样 P1 每加一页只是填数据，不是开发新功能。

---

## 1. 词表与页面清单（冻结，不许改）

| URL | 主词 | 美国月搜索量 | 现状 | 正文配额 | 结构化数据 |
| --- | --- | --- | --- | --- | --- |
| / | ball games | 27,100（-45%） | 已定稿文案 | 900 词 | WebSite + ItemList |
| /hockey-bros | hockey bros | 基线 8,100 / 9 月峰 40,500，KD 36.2 | 已定稿文案 | 1,000 词 | VideoGame + FAQPage + BreadcrumbList |

P1 预备（本期不建，但模型要能装）：/bros-games 14,800、/sports-games 22,200、/car-soccer 12,100（KD 35.1~43.9）。

“词”是英文单词数（wc -w 口径），不是汉字数，也不含导航/页脚/卡片文字。 一篇合格网页内容 800 词是底线，可写到 1,200——这是哥飞在 5 群给的量。

---

## 2. 全局硬性约束（以下 10 条是验收项，不是建议）

1. indexable 默认 false，页面必须人工放行才可索引；sitemap 只输出 status === "published" && indexable === true。
2. /search?q=\* 一律 noindex + robots.txt 屏蔽，上线第一天做。
3. 分页第 2 页起 noindex, follow，每页 ≥24 张卡。
4. tags 不生成任何页面，只作筛选参数；categories 才出页面，且必须满足 ≥12 款游戏 + ≥600 词手写。
5. 每页唯一 H1；canonical 自指向；slug 变更必须走 redirect 表。
6. 首页正文 hockey bros 出现次数 = 0，只允许出现在游戏卡片 `<a>` 的文字里。
7. iframe 三不加：不加 sandbox、不加 loading="lazy"、不加固定像素高度（用 16:9 自适应）。
8. 游戏源失效不得 404：保住 URL 和正文，游戏区降级为「新窗口打开」按钮 + 一句说明。已拿到排名的 URL 不能作废。
9. JSON-LD 禁止编造 aggregateRating / review，没有真实评分就不写。
10. 首页不放 iframe（第三方嵌入会把 LCP 拖到 3 秒以上，而对手盘上体验分多在 20~40，速度是唯一便宜的优势）。

---

## 3. 数据模型

### 3.1 Game

```json
interface Game {
  id: string;
  slug: string;                 // 唯一，变更走 redirect
  title: string;                // 同时是 H1 来源
  seo: {
    title: string;              // ≤60 字符，主词前置
    description: string;        // ≤155 字符，只当 meta description
    canonical?: string;         // 不填=自指向
    indexable: boolean;         // 默认 false
  };

  // —— 正文 800~1000 词的落点，全部必填 ——
  intro: string;                                    // 80~120 词，含主词一次
  howToPlay: string;                                // 250~400 词
  sections: { heading: string; body: string }[];     // 正文主力，2~4 个
  tips?: string[];                                  // 3~5 条，每条 40~60 词
  faq: { q: string; a: string }[];                  // ≥6 条
  controls: { label: string; keys: string }[];      // 表格化

  categories: string[];         // category slug
  tags: string[];               // 仅筛选，不出页面
  thumbnail: { src: string; alt: string; width: number; height: number; priority?: boolean };

  provider: string;             // → Provider.id
  launch: LaunchConfig;
  status: "draft" | "published" | "archived";
  publishedAt: string;
  updatedAt: string;
}
```

为什么 description 单独降级：它只有 155 字符，装不下 800 词。正文配额必须落成独立必填字段，否则开发只会填一句简介——这是「每页只有两句话」的唯一根源。

### 3.2 LaunchConfig（防白屏的核心）

```json
interface LaunchConfig {
  mode: "iframe-official" | "iframe-provider" | "external-link" | "hosted";
  primaryUrl: string;
  fallbackUrls?: string[];
  embedHeight?: number;   // 默认 16:9 自适应
  timeoutMs?: number;     // 默认 8000
}
```

对方哪天加一行 X-Frame-Options 或 CSP frame-ancestors，改这条数据就换源，不是重做页面。这是整个 Launcher 模块唯一值得投入的地方。

### 3.3 Provider

```json
interface Provider {
  id: string;                        // blue-wizard-digital
  name: string;
  site: string;
  games: string[];                   // game id
  embedPermission: "granted" | "requested" | "unknown" | "denied";
  permissionBasis?: string;          // 邮件日期 / 官方 embed 页 URL / 分成协议
  contactStatus: "none" | "sent" | "replied";
  lastContactedAt?: string;
  riskNote?: string;                 // EULA 只授个人非商业使用 → 随时可能被关
}
```

### 3.4 Category / Redirect

```json
interface Category {
  slug: string; keyword: string; intro: string;
  body: string;                  // ≥600 词手写，不达标不许发布
  gameCount: number;             // <12 不许发布
  indexable: boolean;
}
interface Redirect { from: string; to: string; code: 301 | 302; }
```

---

## 4. 组件清单与分期

| 模块 | 分期 | 说明 |
| --- | --- | --- |
| Catalog 数据层（表 + 后台录入 + 发布状态） | P0 | 呈现层 /games 列表页不在 P0 |
| Game Detail 模板 | P0 | 全站唯一流量入口 |
| Game Launcher | P0 | 可切换 + 8s 兜底 |
| SEOHead（title/desc/canonical/OG/默认回退） | P0 | 所有页面共用 |
| JSON-LD 生成器（按页面类型分发） | P0 | 别每页手写 |
| Sitemap 生成 | P0 | 只收 published && indexable |
| Provider 表 | P0 | 授权状态是数据不是注释 |
| Category System（首批 3 个手写） | P1 | 门槛达标才建 |
| Breadcrumbs | P1 | 内页 + 结构化数据 |
| RelatedGames（锚文本规则化） | P1 | 锚文本只能是游戏名 |
| Redirect 管理 | P1 | slug 变更不留 404 |
| Game Search | P2 | 顶栏配件，不产生排名 |
| 分页 / Featured 自动化 / tags | P2（≥20 款） | 现阶段自动生成即低质量 |

通用组件（GameCard / GameGrid / CategoryNavigation / FeaturedGames）可以按你的 1.3 建，但它们不承载 SEO。 页面质量取决于上面的 P0 四项，不取决于卡片写得多漂亮。

---

## 5. 页面规格 A：首页 /

### 5.1 TDK（照抄，勿改）

```html
<title>Ball Games - Play Free Browser Games | BallGames.io</title>
<meta
  name="description"
  content="Play free ball games right in your browser - hockey, soccer, football, basketball and more. No download, no account, one click to start."
/>
<link rel="canonical" href="https://ballgames.io/" />
<h1>Ball Games</h1>
```

- Title 40 字符，主词在最前；Description 155 字符。
- 不写 `<meta name="keywords">`。
- H1 = Ball Games，全页唯一。

### 5.2 Section 顺序与字数配额

| 区块 | 类型 | 配额 |
| --- | --- | --- |
| ① 顶栏：logo + 搜索框 + 导航（Hot/New/Sports/2 Player/.IO） | 组件 | — |
| ② H1「Ball Games」+ 副标题 | 文本 | 15 词 |
| ③ 主推游戏大卡（16:9，宽 70%）→ /hockey-bros | 组件 | 卡片文字 ≤12 词 |
| ④ 300×250 广告（在卡片下方，不在首屏顶） | 组件 | — |
| ⑤ 分类 chips | 组件 | — |
| ⑥ 游戏网格 8~12 张（tab 切换） | 组件 | 每卡只有游戏名 |
| ⑦ H2「Ball Games You Can Play Right Now」 | 正文 | 120 词 |
| ⑧ H2「Ball Games by Type」 | 正文 | 210 词 |
| ⑨ H2「How to Pick One」 | 正文 | 110 词 |
| ⑩ H2「How This Site Works」 | 正文 | 120 词 |
| ⑪ H2「Playing in the Browser」 | 正文 | 160 词 |
| ⑫ H2「FAQ」×8 | FAQPage | 180 词 |
| ⑬ 页脚内链 | 组件 | — |

#### 导语（58 词，紧接 H1）

```html
Every game on this page runs inside the tab you already have open. No installer, no sign-up, no
launcher asking for an update. We collect ball games — hockey, soccer, American football,
basketball, baseball, and the odd car-with-a-ball hybrid — and put them behind one click. If it
needs a download, it is not on this site.
```

#### H2① Ball Games You Can Play Right Now（120 词）

```html
The grid below is the short list: the games people actually come back to, ordered by how much they
get played rather than by which one we like. It changes as new titles arrive, and right now the
newest arrival is an arcade hockey game from a Canadian studio that has been climbing fast since it
launched. Everything here loads in a single click and remembers nothing about you — there is no
account to make, so nothing to lose if you close the tab. If the game you want is not in the grid,
the category pages hold the rest of the catalogue, and they are one click further down this page.
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
Each type has its own page with the full list, sorted by what is worth your time. Start with the one
you already know the rules for — the learning curve is shorter and the fun arrives sooner.
```

#### H2③ How to Pick One（110 词）

```html
Two minutes to kill. Pick anything in the grid. These games are built for short sessions, and most
of them are playable before you have finished reading the controls.
<!--换行-->
Playing with someone next to you. Go for two-player. A shared keyboard is still the best controller
for this kind of game, and the titles here support it.
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

这段不要删。 它同时是合规立场，也是写给 Blue Wizard 看的姿态：我们不剥你的广告。

#### H2⑤ Playing in the Browser（160 词）

```html
Browser games live or die on two things: whether the frame loads, and whether the keyboard works.
<!--换行-->
It will not load. Nine times out of ten it is an ad blocker. The frame is served by the publisher,
and blockers treat in-game ads the same as they treat banner ads. Turn it off for this domain and
reload. The other common cause is a school or office network that filters game domains outright — in
that case no amount of refreshing will help.
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

#### FAQ 8 条（180 词，配 FAQPage schema）

```html
Are the ball games free? — Yes. No account, no download, no trial timer.
<!--换行-->
Do I need to install anything? — No. Everything runs in the browser tab.
<!--换行-->
Can I play on a Chromebook? — Yes, and on any machine with a modern browser.
<!--换行-->
Why will a game not load? — Usually an ad blocker or a network filter. Disable the blocker for this
domain and refresh. Do these games work on a phone? — They load, but the controls assume a keyboard.
<!--换行-->
Who makes the games? — The studios that publish them. We write the pages, they build the games.
<!--换行-->
Can I play with a friend on the same keyboard? — Yes. Two players, one keyboard, one screen. No
second machine and no account needed.
<!--换行-->
Are new games added? — Yes, whenever something worth playing shows up.
```

正文合计 ≈900 词。

> ⚠️ 三处与你的原设计不同，必须照此实现：
>
> - Game Search 不进正文，只在顶栏；
> - Recently Added 与 Recommended 删掉（2 款游戏时是空的，≥10 款再上），Featured 合并进⑥；
> - P- opular Categories 改成 chips（⑤），顺便承担导航职能。
>
> ⚠️ ⑥ 卡片数必须控制在 8~12。20 张卡会让 soccer bros、football bros 这些游戏名把主词挤出词频第一位。

#### 可玩区与卡片区

按哥飞原则，第一屏正中间必须是可玩入口：iframe 占屏宽 70%、高 ≥480px。

卡片 8~12 张，每张 `<a>` 文字只有游戏名，副标题一行（类型 + 是否双人）。

第一张放新游戏，锚文本 Hockey Bros；这是首页唯一一次出现该词。

### 5.3 JSON-LD

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BallGames.io",
    "url": "https://ballgames.io/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://ballgames.io/search?q={q}",
      "query-input": "required name=q"
    }
  }
</script>
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "url": "https://ballgames.io/hockey-bros" },
      { "@type": "ListItem", "position": 2, "url": "https://ballgames.io/bros-games" },
      { "@type": "ListItem", "position": 3, "url": "https://ballgames.io/sports-games" }
    ]
  }
</script>
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BallGames.io",
    "url": "https://ballgames.io/"
  }
</script>
```

ItemList 每项的 name 只能是游戏名，不许加 description 堆词。

---

## 页面规格 B：/hockey-bros

### 6.1 TDK（照抄）

```html
<title>Hockey Bros Game - Controls, Tips, Fixes | BallGames.io</title>
<meta
  name="description"
  content="Hockey Bros is a free arcade hockey game you play right in your browser. Controls, tips, a look at the studio behind it, and fixes when it will not load."
/>
<link rel="canonical" href="https://ballgames.io/hockey-bros" />
<h1>Hockey Bros</h1>
```

Title 42 字符，前 32 字符就保住主词，移动端截断无损失。unblocked 不进 Title——官方自己有 unblocked 页，硬碰没意义；改由正文 H3 承接（该词 170/月，+120%）。

### 6.2 Section 顺序

1. ① 面包屑 Home › Sports › Hockey Bros
2. ② H1「Hockey Bros」+ 一行副标题
3. ③ 游戏区 iframe（第一屏正中央，≥480px 或 16:9）
4. ④ Controls / Note 两行状态提示
5. ⑤ 300×250 + 336×280 广告
6. ⑥ H2 正文 6 段
7. ⑦ 相关游戏 4 张卡
8. ⑧ FAQ 6 条

### 6.3 Launcher 实现要求

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
<script>
  const f = document.querySelector('.game-wrap iframe')
  let ok = false
  f.addEventListener('load', () => {
    ok = true
  })
  setTimeout(() => {
    if (!ok)
      document.getElementById('gload').innerHTML =
        'Still loading — <a href="https://www.hockeybros.io/" target="_blank" rel="noopener">open Hockey Bros in a new tab</a>.'
  }, 8000)
</script>
```

验收三条：.game-wrap 必须撑开 16:9（不撑会塌成 150px 窄条，这类站最常见的首屏事故）；不加 sandbox（会破坏多人连线和对方广告）；不加 loading="lazy"。

另注：iframe 里跑的是官方自己的广告（源码 window.adPrefix = "hockeybros-io"），你的广告位只能在游戏区之外，别指望这一区有收益。

### 6.4 正文配额

| 区块 | 配额 | 状态 |
| --- | --- | --- |
| H1 副标题 + 面包屑 + 状态提示 | 60 词 | 定稿 |
| H2「How to Play Hockey Bros」 | 160 词 | 定稿 |
| H2「Controls」（表 + 1 句） | 50 词 | 定稿；模式/练习房部分待实测补 60 词 |
| H2「Tips for Winning」（5 条） | 150 词 | 定稿 |
| H2「About Hockey Bros」（3 段 + 1 个 H3） | 380 词 | 见 6.5 |
| H2「The Bros Series, Compared」 | 120 词 | 定稿（4 个内链占位） |
| H2「FAQ」×6 | 140 词 | 定稿 |
| 合计 | ≈1,060 词 | 落在 800~1,200 区间 |

### 6.5 Section 段

```bash
H2① How to Play（约 150 词）
Hockey Bros is a browser ice hockey game: two teams, one rink, and a puck that behaves roughly the way a puck should. You skate, you pass, you shoot, and when you do not have the puck you hit people. The physics are deliberately loose — hits send players tumbling, the puck ricochets off the boards at silly angles, and goalies occasionally wander out of the crease to investigate something.

What makes it work is the size of the rink. It is small enough that you are always in the play and never more than a second away from the goal, which means the game rewards positioning over twitch reflexes. You can lose a match having taken twice as many shots, because the player who stands in the right place gets the rebound.

No account, no download, nothing to configure. You open it, you play a short match, and you are done — which is the whole point of a game that fits in a browser tab.
H2② Controls（约 115 词）
One key does three jobs. With the puck you pass or shoot; without it, space is your check. That is the whole control scheme — the game is about position, not about remembering buttons.

A match is split into short periods on a game clock that runs faster than the clock on your wall, so a full game takes less time than the arithmetic suggests. Between periods the ice gets resurfaced and you sit through the break. Whoever is ahead when the clock runs out wins. The studio pitches it as a quick game you can fit into lunch, and the structure is why that works.

There is no practice mode, which sounds like a problem and is not. The first match is the tutorial: the rink is small, the controls are one key, and a full game is short, so you learn by playing rather than by watching a tutorial you will skip anyway.
H2③ Tips for Winning（约 150 词）
Stay between the puck and your own net. Most goals conceded by new players come from chasing the puck into a corner and leaving the middle open. Back off, hold the slot.

Pass before you shoot. The shot is fast enough to beat a goalie from range, but a pass across the middle pulls the goalie out of position and doubles the chance of a rebound landing on your stick.

Use the check as a reset, not a highlight. Big hits look great and leave you out of position for a beat. Do it in the neutral zone, not in front of your own goal.

Learn the boards. Angles off the side walls are consistent. One bank pass beats three defenders.

Play the closing stretch differently. When the clock is running down, the safe pass is worth less than a bad shot on goal.
H2④ About Hockey Bros（约 380 词）
前置段

Hockey Bros is made by Blue Wizard Digital, a small independent studio in Canada that has spent years building one very specific thing: arcade sports games with oversized heads, loose physics and short rounds. The same team is behind the football, soccer, basketball, baseball and kart entries in the same family, which is why the control scheme barely changes between them.

The game launched on 1 August 2026, which makes it the newest thing the studio has shipped — and the reason it is the one people are searching for right now. It runs on web standards inside a browser tab, on any machine with Chrome, Edge, Firefox or Safari. No plugin, no launcher, no account.

And it is a browser game that does not feel like a compromise: the load time is short, the frame is stable, and you are in a match within a couple of seconds of clicking play.
H3｜Hockey Bros unblocked, on a school laptop（约 110 词，已重写）
If you are reading this on a school Chromebook, you already know how this goes: the network filters anything that looks like a game portal, and half the results are pages that took the game down long ago. What we can tell you is where the block actually sits. The game is served from the studio's own domain rather than from a game portal, so a filter that blocks sites by category may still let it through. If it does not, refreshing will not change anything — the block is on the network, not in your browser. A normal connection with an ad blocker switched off covers almost every "it will not load" report we get.
H3｜Why it is worth a tab（约 80 词，未改）
What separates it from the other browser hockey games is how directly it responds. Every input lands immediately — no queue, no animation you have to sit through, no cooldown on the check. When you lose the puck it is because you were out of position, not because the game decided to play a two-second tackle you could not cancel. That is what makes the short matches work: you always know why you lost, so you always want one more.
H2⑤ The Rest of the Bros Series（约 100 词）
Hockey Bros is the newest member of a family built by the same studio, with the same big-headed athletes and the same short rounds:

- [Soccer Bros] — the most played of the family, and usually where people start.
- [Football Bros] — American football cut down to a few downs and a lot of passing.
- [Basket Bros] — 1v1 arcade basketball, built for steals and dunks.
- [Baseball Bros] — timing at the plate rather than a full season.
- [Kart Bros] — the racing branch; same characters, no ball.

If you like the controls here, the others use the same one-key scheme.
```

> ⚠️ 那 5 个 [ ] 是内链占位；页面没建就先链 /bros-games，别留死链。

#### FAQ 6 条（120 词，配 FAQPage schema）

```bash
Is Hockey Bros free? — Yes, completely. No account, no download, no trial.
What are the controls? — Arrow keys or WASD to move; space bar to shoot, pass or check, depending on whether you have the puck.
How long is a match? — A match runs to the final horn. The studio pitches it as a quick game you can fit into a lunch break.
Who makes it? — Blue Wizard Digital, the Canadian studio behind Soccer Bros, Football Bros, Basket Bros and Kart Bros.
Why isn't the game loading? — Usually an ad blocker or a school/office network filter. Disable the blocker, try Chrome, refresh.
Can I play it on a phone? — It loads in mobile browsers, but the controls are built for a keyboard. Play on a laptop if you can.
```

### 6.6 JSON-LD

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Hockey Bros",
    "url": "https://ballgames.io/hockey-bros",
    "applicationCategory": "Game",
    "genre": "Sports",
    "gamePlatform": "Web browser",
    "operatingSystem": "Any",
    "publisher": { "@type": "Organization", "name": "Blue Wizard Digital" },
    "datePublished": "2026-08-01",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  }
</script>
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ballgames.io/" },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Sports",
        "item": "https://ballgames.io/sports-games"
      },
      { "@type": "ListItem", "position": 3, "name": "Hockey Bros" }
    ]
  }
</script>
```

FAQPage schema 按上面 6 条问句一一对应 Question/Answer，Answer 用 FAQ 原文。

FAQPage 与 BreadcrumbList 照常生成。aggregateRating 不写——没有真实评分别编，会被判结构化数据滥用。

---

## 7. 内容规则

### 主词分布（内页 hockey bros 10~14 次 / 约 1,000 词）

存为表格

| 位置 | 次数 |
| --- | --- |
| `<title>` | 1 |
| `<h1>` | 1 |
| meta description | 1 |
| 首段前 100 词内 | 1 |
| 两个 H2 里 | 1~2 |
| 正文段落 | 5~7 |
| FAQ 问句 | 1~2 |
| 内链锚文本 | 1 |

首页 ball games 12~16 次；hockey bros 正文 0 次。

密度只看一个指标：把正文喂进词频工具，排第一的名词短语必须是该页主词。如果第一位是 game、player 或别的游戏名，说明跑偏了，删到它掉下去。哥飞讲密度就是这个意思——让整页内容聚焦核心主题，不是凑百分比，他没有给过固定阈值。

防堆砌：第二次之后用 “the game / it / a match / this one” 指代，别每段开头都写全名。

内链：Related Games 锚文本只能是游戏名。/soccer-bros 等 4 个页面没建之前，先链到 /bros-games，不许留死链。

---

## 8. 验收清单（DoD，逐项打勾才算交付）

- [ ] 全站只有一个 H1/页，且 H1 = 主词
- [ ] Title 主词前置、≤60 字符；description ≤155 字符；无 keywords 标签
- [ ] 正文英文词数 ≥800（首页目标 900，内页 1,000），wc -w 去标签实测
- [ ] 词频第一位名词短语 = 该页主词
- [ ] 首页正文搜索 hockey bros 结果为 0
- [ ] canonical 自指向；indexable 已人工置 true 才进 sitemap
- [ ] sitemap 只含 2 个 URL，无 /search、无分页
- [ ] /search?q=x 返回 noindex，robots.txt 有 Disallow: /search
- [ ] iframe 无 sandbox、无 lazy；.game-wrap 在 375px 宽下高度 ≥210px
- [ ] 拔掉网 / 改错域名时，8 秒后出现「新窗口打开」而非白屏
- [ ] 游戏源失效时 /hockey-bros 返回 200 且正文完整，不 404
- [ ] JSON-LD 用 Rich Results Test 全部通过；无 aggregateRating
- [ ] 首页 LCP < 2.5s（首页无 iframe，这条应一次过）
- [ ] 上线 48 小时后 site:ballgames.io hockey bros，排第一的必须是 /hockey-bros
- [ ] 上线 48 小时后查 / 是否仍在 ball games 的 SERP 里（不在属正常，看收录）
