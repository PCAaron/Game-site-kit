# ballgames.io 开发 Spec v1.2（合并定稿）

**版本** v1.2 ｜ **定稿日** 2026-11-12 ｜ **状态：** 可施工  

**替代：** v1 + 增补 1 + 增补 2 + 三步改定稿 + 增补 3（首页默认播放器）+ How to Play 方案 B 定稿

---

## §0 四处作废（先看这张表，别照旧版做）

| 旧写法 | 现在以谁为准 |
| --- | --- |
| 增补 1：卡片点击「在首页弹窗 iframe 播放」 | 作废。点击只有一种实现：原地替换唯一 `<iframe id="player">` 的 `src` |
| 增补 1 的 1 次 → v1.1 改成 2 次 | v1.2 改回 1 次（可玩区显示的游戏名已换 Football Bros） |
| v1：H2②「每个类型都有自己的页面」 | 作废。R1 没有分类页，不得承诺 |
| §6 旧句「不写版本参数（节数 / 分钟 / 键位名）」 | 拆成两条，键位改为「允许且仅限一处」，见 §6 |

---

## §1 项目定义

球类 H5 小游戏聚合站；嵌入现成游戏、不自研；一个域名承载多款游戏、每款游戏一个页面；对标 brosgames.io；面向美国市场。R1 只上线 2 个页面：`/` 与 `/hockey-bros`。

**不做：** 原生 App、后台、UGC、多语言（R1 只预留目录位置）、批量上页。

---

## §2 站点常量与路由

### 2.1 常量（都放数据层，组件里不许硬编码）

- `SITE_URL = 'https://ballgames.io'`（含协议不带尾斜杠）—— canonical / sitemap / 结构化数据 / OG 的绝对地址都从它拼
- `gameUrl(slug)`——全站 URL 唯一生成器，返回相对路径
- `DEFAULT_PLAYER_GAME = 'football-bros'`——首页播放器初始嵌入哪款游戏

### 2.2 路由表

| 路径 | 用途 | 期次 |
| --- | --- | --- |
| `/` | 首页，扁平，无前缀 | R1 |
| `/{game-slug}` | 游戏详情页，slug = 游戏名连字符形式 | R1 只有 `/hockey-bros` |
| `/bros-games`、`/sports-games`、`/car-soccer` | 分类聚合页，与游戏页同级，不是父子目录 | R3 |

### 2.3 四条工程约束（硬性）

1. 数据模型只存 slug，不存完整路径。
2. 内链 / canonical / sitemap / 结构化数据 / OG 全部走 `gameUrl(slug)`；模板里不得出现 `/hockey-bros` 字面量，CI grep 拦截。
3. 将来加前缀：只改 `gameUrl` 一个函数 + 一条批量 301 + 重提 sitemap。
4. 上线后不可改的两样：slug 本身、域名。

**为什么不加 `/game/` 前缀：** 一款游戏同时属冰球 / 双人 / 球类多个分类，用分类做父目录就必须选一个，选错是永久错；且 R1 只有 2 页。

---

## §3 数据模型

| 字段 | 说明 |
| --- | --- |
| slug | 唯一标识，也是 URL 段；hockey-bros、football-bros |
| name | 展示名；H1 / 锚文本 / 卡片标题都用它 |
| embedUrl | 嵌入地址（官方裸嵌或分发平台嵌入代码） |
| sourceLevel | L1 分发平台官方嵌入 / L2 官方站裸嵌 / L3 无源 |
| category | 冰球、足球、篮球、格斗…… |
| hasPage | 是否有独立页 → 决定卡片是 `<a>` 还是 `<button>` |
| priority | 卡片排序 |

---

## §4 首页 `/`

### 4.1 模块顺序（定稿，不再调整）

H1 → 副标题 → 唯一 iframe 可玩区 → 15~20 张卡片 → 导语（约 55 词）→ 5×H2 正文 → FAQ 8 → 页脚

### 4.2 TDK

- H1 只有 Ball Games 一个词，不叠加第二主词
- Title = 主词 + 后缀（后缀 ≤20 词口径）
- 副标题 ≤20 词，一句话说清免费、免下载、浏览器直接玩
- 导语约 55 词，位于卡片之后、正文之前
- TDK 里 hockey bros 出现 0 次

### 4.3 可玩区（全页唯一 iframe）

- 只有一个 `<iframe id="player">`；初始 src 由 `DEFAULT_PLAYER_GAME` 派生 → R1 = `https://footballbros.io/`
- 容器 16:9 固定比例；不加 sandbox；不加 lazy（首屏就要它）
- 8 秒 onload 兜底：超时降级为封面图 + 播放按钮
- 可玩区旁显示的游戏名跟随 `DEFAULT_PLAYER_GAME`（= Football Bros），不是 Hockey Bros；R1 卡片不做选中态高亮
- 上线后 7 天实测 LCP，>2.5 秒即改「封面图 + 点击加载」（开关保留）

### 4.4 卡片 15~20 张

- 排序：Hockey Bros 第 1 张、Football Bros 第 2 张
- 全站唯一 `<a>` = Hockey Bros，`href={gameUrl('hockey-bros')}`，锚文本只写游戏名、不带 “play free” 修饰
- 其余全部 `<button data-game-url="…">`，点击原地替换唯一 iframe 的 src：不改 URL、不 pushState、不加 hash、不弹窗、不新增第二个 iframe
- `hasPage` 变 true 时才改 `<a>`（R2）
- 卡片图必须有 alt（写游戏名）；卡片标题不用 heading 标签
- 落点明细以「ballgames.io R1 卡片落点定稿表（2026-11-05 审查版）」为准（20 行）；已实测可嵌前 8 款：Hockey Bros / Football Bros / Soccer Bros / Basket Bros / Baseball Bros / Karate Bros（fightbros.io）/ Wrestle Bros / Bullet Bros。未实测的逐款本地验，嵌不了换同批可嵌款，不硬上

### 4.5 词频（防蚕食，硬指标）

| 位置 | hockey bros |
| --- | --- |
| 首页全页 | 1 次（仅首卡锚文本） |
| 正文块 | 0 |
| Title / meta / alt / JSON-LD / URL / 面包屑 | 0 |

计数范围 = 可见正文 + 卡片锚文本，不含 title/meta/alt/JSON-LD/URL/面包屑。

### 4.6 正文 5 个 H2（全部往游戏意图拉）

1. Free Online Ball Games
2. No Download, Play in the Browser
3. Unblocked at School or Work（合规立场段保留：只说明最常见原因，不承诺绕过任何网络限制）
4. Two-Player Ball Games
5. How to Play

禁止「什么是 ball games / 球类运动有哪些」这类百科段——第一页混着应用商店、维基、零售站，百科段等于把自己往维基方向做。

### 4.7 FAQ

- 8 条独立 `<details>`（原来两问黏一起的必须拆开）
- FAQPage 的 Question 数 = 8
- 不写具体键位名；只写行为描述

### 4.8 页脚

- 只放 About / Privacy / Terms / Contact + 首页 + `/hockey-bros`
- 不留分类位、不留聚合位
- 四个法务页 R1 若未建，先去掉对应链接，不承诺不存在的页面
- 上线日期只在页脚出现一处

### 4.9 结构化数据

- **WebSite**（删掉 SearchAction，R2 加回）
- **ItemList**：只列 1 项，且必须指向 `DEFAULT_PLAYER_GAME`（R1 = Football Bros）
- **Organization**
- **FAQPage**（8 问）
- 禁止编造 aggregateRating / review

### 4.10 顶部导航

R1 / R2 只放 Hot 与 New；Sports / 2 Player / .IO 移到 R3。

---

## §5 `/hockey-bros`

### 5.1 模块顺序

面包屑 → H1 → 副标题 → iframe → 双广告位（放在游戏区外，不压可玩区）→ 5×H2 正文 → FAQ 7 → 相关游戏 12~16 → 页脚

### 5.2 H2① How to Play 正文定稿（方案 B，约 155 词，以 wc -w 实测回填）

```text
Hockey Bros drops you onto an ice rink with one job: put the puck in the net more often than the other team before the final horn. There is no setup screen between you and the puck — you are skating within a second of the rink loading.

Skating uses the arrow keys or WASD, and a single action key — the space bar — covers all three of shooting, passing and checking. The control set is small enough that you will not be reading a control list before your first shift; what takes longer to learn is when to use which.

That timing is the whole game. Lining up a shot instead of firing at the first thing you see, stepping into a check along the boards rather than reaching for one in open ice, and passing out of a crowd when defenders close on you are what turn a lucky goal into a repeatable one. Games run online against other players, so the rink rarely leaves you alone with the goalie.
```

**要点：** 本段 「Hockey Bros」只出现 1 次（仅首句）；不写节数、每节时长、用户数、胜负比例；键位措辞与 hockeybros.io 官方 Controls 两行逐字一致。空格一键三动作的具体触发条件官方没写，正文用定性表述；要写死规则须先实机确认。

### 5.3 其余规格

- H1 = Hockey Bros；正文块 hockey bros 10~12 次
- FAQ 7 条独立 details，FAQPage Question = 7
- 结构化数据：VideoGame + FAQPage + BreadcrumbList（两级都带 item：`https://ballgames.io/` 与 `gameUrl('hockey-bros')`）；禁 aggregateRating / review；VideoGame 只在这一页用
- 内容要求：可玩内容 + 操作说明 + 相关游戏三块缺一不可，不得只换标题套模板
- 相关游戏区 12~16 个链接：有独立页用 `<a>`，其余用 `<button>`
- FAQ 若含 「How do you play Hockey Bros?」，答案用两句口诀（滑行 → 空格 → 进球多者胜），不得复述 H2① 第 3 段的时机论述

---

## §6 全站规则

- **sitemap：** R1 只 2 条（`/` 与 `/hockey-bros`），全部走 `gameUrl`
- **robots：** `/search` 只写 Disallow（标 R2 处理），不写 noindex——两者互斥；R1 不建 `/search`
- **内链：** R1 只有一条真实内链（首卡 → `/hockey-bros`），不制造指向不存在页面的链接
- **多语言：** R1 不做，预留 `/es/` 这类目录位置，路由函数按「可加前缀」写

**内容纪律：**

- 节数与每节时长：禁用项，任何页面不得写
- 键位：允许，但仅限 `/hockey-bros` 的 How to Play 段出现一次，措辞与官方 Controls 逐字一致（Move: Arrow keys or WASD / Shoot / Pass / Check: Space bar）；副标题、FAQ、卡片锚文本、JSON-LD 一律不写键位；官方变更时同一次发版改这一处
- 不编造比例（「十次有九次」「几乎所有」「大多数进球」一律改定性）
- 不承诺 R1 不存在的页面
- 合规立场段保留
- 词数：所有词数位置统一标 TBD，文案定稿后 `wc -w` 实测回填同一个数；旧的 950/778、980/895 全部删除
- 卡片宽度：375px 下按实测值（约 147px），不写 ≥210px

---

## §7 CI 与上线前自检

### 7.1 CI 三条拦截

1. `grep -rn "hockeybros.io" src/`：只允许命中 `/hockey-bros` 的数据配置；不得出现在首页模板或 `DEFAULT_PLAYER_GAME` 取值里
2. `curl -s https://ballgames.io/ | grep -c "hockeybros.io"` = 0；`curl -s https://ballgames.io/hockey-bros | grep -c "hockeybros.io"` ≥ 1
3. 播放器组件源码里不得出现任何 `https://` 域名（嵌入源只能来自数据层）

### 7.2 其他 CI grep

- 页面模板不得出现 `/hockey-bros` 字面量（必须走 `gameUrl`）

### 7.3 上线前四项实测

1. `wc -w` 回填首页与内页正文词数，四处标注一致
2. 词频自检：首页 hockey bros = 1，正文块 = 0
3. Rich Results：首页 4 类、内页 3 类全部通过，无 aggregateRating / review
4. details 数量：首页 8、内页 7

### 7.4 可嵌性

Football Bros 已于 2026-11-12 本地实测通过（画面 + 操作）。其余卡片逐款验，嵌不了的换同批已实测可嵌款（Basket Bros / Soccer Bros），不退回 Hockey Bros。

### 7.5 人工比对（不上 CI）

内页键位措辞与 hockeybros.io 官方 Controls 两行逐字一致；官方页面会变，CI 拦会误报。

---

## §8 验收标准 DoD

| # | 指标 | 通过线 |
| --- | --- | --- |
| 1 | 首页被收录 | 正常进入索引 |
| 2 | `site:ballgames.io hockey bros` 首位 | 上线 48 小时后必须是 `/hockey-bros`，不能是首页 |
| 3 | 内页出词 | `/hockey-bros` 开始拿到长尾曝光 |
| 4 | 首页 LCP | ≤2.5 秒（首个 7 天内实测） |
| 5 | 词频 | 首页 hockey bros = 1 次 |
| 6 | 结构 | 首页 FAQ 8、内页 7；面包屑两级带 item |
| 7 | 首卡锚文本 | 只写游戏名 |

不设「首页排上 ball games」目标：该词美国月搜 27,100、同比 -45%，关键词难度 55.1「中等」，进前十需 DR34 量级、约 110 个引用域，DR0 新站 R1 做不到；首页只做主题锚定。

---

## §9 分期路线

- **R1（现在）：** `/` + `/hockey-bros` 两页 → 上线 → 48h 验 DoD
- **R2：** 建 5~6 个游戏详情页 → 对应卡片改 `<a>` → H2⑤ 挂链 → `/games` → 搜索页 noindex（不加 Disallow）→ 顶部导航加 Hot / New → ItemList 扩项 → SearchAction 加回 → 同一次发版把 `DEFAULT_PLAYER_GAME` 换到另一个尚无独立页的游戏，并把首页 football bros 词频降到 ≤1
- **R3：** `/bros-games` → `/sports-games` → `/car-soccer` 依次上，禁止一次铺几百页

---

## §10 风险与已知代价

1. 首页直嵌 Football Bros：该站自带 AdinPlay 前贴视频广告 + 全屏 keydown/touchmove 拦截，首访会立刻发广告请求、可能抢键盘焦点；8 秒兜底与 LCP 开关必须保留；若「画面能看但按键没反应」，改封面图 + 点击加载，不换游戏
2. R2 忘切 `DEFAULT_PLAYER_GAME` → 蚕食从 hockey bros 原样转到 football bros；已写进 R2 清单，靠清单核对不靠记忆
3. 线上站暂不存在可比对页面（2026-11-11 首页请求超时、sitemap 0 条）；上线后第一件事是跑 §7.1 的 curl 计数，不凭截图判断
4. `/search` 的 Disallow + noindex 互斥：R1 直接删，R2 建搜索页只写 noindex 不加 Disallow
5. 域名归属未确认：2026-11-05 查 ballgames.io 为 registered 但无注册/到期日期，早前多次查到可注册；开工前确认归属，备选 goalbros.com / ballarcade.com
6. 词数全部 TBD：旧数 950/778、980/895 是估的，定稿后 wc -w 回填
7. 单卡源风险：Hockey Bros 来自 Blue Wizard（hockeybros.io，2026-08-01 上线），单一来源，源关掉该页会空；R2 起把来源分散到至少三家
8. 待实机确认：空格一键三动作的触发条件（确认后才可写死规则）

---

## 开工顺序与开工前确认

**开工顺序：** 先落 §2.1 三个常量 → 按 §4 做首页 → 按 §5 做内页 → 跑 §7 全部自检 → 提上线。

**开工前只剩两件事要确认：** ballgames.io 的域名归属（registered 但查不到注册日期，早前曾查到可注册），以及空格一键三动作的实机触发条件——这两项没定，前者会让整站白做，后者会让 How to Play 第 2 段只能停在定性表述。
