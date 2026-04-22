import Link from "next/link"
import { Suspense } from "react"
import { SearchBar } from "./SearchBar"

export function TopNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center gap-4 px-5 border-b"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border)",
      }}
    >
      <Link href="/" className="font-bold text-lg shrink-0">
        <span style={{ color: "var(--accent)" }}>Icon</span>Rift
      </Link>

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-xl">
          <Suspense>
            <SearchBar placeholder="Search..." compact />
          </Suspense>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Sponsor */}
        <button
          className="hover-card flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ color: "var(--text-muted)" }}
          title="Sponsor"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Dark mode toggle */}
        <button
          className="hover-card flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ color: "var(--text-muted)" }}
          title="Toggle theme"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>

        {/* Settings */}
        <button
          className="hover-card flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ color: "var(--text-muted)" }}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* GitHub stars */}
        <button
          className="hover-card flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border"
          style={{
            color: "var(--text-secondary)",
            borderColor: "var(--border)",
            background: "var(--bg-card)",
          }}
          title="Star on GitHub"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Star
        </button>

        {/* Submit / Request icon */}
        <button
          className="hover-accent flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
          style={{
            background: "var(--accent)",
            color: "#fff",
          }}
          title="Request to add new icons"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Submit
        </button>
      </div>
    </nav>
  )
}
