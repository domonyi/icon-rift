"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { MobileDrawer } from "./MobileDrawer"

interface HomeSidebarProps {
  categories: { name: string; count: number }[]
  activeCategory?: string
  query?: string
}

export function HomeSidebar({
  categories,
  activeCategory: cat,
  query: q,
}: HomeSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const renderContent = (onNav?: () => void) => (
    <>
      <div className="p-3 space-y-0.5">
        <Link
          href="/"
          onClick={onNav}
          className={`cat-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium${!cat ? " active" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </Link>
        <Link
          href="#"
          onClick={onNav}
          className="cat-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Favorites
        </Link>
        <Link
          href="/playground"
          onClick={onNav}
          className="cat-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Playground
        </Link>
        <Link
          href="/sandbox"
          onClick={onNav}
          className="cat-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 8l4 4-4 4" />
          </svg>
          Sandbox
        </Link>
        <Link
          href="/docs"
          onClick={onNav}
          className="cat-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          API
        </Link>
        <Link
          href="#"
          onClick={onNav}
          className="cat-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 256 256" fill="none">
            <line
              x1="208"
              y1="128"
              x2="128"
              y2="208"
              stroke="currentColor"
              strokeWidth="25"
              strokeLinecap="round"
            />
            <line
              x1="192"
              y1="40"
              x2="40"
              y2="192"
              stroke="currentColor"
              strokeWidth="25"
              strokeLinecap="round"
            />
          </svg>
          shadcn/ui
        </Link>
        <Link
          href="#"
          onClick={onNav}
          className="cat-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          Extensions
        </Link>
      </div>

      <div
        className="mx-3 border-t"
        style={{ borderColor: "var(--border)" }}
      />

      <div className="p-3 space-y-0.5 flex-1 overflow-y-auto">
        {categories.map(({ name: category, count }) => {
          const isActive = cat === category
          const href = isActive
            ? q
              ? `/?q=${encodeURIComponent(q)}`
              : "/"
            : q
              ? `/?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`
              : `/?category=${encodeURIComponent(category)}`
          return (
            <Link
              key={category}
              href={href}
              onClick={onNav}
              className={`cat-link flex items-center justify-between px-3 py-1.5 rounded-lg text-sm${isActive ? " active" : ""}`}
            >
              <span className="truncate">{category}</span>
              <span className="text-xs tabular-nums ml-2">{count}</span>
            </Link>
          )
        })}
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 border-r overflow-y-auto"
        style={{ borderColor: "var(--border)" }}
      >
        {renderContent()}
      </aside>

      {/* Mobile trigger button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-30 flex items-center justify-center w-14 h-14 rounded-full shadow-xl border border-white/10 backdrop-blur-sm transition-all active:scale-95 hover:scale-105 hover:brightness-125 cursor-pointer"
        style={{ background: "rgba(23,23,23,0.85)", color: "#fff" }}
        aria-label="Open menu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={closeDrawer} side="left">
        {renderContent(closeDrawer)}
      </MobileDrawer>
    </>
  )
}
