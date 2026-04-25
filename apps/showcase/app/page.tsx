import Link from "next/link"
import { Suspense } from "react"
import { getCollections, getSampleIcons, getExtendedSamples } from "@/lib/icons"
import { customizeSvg } from "@iconrift/react"
import { CardActions } from "@/components/CardActions"
import { IconPreviewCycler } from "@/components/IconPreviewCycler"
import { SortToggle } from "@/components/SortToggle"
import { HomeSidebar } from "@/components/HomeSidebar"
import { FilterBar } from "@/components/FilterBar"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
    commercial?: string
    attribution?: string
    palette?: string
    group?: string
  }>
}) {
  const { q, category: cat, sort, commercial, attribution, palette, group } = await searchParams
  const allCollections = getCollections()

  /* ---- Filter ---- */
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

  // Licenses that require visible attribution
  const ATTRIBUTION_REQUIRED = new Set([
    "CC-BY-4.0", "CC-BY-SA-4.0", "CC-BY-3.0", "CC-BY-SA-3.0",
  ])
  // Licenses that restrict commercial use
  const NO_COMMERCIAL = new Set([
    "CC-BY-NC-4.0", "CC-BY-NC-3.0", "CC-BY-NC-SA-4.0", "CC-BY-NC-SA-3.0",
    "CC-BY-NC-ND-4.0", "CC-BY-NC-ND-3.0",
  ])

  if (commercial === "yes") {
    filtered = filtered.filter((c) => !NO_COMMERCIAL.has(c.license.spdx))
  } else if (commercial === "no") {
    filtered = filtered.filter((c) => NO_COMMERCIAL.has(c.license.spdx))
  }

  if (attribution === "none") {
    filtered = filtered.filter((c) => !ATTRIBUTION_REQUIRED.has(c.license.spdx))
  } else if (attribution === "required") {
    filtered = filtered.filter((c) => ATTRIBUTION_REQUIRED.has(c.license.spdx))
  }

  if (palette === "mono") {
    filtered = filtered.filter((c) => !c.palette)
  } else if (palette === "color") {
    filtered = filtered.filter((c) => c.palette)
  }

  /* ---- Sort ---- */
  if (sort === "a-z") {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === "z-a") {
    filtered.sort((a, b) => b.name.localeCompare(a.name))
  } else if (sort === "most") {
    filtered.sort((a, b) => b.total - a.total)
  } else if (sort === "least") {
    filtered.sort((a, b) => a.total - b.total)
  }

  /* ---- Categories (sidebar) ---- */
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

  /* ---- License category counts for filter bar ---- */
  const licenseCounts = { commercial: 0, nonCommercial: 0, noAttribution: 0, attribution: 0 }
  for (const c of allCollections) {
    if (NO_COMMERCIAL.has(c.license.spdx)) {
      licenseCounts.nonCommercial++
    } else {
      licenseCounts.commercial++
    }
    if (ATTRIBUTION_REQUIRED.has(c.license.spdx)) {
      licenseCounts.attribution++
    } else {
      licenseCounts.noAttribution++
    }
  }

  /* ---- Grouping ---- */
  const effectiveGroup = group || (cat || q ? "none" : "category")

  type GroupDef = { key: string; label: string; items: typeof filtered }
  let groups: GroupDef[] = []

  if (effectiveGroup === "none") {
    groups = [{ key: "__all__", label: "", items: filtered }]
  } else if (effectiveGroup === "license") {
    const licenseCategories = [
      { key: "commercial", label: "Commercial use allowed", test: (spdx: string) => !NO_COMMERCIAL.has(spdx) },
      { key: "non-commercial", label: "Commercial use not allowed", test: (spdx: string) => NO_COMMERCIAL.has(spdx) },
      { key: "no-attribution", label: "Attribution not required", test: (spdx: string) => !ATTRIBUTION_REQUIRED.has(spdx) },
      { key: "attribution", label: "Attribution required", test: (spdx: string) => ATTRIBUTION_REQUIRED.has(spdx) },
    ]
    for (const cat of licenseCategories) {
      const items = filtered.filter((c) => cat.test(c.license.spdx))
      if (items.length > 0) groups.push({ key: cat.key, label: cat.label, items })
    }
  } else if (effectiveGroup === "author") {
    const authorMap = new Map<string, typeof filtered>()
    for (const c of filtered) {
      const key = c.author.name
      if (!authorMap.has(key)) authorMap.set(key, [])
      authorMap.get(key)!.push(c)
    }
    groups = Array.from(authorMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([key, items]) => ({ key, label: key, items }))
  } else {
    // default: category
    const orderedCats = [
      ...categoryOrder.filter((c) => allCategoryNames.includes(c)),
      ...allCategoryNames.filter((c) => !categoryOrder.includes(c)),
    ]
    for (const category of orderedCats) {
      const items = filtered.filter((c) => c.category === category)
      if (items.length > 0) groups.push({ key: category, label: category, items })
    }
  }

  const showGroupHeaders = effectiveGroup !== "none"

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Sidebar */}
      <HomeSidebar categories={categories} activeCategory={cat} query={q} />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6">
          {/* Content header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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
            <div className="flex items-center gap-1">
              <Suspense>
                <FilterBar licenseCounts={licenseCounts} />
              </Suspense>
              <div
                className="w-px h-5 mx-1"
                style={{ background: "var(--border)" }}
              />
              <Suspense>
                <SortToggle />
              </Suspense>
            </div>
          </div>

          {/* Icon set grid */}
          {showGroupHeaders ? (
            <div className="space-y-8 max-w-[1400px] mx-auto">
              {groups.map(({ key, label, items }) => (
                <section key={key}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-sm font-semibold">{label}</h2>
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
              ))}
            </div>
          ) : (
            <div className="card-grid grid max-w-[1400px] mx-auto">
              {groups.flatMap((g) => g.items).map((col) => (
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
  const FRAME_SIZE = 8
  const MAX_FRAMES = 5
  const allSamples = getExtendedSamples(collection.prefix, FRAME_SIZE, MAX_FRAMES)

  // Split into frames and pre-render SVG HTML
  const frames: string[][] = []
  for (let i = 0; i < allSamples.length; i += FRAME_SIZE) {
    const chunk = allSamples.slice(i, i + FRAME_SIZE)
    if (chunk.length === FRAME_SIZE) {
      frames.push(
        chunk.map((icon) =>
          customizeSvg(icon.svg, { size: 32, color: "var(--text-primary)" })
        )
      )
    }
  }

  // Fallback for sets with fewer icons than a full frame
  if (frames.length === 0 && allSamples.length > 0) {
    frames.push(
      allSamples.map((icon) =>
        customizeSvg(icon.svg, { size: 32, color: "var(--text-primary)" })
      )
    )
  }

  return (
    <Link
      href={`/set/${collection.prefix}`}
      className="icon-cell group flex flex-col rounded-xl border transition-all duration-150"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Icon display area with hover cycling */}
      {frames.length > 0 ? (
        <IconPreviewCycler frames={frames} />
      ) : (
        <div className="card-icons flex items-center justify-center">
          <div className="w-7 h-7 rounded-lg" style={{ background: "var(--bg-secondary)" }} />
        </div>
      )}

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
