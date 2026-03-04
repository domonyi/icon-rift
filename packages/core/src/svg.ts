import type { IconCustomizations } from "./types"

/**
 * Customize an SVG string with the given options.
 * Works with any well-formed SVG element string.
 */
export function customizeSvg(
  svg: string,
  options: IconCustomizations = {}
): string {
  const {
    size = 24,
    width,
    height,
    color = "currentColor",
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

  // Color: replace currentColor in both attributes and body
  let processedBody = body
  for (const [key, val] of attrs.entries()) {
    if (val.includes("currentColor")) {
      attrs.set(key, val.replace(/currentColor/g, color))
    }
  }
  processedBody = processedBody.replace(/currentColor/g, color)

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
