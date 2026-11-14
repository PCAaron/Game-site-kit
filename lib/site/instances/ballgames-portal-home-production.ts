import type { PortalHomeContent } from '../types'
import { PORTAL_HOME_SECTION_HEADINGS } from '../portal-home-editorial-contract'

/**
 * R1 production Portal Home editorial — specs/ballgames/content/homepage-r1.md (Ballgames Spec v1.2 §4).
 * Copy is verbatim from the approved content document; do not auto-expand or regenerate.
 */
export const ballgamesPortalHomeProductionEditorial: Pick<
  PortalHomeContent,
  'intro' | 'sections' | 'faq'
> = {
  intro:
    'Everything on this page runs in your browser tab. Pick a card, the game loads in place, and you are playing before the page finishes scrolling. No account, no download, no install. Some games are solo challenges, others are two-player battles on one keyboard or one device — the cards below mark which is which.',

  sections: [
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[0],
      paragraphs: [
        'Ball games covers a wide field: soccer, basketball, ice rink battles, volleyball, dodgeball and the odd arcade take on a sport that never quite existed. What they share is a shape — a ball, a goal or a target, and a clock or a score that decides when it is over.',
        'Every title here is free to play and runs on the open web. Nothing has to be bought to start, and there is no paywall between you and the first match. A few games carry ads around the play area, which is how the studios behind them keep running; the games themselves stay free.',
        'Most rounds are short. You can finish a match in the time it takes to drink a coffee, which is why this kind of game tends to get played in the gaps of a day rather than in long sessions. If you only have five minutes, pick a card, play one round, close the tab — nothing is lost.',
      ],
    },
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[1],
      paragraphs: [
        'Every game on this site is an HTML5 build that runs inside the page. There is no installer to download, no app store to visit, and nothing asking for permission to your device.',
        'That also means no waiting on a multi-gigabyte patch before your first match. A modern browser on desktop, laptop, tablet or phone is enough, and the major ones all work. On a phone the game fills the screen, in portrait or landscape depending on the title.',
        'Because nothing is installed, switching games costs one click. If a game is not what you expected, go back to the cards and pick another — there is no uninstall step and no leftover files.',
        'One practical note: ad blockers and some browser extensions interfere with game loaders. If a title sits on a loading screen, turn the blocker off for this page and refresh.',
      ],
    },
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[2],
      paragraphs: [
        'School and workplace networks often filter whole categories of site, and game sites are a common one. When a page will not load on a managed network, the block is almost always applied by that network rather than by us, and lifting it is a decision for whoever runs it. We do not offer ways around network filters, and we would not recommend trying.',
        'What we can say is what the games need when a network does allow them: a modern browser, an ordinary internet connection, and permission to run JavaScript. No plugin, no download, no separate launcher.',
        'If you are on a network you control and a game still will not start, the usual causes are a strict firewall rule, an ad blocker, or an extension that blocks scripts. All three are fixable in a minute by whoever set them up.',
      ],
    },
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[3],
      paragraphs: [
        'Plenty of the games here are built for two people in the same room. Some split one keyboard between the two players, some take a controller each, some expect a device apiece. The card for each game carries a mode tag, so you can check the setup before you commit.',
        'Local two-player is the fastest way to settle an argument. Load the game, hand over one side, and the round starts without accounts, lobbies or friend codes.',
        'A separate set of titles is online multiplayer: you share a link or join a public match, and the other player can be anywhere. Those need a stable connection, and quality follows the weakest connection in the match — if one player lags, everyone feels it.',
        'If you are unsure which mode a game offers, look for the tag on its card: local, online, or single-player.',
      ],
    },
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[4],
      paragraphs: [
        'Pick a card and the game loads in the play area at the top of this page. Nothing else changes — same tab, same scroll position, no popup.',
        'Controls vary by title but follow one of three patterns: keyboard, mouse or touch. Where a keyboard is used, one set of keys moves and another key acts, and each game shows its own key hint before the first round. If a game ignores your keys, click once inside the play area first: keyboard input only reaches the game once the page knows you are there.',
        'Scoring rules are stated for each game: a match ends on a clock, on a target score, or after a set number of rounds. Spend the first minute learning what counts as a point before trying to win.',
        'When you are done, refresh the page or pick another card. Nothing is stored, so there is no profile to clean up.',
      ],
    },
  ],

  faq: [
    {
      q: 'Are these ball games free?',
      a: 'All of them. There is no purchase, no trial timer and no account required. Some titles show ads around the play area, which is how they stay free.',
    },
    {
      q: 'Do I need to download or install anything?',
      a: 'No. Every game is an HTML5 build that runs inside your browser tab. Nothing is saved to your device and there is no launcher.',
    },
    {
      q: 'Can I play on a phone or tablet?',
      a: 'Yes, provided the browser is reasonably current. Games fill the screen and switch between portrait and landscape depending on the title. On-screen controls appear where a game needs them.',
    },
    {
      q: 'What do I do if a game will not load?',
      a: 'Reload the page first. If that does not help, disable ad blockers or script-blocking extensions for this page, then reload again. A very strict network filter can also stop a game from starting.',
    },
    {
      q: 'Can two people play at the same time?',
      a: "Many titles support it, either sharing one keyboard or using a device each. Each game's card carries a mode tag showing whether it is local, online or single-player.",
    },
    {
      q: 'Do I need an account to play online?',
      a: 'No account is needed to start a game. Where a title has online multiplayer, you join from the game itself rather than from this site.',
    },
    {
      q: 'Is my progress saved if I close the tab?',
      a: 'Not on our side — we store nothing. Closing the tab ends the session. A few individual games keep their own local save, and the game will tell you if it does.',
    },
    {
      q: 'How often are new games added?',
      a: 'Games are added as they become available to embed, without a fixed schedule. When a real “New” list page exists, the top navigation can link to it; R1 does not promise that page.',
    },
  ],
}
