import type { IconCustomizations } from "./types"

// --- Palette utilities ---

/** Colors that should never appear in the palette */
function shouldSkipColor(value: string): boolean {
  const v = value.trim().toLowerCase()
  return v === "none" || v === "inherit" || v === "transparent" || v.startsWith("url(")
}

/** Normalize a hex color to lowercase 6-digit form for deduplication */
function normalizeColor(raw: string): string {
  const c = raw.trim().toLowerCase()
  // Expand shorthand #rgb → #rrggbb
  const m = c.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
  if (m) return `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`
  return c
}

/** Escape a string for use in a RegExp */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Extract the unique color palette from an SVG string.
 * Returns colors in order of first appearance (fill before stroke when on the same element).
 * Skips `none`, `url(...)`, `inherit`, `transparent`.
 * `currentColor` is always placed at index 0 if present.
 */
export function extractPalette(svg: string): string[] {
  const seen = new Set<string>()
  const palette: string[] = []

  const regex = /(?:fill|stroke)\s*=\s*"([^"]*)"/gi
  let m: RegExpExecArray | null
  while ((m = regex.exec(svg)) !== null) {
    const raw = m[1]
    if (shouldSkipColor(raw)) continue
    const normalized = normalizeColor(raw)
    if (!seen.has(normalized)) {
      seen.add(normalized)
      palette.push(raw) // keep original casing for replacement
    }
  }

  // Move currentColor to index 0 if present
  const ccIdx = palette.findIndex((c) => c.toLowerCase() === "currentcolor")
  if (ccIdx > 0) {
    const [cc] = palette.splice(ccIdx, 1)
    palette.unshift(cc)
  }

  return palette
}

/**
 * Customize an SVG string with the given options.
 * Works with any well-formed SVG element string.
 *
 * @param palette - Pre-extracted color palette (from extractPalette or build-time).
 *                  When provided together with `colors`, enables positional color replacement.
 */
export function customizeSvg(
  svg: string,
  options: IconCustomizations = {},
  palette?: string[]
): string {
  const {
    size = 24,
    width,
    height,
    color = "currentColor",
    colors,
    stroke,
    strokeWidth = 2,
    absoluteStrokeWidth = false,
    strokeLinecap,
    strokeLinejoin,
    opacity,
    rotate,
    flipH,
    flipV,
    className,
    style,
    title,
    viewBox,
  } = options

  // Extract the opening <svg ...> tag, body, and closing tag
  const match = svg.match(/^(<svg)([\s\S]*?)(>)([\s\S]*?)(<\/svg>)$/i)
  if (!match) return svg

  const [, svgOpen, attrString, close, body, svgClose] = match

  // Parse existing attributes into a Map
  const attrs = new Map<string, string>()
  const attrRegex = /([\w:.-]+)\s*=\s*"([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = attrRegex.exec(attrString)) !== null) {
    attrs.set(m[1], m[2])
  }

  // --- Apply customizations ---

  // Size
  const w = width ?? size
  const h = height ?? size
  attrs.set("width", String(w))
  attrs.set("height", String(h))

  // ViewBox
  if (viewBox) attrs.set("viewBox", viewBox)

  // Color replacement
  let processedBody = body

  if (colors && colors.length > 0 && palette && palette.length > 0) {
    // Positional palette replacement: colors[i] replaces palette[i]
    // Sort replacements by length descending to avoid partial matches (e.g. #fff inside #ffffff)
    const replacements = palette
      .map((original, i) => ({ original, replacement: colors[i] }))
      .filter((r) => r.replacement !== undefined)
      .sort((a, b) => b.original.length - a.original.length)

    for (const { original, replacement } of replacements) {
      const re = new RegExp(escapeRegex(original), "g")
      processedBody = processedBody.replace(re, replacement)
      for (const [key, val] of attrs.entries()) {
        if (val.includes(original)) {
          attrs.set(key, val.replace(re, replacement))
        }
      }
    }
  } else {
    // Legacy behavior: replace currentColor with `color` prop
    for (const [key, val] of attrs.entries()) {
      if (val.includes("currentColor")) {
        attrs.set(key, val.replace(/currentColor/g, color))
      }
    }
    processedBody = processedBody.replace(/currentColor/g, color)
  }

  // Stroke properties
  if (stroke) attrs.set("stroke", stroke)

  // absoluteStrokeWidth: scale stroke so it stays visually constant regardless of icon size
  const numericSize = typeof w === "number" ? w : parseFloat(String(w))
  const baseViewBox = 24
  if (absoluteStrokeWidth && !isNaN(numericSize)) {
    attrs.set("stroke-width", String(Number(strokeWidth) * baseViewBox / numericSize))
  } else {
    attrs.set("stroke-width", String(strokeWidth))
  }

  if (strokeLinecap) attrs.set("stroke-linecap", strokeLinecap)
  if (strokeLinejoin) attrs.set("stroke-linejoin", strokeLinejoin)

  // Opacity
  if (opacity !== undefined) attrs.set("opacity", String(opacity))

  // Transforms
  const transforms: string[] = []
  if (rotate) transforms.push(`rotate(${rotate}deg)`)
  if (flipH) transforms.push("scaleX(-1)")
  if (flipV) transforms.push("scaleY(-1)")

  // Build style string
  const styleParts: string[] = []
  if (transforms.length > 0) {
    styleParts.push(
      `transform:${transforms.join(" ")};transform-origin:center`
    )
  }
  if (style) styleParts.push(style)
  const existingStyle = attrs.get("style")
  if (existingStyle) styleParts.unshift(existingStyle)
  if (styleParts.length > 0) {
    attrs.set("style", styleParts.join(";"))
  }

  // Class
  if (className) {
    const existing = attrs.get("class") || ""
    attrs.set("class", (existing + " " + className).trim())
  }

  // Title (accessibility)
  if (title) {
    processedBody = `<title>${escapeHtml(title)}</title>${processedBody}`
  }

  // Reconstruct SVG
  const attrStr = Array.from(attrs.entries())
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ")

  return `${svgOpen} ${attrStr}${close}${processedBody}${svgClose}`
}

/**
 * Extract the inner body of an SVG (everything between <svg> and </svg>).
 */
export function getSvgBody(svg: string): string {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
  return match ? match[1].trim() : ""
}

/**
 * Extract attributes from an SVG element as a plain object.
 */
export function getSvgAttributes(svg: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const tagMatch = svg.match(/<svg([^>]*)>/i)
  if (!tagMatch) return attrs

  const attrRegex = /([\w:.-]+)\s*=\s*"([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = attrRegex.exec(tagMatch[1])) !== null) {
    attrs[m[1]] = m[2]
  }
  return attrs
}

/**
 * Convert an SVG string into a data URI for use in img src, CSS background, etc.
 */
export function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22")
  return `data:image/svg+xml,${encoded}`
}

/**
 * Convert an SVG string into a base64 data URI.
 */
export function svgToBase64(svg: string): string {
  const base64 =
    typeof btoa === "function"
      ? btoa(svg)
      : Buffer.from(svg).toString("base64")
  return `data:image/svg+xml;base64,${base64}`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
