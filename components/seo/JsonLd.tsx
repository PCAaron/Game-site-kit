import { serializeJsonLdForHtml, type JsonLdObject } from '@/lib/seo'

export interface JsonLdProps {
  blocks: JsonLdObject[]
}

export function JsonLd({ blocks }: JsonLdProps) {
  if (!blocks.length) return null
  const json = serializeJsonLdForHtml(blocks)
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
