import fuzzyMatches from './fuzzy-substring.js'

export default function bestMatch(query, source) {
  const matches = fuzzyMatches(query, source)
  let match

  for (const m of matches) {
    if (m === null || m.distance < match.distance) {
      match = m
    }
  }

  const start = Math.max(match.start, 0)
  const end = Math.min(Math.max(match.end, start), source.length)
  const value = source.slice(start, end)

  return { value, start, end }
}