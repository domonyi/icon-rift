import Link from "next/link"
import { Suspense } from "react"
import { SearchBar } from "./SearchBar"
import { GitHubStars } from "./GitHubStars"

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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Dark mode toggle */}
        <button
          className="hover-card flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ color: "var(--text-muted)" }}
          title="Toggle theme"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        {/* Settings */}
        <button
          className="hover-card flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ color: "var(--text-muted)" }}
          title="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* Divider */}
        <div
          className="h-4 w-px mx-1"
          style={{ background: "var(--border)" }}
        />

        {/* GitHub stars */}
        <Suspense
          fallback={
            <span
              className="hover-card flex items-center gap-2 h-8 px-2.5 rounded-lg text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </span>
          }
        >
          <GitHubStars />
        </Suspense>

        {/* Submit / Request icon */}
        <button
          className="hover-card flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border leading-none"
          style={{
            color: "var(--text-secondary)",
            borderColor: "var(--border)",
            background: "var(--bg-card)",
          }}
          title="Request to add new icons"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Submit
        </button>
      </div>
    </nav>
  )
}
