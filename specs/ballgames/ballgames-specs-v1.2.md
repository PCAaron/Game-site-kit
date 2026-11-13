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
| 旧：ItemList 必须跟 `DEFAULT_PLAYER_GAME` | 作废。ItemList 只列 **已发布真实详情页**（R1 = Hockey Bros）；播放器默认仍为 Football Bros |
| 旧：首页页脚含 `/hockey-bros` | 作废。R1 页脚无 Hockey Bros 链接（P1-05） |

---

## §1 项目定义

球类 H5 小游戏聚合站；嵌入现成游戏、不自研；一个域名承载多款游戏、每款游戏一个页面；对标 brosgames.io；面向美国市场。R1 只上线 2 个页面：`/` 与 `/hockey-bros`。

**不做：** 原生 App、后台、UGC、多语言（R1 只预留目录位置）、批量上页。

---

## §2 站点常量与路由

### 2.1 常量（都放数据层，组件里不许硬编码）

- `SITE_URL = 'https://ballgames.io'`（含协议不带尾斜杠）—— canonical / sitemap / 结构化数据 / OG 的绝对地址都从它拼
- `gameUrl(slug)`——**SEO 绝对 URL** 唯一生成器（canonical / sitemap / JSON-LD / OpenGraph）；返回形如 `https://ballgames.io/hockey-bros`，**不**用于本地/预览环境的站内 `<Link href>`
- `gamePath(slug)`——**拟实施**（BG-1.2.1+）站内相对导航路径，返回形如 `/hockey-bros`；须与 `gameUrl` 共用 slug 校验，禁止组件内手写 `'/' + slug`（见 Kit [`specs/seo/02-url-canonical-indexing.md`](../seo/02-url-canonical-indexing.md)、ADR 0003 增补 DEC-003-G）
- `DEFAULT_PLAYER_GAME = 'football-bros'`——首页播放器初始嵌入哪款游戏；**与**首页 ItemList 资格 **解耦**（见 §4.9）

### 2.2 路由表

| 路径 | 用途 | 期次 |
| --- | --- | --- |
| `/` | 首页，扁平，无前缀 | R1 |
| `/{game-slug}` | 游戏详情页，slug = 游戏名连字符形式 | R1 只有 `/hockey-bros` |
| `/bros-games`、`/sports-games`、`/car-soccer` | 分类聚合页，与游戏页同级，不是父子目录 | R3 |

### 2.3 四条工程约束（硬性）

1. 数据模型只存 slug，不存完整路径。
2. canonical / sitemap / 结构化数据 / OG 走 `gameUrl(slug)`；站内可见导航走 `gamePath(slug)`（实施后）；模板里不得出现 `/hockey-bros` 字面量，CI grep 拦截。
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
- 全站唯一 `<a>` = Hockey Bros，`href={gamePath('hockey-bros')}`（实施后；SEO 仍用 `gameUrl`），锚文本只写游戏名、不带 “play free” 修饰
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

- R1 可见链接：**Ball Games**（首页）+ About / Privacy / Terms / Contact；**不得**增加 Hockey Bros 页脚入口（首卡已是唯一内链）
- 不留分类位、不留聚合位
- 四个法务页 R1 若未建，先去掉对应链接，不承诺不存在的页面
- 上线日期只在页脚出现一处

**首页词频统计边界（P1-05）：** 计入可见正文、卡片锚文本、FAQ 可见文本及本 Spec 定义的页脚可见文案；**不计入** URL、图片 alt、JSON-LD、Metadata、不可见技术字段（后二者仍须正确生成）

### 4.9 结构化数据

- **WebSite**（删掉 SearchAction，R2 加回）
- **ItemList**：R1 只列 **1** 项，且必须指向 **已发布、可索引、真实存在的** 游戏详情页；R1 = **Hockey Bros**，`url` = `gameUrl('hockey-bros')`（绝对 canonical）。**不得**为配合 `DEFAULT_PLAYER_GAME` 生成不存在的 `/football-bros` 等 URL
- **Organization**：按 Kit [`specs/seo/06-verified-offer-and-organization.md`](../seo/06-verified-offer-and-organization.md) **证据门控**；无足够法人/品牌依据时 **允许省略**，不得虚构
- **FAQPage**（8 问）
- 禁止编造 aggregateRating / review；`offers` 仅在有核实依据时按 §6 契约输出（R1 首页 **不** 输出 Offer）

### 4.10 顶部导航

R1：**仅**在有真实可用目标时展示 Hot / New（无列表页则不建链、不占位）；Sports / 2 Player / .IO 移到 R3。R1 **不**实现 `/search`、`/games`、`/bros-games`、`/sports-games`、`/car-soccer`（见 §6、§9）

---

## §5 `/hockey-bros`

### 5.1 模块顺序

面包屑 → H1 → 副标题 → iframe → 双广告位（放在游戏区外，不压可玩区）→ 5×H2 正文 → FAQ 7 → 相关游戏 12~16 → 页脚

### 5.2 正文权威与 H2①

- **逐字定稿权威：** [`content/hockey-bros-r1.md`](content/hockey-bros-r1.md)（本 Spec 只写约束，不维护可能漂移的长正文）
- **键位：** 官方 Controls 已 **用户核实**（2026-11-12 前后）；仅 H2① How to Play 描述键位；首页、FAQ、卡片、JSON-LD **不得**重复键位
  - **Verification source：** hockeybros.io official Controls（Move / Shoot·Pass·Check 两行）
  - **Trigger behavior：** 空格一键三动作的 **触发机制未独立核实**；正文保持定性表述，不得写死未确认规则
- H2① 段内 「Hockey Bros」只出现 1 次；不写节数、时长、比例断言

### 5.3 其余规格

- H1 = Hockey Bros；正文块 hockey bros 10~12 次
- FAQ 7 条独立 details，FAQPage Question = 7
- 结构化数据：VideoGame + FAQPage + BreadcrumbList（两级都带 item：`https://ballgames.io/` 与 `gameUrl('hockey-bros')`）；禁 aggregateRating / review；**VideoGame.offers** 仅当免费事实 **verified** 时输出（见 [`specs/seo/06-verified-offer-and-organization.md`](../seo/06-verified-offer-and-organization.md) 与内容稿 §七）；VideoGame 只在这一页用
- 内容要求：可玩内容 + 操作说明 + 相关游戏三块缺一不可，不得只换标题套模板
- 相关游戏区 12~16 个链接：有独立页用 `<a>`，其余用 `<button>`
- FAQ 若含 「How do you play Hockey Bros?」，答案用两句口诀（滑行 → 空格 → 进球多者胜），不得复述 H2① 第 3 段的时机论述

---

## §6 全站规则

- **sitemap：** R1 只 2 条（`/` 与 `/hockey-bros`），全部走 `gameUrl`
- **robots / 搜索：** R1 不建 `/search`。R2 建 `/search` 时页面 **`noindex, follow`**；**不**用 `robots.txt` Disallow 阻断爬虫读取该页上的 noindex（Disallow 与 noindex 非语法互斥，但禁止「拦抓导致读不到 noindex」的做法）
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

### 7.4 可嵌性（区分技术验证 vs 生产授权）

| 游戏 | Technical Demo | Production Authorization | Production CSP |
| --- | --- | --- | --- |
| Football Bros（`DEFAULT_PLAYER_GAME`） | **Reported Passed**（2026-11-12 本地：画面 + 操作）；证据见本 Spec §7.4 与 ADR 0004 Demo-first 记录 | **Not Yet Verified** | **Not Yet Verified** |

Demo 成功 **不得** 自动代表商业 embed 许可或生产 `frame-src` 已配置（ADR 0004）。其余卡片逐款 Demo-first 验，嵌不了的换同批已实测可嵌款，不退回 Hockey Bros。

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
4. R2 `/search`：仅 `noindex, follow`；**不加** 使爬虫无法读取 noindex 的 `robots.txt` Disallow
5. 域名归属未确认：2026-11-05 查 ballgames.io 为 registered 但无注册/到期日期，早前多次查到可注册；开工前确认归属，备选 goalbros.com / ballarcade.com
6. 词数全部 TBD：旧数 950/778、980/895 是估的，定稿后 wc -w 回填
7. 单卡源风险：Hockey Bros 来自 Blue Wizard（hockeybros.io，2026-08-01 上线），单一来源，源关掉该页会空；R2 起把来源分散到至少三家
8. 官方键位已核实；空格一键三动作的 **触发条件** 仍未独立核实——How to Play 保持定性表述

---

## 开工顺序与开工前确认

**开工顺序：** 先落 §2.1 三个常量 → 按 §4 做首页 → 按 §5 做内页 → 跑 §7 全部自检 → 提上线。

**开工前仍须外部证据：** ballgames.io 域名归属（registered 但查不到注册日期）；各 embed 的 **商业授权** 与 **生产 CSP**（见 ADR 0004）。键位文案已对齐官方 Controls；触发机制未核实项 **不** 阻塞文案定稿。
