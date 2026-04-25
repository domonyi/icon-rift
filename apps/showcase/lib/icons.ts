import fs from "fs"
import path from "path"
import type { IconSetMeta } from "@iconrift/core"
import { collections as allCollections } from "@iconrift/meta"

function findRootDir(): string {
  let dir = process.cwd()
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(dir, "svg"))) return dir
    dir = path.dirname(dir)
  }
  throw new Error("Cannot find project root (svg/ directory)")
}

const ROOT = findRootDir()
const SVG_DIR = path.join(ROOT, "svg")

// Cache for icon name lists per set
const iconNamesCache = new Map<string, string[]>()

// Cache for collections by prefix
const collectionsByPrefix = new Map(allCollections.map((c) => [c.prefix, c]))

/**
 * Get metadata for all icon sets.
 */
export function getCollections(): IconSetMeta[] {
  return allCollections
}

/**
 * Get metadata for a single icon set.
 */
export function getCollection(prefix: string): IconSetMeta | null {
  return collectionsByPrefix.get(prefix) ?? null
}

/**
 * Get all icon names for a set (from the filesystem).
 */
export function getIconNames(prefix: string): string[] {
  if (iconNamesCache.has(prefix)) return iconNamesCache.get(prefix)!

  const dir = path.join(SVG_DIR, prefix)
  if (!fs.existsSync(dir)) return []

  const names = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".svg"))
    .map((f) => f.slice(0, -4))
    .sort()

  iconNamesCache.set(prefix, names)
  return names
}

/**
 * Read an SVG file for a specific icon.
 */
export function getIconSvg(prefix: string, name: string): string {
  const filePath = path.join(SVG_DIR, prefix, `${name}.svg`)
  try {
    return fs.readFileSync(filePath, "utf8")
  } catch {
    return ""
  }
}

// Cache for sample icons per set
const sampleIconsCache = new Map<string, Array<{ name: string; svg: string }>>()

/**
 * Get sample icons for a set (with SVG content).
 */
export function getSampleIcons(
  prefix: string,
  count = 4
): Array<{ name: string; svg: string }> {
  const cacheKey = `${prefix}:${count}`
  if (sampleIconsCache.has(cacheKey)) return sampleIconsCache.get(cacheKey)!

  const meta = getCollection(prefix)
  let names: string[]

  if (meta?.samples && meta.samples.length > 0) {
    names = meta.samples.slice(0, count)
    // Verify these actually exist, fall back to directory listing
    const existing = names.filter((n) => {
      const p = path.join(SVG_DIR, prefix, `${n}.svg`)
      return fs.existsSync(p)
    })
    if (existing.length >= count) {
      names = existing.slice(0, count)
    } else {
      names = getIconNames(prefix).slice(0, count)
    }
  } else {
    names = getIconNames(prefix).slice(0, count)
  }

  // Per-set sample overrides
  const overrides: Record<string, string[]> = {
    "line-md": ["image-twotone", "account", "beer-alt-twotone", "cloud-alt-download-twotone"],
  }
  if (overrides[prefix]) {
    const ov = overrides[prefix].filter((n) =>
      fs.existsSync(path.join(SVG_DIR, prefix, `${n}.svg`))
    )
    if (ov.length >= count) names = ov.slice(0, count)
  }

  const result = names.map((name) => ({
    name,
    svg: getIconSvg(prefix, name),
  }))

  sampleIconsCache.set(cacheKey, result)
  return result
}

/**
 * Get extended sample icons for cycling previews.
 * Returns the curated samples as the first frame, plus additional icons
 * from the directory for subsequent frames.
 */
export function getExtendedSamples(
  prefix: string,
  perFrame: number = 8,
  maxFrames: number = 3
): Array<{ name: string; svg: string }> {
  const curated = getSampleIcons(prefix, perFrame)
  if (maxFrames <= 1) return curated

  const usedNames = new Set(curated.map((i) => i.name))
  const needed = perFrame * (maxFrames - 1)

  const allNames = getIconNames(prefix)
  const extraNames = allNames
    .filter((n) => !usedNames.has(n))
    // Spread them out across the set for visual variety
    .filter((_, i, arr) => {
      const step = Math.max(1, Math.floor(arr.length / needed))
      return i % step === 0
    })
    .slice(0, needed)

  const extras = extraNames.map((name) => ({
    name,
    svg: getIconSvg(prefix, name),
  }))

  return [...curated, ...extras]
}

/**
 * Get a page of icons with SVG content.
 */
export function getIconsPage(
  prefix: string,
  page: number,
  perPage: number,
  query?: string
): {
  icons: Array<{ name: string; svg: string }>
  total: number
  totalPages: number
} {
  let names = getIconNames(prefix)

  if (query) {
    const q = query.toLowerCase()
    names = names.filter((n) => n.toLowerCase().includes(q))
  }

  const total = names.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const pageNames = names.slice(start, start + perPage)

  const icons = pageNames.map((name) => ({
    name,
    svg: getIconSvg(prefix, name),
  }))

  return { icons, total, totalPages }
}
