import type { ReactNode } from 'react'

export type DetailBodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading3'; text: string }
  | { type: 'list'; items: string[] }

/** Line-oriented parser for catalog detail section bodies (paragraphs, ### h3, - lists). */
export function parseDetailBody(body: string): DetailBodyBlock[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  const blocks: DetailBodyBlock[] = []
  let paragraphLines: string[] = []
  let listItems: string[] | null = null

  const flushParagraph = () => {
    const text = paragraphLines.join(' ').trim()
    paragraphLines = []
    if (text.length > 0) {
      blocks.push({ type: 'paragraph', text })
    }
  }

  const flushList = () => {
    if (listItems && listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems })
    }
    listItems = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (trimmed.length === 0) {
      flushParagraph()
      flushList()
      continue
    }

    const h3 = trimmed.match(/^###\s+(.+)$/)
    if (h3) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading3', text: h3[1]!.trim() })
      continue
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph()
      if (!listItems) {
        listItems = []
      }
      listItems.push(trimmed.slice(2).trim())
      continue
    }

    if (listItems) {
      flushList()
    }
    paragraphLines.push(trimmed)
  }

  flushParagraph()
  flushList()
  return blocks
}

export function DetailBodyBlocks({ body }: { body: string }) {
  const blocks = parseDetailBody(body)
  const nodes: ReactNode[] = []

  blocks.forEach((block, index) => {
    if (block.type === 'paragraph') {
      nodes.push(
        <p key={`p-${index}`} className="mt-4 first:mt-0">
          {block.text}
        </p>
      )
      return
    }
    if (block.type === 'heading3') {
      nodes.push(
        <h3
          key={`h3-${index}`}
          className="mt-8 text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          {block.text}
        </h3>
      )
      return
    }
    nodes.push(
      <ul key={`ul-${index}`} className="mt-4 list-disc space-y-2 pl-5">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  })

  return <>{nodes}</>
}
