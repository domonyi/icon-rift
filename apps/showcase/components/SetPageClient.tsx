"use client"

import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react"
import { Sidebar } from "./Sidebar"

interface IconData {
  name: string
  svg: string
}

interface SetPageClientProps {
  icons: IconData[]
  prefix: string
  total: number
  totalPages: number
  query?: string
  header: React.ReactNode
}

interface Customization {
  size: number
  color: string
  rotation: number
  flipH: boolean
  flipV: boolean
  strokeWidth: number | null
  absoluteStrokeWidth: boolean
}

const DEFAULT_CUSTOM: Customization = {
  size: 48,
  color: "#f5f5f5",
  rotation: 0,
  flipH: false,
  flipV: false,
  strokeWidth: 2,
  absoluteStrokeWidth: false,
}

function toPascalCase(name: string): string {
  const parts = name.split(/[-_.\s]+/).filter(Boolean)
  let result = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
  if (/^\d/.test(result)) result = "Icon" + result
  result = result.replace(/[^a-zA-Z0-9_$]/g, "")
  return result || "Icon"
}

function shouldSkipColor(value: string): boolean {
  const v = value.trim().toLowerCase()
  return v === "none" || v === "inherit" || v === "transparent" || v.startsWith("url(")
}

function normalizeColor(raw: string): string {
  const c = raw.trim().toLowerCase()
  const m = c.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
  if (m) return `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`
  return c
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function extractPalette(svg: string): string[] {
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
      palette.push(raw)
    }
  }
  const ccIdx = palette.findIndex((c) => c.toLowerCase() === "currentcolor")
  if (ccIdx > 0) {
    const [cc] = palette.splice(ccIdx, 1)
    palette.unshift(cc)
  }
  return palette
}

function applySvgCustomization(svg: string, c: Customization, colorOverrides?: string[]): string {
  let s = svg

  if (colorOverrides && colorOverrides.length > 0) {
    const palette = extractPalette(svg)
    const replacements = palette
      .map((original, i) => ({ original, replacement: colorOverrides[i] }))
      .filter((r) => r.replacement !== undefined)
      .sort((a, b) => b.original.length - a.original.length)
    for (const { original, replacement } of replacements) {
      const re = new RegExp(escapeRegex(original), "g")
      s = s.replace(re, replacement)
    }
  } else {
    s = s.replace(/currentColor/g, c.color)
  }

  if (c.strokeWidth !== null) {
    let sw = c.strokeWidth
    if (c.absoluteStrokeWidth) {
      const viewBox = 24
      sw = sw * viewBox / c.size
    }
    s = s.replace(/stroke-width="[^"]*"/g, `stroke-width="${sw}"`)
  }
  const transforms: string[] = []
  if (c.rotation !== 0) transforms.push(`rotate(${c.rotation})`)
  if (c.flipH) transforms.push("scaleX(-1)")
  if (c.flipV) transforms.push("scaleY(-1)")
  if (transforms.length > 0) {
    s = s.replace(
      /(<svg[^>]*>)/,
      `$1<g transform-origin="center" style="transform-origin:center;transform:${transforms.join(" ")}">`
    )
    s = s.replace(/<\/svg>/, "</g></svg>")
  }
  return s
}

const IconGridItem = memo(function IconGridItem({
  icon,
  isActive,
  custom,
  gridColors,
  onSelect,
}: {
  icon: IconData
  isActive: boolean
  custom: Customization
  gridColors: string[] | undefined
  onSelect: (icon: IconData) => void
}) {
  const previewSvg = useMemo(
    () => applySvgCustomization(icon.svg, custom, gridColors),
    [icon.svg, custom, gridColors]
  )

  return (
    <button
      onClick={() => onSelect(icon)}
      className="hover-icon flex items-center justify-center p-3 rounded-lg transition-all duration-150 cursor-pointer"
      style={{
        background: isActive ? "var(--accent)" : undefined,
        outline: isActive
          ? "2px solid var(--accent)"
          : "2px solid transparent",
        contentVisibility: "auto",
        containIntrinsicSize: `${custom.size + 24}px`,
      }}
      title={icon.name}
    >
      <span
        className="flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
        style={{
          width: custom.size,
          height: custom.size,
          color: isActive ? "#fff" : undefined,
          transition: "width 0.15s, height 0.15s",
        }}
        dangerouslySetInnerHTML={{ __html: previewSvg }}
      />
    </button>
  )
})

export function SetPageClient({ icons: initialIcons, prefix, total, totalPages, query, header }: SetPageClientProps) {
  const [allIcons, setAllIcons] = useState<IconData[]>(initialIcons)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<IconData | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOM)
  const [globalColors, setGlobalColors] = useState<string[]>([])
  const [colorOverrides, setColorOverrides] = useState<string[]>([])

  const selectedPalette = useMemo(
    () => (selected ? extractPalette(selected.svg) : []),
    [selected]
  )
  const isMultiColor = selectedPalette.length > 1 || (selectedPalette.length === 1 && selectedPalette[0].toLowerCase() !== "currentcolor")

  const sentinelRef = useRef<HTMLDivElement>(null)
  const prefetchCache = useRef<Map<number, IconData[]>>(new Map())

  const hasMore = page < totalPages

  const buildPageUrl = useCallback(
    (p: number) => {
      const params = new URLSearchParams({ page: String(p) })
      if (query) params.set("q", query)
      return `/api/icons/${prefix}?${params}`
    },
    [prefix, query]
  )

  useEffect(() => {
    setAllIcons(initialIcons)
    setPage(1)
    setSelected(null)
    prefetchCache.current.clear()
  }, [initialIcons])

  useEffect(() => {
    if (!hasMore) return
    const nextPage = page + 1
    if (prefetchCache.current.has(nextPage)) return
    fetch(buildPageUrl(nextPage))
      .then((r) => r.json())
      .then((data: { icons: IconData[] }) => {
        prefetchCache.current.set(nextPage, data.icons)
      })
  }, [page, hasMore, buildPageUrl])

  useEffect(() => {
    if (!hasMore || loading) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1
          const cached = prefetchCache.current.get(nextPage)
          if (cached) {
            setAllIcons((prev) => [...prev, ...cached])
            setPage(nextPage)
          } else {
            setLoading(true)
            fetch(buildPageUrl(nextPage))
              .then((r) => r.json())
              .then((data: { icons: IconData[] }) => {
                setAllIcons((prev) => [...prev, ...data.icons])
                setPage(nextPage)
              })
              .finally(() => setLoading(false))
          }
        }
      },
      { rootMargin: "800px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, page, buildPageUrl])

  const handleSelect = useCallback(
    (icon: IconData) => {
      setSelected((prev) => (prev?.name === icon.name ? null : icon))
      setCopied(null)
      setColorOverrides([])
    },
    []
  )

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  const componentName = useMemo(
    () => (selected ? toPascalCase(selected.name) : ""),
    [selected]
  )

  const gridColors = useMemo(
    () => globalColors.length > 0 ? globalColors : undefined,
    [globalColors]
  )

  const effectiveColors = useMemo(
    () => colorOverrides.length > 0 ? colorOverrides : gridColors,
    [colorOverrides, gridColors]
  )

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(custom.size + 24, 72)}px, 1fr))`,
    }),
    [custom.size]
  )

  const customizedSvg = useMemo(
    () => (selected ? applySvgCustomization(selected.svg, custom, effectiveColors) : ""),
    [selected, custom, effectiveColors]
  )

  const propsString = useMemo(() => {
    const parts: string[] = [`size={${custom.size}}`]
    if (effectiveColors) {
      parts.push(`colors={${JSON.stringify(effectiveColors)}}`)
    } else if (custom.color !== "#f5f5f5") {
      parts.push(`color="${custom.color}"`)
    }
    if (custom.rotation !== 0) parts.push(`rotate={${custom.rotation}}`)
    if (custom.flipH) parts.push("flipH")
    if (custom.flipV) parts.push("flipV")
    if (custom.strokeWidth !== null && custom.strokeWidth !== 2)
      parts.push(`strokeWidth={${custom.strokeWidth}}`)
    return parts.join(" ")
  }, [custom, effectiveColors])

  useEffect(() => {
    if (!selected) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selected])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left column: fixed header + scrollable grid */}
      <div className="flex-1 min-w-0 flex flex-col">
        {header}

        <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Icon grid */}
        <div
          className="grid gap-3 px-6 pb-8"
          style={gridStyle}
        >
          {allIcons.map((icon) => (
            <IconGridItem
              key={icon.name}
              icon={icon}
              isActive={selected?.name === icon.name}
              custom={custom}
              gridColors={gridColors}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {loading && (
              <span
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Loading more icons...
              </span>
            )}
          </div>
        )}

        {!hasMore && allIcons.length > 0 && (
          <p
            className="text-center text-xs py-6"
            style={{ color: "var(--text-muted)" }}
          >
            {total.toLocaleString()} icons
          </p>
        )}

        {allIcons.length === 0 && (
          <div className="text-center py-20">
            <p style={{ color: "var(--text-secondary)" }}>
              No icons found
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Sidebar — full viewport height, completely independent */}
      <Sidebar
        custom={custom}
        setCustom={setCustom}
        globalColors={globalColors}
        setGlobalColors={setGlobalColors}
        selected={selected}
        setSelected={setSelected}
        prefix={prefix}
        componentName={componentName}
        customizedSvg={customizedSvg}
        propsString={propsString}
        selectedPalette={selectedPalette}
        isMultiColor={isMultiColor}
        colorOverrides={colorOverrides}
        setColorOverrides={setColorOverrides}
        copied={copied}
        onCopy={copyToClipboard}
      />
    </div>
  )
}
