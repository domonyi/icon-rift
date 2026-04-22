import fs from "fs"
import path from "path"
import type { IconSetMeta } from "@iconrift/core"

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
const COLLECTIONS_PATH = path.join(
  ROOT,
  "node_modules",
  "@iconify",
  "json",
  "collections.json"
)

// Cache for collections metadata
let collectionsRaw: Record<string, Record<string, unknown>> | null = null

function loadCollectionsRaw(): Record<string, Record<string, unknown>> {
  if (!collectionsRaw) {
    collectionsRaw = JSON.parse(fs.readFileSync(COLLECTIONS_PATH, "utf8"))
  }
  return collectionsRaw!
}

// Cache for icon name lists per set
const iconNamesCache = new Map<string, string[]>()

// Cache for parsed collections
let collectionsCache: IconSetMeta[] | null = null
let collectionsByPrefix: Map<string, IconSetMeta> | null = null

/**
 * Get metadata for all icon sets.
 */
export function getCollections(): IconSetMeta[] {
  if (collectionsCache) return collectionsCache
  const raw = loadCollectionsRaw()
  collectionsCache = Object.entries(raw).map(([prefix, meta]) => ({
    prefix,
    name: (meta.name as string) || prefix,
    total: (meta.total as number) || 0,
    author: (meta.author as { name: string; url?: string }) || { name: "Unknown" },
    license: (meta.license as { title: string; spdx: string }) || {
      title: "Unknown",
      spdx: "Unknown",
    },
    category: (meta.category as string) || "General",
    height: (meta.height as number | number[]) || 24,
    palette: (meta.palette as boolean) || false,
    samples: (meta.samples as string[]) || [],
  }))
  collectionsByPrefix = new Map(collectionsCache.map((c) => [c.prefix, c]))
  return collectionsCache
}

/**
 * Get metadata for a single icon set.
 */
export function getCollection(prefix: string): IconSetMeta | null {
  if (!collectionsByPrefix) getCollections()
  return collectionsByPrefix!.get(prefix) ?? null
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
