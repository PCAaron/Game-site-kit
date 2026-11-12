/** ballgames-specs-v1 word quota style — `wc -w` equivalent */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function countPhrase(text: string, phrase: string): number {
  const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  return (text.match(re) ?? []).length
}
