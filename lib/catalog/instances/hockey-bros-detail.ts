import { createGameSeo, type GameDetailContent } from '../types'

/**
 * Editorial Game Detail fields copied from specs/ballgames/ballgames-specs-v1.md §6.
 * Studio, launch date, privacy, and related claims remain VERIFICATION REQUIRED (§7.1).
 * Do not emit those claims as JSON-LD in later phases without independent evidence.
 * publishedAt / updatedAt are omitted because those dates are not verified.
 */
export const hockeyBrosDetail: GameDetailContent = {
  seo: createGameSeo({
    title: 'Hockey Bros Game - Controls, Tips, Fixes | BallGames.io',
    description:
      'Hockey Bros is a free arcade hockey game you play right in your browser. Controls, tips, a look at the studio behind it, and fixes when it will not load.',
    indexable: true,
  }),
  intro: 'One small rink, short matches, and nothing to install.',
  howToPlay: `Hockey Bros is a browser ice hockey game: two teams, one rink, and a puck that behaves roughly the way a puck should. You skate, you pass, you shoot, and when you do not have the puck you hit people. The physics are deliberately loose — hits send players tumbling, the puck ricochets off the boards at silly angles, and goalies occasionally wander out of the crease to investigate something.

What makes it work is the size of the rink. It is small enough that you are always in the play and never more than a second away from the goal, which means the game rewards positioning over twitch reflexes. You can lose a match having taken twice as many shots, because the player who stands in the right place gets the rebound.

No account, no download, nothing to configure. You open it, you play a short match, and you are done — which is the whole point of a game that fits in a browser tab.`,
  sections: [
    {
      heading: 'Controls',
      body: `One key does three jobs. With the puck you pass or shoot; without it, space is your check. That is the whole control scheme — the game is about position, not about remembering buttons.

A match is split into short periods on a game clock that runs faster than the clock on your wall, so a full game takes less time than the arithmetic suggests. Between periods the ice gets resurfaced and you sit through the break. Whoever is ahead when the clock runs out wins. The studio pitches it as a quick game you can fit into lunch, and the structure is why that works.

There is no practice mode, which sounds like a problem and is not. The first match is the tutorial: the rink is small, the controls are one key, and a full game is short, so you learn by playing rather than by watching a tutorial you will skip anyway.`,
    },
    {
      heading: 'Tips for Winning',
      body: `Stay between the puck and your own net. A lot of goals conceded by new players come from the same two places: chasing the puck into the corner, and skating at the far blue line.

Pass before you shoot. The shot is fast enough to beat a goalie from range, but a pass across the middle pulls the goalie out of position and doubles the chance of a rebound landing on your stick.

Use the check as a reset, not a highlight. Big hits look great and leave you out of position for a beat. Do it in the neutral zone, not in front of your own goal.

Learn the boards. Angles off the side walls are consistent. One bank pass beats three defenders.

Play the closing stretch differently. When the clock is running down, the safe pass is worth less than a bad shot on goal.`,
    },
    {
      heading: 'About Hockey Bros',
      body: `Hockey Bros is made by Blue Wizard Digital, a small independent studio in Canada that has spent years building one very specific thing: arcade sports games with oversized heads, loose physics and short rounds. The same team is behind the football, soccer, basketball, baseball and kart entries in the same family, which is why the control scheme barely changes between them.

The game launched on 1 August 2026, which makes it the newest thing the studio has shipped — and the reason it is the one people are searching for right now. It runs on web standards inside a browser tab, on any machine with Chrome, Edge, Firefox or Safari. No plugin, no launcher, no account.

And it is a browser game that does not feel like a compromise: the load time is short, the frame is stable, and you are in a match quickly after clicking play.

Hockey Bros unblocked, on a school laptop
School Chromebooks cannot install anything, and neither can most work laptops — which is exactly the case a browser game is built for. The network filters anything that looks like a game portal, and half the results are pages that took the game down long ago. What we can tell you is where the block actually sits. The game is served from the studio's own domain rather than from a game portal, so a filter that blocks sites by category may still let it through. If it does not, refreshing will not change anything — the block is on the network, not in your browser. A normal connection with the ad blocker switched off covers the most common cause we have seen.

Why it is worth a tab
What separates it from the other browser hockey games is how directly it responds. Every input lands immediately — no queue, no animation you have to sit through, no cooldown on the check. When you lose the puck it is because you were out of position, not because the game decided to play a two-second tackle you could not cancel. That is what makes the short matches work: you always know why you lost, so you always want one more.`,
    },
    {
      heading: 'The Rest of the Bros Series',
      body: `Hockey Bros is the newest member of a family built by the same studio, with the same big-headed athletes and the same short rounds:

- Soccer Bros — the most played of the family, and usually where people start.
- Football Bros — American football cut down to a few downs and a lot of passing.
- Basket Bros — 1v1 arcade basketball, built for steals and dunks.
- Baseball Bros — timing at the plate rather than a full season.
- Kart Bros — the racing branch; same characters, no ball.

If you like the controls here, the others are built on the same control idea, so the habits carry over.

Several of these are playable from the grid on the home page, so you can switch without leaving the site.`,
    },
  ],
  faq: [
    {
      q: 'Is Hockey Bros free?',
      a: 'Yes, completely. No account, no download, no trial.',
    },
    {
      q: 'What are the controls?',
      a: 'One key does everything. With the puck it passes or shoots; without it, the same key is your check. Arrow keys or WASD move your player, and the rink does the rest of the aiming — the game is about position, not about remembering buttons.',
    },
    {
      q: 'How long is a match?',
      a: 'A match runs to the final horn. The studio pitches it as a quick game you can fit into a lunch break.',
    },
    {
      q: 'Who makes it?',
      a: 'Blue Wizard Digital, the Canadian studio behind Soccer Bros, Football Bros, Basket Bros and Kart Bros.',
    },
    {
      q: "Why isn't the game loading?",
      a: 'Usually an ad blocker or a school/office network filter. Disable the blocker, try Chrome, refresh.',
    },
    {
      q: 'Can I play it on a phone?',
      a: 'It loads in mobile browsers, but the controls are built for a keyboard. Play on a laptop if you can.',
    },
    {
      q: 'Can I play with a friend on the same keyboard?',
      a: 'Yes. Two players, one keyboard, one screen. No second machine and no account needed.',
    },
  ],
  controls: [
    { label: 'Move', keys: 'Arrow keys or WASD' },
    {
      label: 'Pass, shoot, or check',
      keys: 'One action key (with puck: pass or shoot; without puck: check)',
    },
  ],
}
