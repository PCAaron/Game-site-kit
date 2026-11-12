import { hockeyBrosDetail } from '../lib/catalog/instances/hockey-bros-detail'
import { getPortalHomeContent } from '../lib/site/get-portal-home-content'
import { countPhrase, countWords } from './phase4.5-word-count-lib'

const portal = getPortalHomeContent()
const seoBody = [portal.intro ?? '', ...(portal.sections ?? []).flatMap((s) => s.paragraphs)].join(' ')
const detailBody = [
  hockeyBrosDetail.intro ?? '',
  hockeyBrosDetail.howToPlay ?? '',
  ...(hockeyBrosDetail.sections ?? []).flatMap((s) => [s.heading, s.body].join(' ')),
].join(' ')

const introWordCount = countWords(portal.intro ?? '')
const fiveH2WordCount = countWords(
  (portal.sections ?? []).flatMap((s) => s.paragraphs).join(' ')
)
const faqWordCount = countWords((portal.faq ?? []).flatMap((f) => [f.q, f.a]).join(' '))
const seoBodyExcludingFaqWordCount = introWordCount + fiveH2WordCount

console.log(
  JSON.stringify({
    homepage: {
      introWordCount,
      fiveH2WordCount,
      seoBodyExcludingFaqWordCount,
      faqWordCount,
      primaryKeywordBallGames: countPhrase(seoBody, 'ball games'),
      hockeyBrosInSeoBody: countPhrase(seoBody, 'hockey bros'),
      faqCount: portal.faq?.length ?? 0,
    },
    hockeyBros: {
      bodyWordCount: countWords(detailBody),
      primaryKeywordHockeyBros: countPhrase(detailBody, 'hockey bros'),
      faqCount: hockeyBrosDetail.faq.length,
    },
  })
)
