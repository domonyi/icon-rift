"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"

interface IconGridProps {
  icons: Array<{ name: string; svg: string }>
  prefix: string
}

interface Customization {
  size: number
  color: string
  rotation: number
  flipH: boolean
  flipV: boolean
  strokeWidth: number | null
}

const DEFAULT_CUSTOM: Customization = {
  size: 24,
  color: "#f5f5f5",
  rotation: 0,
  flipH: false,
  flipV: false,
  strokeWidth: null,
}

const PRESET_COLORS = [
  "#f5f5f5",
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
]

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

function applySvgCustomization(svg: string, c: Customization): string {
  let s = svg
  s = s.replace(/currentColor/g, c.color)
  if (c.strokeWidth !== null) {
    s = s.replace(/stroke-width="[^"]*"/g, `stroke-width="${c.strokeWidth}"`)
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

export function IconGrid({ icons, prefix }: IconGridProps) {
  const [selected, setSelected] = useState<{
    name: string
    svg: string
  } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOM)
  const [tab, setTab] = useState<"customize" | "code">("customize")
  const sidebarRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback((icon: { name: string; svg: string }) => {
    setSelected(icon)
    setCustom({
      ...DEFAULT_CUSTOM,
      strokeWidth: hasStroke(icon.svg) ? 2 : null,
    })
    setTab("customize")
    setCopied(null)
  }, [])

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  const componentName = useMemo(
    () => (selected ? toPascalCase(selected.name) : ""),
    [selected]
  )

  const customizedSvg = useMemo(
    () => (selected ? applySvgCustomization(selected.svg, custom) : ""),
    [selected, custom]
  )

  const propsString = useMemo(() => {
    const parts: string[] = [`size={${custom.size}}`]
    if (custom.color !== "#f5f5f5") parts.push(`color="${custom.color}"`)
    if (custom.rotation !== 0) parts.push(`rotate={${custom.rotation}}`)
    if (custom.flipH) parts.push("flipH")
    if (custom.flipV) parts.push("flipV")
    if (custom.strokeWidth !== null && custom.strokeWidth !== 2)
      parts.push(`strokeWidth={${custom.strokeWidth}}`)
    return parts.join(" ")
  }, [custom])

  // Close on Escape
  useEffect(() => {
    if (!selected) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selected])

  return (
    <>
      {/* Grid — shrinks when sidebar is open */}
      <div
        className="transition-[margin] duration-300 ease-in-out"
        style={{ marginRight: selected ? 380 : 0 }}
      >
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
          }}
        >
          {icons.map((icon) => {
            const isActive = selected?.name === icon.name
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
                  className="w-10 h-10 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  style={{
                    color: isActive ? "#fff" : "var(--text-primary)",
                  }}
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full z-40 transition-transform duration-300 ease-in-out"
        style={{
          width: 380,
          transform: selected ? "translateX(0)" : "translateX(100%)",
          background: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        {selected && (
          <div className="h-full flex flex-col">
            {/* Sidebar header + close */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate">
                  {componentName}
                </h3>
                <p
                  className="text-xs font-mono truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {prefix}:{selected.name}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 shrink-0 ml-3"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  width="16"
                  height="16"
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

            {/* Live preview */}
            <div className="flex items-center justify-center px-5 py-6 shrink-0">
              <div
                className="flex items-center justify-center rounded-xl border checkerboard"
                style={{
                  width: Math.max(custom.size + 48, 96),
                  height: Math.max(custom.size + 48, 96),
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

            {/* Tab switcher */}
            <div
              className="flex border-b mx-5 shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <TabButton
                active={tab === "customize"}
                onClick={() => setTab("customize")}
              >
                Customize
              </TabButton>
              <TabButton
                active={tab === "code"}
                onClick={() => setTab("code")}
              >
                Code
              </TabButton>
            </div>

            {/* Tab content — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {tab === "customize" ? (
                <CustomizePanel
                  custom={custom}
                  setCustom={setCustom}
                  showStroke={hasStroke(selected.svg)}
                />
              ) : (
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
              )}
            </div>
          </div>
        )}
      </div>
    </>
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

function CustomizePanel({
  custom,
  setCustom,
  showStroke,
}: {
  custom: Customization
  setCustom: React.Dispatch<React.SetStateAction<Customization>>
  showStroke: boolean
}) {
  const colorInputRef = useRef<HTMLInputElement>(null)

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

      {/* Color */}
      <ControlGroup label="Color" value={custom.color}>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setCustom((prev) => ({ ...prev, color: c }))}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c,
                borderColor:
                  custom.color === c ? "var(--accent)" : "transparent",
              }}
            />
          ))}
          <button
            onClick={() => colorInputRef.current?.click()}
            className="w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center text-xs transition-transform hover:scale-110"
            style={{
              borderColor: "var(--border-hover)",
              color: "var(--text-muted)",
            }}
            title="Custom color"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={custom.color}
            onChange={(e) =>
              setCustom((c) => ({ ...c, color: e.target.value }))
            }
            className="sr-only"
          />
        </div>
      </ControlGroup>

      {/* Rotation */}
      <ControlGroup label="Rotation" value={`${custom.rotation}\u00B0`}>
        <div className="flex gap-2">
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              onClick={() => setCustom((c) => ({ ...c, rotation: deg }))}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background:
                  custom.rotation === deg ? "var(--accent)" : "var(--bg-card)",
                color:
                  custom.rotation === deg ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${custom.rotation === deg ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {deg}&deg;
            </button>
          ))}
        </div>
      </ControlGroup>

      {/* Flip */}
      <ControlGroup label="Flip">
        <div className="flex gap-2">
          <ToggleButton
            active={custom.flipH}
            onClick={() => setCustom((c) => ({ ...c, flipH: !c.flipH }))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="3" x2="12" y2="21" />
              <polyline points="7 8 3 12 7 16" />
              <polyline points="17 8 21 12 17 16" />
            </svg>
            Horizontal
          </ToggleButton>
          <ToggleButton
            active={custom.flipV}
            onClick={() => setCustom((c) => ({ ...c, flipV: !c.flipV }))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <polyline points="8 7 12 3 16 7" />
              <polyline points="8 17 12 21 16 17" />
            </svg>
            Vertical
          </ToggleButton>
        </div>
      </ControlGroup>

      {/* Stroke width */}
      {showStroke && custom.strokeWidth !== null && (
        <ControlGroup label="Stroke Width" value={`${custom.strokeWidth}`}>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.25}
            value={custom.strokeWidth}
            onChange={(e) =>
              setCustom((c) => ({ ...c, strokeWidth: Number(e.target.value) }))
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
      )}

      {/* Reset */}
      <button
        onClick={() =>
          setCustom({
            ...DEFAULT_CUSTOM,
            strokeWidth: showStroke ? 2 : null,
          })
        }
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

/* ─── Toggle Button ─── */

function ToggleButton({
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
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
      style={{
        background: active ? "var(--accent)" : "var(--bg-card)",
        color: active ? "#fff" : "var(--text-secondary)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      {children}
    </button>
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
