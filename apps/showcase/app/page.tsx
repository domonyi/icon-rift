import Link from "next/link"
import { Suspense } from "react"
import { getCollections, getSampleIcons } from "@/lib/icons"
import { SearchBar } from "@/components/SearchBar"
import { customizeSvg } from "@iconrift/react"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category: cat } = await searchParams
  const allCollections = getCollections()

  let filtered = allCollections
  if (cat) {
    filtered = filtered.filter((c) => c.category === cat)
  }
  if (q) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.prefix.toLowerCase().includes(q.toLowerCase()) ||
        c.category.toLowerCase().includes(q.toLowerCase())
    )
  }

  // Count totals
  const totalIcons = allCollections.reduce((sum, c) => sum + c.total, 0)

  // Pre-compute categories with counts
  const categories = Array.from(new Set(allCollections.map((c) => c.category)))
    .sort()
    .map((category) => ({
      name: category,
      count: allCollections.filter((c) => c.category === category).length,
    }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          <span style={{ color: "var(--accent)" }}>Icon</span>Rift
        </h1>
        <p style={{ color: "var(--text-secondary)" }} className="text-lg mb-6">
          {allCollections.length.toLocaleString()} icon sets &middot;{" "}
          {totalIcons.toLocaleString()} icons
        </p>

        <div className="max-w-xl mx-auto mb-4">
          <Suspense>
            <SearchBar placeholder="Search icon sets..." />
          </Suspense>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/playground"
            className="hover-card inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Playground
          </Link>
          <Link
            href="/sandbox"
            className="hover-card inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 8l4 4-4 4" />
            </svg>
            Sandbox
          </Link>
        </div>
      </header>

      {/* Category badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(({ name: category, count }) => {
          const isActive = cat === category
          const href = isActive
            ? q ? `/?q=${encodeURIComponent(q)}` : "/"
            : q ? `/?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}` : `/?category=${encodeURIComponent(category)}`
          return (
            <Link
              key={category}
              href={href}
              className={`${isActive ? "hover-accent" : "hover-card"} px-3 py-1 rounded-full text-xs border`}
              style={{
                background: isActive ? "var(--accent)" : "var(--bg-card)",
                borderColor: isActive ? "var(--accent)" : "var(--border)",
                color: isActive ? "#fff" : "var(--text-secondary)",
              }}
            >
              {category}{" "}
              <span style={{ color: isActive ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>({count})</span>
            </Link>
          )
        })}
      </div>

      {/* Results count */}
      {(q || cat) && (
        <p
          className="text-sm mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          {q && <> for &ldquo;{q}&rdquo;</>}
          {cat && <> in <strong>{cat}</strong></>}
        </p>
      )}

      {/* Icon set grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((col) => (
          <IconSetCard key={col.prefix} collection={col} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p
            className="text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            No icon sets found
          </p>
        </div>
      )}
    </div>
  )
}

function IconSetCard({
  collection,
}: {
  collection: ReturnType<typeof getCollections>[number]
}) {
  const samples = getSampleIcons(collection.prefix, 4)

  return (
    <Link
      href={`/set/${collection.prefix}`}
      className="icon-cell block rounded-xl border p-4 transition-all duration-150"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Sample icons */}
      <div className="flex items-center gap-3 mb-3">
        {samples.map((icon) => {
          const html = customizeSvg(icon.svg, { size: 24, color: "var(--text-primary)" })
          return (
            <span
              key={icon.name}
              className="flex items-center justify-center shrink-0"
              style={{ display: "inline-flex", alignItems: "center" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        })}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-base truncate">
            {collection.name}
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {collection.prefix}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            {collection.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div
        className="flex items-center gap-2 mt-2 text-[11px]"
        style={{ color: "var(--text-muted)" }}
      >
        <span>{collection.category}</span>
        <span>&middot;</span>
        <span>{collection.license.spdx}</span>
        <span>&middot;</span>
        <span>{collection.author.name}</span>
      </div>
    </Link>
  )
}
