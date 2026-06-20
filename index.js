import bestMatch from './best-match.js'
import rangeFromTextContentOffsets from './range-from-offsets.js'

const HIGHLIGHT_NAME = 'dom-highlight'

export default function WebsiteHighlighter(text, root=document.body) {
  const haystack = root.textContent ?? ''

  const { start, end } = bestMatch(text, haystack)

  const range = rangeFromTextContentOffsets( root, start, end)
  const view = root.ownerDocument?.defaultView ?? window

  if (!view.CSS?.highlights || !view.Highlight) {
    throw new Error('This browser does not support the CSS Custom Highlight API.')
  }

  view.CSS.highlights.set(HIGHLIGHT_NAME, new view.Highlight(range))

  return range
}

export function highlightInIframe(iframe, text, targetOrigin='*') {
  if (!iframe?.contentWindow) {
    throw new TypeError('Expected an iframe with a contentWindow')
  }

  iframe.contentWindow.postMessage({
    type: HIGHLIGHT_NAME,
    text
  }, targetOrigin)
}

if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.data?.type !== HIGHLIGHT_NAME || typeof event.data.text !== 'string') {
      return
    }

    WebsiteHighlighter(event.data.text, document.body)
  })
}
