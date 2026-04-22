export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Sidebar skeleton */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 border-r"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="p-3 space-y-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-9 rounded-lg animate-pulse"
              style={{ background: "var(--bg-secondary)" }}
            />
          ))}
        </div>
        <div className="mx-3 border-t" style={{ borderColor: "var(--border)" }} />
        <div className="p-3 space-y-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-7 rounded-lg animate-pulse"
              style={{
                background: "var(--bg-secondary)",
                opacity: 1 - i * 0.06,
              }}
            />
          ))}
        </div>
      </aside>

      {/* Main Content skeleton */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div
              className="h-5 w-40 rounded animate-pulse"
              style={{ background: "var(--bg-secondary)" }}
            />
            <div
              className="h-8 w-24 rounded-lg animate-pulse"
              style={{ background: "var(--bg-secondary)" }}
            />
          </div>
          <div
            className="grid gap-4 max-w-[1400px] mx-auto"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border animate-pulse"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  height: 160,
                  opacity: 1 - i * 0.02,
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
