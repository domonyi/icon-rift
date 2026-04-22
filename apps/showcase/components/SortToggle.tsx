"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "a-z", label: "Sort A-Z" },
  { value: "z-a", label: "Sort Z-A" },
  { value: "most", label: "Most icons" },
  { value: "least", label: "Least icons" },
] as const

export function SortToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get("sort") || "default"
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "default") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const label = SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Default"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="hover-card flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
        style={{ color: "var(--text-secondary)" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3v18M7 3l-4 4M7 3l4 4M17 21V3M17 21l-4-4M17 21l4-4" />
        </svg>
        {label}
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-40 rounded-lg border py-1 shadow-lg z-10"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              className="w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors"
              style={{
                color: current === opt.value ? "var(--text-primary)" : "var(--text-muted)",
                background: current === opt.value ? "var(--bg-card)" : undefined,
              }}
              onMouseEnter={(e) => {
                if (current !== opt.value) e.currentTarget.style.color = "var(--text-secondary)"
              }}
              onMouseLeave={(e) => {
                if (current !== opt.value) e.currentTarget.style.color = "var(--text-muted)"
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
