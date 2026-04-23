import Link from "next/link"
import { Suspense } from "react"
import { getCollections, getSampleIcons } from "@/lib/icons"
import { customizeSvg } from "@iconrift/react"
import { CardActions } from "@/components/CardActions"
import { SortToggle } from "@/components/SortToggle"
import { HomeSidebar } from "@/components/HomeSidebar"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}) {
  const { q, category: cat, sort } = await searchParams
  const allCollections = getCollections()

  let filtered = allCollections
  if (q) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.prefix.toLowerCase().includes(q.toLowerCase()) ||
        c.category.toLowerCase().includes(q.toLowerCase())
    )
  } else if (cat) {
    filtered = filtered.filter((c) => c.category === cat)
  }

  // Sort (default = original order from @iconify/json)
  if (sort === "a-z") {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === "z-a") {
    filtered.sort((a, b) => b.name.localeCompare(a.name))
  } else if (sort === "most") {
    filtered.sort((a, b) => b.total - a.total)
  } else if (sort === "least") {
    filtered.sort((a, b) => a.total - b.total)
  }

  const categoryOrder = [
    "Material",
    "UI 24px",
    "UI 16px / 32px",
    "UI Other / Mixed Grid",
    "UI Multicolor",
    "Programming",
    "Logos",
    "Emoji",
    "Flags / Maps",
    "Thematic",
    "Archive / Unmaintained",
  ]
  const allCategoryNames = Array.from(new Set(allCollections.map((c) => c.category)))
  const categories = [
    ...categoryOrder.filter((c) => allCategoryNames.includes(c)),
    ...allCategoryNames.filter((c) => !categoryOrder.includes(c)),
  ].map((category) => ({
    name: category,
    count: allCollections.filter((c) => c.category === category).length,
  }))

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Sidebar */}
      <HomeSidebar categories={categories} activeCategory={cat} query={q} />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6">
          {/* Content header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {cat && !q && (
                <Link
                  href="/"
                  className="hover-icon p-1 rounded-md"
                  title="Clear category"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </Link>
              )}
              <h1 className="text-base font-semibold">
                {cat && !q && (
                  <span style={{ color: "var(--text-muted)" }} className="font-normal">
                    Icon Sets{" "}&rsaquo;{" "}
                  </span>
                )}
                {cat && !q
                  ? cat
                  : `${filtered.length.toLocaleString("en-US")} icon set${filtered.length !== 1 ? "s" : ""}`}
                {cat && !q && (
                  <span className="font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                    {filtered.length.toLocaleString("en-US")} set{filtered.length !== 1 ? "s" : ""}
                  </span>
                )}
                {q && (
                  <span className="font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                    matching &ldquo;{q}&rdquo;
                  </span>
                )}
              </h1>
            </div>
            <Suspense>
              <SortToggle />
            </Suspense>
          </div>

          {/* Icon set grid */}
          {!cat && !q ? (
            // Grouped by category
            <div className="space-y-8 max-w-[1400px] mx-auto">
              {categories.map(({ name: category }) => {
                const items = filtered.filter((c) => c.category === category)
                if (items.length === 0) return null
                return (
                  <section key={category}>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-sm font-semibold">{category}</h2>
                      <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                        {items.length}
                      </span>
                      <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
                    </div>
                    <div className="card-grid grid">
                      {items.map((col) => (
                        <IconSetCard key={col.prefix} collection={col} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            // Flat grid when filtered by category or search
            <div className="card-grid grid max-w-[1400px] mx-auto">
              {filtered.map((col) => (
                <IconSetCard key={col.prefix} collection={col} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p style={{ color: "var(--text-secondary)" }}>No icon sets found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function IconSetCard({
  collection,
}: {
  collection: ReturnType<typeof getCollections>[number]
}) {
  const samples = getSampleIcons(collection.prefix, 8)

  return (
    <Link
      href={`/set/${collection.prefix}`}
      className="icon-cell group flex flex-col rounded-xl border transition-all duration-150"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Icon display area */}
      <div className="card-icons flex items-center justify-center">
        {samples.length > 0 ? (
          samples.map((icon, i) => (
            <span
              key={icon.name}
              className="card-icon flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
              data-index={i}
              dangerouslySetInnerHTML={{
                __html: customizeSvg(icon.svg, {
                  size: 32,
                  color: "var(--text-primary)",
                }),
              }}
            />
          ))
        ) : (
          <div className="w-7 h-7 rounded-lg" style={{ background: "var(--bg-secondary)" }} />
        )}
      </div>

      {/* Info */}
      <div className="px-3 pb-2">
        <h2 className="font-medium text-sm truncate">{collection.name}</h2>
        <span className="text-xs mt-0.5 block" style={{ color: "var(--text-muted)" }}>{collection.license.spdx}</span>
      </div>

      {/* Action buttons + count */}
      <CardActions
        prefix={collection.prefix}
        authorName={collection.author.name}
        authorUrl={collection.author.url}
        licenseSpdx={collection.license.spdx}
        licenseTitle={collection.license.title}
        category={collection.category}
        iconCount={collection.total}
      />
    </Link>
  )
}
