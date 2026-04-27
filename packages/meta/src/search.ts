/**
 * Search icon names using substring matching.
 *
 * @example
 * ```ts
 * import { names } from "@iconrift/meta/names/mdi"
 * import { searchNames } from "@iconrift/meta/search"
 *
 * searchNames(names, "arrow")
 * // → ["arrow-left", "arrow-right", "arrow-up", "arrow-down", ...]
 *
 * searchNames(names, "arrow", 5)
 * // → first 5 matches
 * ```
 */
export function searchNames(
  names: readonly string[],
  query: string,
  limit?: number
): string[] {
  const q = query.toLowerCase()
  const tokens = q.split(/[\s-_]+/).filter(Boolean)

  const results: string[] = []
  for (const name of names) {
    const lower = name.toLowerCase()
    if (tokens.every((t) => lower.includes(t))) {
      results.push(name)
      if (limit && results.length >= limit) break
    }
  }
  return results
}
