"use client"

import { useEffect } from "react"

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  side: "left" | "right"
  children: React.ReactNode
  width?: number
}

export function MobileDrawer({
  open,
  onClose,
  side,
  children,
  width = 288,
}: MobileDrawerProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-14 z-50 h-[calc(100vh-3.5rem)] flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out ${
          side === "left" ? "left-0 border-r" : "right-0 border-l"
        } ${
          open
            ? "translate-x-0"
            : side === "left"
              ? "-translate-x-full"
              : "translate-x-full"
        }`}
        style={{
          width,
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        {children}
      </aside>
    </div>
  )
}
