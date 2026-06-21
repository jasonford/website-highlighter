import bestMatch from './best-match.js'
import MatcherWorker from './matcher.worker.js?worker&inline'

let worker
let nextRequestId = 0
let workerDisabled = false
let lastMatchMode = 'sync'
const pendingRequests = new Map()

function rejectPendingRequests(error) {
  for (const { reject } of pendingRequests.values()) {
    reject(error)
  }

  pendingRequests.clear()
}

function disableWorker(error) {
  workerDisabled = true

  if (worker) {
    worker.terminate()
    worker = undefined
  }

  rejectPendingRequests(error)
}

function createWorker() {
  if (
    workerDisabled ||
    typeof Worker === 'undefined'
  ) {
    return undefined
  }

  if (worker) return worker

  try {
    worker = new MatcherWorker()
  } catch {
    workerDisabled = true
    return undefined
  }

  worker.addEventListener('message', (event) => {
    const request = pendingRequests.get(event.data?.id)

    if (!request) return

    pendingRequests.delete(event.data.id)

    if (event.data.error) {
      request.reject(new Error(event.data.error))
    } else {
      request.resolve(event.data.result)
    }
  })

  worker.addEventListener('error', (event) => {
    disableWorker(event.error ?? new Error(event.message || 'Worker matcher failed.'))
  })

  worker.addEventListener('messageerror', () => {
    disableWorker(new Error('Worker matcher could not deserialize a message.'))
  })

  return worker
}

function runWorkerMatch(query, source) {
  const activeWorker = createWorker()

  if (!activeWorker) return undefined

  const id = nextRequestId++

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject })

    try {
      activeWorker.postMessage({ id, query, source })
    } catch (error) {
      pendingRequests.delete(id)
      reject(error)
    }
  })
}

export function latestMatcherMode() {
  return lastMatchMode
}

export default async function findBestMatch(query, source) {
  const workerMatch = runWorkerMatch(query, source)

  if (workerMatch) {
    try {
      const result = await workerMatch
      lastMatchMode = 'worker'
      return result
    } catch (error) {
      disableWorker(error)
    }
  }

  lastMatchMode = 'sync'
  return bestMatch(query, source)
}
