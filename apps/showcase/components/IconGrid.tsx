"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { HexColorPicker } from "react-colorful"

interface IconData {
  name: string
  svg: string
}

interface IconGridProps {
  icons: IconData[]
  prefix: string
  total: number
  totalPages: number
  query?: string
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
  size: 24,
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

function hasStroke(svg: string): boolean {
  return /stroke=/.test(svg) && /stroke-width=/.test(svg)
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
    // Multi-color: extract palette and replace positionally
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

export function IconGrid({ icons: initialIcons, prefix, total, totalPages, query }: IconGridProps) {
  const [allIcons, setAllIcons] = useState<IconData[]>(initialIcons)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<IconData | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOM)
  const [globalColors, setGlobalColors] = useState<string[]>([])
  const [colorOverrides, setColorOverrides] = useState<string[]>([])

  // Extract palette for selected icon
  const selectedPalette = useMemo(
    () => (selected ? extractPalette(selected.svg) : []),
    [selected]
  )
  const isMultiColor = selectedPalette.length > 1 || (selectedPalette.length === 1 && selectedPalette[0].toLowerCase() !== "currentcolor")
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const prefetchCache = useRef<Map<number, IconData[]>>(new Map())

  const hasMore = page < totalPages

  // Build fetch URL for a page
  const buildPageUrl = useCallback(
    (p: number) => {
      const params = new URLSearchParams({ page: String(p) })
      if (query) params.set("q", query)
      return `/api/icons/${prefix}?${params}`
    },
    [prefix, query]
  )

  // Reset when initial icons change (e.g. search query changes)
  useEffect(() => {
    setAllIcons(initialIcons)
    setPage(1)
    setSelected(null)
    prefetchCache.current.clear()
  }, [initialIcons])

  // Prefetch the next page eagerly
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

  // Infinite scroll — append next page when sentinel is visible
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

  // Per-icon overrides take precedence over global colors
  const effectiveColors = colorOverrides.length > 0 ? colorOverrides : globalColors.length > 0 ? globalColors : undefined

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

  // Close selected icon on Escape
  useEffect(() => {
    if (!selected) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selected])

  return (
    <div className="flex gap-6">
      {/* Grid — takes remaining space */}
      <div className="flex-1 min-w-0">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(custom.size + 24, 72)}px, 1fr))`,
          }}
        >
          {allIcons.map((icon) => {
            const isActive = selected?.name === icon.name
            const previewSvg = applySvgCustomization(icon.svg, custom, globalColors.length > 0 ? globalColors : undefined)
            return (
              <button
                key={icon.name}
                onClick={() => handleSelect(icon)}
                className="flex items-center justify-center p-3 rounded-lg transition-all duration-150 cursor-pointer"
                style={{
                  background: isActive ? "var(--accent)" : undefined,
                  outline: isActive
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
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
          })}
        </div>

        {/* Scroll sentinel */}
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

        {/* Count */}
        {!hasMore && allIcons.length > 0 && (
          <p
            className="text-center text-xs py-6"
            style={{ color: "var(--text-muted)" }}
          >
            {total.toLocaleString()} icons
          </p>
        )}
      </div>

      {/* Always-visible sidebar */}
      <div
        ref={sidebarRef}
        className="shrink-0 hidden lg:block"
        style={{ width: 300 }}
      >
        <div
          className="sticky top-4 rounded-xl border overflow-hidden"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          {/* Sidebar header */}
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <h3 className="text-sm font-semibold">Customize All</h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Changes apply to every icon
            </p>
          </div>

          {/* Customization controls */}
          <div className="px-5 py-4">
            <CustomizePanel
              custom={custom}
              setCustom={setCustom}
              globalColors={globalColors}
              setGlobalColors={setGlobalColors}
            />
          </div>

          {/* Selected icon detail */}
          {selected && (
            <>
              <div
                className="border-t px-5 py-4"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold truncate">
                      {componentName}
                    </h4>
                    <p
                      className="text-[11px] font-mono truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {prefix}:{selected.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1 rounded-lg transition-colors hover:bg-white/10 shrink-0 ml-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Preview */}
                <div className="flex items-center justify-center mb-3">
                  <div
                    className="flex items-center justify-center rounded-lg border checkerboard"
                    style={{
                      width: Math.max(custom.size + 32, 72),
                      height: Math.max(custom.size + 32, 72),
                      borderColor: "var(--border)",
                      transition: "width 0.2s, height 0.2s",
                    }}
                  >
                    <span
                      className="flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      style={{
                        width: custom.size,
                        height: custom.size,
                        transition: "width 0.2s, height 0.2s",
                      }}
                      dangerouslySetInnerHTML={{ __html: customizedSvg }}
                    />
                  </div>
                </div>

                {/* Multi-color palette editor */}
                {isMultiColor && (
                  <PaletteEditor
                    palette={selectedPalette}
                    overrides={colorOverrides}
                    onChange={setColorOverrides}
                  />
                )}

                {/* Code snippets */}
                <CodePanel
                  componentName={componentName}
                  prefix={prefix}
                  iconName={selected.name}
                  propsString={propsString}
                  customizedSvg={customizedSvg}
                  copied={copied}
                  onCopy={copyToClipboard}
                  custom={custom}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Tab Button ─── */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 text-sm font-medium transition-colors relative"
      style={{
        color: active ? "var(--text-primary)" : "var(--text-muted)",
      }}
    >
      {children}
      {active && (
        <span
          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
          style={{ background: "var(--accent)" }}
        />
      )}
    </button>
  )
}

/* ─── Customize Panel ─── */

function DebouncedColorPicker({
  color,
  onChange,
}: {
  color: string
  onChange: (color: string) => void
}) {
  const [localColor, setLocalColor] = useState(color)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Sync from parent when it changes externally (e.g. reset)
  useEffect(() => {
    setLocalColor(color)
  }, [color])

  const handleChange = useCallback(
    (newColor: string) => {
      setLocalColor(newColor)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => onChange(newColor), 16)
    },
    [onChange]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <HexColorPicker
      color={localColor}
      onChange={handleChange}
      style={{ width: "100%" }}
    />
  )
}

function CustomizePanel({
  custom,
  setCustom,
  globalColors,
  setGlobalColors,
}: {
  custom: Customization
  setCustom: React.Dispatch<React.SetStateAction<Customization>>
  globalColors: string[]
  setGlobalColors: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const [activeGlobalSlot, setActiveGlobalSlot] = useState<number | null>(null)

  const handleColorChange = useCallback(
    (color: string) => setCustom((c) => ({ ...c, color })),
    [setCustom]
  )

  const handleAddSlot = useCallback(() => {
    setGlobalColors((prev) => [...prev, "#6366f1"])
    setActiveGlobalSlot((prev) => (prev ?? 0) + (globalColors.length > 0 ? 1 : 0))
  }, [setGlobalColors, globalColors.length])

  const handleRemoveSlot = useCallback(
    (index: number) => {
      setGlobalColors((prev) => prev.filter((_, i) => i !== index))
      setActiveGlobalSlot((prev) =>
        prev === index ? null : prev !== null && prev > index ? prev - 1 : prev
      )
    },
    [setGlobalColors]
  )

  const handleSlotColor = useCallback(
    (index: number, color: string) => {
      setGlobalColors((prev) => {
        const next = [...prev]
        next[index] = color
        return next
      })
    },
    [setGlobalColors]
  )

  return (
    <div className="space-y-5">
      {/* Size */}
      <ControlGroup label="Size" value={`${custom.size}px`}>
        <input
          type="range"
          min={12}
          max={128}
          value={custom.size}
          onChange={(e) =>
            setCustom((c) => ({ ...c, size: Number(e.target.value) }))
          }
          className="slider w-full"
        />
        <div
          className="flex justify-between text-[10px] mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          <span>12</span>
          <span>128</span>
        </div>
      </ControlGroup>

      {/* Color (monotone) */}
      {globalColors.length === 0 && (
        <ControlGroup label="Color" value={custom.color}>
          <DebouncedColorPicker
            color={custom.color}
            onChange={handleColorChange}
          />
        </ControlGroup>
      )}

      {/* Multi-color slots */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Colors
          </span>
          <span
            className="text-[10px] font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            {globalColors.length === 0
              ? "monotone"
              : `${globalColors.length} slot${globalColors.length > 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Swatches + add */}
        <div className="flex flex-wrap items-center gap-1.5">
          {globalColors.map((color, i) => {
            const isActive = activeGlobalSlot === i
            return (
              <button
                key={i}
                onClick={() => setActiveGlobalSlot(isActive ? null : i)}
                className="relative rounded-md transition-all group"
                style={{
                  width: 28,
                  height: 28,
                  background: color,
                  outline: isActive
                    ? "2px solid var(--accent)"
                    : "1px solid var(--border)",
                  outlineOffset: isActive ? 1 : 0,
                }}
                title={`Slot ${i + 1}: ${color}`}
              >
                {/* Remove button on hover */}
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveSlot(i)
                  }}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full items-center justify-center text-[8px] font-bold hidden group-hover:flex"
                  style={{
                    background: "var(--bg-card)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    lineHeight: 1,
                  }}
                >
                  x
                </span>
              </button>
            )
          })}

          {/* Add slot button */}
          <button
            onClick={handleAddSlot}
            className="flex items-center justify-center rounded-md transition-colors"
            style={{
              width: 28,
              height: 28,
              background: "var(--bg-card)",
              border: "1px dashed var(--border)",
              color: "var(--text-muted)",
              fontSize: 16,
              lineHeight: 1,
            }}
            title="Add color slot"
          >
            +
          </button>
        </div>

        {/* Color picker for active global slot */}
        {activeGlobalSlot !== null && globalColors[activeGlobalSlot] && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[11px] font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                Slot {activeGlobalSlot + 1}
              </span>
              <span
                className="text-[11px] font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                {globalColors[activeGlobalSlot]}
              </span>
            </div>
            <DebouncedColorPicker
              color={globalColors[activeGlobalSlot]}
              onChange={(color) => handleSlotColor(activeGlobalSlot, color)}
            />
          </div>
        )}

        {/* Clear all colors */}
        {globalColors.length > 0 && (
          <button
            onClick={() => {
              setGlobalColors([])
              setActiveGlobalSlot(null)
            }}
            className="mt-2 text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ color: "var(--text-muted)", background: "var(--bg-card)" }}
          >
            Clear all colors
          </button>
        )}
      </div>

      {/* Stroke width */}
      <ControlGroup label="Stroke Width" value={`${custom.strokeWidth ?? 2}`}>
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.25}
          value={custom.strokeWidth ?? 2}
          onChange={(e) =>
            setCustom((c) => ({
              ...c,
              strokeWidth: Number(e.target.value),
            }))
          }
          className="slider w-full"
        />
        <div
          className="flex justify-between text-[10px] mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          <span>0.5</span>
          <span>4</span>
        </div>
      </ControlGroup>

      {/* Absolute stroke width */}
      <div className="flex items-center justify-between">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Absolute Stroke Width
          </span>
          <button
            onClick={() =>
              setCustom((c) => ({
                ...c,
                absoluteStrokeWidth: !c.absoluteStrokeWidth,
              }))
            }
            className="relative w-9 h-5 rounded-full transition-colors"
            style={{
              background: custom.absoluteStrokeWidth
                ? "var(--accent)"
                : "var(--bg-card)",
              border: `1px solid ${custom.absoluteStrokeWidth ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-transform"
              style={{
                background: "#fff",
                transform: custom.absoluteStrokeWidth
                  ? "translateX(16px)"
                  : "translateX(0)",
              }}
            />
          </button>
        </div>

      {/* Reset */}
      <button
        onClick={() => {
          setCustom(DEFAULT_CUSTOM)
          setGlobalColors([])
          setActiveGlobalSlot(null)
        }}
        className="w-full py-2 rounded-lg text-xs font-medium transition-colors"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        Reset to defaults
      </button>
    </div>
  )
}

/* ─── Control Group ─── */

function ControlGroup({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        {value && (
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

/* ─── Palette Editor ─── */

function PaletteEditor({
  palette,
  overrides,
  onChange,
}: {
  palette: string[]
  overrides: string[]
  onChange: (colors: string[]) => void
}) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null)

  const handleSlotColor = useCallback(
    (index: number, color: string) => {
      const next = [...overrides]
      // Ensure array is long enough
      while (next.length <= index) next.push(palette[next.length])
      next[index] = color
      onChange(next)
    },
    [overrides, palette, onChange]
  )

  const handleReset = useCallback(() => {
    onChange([])
    setActiveSlot(null)
  }, [onChange])

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Colors ({palette.length})
        </span>
        {overrides.length > 0 && (
          <button
            onClick={handleReset}
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Color swatches */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {palette.map((original, i) => {
          const current = overrides[i] ?? original
          const displayColor = original.toLowerCase() === "currentcolor" ? "#f5f5f5" : current
          const isActive = activeSlot === i
          return (
            <button
              key={i}
              onClick={() => setActiveSlot(isActive ? null : i)}
              className="relative rounded-md transition-all"
              style={{
                width: 28,
                height: 28,
                background: displayColor,
                outline: isActive
                  ? "2px solid var(--accent)"
                  : "1px solid var(--border)",
                outlineOffset: isActive ? 1 : 0,
              }}
              title={`${original}${overrides[i] ? ` → ${overrides[i]}` : ""}`}
            >
              {overrides[i] && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Inline color picker for active slot */}
      {activeSlot !== null && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              Slot {activeSlot + 1}: {palette[activeSlot]}
            </span>
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              {overrides[activeSlot] ?? palette[activeSlot]}
            </span>
          </div>
          <DebouncedColorPicker
            color={
              (overrides[activeSlot] ?? palette[activeSlot]).toLowerCase() === "currentcolor"
                ? "#f5f5f5"
                : (overrides[activeSlot] ?? palette[activeSlot])
            }
            onChange={(color) => handleSlotColor(activeSlot, color)}
          />
        </div>
      )}
    </div>
  )
}

/* ─── Code Panel ─── */

function CodePanel({
  componentName,
  prefix,
  iconName,
  propsString,
  customizedSvg,
  copied,
  onCopy,
  custom,
}: {
  componentName: string
  prefix: string
  iconName: string
  propsString: string
  customizedSvg: string
  copied: string | null
  onCopy: (text: string, label: string) => void
  custom: Customization
}) {
  return (
    <div className="space-y-2">
      <CopyRow
        label="Import"
        value={`import { ${componentName} } from '@iconkit/react/${prefix}'`}
        copied={copied}
        onCopy={onCopy}
      />
      <CopyRow
        label="Usage (with your settings)"
        value={`<${componentName} ${propsString} />`}
        copied={copied}
        onCopy={onCopy}
      />
      <CopyRow
        label="Dynamic (runtime)"
        value={`<Icon name="${prefix}:${iconName}" ${propsString} />`}
        copied={copied}
        onCopy={onCopy}
      />
      <CopyRow
        label="HTML (API)"
        value={`<img src="/api/icons/${prefix}/${iconName}?size=${custom.size}&color=${encodeURIComponent(custom.color)}" width="${custom.size}" height="${custom.size}" />`}
        copied={copied}
        onCopy={onCopy}
      />
      <CopyRow
        label="SVG (customized)"
        value={customizedSvg}
        copied={copied}
        onCopy={onCopy}
      />
    </div>
  )
}

/* ─── Copy Row ─── */

function CopyRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string
  value: string
  copied: string | null
  onCopy: (text: string, label: string) => void
}) {
  const isCopied = copied === label
  return (
    <button
      onClick={() => onCopy(value, label)}
      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors duration-150"
      style={{
        background: "var(--bg-card)",
        borderColor: isCopied ? "var(--accent)" : "var(--border)",
      }}
    >
      <div className="min-w-0">
        <span
          className="text-[11px] font-medium block mb-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>
        <span
          className="block truncate text-[11px] font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {value.length > 60 ? value.slice(0, 60) + "..." : value}
        </span>
      </div>
      <span
        className="shrink-0 text-[11px] font-medium"
        style={{ color: isCopied ? "var(--accent)" : "var(--text-secondary)" }}
      >
        {isCopied ? "Copied!" : "Copy"}
      </span>
    </button>
  )
}
