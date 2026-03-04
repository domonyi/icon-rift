import Link from "next/link"
import { Suspense } from "react"
import { getCollections, getSampleIcons } from "@/lib/icons"
import { SearchBar } from "@/components/SearchBar"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const allCollections = getCollections()

  const filtered = q
    ? allCollections.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.prefix.toLowerCase().includes(q.toLowerCase()) ||
          c.category.toLowerCase().includes(q.toLowerCase())
      )
    : allCollections

  // Count totals
  const totalIcons = allCollections.reduce((sum, c) => sum + c.total, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          <span style={{ color: "var(--accent)" }}>Icon</span>Kit
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

        <Link
          href="/playground"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
      </header>

      {/* Category badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {Array.from(new Set(allCollections.map((c) => c.category)))
          .sort()
          .map((cat) => {
            const count = allCollections.filter(
              (c) => c.category === cat
            ).length
            return (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-xs border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {cat}{" "}
                <span style={{ color: "var(--text-muted)" }}>({count})</span>
              </span>
            )
          })}
      </div>

      {/* Results count */}
      {q && (
        <p
          className="text-sm mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
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
        {samples.map((icon) => (
          <span
            key={icon.name}
            className="w-6 h-6 flex items-center justify-center shrink-0"
            style={{ color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: icon.svg }}
          />
        ))}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-sm truncate">
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
