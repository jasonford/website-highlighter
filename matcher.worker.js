import bestMatch from './best-match.js'

self.addEventListener('message', (event) => {
  const { id, query, source } = event.data

  try {
    self.postMessage({ id, result: bestMatch(query, source) })
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error)
    })
  }
})
