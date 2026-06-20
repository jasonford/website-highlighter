import bestMatch from './best-match.js'
import rangeFromTextContentOffsets from './range-from-offsets.js'

const HIGHLIGHT_NAME = 'website-highlighter'
const HIGHLIGHT_RESPONSE_TYPE = `${HIGHLIGHT_NAME}:response`
const RETRY_INTERVAL_MS = 500

let nextIframeRequestId = 0

function delay(ms) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms))
}

function matchScore(text, value, distance) {
  const length = Math.max(text.length, value.length)

  if (length === 0) {
    return 1
  }

  return (length - distance) / length
}

function findMatch(text, root) {
  const haystack = root.textContent ?? ''
  const { start, end, value, distance } = bestMatch(text, haystack)
  const view = root.ownerDocument?.defaultView ?? window

  if (!view.CSS?.highlights || !view.Highlight) throw new Error('This browser does not support the CSS Custom Highlight API.')

  return {
    haystack,
    range: start < end ? rangeFromTextContentOffsets(root, start, end) : null,
    value,
    view,
    score: matchScore(text, value, distance)
  }
}

function applyHighlight({ range, value, view }) {
  if (!range) throw new Error('Could not find text to highlight.')

  view.CSS.highlights.set(HIGHLIGHT_NAME, new view.Highlight(range))

  return { range, value }
}

async function retryUntilThreshold(text, root, threshold, retries, retryInterval) {
  let attempt = 0

  while (true) {
    const match = findMatch(text, root)

    if (match.score >= threshold) return applyHighlight(match)

    while (attempt < retries) {
      await delay(retryInterval)
      attempt += 1
      if ((root.textContent ?? '') !== match.haystack) break
    }

    if (attempt >= retries) throw new Error(`Could not find "${text}" with threshold ${threshold}. Best match was "${match.value}".`)
  }
}

export default function WebsiteHighlighter(
  text,
  {
    root=document.body,
    threshold=0,
    retries=6,
    retryInterval=RETRY_INTERVAL_MS
  }={}
) {
  if (threshold > 0) return retryUntilThreshold(text, root, threshold, retries, retryInterval)
  else return applyHighlight(findMatch(text, root))
}

export function highlightInIframe(iframe, text, targetOrigin='*') {
  if (!iframe?.contentWindow) throw new TypeError('Expected an iframe with a contentWindow')

  const requestId = `${Date.now()}-${nextIframeRequestId++}`
  const targetWindow = iframe.contentWindow
  let retryTimer

  function postHighlightRequest() {
    targetWindow.postMessage({
      type: HIGHLIGHT_NAME,
      id: requestId,
      text
    }, targetOrigin)
  }

  function handleResponse(event) {
    if (
      event.source === targetWindow &&
      event.data?.type === HIGHLIGHT_RESPONSE_TYPE &&
      event.data.id === requestId
    ) {
      window.clearInterval(retryTimer)
      window.removeEventListener('message', handleResponse)
    }
  }

  window.addEventListener('message', handleResponse)

  postHighlightRequest()
  retryTimer = window.setInterval(postHighlightRequest, RETRY_INTERVAL_MS)
}

if (typeof window !== 'undefined') {
  function responseOriginFor(event) {
    return event.origin === 'null' ? '*' : event.origin
  }

  function acknowledgeHighlightRequest(event) {
    event.source?.postMessage({
      type: HIGHLIGHT_RESPONSE_TYPE,
      id: event.data.id
    }, responseOriginFor(event))
  }

  window.addEventListener('message', (event) => {
    if (event.data?.type === HIGHLIGHT_NAME) {
      acknowledgeHighlightRequest(event)
      WebsiteHighlighter(event.data.text, { threshold: 0.9 })
        .catch(error => console.error(error))
    }
  })
}
