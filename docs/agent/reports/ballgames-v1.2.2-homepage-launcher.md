# BG-1.2.2 — Homepage / Launcher / Content & SEO Integration

**Date:** 2026-11-14  
**Task:** BG-1.2.2

## A. Git Baseline

| Field | Value |
| --- | --- |
| Before SHA (authorized) | `7521011665bb1251046b6b76c474ab3c591d33f1` |
| Actual Validation SHA | `7521011665bb1251046b6b76c474ab3c591d33f1`（工作区未 commit） |
| Branch | `main` |
| Working Tree | Modified — BG-1.2.2 实施（未 commit） |
| Node | v22.14.0 |
| Yarn | 3.6.1 |

## B. Scope

**已实施：**

- Task A：`defaultPlayerGameSlug` slug 格式硬校验；`technicalEmbedVerification` 运行时校验；`collectDefaultPlayerGameIssues` 警告；CAT-N01–N08
- Task B：homepage-r1.md 正文 / FAQ / TDK / 五 H2 契约；副标题 frozen copy
- Task C：导出 HTML 可见词频测试（SEO-HOME-01 … 05）
- Task D：Ballgames R1 页脚（`PortalHomeSiteFooter`）；顶栏仅 Home + About
- Task E/F：`pickDefaultLauncherGame` 默认 Football Bros；生产 iframe仍 blocked；`iframe#player`；PLAY-01/04
- Task H：ItemList / FAQPage 回归（Organization 仍省略）
- Task I：phase4.3/4.5/4.6 + catalog 测试更新

**未实施 / 延期：**

- 15–20 张生产游戏卡（仅 1 张 verified home 卡）
- Catalog `mode` 强类型字段与卡片 Local/Online/1P UI（无证据不虚构）
- BG-1.2.3 VideoGame Offer、Football Bros 详情页
- 浏览器视觉 / LCP 抽检（本机未附证据）

## C. Catalog Hardening

| ID | Result |
| --- | --- |
| A01 default player | 硬错误：空 slug、非法格式、未知 slug；警告：launch 未 verified、discontinued |
| A02 technical embed | 枚举、`testedAt`、`sourceUrl` 与 launch 一致；`verified` 需非空 `evidenceRef` |
| CAT-N01–N08 | `yarn test:catalog` pass |

## D. Homepage Content

| Field | Value |
| --- | --- |
| Title | Ball Games \| Free Online Sports Games, No Download |
| Description | Play free online ball games right in your browser — soccer, basketball, rink battles and more. No downloads, no sign-ups, no installs. |
| H1 | Ball Games |
| Subtitle | Pick a game and play in seconds — free, in your browser, nothing to install. |
| Five H2 | Free Online Ball Games → … → How to Play（见 `PORTAL_HOME_SECTION_HEADINGS`） |
| FAQ | 8 条（homepage-r1.md  verbatim） |

**词数（`countWords` / P45-21 口径，实测）：**

| Block | Words |
| --- | ---: |
| Intro | 55 |
| Five H2 paragraphs (combined) | 747 |
| FAQ (q+a) | 294 |

**词频：** 导出可见 DOM `hockey bros` = **1**（首卡锚文本）；SEO 正文块 = 0；页脚 = 0。

**EDITORIAL REVIEW REQUIRED：** 导语 “the game loads in place” 与当前生产 embed 门禁（Football Bros `external-only`，生产 iframe BLOCKED）不一致；未改定稿文案。

**Footer / Nav：** 页脚 Ball Games + About；无法务 404；顶栏无 Hot/New。

## E. Launcher & PlayFrame

| Field | Value |
| --- | --- |
| Default Player | Football Bros（catalog.defaultPlayerGameSlug） |
| Production Embed | BLOCKED |
| Single Iframe Capability | PASS（隔离 fixture `PLAY-04`） |
| Fallback 8s | PASS（既有 T03–T06） |

## F. Catalog Cards

| Metric | Value |
| --- | ---: |
| Target cards | 15–20 |
| Actual production home cards | 1（Hockey Bros） |
| Target order | Hockey Bros → Football Bros |
| Mode tags on cards | 未输出（数据缺口） |

## G. SEO

- Metadata / canonical：与 `ballgamesPortalHomeContent` 一致；canonical `https://ballgames.io`
- JSON-LD：WebSite + ItemList（仅 Hockey Bros）+ FAQPage；无 Organization / SearchAction
- Sitemap：exact-two

## H. Testing

| Command | Exit | Evidence |
| --- | ---: | --- |
| `yarn typecheck` | 0 | 本地 |
| `yarn test:batch1` | 0 | 本地 |
| `yarn test:batch2` | 0 | 本地 |
| `yarn test:catalog` | 0 | 43 tests |
| `yarn validate:catalog` | 0 | schema PASS |
| `yarn validate:seo` | 0 | contract |
| `yarn test:phase4.3` | 0 | 26 tests |
| `yarn test:phase4.4` | 0 | 25 tests |
| `yarn test:phase4.5` | 0 | 24 tests |
| `yarn test:phase4.6` | 0 | export PASS |
| `$env:EXPORT='1'; $env:UNOPTIMIZED='1'; yarn build` | 0 | fresh `out/` |
| `yarn validate:seo --export-dir=out` | 0 | artifacts |
| `git diff --check` | 0 | 本地 |

## I. Manual Review

- Football Bros 商业 embed / 生产 CSP
- 导语与 in-page embed 产品承诺对齐
- 首页卡片数量与 mode 标签证据
- 浏览器 1440 / 768 / 375 布局与交互

## J. Final Verdict

```text
BG-1.2.2 Engineering: PASS WITH MANUAL REVIEW
BG-1.2.3 Readiness: READY WITH GATES
Production iframe: BLOCKED
Ballgames R1 Production: NOT VERIFIED
```