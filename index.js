import bestMatch from './best-match.js'
import rangeFromTextContentOffsets from './range-from-offsets.js'

export default function DOMHighlighter(query, root=document.body) {
  const haystack = root.textContent ?? ''

  const { start, end } = bestMatch(query, haystack)

  const range = rangeFromTextContentOffsets( root, start, end)

  CSS.highlights.set('fuzzy-text-match', new Highlight(range))

  return range
}
