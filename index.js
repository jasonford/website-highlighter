import findBestMatch, { latestMatcherMode } from './worker-matcher.js'
import rangeFromTextContentOffsets from './range-from-offsets.js'

const HIGHLIGHT_NAME = 'website-highlighter'
const HIGHLIGHT_RESPONSE_TYPE = `${HIGHLIGHT_NAME}:response`
const RETRY_INTERVAL_MS = 500
const HIGHLIGHT_STYLE_ID = `${HIGHLIGHT_NAME}-default-style`

let nextIframeRequestId = 0

function delay(ms) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms))
}

function waitForTextMutation(root, timeout) {
  const view = root.ownerDocument?.defaultView ?? window

  if (!view.MutationObserver) {
    return delay(timeout).then(() => false)
  }

  return new Promise((resolve) => {
    let timeoutId
    const observer = new view.MutationObserver(() => {
      view.clearTimeout(timeoutId)
      observer.disconnect()
      resolve(true)
    })

    timeoutId = view.setTimeout(() => {
      observer.disconnect()
      resolve(false)
    }, timeout)

    observer.observe(root, {
      childList: true,
      characterData: true,
      subtree: true
    })
  })
}

function matchScore(text, value, distance) {
  const length = Math.max(text.length, value.length)

  if (length === 0) {
    return 1
  }

  return (length - distance) / length
}

function rangeStartElement(range) {
  const { startContainer } = range

  if (startContainer.nodeType === startContainer.ELEMENT_NODE) {
    return startContainer
  }

  return startContainer.parentElement
}

function scrollRangeIntoView(range, view) {
  const firstRect = range.getClientRects()[0]

  if (!firstRect) {
    rangeStartElement(range)?.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'smooth'
    })
    return
  }

  const viewportHeight = view.innerHeight || view.document.documentElement.clientHeight
  const targetTop = firstRect.top + view.scrollY - (viewportHeight / 2) + (firstRect.height / 2)

  view.scrollTo({
    top: Math.max(0, targetTop),
    behavior: 'smooth'
  })
}

function ensureHighlightStyle(view) {
  const { document } = view

  if (!document || document.getElementById(HIGHLIGHT_STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = HIGHLIGHT_STYLE_ID
  style.textContent = `
::highlight(${HIGHLIGHT_NAME}) {
  background-color: Highlight;
  color: HighlightText;
}
`

  const parent = document.head || document.documentElement
  parent.insertBefore(style, parent.firstChild)
}

async function findMatch(text, root) {
  const haystack = root.textContent ?? ''
  const view = root.ownerDocument?.defaultView ?? window

  if (!view.CSS?.highlights || !view.Highlight) throw new Error('This browser does not support the CSS Custom Highlight API.')

  const { start, end, value, distance } = await findBestMatch(text, haystack)

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

  ensureHighlightStyle(view)
  view.CSS.highlights.set(HIGHLIGHT_NAME, new view.Highlight(range))
  scrollRangeIntoView(range, view)

  return { range, value }
}

async function retryUntilThreshold(text, root, threshold, retries, retryInterval) {
  let attempt = 0

  while (true) {
    const match = await findMatch(text, root)

    if (match.score >= threshold) return applyHighlight(match)

    while (attempt < retries) {
      const didChange = await waitForTextMutation(root, retryInterval)
      attempt += 1
      if (didChange) break
    }

    if (attempt >= retries) throw new Error(`Could not find "${text}" with threshold ${threshold}. Best match was "${match.value}".`)
  }
}

export function getMatcherMode() {
  return latestMatcherMode()
}

export default async function WebsiteHighlighter(
  text,
  {
    root=document.body,
    threshold=0,
    retries=6,
    retryInterval=RETRY_INTERVAL_MS
  }={}
) {
  if (threshold > 0) return retryUntilThreshold(text, root, threshold, retries, retryInterval)
  else return applyHighlight(await findMatch(text, root))
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

export function highlightInParent(text, targetOrigin='*') {
  if (typeof window === 'undefined' || !window.parent || window.parent === window) {
    throw new TypeError('Expected to be called from a child iframe')
  }

  const requestId = `${Date.now()}-${nextIframeRequestId++}`
  const targetWindow = window.parent
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
