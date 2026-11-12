import type { PortalHomeContent } from '../types'
import { PORTAL_HOME_SECTION_HEADINGS } from '../portal-home-editorial-contract'

/**
 * R1 production Portal Home editorial — ballgames-specs-v1 §5.4–5.6 with fact-checked adjustments (Phase 4.5).
 * Claims about grid size, popularity ranking, embed grants, and network policy use cautious wording.
 */
export const ballgamesPortalHomeProductionEditorial: Pick<
  PortalHomeContent,
  'intro' | 'sections' | 'faq'
> = {
  intro:
    'Every game on this page runs inside the tab you already have open. No installer, no sign-up, no launcher asking for an update. We collect ball games — hockey, soccer, American football, basketball, baseball, and the odd car-with-a-ball hybrid — and put them behind one click. If it needs a download, it is not on this site.',

  sections: [
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[0],
      paragraphs: [
        `The grid above lists ball games we have verified for this release. Order follows our homeSort field so editors can surface good starting points — not a live play-count ranking. At launch, the verified set is small: one hockey title has a full guide on this site, and additional launcher titles appear in the grid only after their launch URLs are checked.`,
        `Nothing here asks you to create an account or install a client. A title with a full guide opens its own page when you choose it from the grid. Other verified titles, when we add them, load in the single play frame at the top of this page without leaving the tab. Pick a ball game and start a round.`,
      ],
    },
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[1],
      paragraphs: [
        `Hockey. Ice hockey cut down to a single rink, short periods, and body checks that send players skidding. Arcade studios in this niche often ship several hockey variants with the same keyboard-friendly controls.`,
        `Soccer. Small-sided browser football with exaggerated ball physics — usually where newcomers to this genre start when a verified launch is available.`,
        `American football. Fewer downs, longer passes, and less time spent in menus than console football sims.`,
        `Basketball. One-on-one arcade hoops built around steals and dunks rather than full-court plays.`,
        `Baseball. Timing at the plate instead of a season-long campaign; innings stay short.`,
        `Car ball. Cars with a giant ball in the middle and a goal at each end — driving physics meets sports comedy.`,
        `We group these under ball games because they share short matches and keyboard-first controls. Not every type appears in the grid today; we add a row only when its launch link is verified. When a title is available, open it from the grid or read its page if we have published one.`,
      ],
    },
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[2],
      paragraphs: [
        `Two minutes to kill. Pick anything that already appears in the grid. These games are built for short sessions, and most load before you finish reading the on-screen controls.`,
        `Playing with someone next to you. Look for games that document two-player keyboard controls on their page. We do not run a separate two-player filter on the home grid yet, so check the guide for the title you want.`,
        `On a school or work laptop. Stick to keyboard controls. Titles that need a mouse camera are awkward on a trackpad, and anything that wants both mouse and keyboard assumes a desk you may not have.`,
        `On a phone. The pages load, but control schemes assume a keyboard. Landscape mode helps if you still want to try.`,
      ],
    },
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[3],
      paragraphs: [
        `We do not make these games. Every title here is built and maintained by the studio that published it, and it runs on their servers, in their player, with their ads around it when they choose to show them.`,
        `What we do is write the page you are reading: what the game is, how the controls work, and what to try when it will not load. You may see the studio's own branding inside the frame because it is their game and their infrastructure — we are not going to pretend otherwise.`,
        `If a game disappears from the catalogue, it is usually because the publisher pulled or moved it, not because we deleted a working copy on our side.`,
      ],
    },
    {
      heading: PORTAL_HOME_SECTION_HEADINGS[4],
      paragraphs: [
        `Browser games live or die on two things: whether the frame loads, and whether the keyboard works.`,
        `It will not load. Ad blockers and strict school or office network filters are the most common causes we see. Disable the blocker for this domain and reload. If the network blocks game domains outright, refreshing alone will not help — the block is upstream of your browser.`,
        `The keyboard does nothing. Click once inside the game frame first. Browsers give keyboard focus to the top-level page, not to an embedded frame, until you click the game.`,
        `It runs slowly. Close other tabs. These games are small, but a machine with many tabs open still struggles.`,
        `Chromebooks. Titles here target modern web standards and often run on ChromeOS without plugins, but district policies differ. A capable Chromebook on a filtered network can still fail to load the frame.`,
      ],
    },
  ],

  faq: [
    {
      q: 'What are these ball games?',
      a: 'Browser games built around balls, pucks, and sports physics — hockey, soccer, football, basketball, and similar titles you play in one tab.',
    },
    {
      q: 'Are they free?',
      a: 'Yes. No account, no download, no trial timer.',
    },
    {
      q: 'Do I need an account?',
      a: 'No. Everything runs in the browser tab without sign-up.',
    },
    {
      q: 'Why will a game not load?',
      a: 'Usually an ad blocker or a network filter. Disable the blocker for this domain and refresh.',
    },
    {
      q: 'Will these work on a school Chromebook?',
      a: 'Many Chromebooks can run these browser games when the network allows game domains. Filters that block entertainment sites will stop the frame even on capable hardware.',
    },
    {
      q: 'Do these games work on a phone?',
      a: 'Yes. They load in a phone browser, though the frame is easier to use in landscape — turn the phone sideways before you start.',
    },
    {
      q: 'Can I play with a friend on the same keyboard?',
      a: 'Yes, on the titles that support two-player. Two people, one keyboard, one screen — no second device and no account. Check the page of the game you want, since not every title in the grid has a two-player mode.',
    },
    {
      q: 'Are these the full versions of the games?',
      a: 'You get the same player the studio publishes; we do not host stripped-down copies.',
    },
  ],
}
