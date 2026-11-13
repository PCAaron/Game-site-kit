# 首页文案（R1 `/`）

> 来源：哥飞 SEO AGENT  
> 对应 Spec v1.2 §4  
> 结论：下面是首页全部文案，按 Spec v1.2 §4 的口径写好，可直接进代码。两个硬性要求已满足：全篇不出现「hockey bros」（首页该词只保留首卡锚文本 1 次）、不出现任何具体键位名、不写节数与时长、不写比例断言、没有百科式定义段。所有词数标 TBD，文案定稿后统一用 `wc -w` 实测回填，不要照本文估数写进文档。

---

## 一、TDK 与首屏

### H1

```text
Ball Games
```

### Title（51 字符，只此一个主词）

```text
Ball Games | Free Online Sports Games, No Download
```

### Meta Description（137 字符）

```text
Play free online ball games right in your browser — soccer, basketball, rink battles and more. No downloads, no sign-ups, no installs.
```

### 副标题（H1 下方，15 词）

```text
Pick a game and play in seconds — free, in your browser, nothing to install.
```

### 可玩区旁边的游戏名（由 DEFAULT_PLAYER_GAME 派生，不是文案）

```text
Now playing: Football Bros
```

---

## 二、导语（卡片区之后，约 55 词｜TBD）

```text
Everything on this page runs in your browser tab. Pick a card, the game loads in place, and you are playing before the page finishes scrolling. No account, no download, no install. Some games are solo challenges, others are two-player battles on one keyboard or one device — the cards below mark which is which.
```

---

## 三、卡片区（20 张，文案规则）

- 锚文本只写游戏名，不带 “play free”“click here” 之类修饰。首卡就是 Hockey Bros（全站唯一 `<a>`）。
- 图片 alt 写游戏名，如 `alt="Hockey Bros"`、`alt="Football Bros"`。alt 不计入 §4.5 的词频统计口径，不要为了词频把 alt 写坏——可访问性优先。
- 卡片标题不用 heading 标签（`<h2>`~`<h6>` 一个都不占），用 `<p>` 或 `<span>`。
- 每张卡上加一个模式标记（Local / Online / 1P），正文 H2④ 引用了这个标记，卡片上必须有。
- 具体 20 张的排序与落点以「ballgames.io R1 卡片落点定稿表（2026-11-05 审查版）」为准，本文不重复。

---

## 四、正文 5 段

### H2① Free Online Ball Games（约 170 词｜TBD）

```text
Ball games covers a wide field: soccer, basketball, ice rink battles, volleyball, dodgeball and the odd arcade take on a sport that never quite existed. What they share is a shape — a ball, a goal or a target, and a clock or a score that decides when it is over.

Every title here is free to play and runs on the open web. Nothing has to be bought to start, and there is no paywall between you and the first match. A few games carry ads around the play area, which is how the studios behind them keep running; the games themselves stay free.

Most rounds are short. You can finish a match in the time it takes to drink a coffee, which is why this kind of game tends to get played in the gaps of a day rather than in long sessions. If you only have five minutes, pick a card, play one round, close the tab — nothing is lost.
```

### H2② No Download, Play in the Browser（约 150 词｜TBD）

```text
Every game on this site is an HTML5 build that runs inside the page. There is no installer to download, no app store to visit, and nothing asking for permission to your device.

That also means no waiting on a multi-gigabyte patch before your first match. A modern browser on desktop, laptop, tablet or phone is enough, and the major ones all work. On a phone the game fills the screen, in portrait or landscape depending on the title.

Because nothing is installed, switching games costs one click. If a game is not what you expected, go back to the cards and pick another — there is no uninstall step and no leftover files.

One practical note: ad blockers and some browser extensions interfere with game loaders. If a title sits on a loading screen, turn the blocker off for this page and refresh.
```

### H2③ Unblocked at School or Work（约 150 词｜TBD）

```text
School and workplace networks often filter whole categories of site, and game sites are a common one. When a page will not load on a managed network, the block is almost always applied by that network rather than by us, and lifting it is a decision for whoever runs it. We do not offer ways around network filters, and we would not recommend trying.

What we can say is what the games need when a network does allow them: a modern browser, an ordinary internet connection, and permission to run JavaScript. No plugin, no download, no separate launcher.

If you are on a network you control and a game still will not start, the usual causes are a strict firewall rule, an ad blocker, or an extension that blocks scripts. All three are fixable in a minute by whoever set them up.
```

> **开发注释：** 标题保留是为了承接搜索词，但正文只解释「为什么会被拦」，不得出现任何绕过手段、镜像站、代理、VPN 之类说法，也不得写 “we are unblocked” 这种承诺。

### H2④ Two-Player Ball Games（约 150 词｜TBD）

```text
Plenty of the games here are built for two people in the same room. Some split one keyboard between the two players, some take a controller each, some expect a device apiece. The card for each game carries a mode tag, so you can check the setup before you commit.

Local two-player is the fastest way to settle an argument. Load the game, hand over one side, and the round starts without accounts, lobbies or friend codes.

A separate set of titles is online multiplayer: you share a link or join a public match, and the other player can be anywhere. Those need a stable connection, and quality follows the weakest connection in the match — if one player lags, everyone feels it.

If you are unsure which mode a game offers, look for the tag on its card: local, online, or single-player.
```

### H2⑤ How to Play（约 150 词｜TBD）

```text
Pick a card and the game loads in the play area at the top of this page. Nothing else changes — same tab, same scroll position, no popup.

Controls vary by title but follow one of three patterns: keyboard, mouse or touch. Where a keyboard is used, one set of keys moves and another key acts, and each game shows its own key hint before the first round. If a game ignores your keys, click once inside the play area first: keyboard input only reaches the game once the page knows you are there.

Scoring rules are stated for each game: a match ends on a clock, on a target score, or after a set number of rounds. Spend the first minute learning what counts as a point before trying to win.

When you are done, refresh the page or pick another card. Nothing is stored, so there is no profile to clean up.
```

> **注：** 刻意没写 “arrow keys”“WASD”“space bar”，统一指向游戏自己显示的键位提示，一律不在首页写出具体键名。具体键位只在 `/hockey-bros` 的 How to Play 段出现一次。

---

## 五、FAQ（8 条独立 `<details>`）

每条答案 2~3 句，不复述正文原句；FAQPage 的 Question 数必须等于 8。

**1. Are these ball games free?**

```text
All of them. There is no purchase, no trial timer and no account required. Some titles show ads around the play area, which is how they stay free.
```

**2. Do I need to download or install anything?**

```text
No. Every game is an HTML5 build that runs inside your browser tab. Nothing is saved to your device and there is no launcher.
```

**3. Can I play on a phone or tablet?**

```text
Yes, provided the browser is reasonably current. Games fill the screen and switch between portrait and landscape depending on the title. On-screen controls appear where a game needs them.
```

**4. What do I do if a game will not load?**

```text
Reload the page first. If that does not help, disable ad blockers or script-blocking extensions for this page, then reload again. A very strict network filter can also stop a game from starting.
```

**5. Can two people play at the same time?**

```text
Many titles support it, either sharing one keyboard or using a device each. Each game's card carries a mode tag showing whether it is local, online or single-player.
```

**6. Do I need an account to play online?**

```text
No account is needed to start a game. Where a title has online multiplayer, you join from the game itself rather than from this site.
```

**7. Is my progress saved if I close the tab?**

```text
Not on our side — we store nothing. Closing the tab ends the session. A few individual games keep their own local save, and the game will tell you if it does.
```

**8. How often are new games added?**

```text
Games are added as they become available to embed, without a fixed schedule. When a real “New” list page exists, the top navigation can link to it; R1 does not promise that page.
```

---

## 六、页脚

链接组（只这些，不留分类位、不留聚合位）：

```text
Ball Games ・ About ・ Privacy ・ Terms ・ Contact
```

（Hockey Bros 仅经首卡进入；**不得**在页脚重复链接，以满足 `hockey bros` 全页仅 1 次词频）

- 四个法务页若 R1 还没建，先删掉对应的链接，不要链到 404，也不要写进 sitemap。
- 上线日期只出现一处：`© 2026 BallGames.io · Launched November 2026`

---

## 七、结构化数据（文案部分）

### WebSite（无 SearchAction，R2 加回）

- name: BallGames.io
- alternateName: Ball Games
- url: `https://ballgames.io/`

### Organization

按 Kit [`specs/seo/06-verified-offer-and-organization.md`](../../seo/06-verified-offer-and-organization.md)：有核实品牌展示依据时可输出；**无证据时允许省略**，不得虚构法人主体。

### ItemList（R1：只 1 项，指向真实详情页）

- `DEFAULT_PLAYER_GAME`（Football Bros）仅决定首页播放器初始 embed；**不**决定 ItemList
- itemListElement → position 1 · name **Hockey Bros** · url **`https://ballgames.io/hockey-bros`**（`gameUrl('hockey-bros')`，绝对 canonical）

### FAQPage

8 个 Question / Answer 对，文案照抄上面 8 条，不增不减。禁止 aggregateRating、review。

---

## 八、词频与自检清单（首页交付前逐条勾）

| 检查项 | 通过线 |
| --- | --- |
| 首页 “hockey bros” | 1 次（仅首卡锚文本） |
| 正文块 “hockey bros” | 0 次（五段 + FAQ + 页脚全部为 0；**计入口径**含可见正文、卡片锚文本、FAQ 可见文本、页脚可见文案；**不计** URL / alt / JSON-LD / metadata） |
| 键位名（arrow keys / WASD / space bar） | 0 次（只在 `/hockey-bros` 出现一次） |
| 节数、每节时长 | 0 次 |
| 比例断言（几乎所有 / 大多数 / 十次有九次） | 0 次 |
| 百科段（what are ball games / types of ball games） | 0 段 |
| `<details>` 数量 | 8 |
| FAQPage Question 数量 | 8，与 details 数一致 |
| ItemList 项数 | 1（Hockey Bros → `/hockey-bros` 真实页） |
| 页脚链接 | 最多 5 个可见项（Ball Games + 法务）；无 Hockey Bros；法务页未建则先删 |
| 卡片 heading 标签 | 0 个（卡片标题不用 h 标签） |

**词数 TBD 的落法：** 五段正文标的是约 170 / 150 / 150 / 150 / 150 词，加上导语约 55 词和 FAQ，文案落进代码后用 `wc -w` 实测一次，把结果回填到 Spec §6 与 §7 的四处标注里，四处必须是同一个数。别拿本文估数当准。
