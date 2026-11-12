import { hockeyBrosDetail } from '../lib/catalog/instances/hockey-bros-detail'
import { getPortalHomeContent } from '../lib/site/get-portal-home-content'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function countPhrase(text: string, phrase: string): number {
  const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  return (text.match(re) ?? []).length
}

const portal = getPortalHomeContent()
const seoBody = [portal.intro ?? '', ...(portal.sections ?? []).flatMap((s) => s.paragraphs)].join(' ')
const detailBody = [
  hockeyBrosDetail.intro ?? '',
  hockeyBrosDetail.howToPlay ?? '',
  ...(hockeyBrosDetail.sections ?? []).flatMap((s) => [s.heading, s.body].join(' ')),
].join(' ')

console.log(
  JSON.stringify({
    homepage: {
      introWordCount: countWords(portal.intro ?? ''),
      fiveH2WordCount: countWords((portal.sections ?? []).flatMap((s) => s.paragraphs).join(' ')),
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
