export default function DOMHighlighter(query, root=document.body) {
  const haystack = root.textContent ?? ''

  const { start, end } = fuzzyMatcher(haystack, query)

  const range = rangeFromTextContentOffsets( root, start, end)

  CSS.highlights.set('fuzzy-text-match', new Highlight(range))

  return range
}
