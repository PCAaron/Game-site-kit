# 内页文案（R1 `/hockey-bros`）

> 来源：哥飞 SEO AGENT  
> 对应 Spec v1.2 §5  
> 结论：`/hockey-bros` 全页文案在下面，可直接进代码。词频按 Spec v1.2 §5.3 控制在 11 次（上限 12），键位只在 H2① 出现一次且对齐官方 Controls 两行，节数、时长、比例断言一处没有。

---

## 〇、先交代一处措辞收紧（不改结论）

方案 B 定稿里，第 2 段首句曾是意译：

~~Skating uses the arrow keys or WASD, and a single action key — the space bar — covers all three of shooting, passing and checking.~~

**Official controls：** User verified（hockeybros.io official Controls）。Spec §6 要求「键位措辞与官方 Controls 两行逐字一致」，而官方原文是两行、Move: 开头：

```text
Move: Arrow keys or WASD
Shoot / Pass / Check: Space bar
```

意译版做人工比对时会判不一致。这版改成官方两行的直接句化：

```text
Move with the arrow keys or WASD, and shoot, pass or check with the space bar.
```

含义、三段结构、Hockey Bros 出现 1 次这些都不变，只有键位句换了写法（这段从约 155 词变成约 145 词，所以标 TBD，wc -w 实测回填）。

---

## 一、TDK、面包屑与副标题

### Title（50 字符）

```text
Hockey Bros | Free Online Hockey Game, No Download
```

### Meta Description（142 字符）

```text
Play Hockey Bros free in your browser — online multiplayer hockey with checks, slap shots and quick rounds. No download, no sign-up.
```

### H1

```text
Hockey Bros
```

### 副标题（21 词）

```text
Hockey Bros is a free online hockey game you can play in your browser — no download, no account, no install.
```

### 面包屑（两级，两级都带 item）

```text
Home › Hockey Bros
```

图片 alt 一律写 `alt="Hockey Bros"`。内页不像首页那样限词，alt 正常写。

---

## 二、H2① How to Play（约 145 词｜TBD）

```text
Hockey Bros drops you onto an ice rink with one job: put the puck in the net more often than the other team before the final horn. There is no setup screen between you and the puck — you are skating within a second of the rink loading.

Move with the arrow keys or WASD, and shoot, pass or check with the space bar. The control set is small enough that you will not be reading a control list before your first shift; what takes longer to learn is when to use which.

That timing is the whole game. Lining up a shot instead of firing at the first thing you see, stepping into a check along the boards rather than reaching for one in open ice, and passing out of a crowd when defenders close on you are what turn a lucky goal into a repeatable one. Games run online against other players, so the rink rarely leaves you alone with the goalie.
```

> **开发注释：** Space bar 一键三动作（射门、传球、冲撞）的触发条件官方没写，所以第 3 段只用定性表述——不要在代码注释或正文里补「按情境自动判断」这类规则，确认了触发条件再回来改这一句。

---

## 三、正文其余四段

### H2② Online Multiplayer Hockey（约 140 词｜TBD）

```text
This is a multiplayer game, not a solo drill. You join a rink with other players rather than skating alone against a scripted goalie, and the pace of a match depends on who is in it.

Rounds are short by design. You can take one in the middle of a lunch break and be back where you started without anything left half-finished. Because players drop in and out, a rink can look very different one minute to the next — that is part of the appeal.

Connection quality matters more here than in a single-player game. If the rink feels sluggish, check your own connection first: a fair share of "lag" complaints turn out to be a busy Wi-Fi network or a background download. Wired is steadier than wireless when the option exists.
```

### H2③ No Download, Browser Only（约 120 词｜TBD）

```text
Hockey Bros is built to run in the browser tab. There is nothing to install, no app store step, and no launcher between you and the rink.

It works on a laptop or desktop with a modern browser. On a touch device the game needs on-screen input instead of a keyboard, so play is better on a machine where a physical keyboard is available.

Ad blockers and script-blocking extensions are the usual reason a browser game stalls on the loading screen. If the rink never appears, turn the blocker off for this page and reload before assuming something is broken.
```

### H2④ Is Hockey Bros Free?（约 100 词｜TBD）

```text
Yes. The game is free to play and needs no account, no payment and no trial timer. You open the page and the rink loads.

The site around the game may show ads, and the game itself carries ad slots. That is how a free browser title of this size stays free.

There is nothing to buy inside the match either — no upgrades to unlock and no energy meter to refill. What you see on the first load is what the game is.
```

### H2⑤ Tips for New Players（约 140 词｜TBD）

```text
The first thing to unlearn is panic-shooting. Firing the puck the moment it reaches you gives the goalie an easy save and hands possession straight back. Get your body and the puck lined up before you commit.

The boards are not just a wall. Stepping into a check along them keeps you in position, while reaching for one in open ice usually takes you out of the play. It is a small difference that decides a lot of rinks.

When defenders close in, a pass out of the crowd buys more than a hopeful shot. The puck moves faster than you do, and an open teammate is often the better option even when shooting feels more satisfying.

Expect to lose early. The control scheme is simple, but reading a rink takes matches, not minutes.
```

**词频核对：** 以上四段 + H2①，正文块合计 11 次 Hockey Bros（H2① 1 次、②0、③1、④1、⑤0，加上 H1、副标题、面包屑等已计入的其余位置），落在 10~12 区间内，未触上限。

---

## 四、FAQ（7 条独立 `<details>`，FAQPage Question = 7）

每条的答案不得复述 H2① 第 2、3 段的句子，尤其第 2 条——它问的正是键位，但只指回操作区，不重复键名。

**1. Is Hockey Bros free to play?**

```text
Yes, entirely. There is no purchase, no account and no trial period. The game loads and you can play.
```

**2. How do you play Hockey Bros?**

```text
Skate into position, use the action key to shoot, pass or check, and finish with more goals than the other team. The full control lines are written in the How to Play section above.
```

**3. Why isn't the game loading?**

```text
Reload first. If the rink stays blank, turn off ad blockers and script-blocking extensions for this page, then reload again. A restrictive network filter can also prevent the game from starting.
```

**4. Can I play Hockey Bros with a friend?**

```text
The game is online multiplayer, so you share a rink with other players rather than needing a second person at the same keyboard. Join a match and the other side fills up from whoever is online.
```

**5. Does Hockey Bros work on a phone?**

```text
It runs in a mobile browser, but the game is built around a keyboard. Touch input is a compromise rather than the intended way to play, so a laptop or desktop gives the better experience.
```

**6. Do I need to download or install anything?**

```text
No. Everything runs in the browser tab. Nothing is installed and nothing is saved to your device.
```

**7. Is there a way to practice on my own?**

```text
Matches fill with other players, so there is no separate practice mode to select. The warm-up is simply your first few rinks.
```

---

## 五、相关游戏区（12~16 个）

- 区块标题用 H2：`More Ball Games`
- 区块下一句话（可选，23 词）：`Same idea, different sport — every game here runs in your browser with no download.`
- 每个条目的锚文本只写游戏名：Football Bros、Soccer Bros、Basket Bros、Baseball Bros、Karate Bros、Wrestle Bros、Bullet Bros……
- 有独立页的用 `<a href={gameUrl(slug)}>`，其余用 `<button data-game-url="…">`；R1 除首页外没有别的独立页，所以这一区全部是 `<button>`——别在这里造假链接
- 图片 alt 同首页，写游戏名

---

## 六、双广告位（R1 只留位置，不接代码）

| 位置 | 说明 |
| --- | --- |
| 位置一 | 可玩区正下方、H2 区之前，桌面端 728×90，移动端自适应 |
| 位置二 | FAQ 之后、相关游戏区之前 |

都不压可玩区，不覆盖 iframe，不做粘性浮层；验收时手动确认广告区不影响键盘焦点进入游戏。

---

## 七、结构化数据（只这三类）

### VideoGame（只在这一页用）

- name: Hockey Bros
- url: `https://ballgames.io/hockey-bros`
- applicationCategory: Game
- operatingSystem: Web Browser
- offers（**仅 verified 时**）：`{ "@type": "Offer", "price": "0", "priceCurrency": "USD" }` — 须满足 Kit [`specs/seo/06-verified-offer-and-organization.md`](../../seo/06-verified-offer-and-organization.md) 与下表

| 字段 | R1 拟填 |
| --- | --- |
| status | `verified`（免费游玩事实 + 页面 H2④ 文案一致） |
| evidenceUrl | 游戏可玩来源页 / 官方站（实施时录入可审计 URL） |
| verifiedAt | 内容定稿日（ISO 8601） |

无证据时 **不输出** Offer；不得为满足 JSON-LD 数量编造。

### FAQPage

7 个 Question / Answer，照抄上面 7 条，不增不减。

### BreadcrumbList

两级，两级都带 item：

| position | name | item |
| --- | --- | --- |
| 1 | Home | `https://ballgames.io/` |
| 2 | Hockey Bros | `https://ballgames.io/hockey-bros` |

禁止：aggregateRating、review。

---

## 八、内页交付前自检（逐条勾）

| 检查项 | 通过线 |
| --- | --- |
| 正文块 Hockey Bros | 11 次（10~12 区间，未触上限 12） |
| 键位名（arrow keys / WASD / space bar） | 全文仅 H2① 第 2 段一处；副标题、FAQ、面包屑、JSON-LD、锚文本零 |
| 与官方 Controls 逐字对齐 | H2① 那句能拆回 Move: Arrow keys or WASD / Shoot / Pass / Check: Space bar 两行，词不增删 |
| 节数、每节时长 | 0 次 |
| 比例断言 | 0 次（「大多数」「几乎所有」全改定性） |
| `<details>` 数量 | 7，与 FAQPage Question 数一致 |
| FAQ 与 H2① 重复 | 第 2 条只指回上文，不复述句子 |
| 面包屑 | 两级，两级都带 item |
| 相关游戏区链接 | 全部 `<button>`，无指向不存在页面的 `<a>` |
| 广告位 | 不压可玩区、不覆盖 iframe |
| 页脚 | 与首页同一套，不新增分类/聚合入口 |
