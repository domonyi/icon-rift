"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { HexColorPicker } from "react-colorful"
import { MobileDrawer } from "./MobileDrawer"

interface Customization {
  size: number
  color: string
  rotation: number
  flipH: boolean
  flipV: boolean
  strokeWidth: number | null
  absoluteStrokeWidth: boolean
}

interface IconData {
  name: string
  svg: string
}

interface SidebarProps {
  custom: Customization
  setCustom: React.Dispatch<React.SetStateAction<Customization>>
  globalColors: string[]
  setGlobalColors: React.Dispatch<React.SetStateAction<string[]>>
  selected: IconData | null
  setSelected: (icon: IconData | null) => void
  prefix: string
  componentName: string
  customizedSvg: string
  propsString: string
  selectedPalette: string[]
  isMultiColor: boolean
  colorOverrides: string[]
  setColorOverrides: (colors: string[]) => void
  copied: string | null
  onCopy: (text: string, label: string) => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

export function Sidebar({
  custom,
  setCustom,
  globalColors,
  setGlobalColors,
  selected,
  setSelected,
  prefix,
  componentName,
  customizedSvg,
  propsString,
  selectedPalette,
  isMultiColor,
  colorOverrides,
  setColorOverrides,
  copied,
  onCopy,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const closeMobile = useCallback(() => onMobileOpenChange(false), [onMobileOpenChange])

  const sidebarContent = (
    <>
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold">Customize</h3>
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
            onCopy={onCopy}
            custom={custom}
          />
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto border-l"
        style={{
          width: 300,
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile trigger button */}
      <button
        onClick={() => onMobileOpenChange(true)}
        className="lg:hidden fixed bottom-5 right-5 z-30 flex items-center gap-2 h-14 px-5 rounded-full shadow-xl border border-white/10 backdrop-blur-sm transition-all active:scale-95 hover:scale-105 hover:brightness-125 cursor-pointer"
        style={{ background: "rgba(23,23,23,0.85)", color: "#fff" }}
        aria-label="Customize"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        <span className="text-sm font-medium">Customize</span>
      </button>

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={closeMobile} side="right" width={300}>
        {sidebarContent}
      </MobileDrawer>
    </>
  )
}

/* ─── Debounced Color Picker ─── */

function DebouncedColorPicker({
  color,
  onChange,
}: {
  color: string
  onChange: (color: string) => void
}) {
  const [localColor, setLocalColor] = useState(color)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

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

/* ─── Customize Panel ─── */

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

          <button
            onClick={handleAddSlot}
            className="hover-card flex items-center justify-center rounded-md"
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

        {globalColors.length > 0 && (
          <button
            onClick={() => {
              setGlobalColors([])
              setActiveGlobalSlot(null)
            }}
            className="hover-card mt-2 text-[10px] font-medium px-1.5 py-0.5 rounded"
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
          setCustom({
            size: 48,
            color: "#f5f5f5",
            rotation: 0,
            flipH: false,
            flipV: false,
            strokeWidth: 2,
            absoluteStrokeWidth: false,
          })
          setGlobalColors([])
          setActiveGlobalSlot(null)
        }}
        className="hover-card w-full py-2 rounded-lg text-xs font-medium"
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
            className="hover-card text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}
          >
            Reset
          </button>
        )}
      </div>

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
        value={`import { ${componentName} } from '@iconrift/react/${prefix}'`}
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
      className="hover-card w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-left text-sm"
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
