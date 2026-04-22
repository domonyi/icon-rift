"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useRef, useTransition } from "react"

export function SearchBar({
  placeholder = "Search icons...",
  paramName = "q",
  compact = false,
}: {
  placeholder?: string
  paramName?: string
  compact?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get(paramName) ?? "")
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  function handleChange(value: string) {
    setValue(value)
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(paramName, value)
        params.delete("page") // Reset pagination on search
      } else {
        params.delete(paramName)
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 300)
  }

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-9 ${compact ? "py-2 rounded-lg" : "py-3 rounded-xl"} border transition-colors duration-200 text-sm outline-none`}
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
      />
      {value && !isPending && (
        <button
          onClick={() => handleChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      {isPending && (
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--border)",
            borderTopColor: "var(--accent)",
          }}
        />
      )}
    </div>
  )
}
