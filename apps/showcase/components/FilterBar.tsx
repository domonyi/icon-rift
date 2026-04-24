"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useRef, useEffect, useCallback } from "react"

/* ------------------------------------------------------------------ */
/*  Reusable dropdown (same visual style as SortToggle)                */
/* ------------------------------------------------------------------ */

function FilterDropdown({
  label,
  icon,
  options,
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const display = value ? (options.find((o) => o.value === value)?.label ?? label) : label

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="hover-card flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
        style={{ color: value ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {icon}
        {display}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-0.5"
          style={{ opacity: 0.5 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 min-w-[10rem] max-h-64 overflow-y-auto rounded-lg border py-1 shadow-lg z-10"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors"
              style={{
                color: value === opt.value ? "var(--text-primary)" : "var(--text-muted)",
                background: value === opt.value ? "var(--bg-card)" : undefined,
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.currentTarget.style.color = "var(--text-secondary)"
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.currentTarget.style.color = "var(--text-muted)"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  License dropdown with two sections                                 */
/* ------------------------------------------------------------------ */

function LicenseDropdown({
  commercial,
  attribution,
  counts,
  onCommercialChange,
  onAttributionChange,
  active,
}: {
  commercial: string
  attribution: string
  counts: { commercial: number; nonCommercial: number; noAttribution: number; attribution: number }
  onCommercialChange: (v: string) => void
  onAttributionChange: (v: string) => void
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="hover-card flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
        style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        License
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-0.5"
          style={{ opacity: 0.5 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 min-w-[13rem] rounded-lg border py-1 shadow-lg z-10"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          {/* Commercial use section */}
          <div
            className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Commercial use
          </div>
          {([
            { value: "", label: "Any" },
            { value: "yes", label: `Allowed (${counts.commercial})` },
            { value: "no", label: `Not allowed (${counts.nonCommercial})` },
          ] as const).map((opt) => (
            <button
              key={`c-${opt.value}`}
              onClick={() => onCommercialChange(opt.value)}
              className="w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors"
              style={{
                color: commercial === opt.value ? "var(--text-primary)" : "var(--text-muted)",
                background: commercial === opt.value ? "var(--bg-card)" : undefined,
              }}
              onMouseEnter={(e) => {
                if (commercial !== opt.value) e.currentTarget.style.color = "var(--text-secondary)"
              }}
              onMouseLeave={(e) => {
                if (commercial !== opt.value) e.currentTarget.style.color = "var(--text-muted)"
              }}
            >
              {opt.label}
            </button>
          ))}

          {/* Divider */}
          <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />

          {/* Attribution section */}
          <div
            className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Attribution
          </div>
          {([
            { value: "", label: "Any" },
            { value: "none", label: `Not required (${counts.noAttribution})` },
            { value: "required", label: `Required (${counts.attribution})` },
          ] as const).map((opt) => (
            <button
              key={`a-${opt.value}`}
              onClick={() => onAttributionChange(opt.value)}
              className="w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors"
              style={{
                color: attribution === opt.value ? "var(--text-primary)" : "var(--text-muted)",
                background: attribution === opt.value ? "var(--bg-card)" : undefined,
              }}
              onMouseEnter={(e) => {
                if (attribution !== opt.value) e.currentTarget.style.color = "var(--text-secondary)"
              }}
              onMouseLeave={(e) => {
                if (attribution !== opt.value) e.currentTarget.style.color = "var(--text-muted)"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  FilterBar                                                          */
/* ------------------------------------------------------------------ */

export function FilterBar({
  licenseCounts,
}: {
  licenseCounts: { commercial: number; nonCommercial: number; noAttribution: number; attribution: number }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCommercial = searchParams.get("commercial") ?? ""
  const currentAttribution = searchParams.get("attribution") ?? ""
  const currentPalette = searchParams.get("palette") ?? ""
  const currentGroup = searchParams.get("group") ?? ""

  const setParam = useCallback(
    (key: string, val: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (val) {
        params.set(key, val)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  /* --- Style options --- */
  const paletteOptions = [
    { value: "", label: "All styles" },
    { value: "mono", label: "Mono" },
    { value: "color", label: "Multicolor" },
  ]

  /* --- Group-by options --- */
  const groupOptions = [
    { value: "", label: "Category" },
    { value: "license", label: "License" },
    { value: "author", label: "Author" },
    { value: "none", label: "No grouping" },
  ]

  const hasActiveFilters = currentCommercial || currentAttribution || currentPalette

  const licenseActive = currentCommercial || currentAttribution

  return (
    <div className="flex items-center gap-1">
      {/* License filter (two sections in one dropdown) */}
      <LicenseDropdown
        commercial={currentCommercial}
        attribution={currentAttribution}
        counts={licenseCounts}
        onCommercialChange={(v) => setParam("commercial", v)}
        onAttributionChange={(v) => setParam("attribution", v)}
        active={!!licenseActive}
      />

      {/* Style filter */}
      <FilterDropdown
        label="Style"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="10.5" r="2.5" />
            <circle cx="8.5" cy="7.5" r="2.5" />
            <circle cx="6.5" cy="12.5" r="2.5" />
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M19.14 19.14a2 2 0 0 1-2.8 0l-7.34-7.34a2 2 0 0 1 0-2.8" />
          </svg>
        }
        options={paletteOptions}
        value={currentPalette}
        onChange={(v) => setParam("palette", v)}
      />

      {/* Group-by */}
      <FilterDropdown
        label="Group"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        }
        options={groupOptions}
        value={currentGroup}
        onChange={(v) => setParam("group", v)}
      />

      {/* Clear all filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("commercial")
            params.delete("attribution")
            params.delete("palette")
            router.push(`${pathname}?${params.toString()}`)
          }}
          className="hover-icon flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs cursor-pointer"
          style={{ color: "var(--accent)" }}
          title="Clear filters"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      )}
    </div>
  )
}
