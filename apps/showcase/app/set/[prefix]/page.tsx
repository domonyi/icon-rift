import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getCollection, getIconsPage } from "@/lib/icons"
import { SearchBar } from "@/components/SearchBar"
import { IconGrid } from "@/components/IconGrid"

const PER_PAGE = 200

export default async function SetPage({
  params,
  searchParams,
}: {
  params: Promise<{ prefix: string }>
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { prefix } = await params
  const { q } = await searchParams

  const collection = getCollection(prefix)
  if (!collection) notFound()

  const { icons, total, totalPages } = getIconsPage(prefix, 1, PER_PAGE, q)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All icon sets
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            <div
              className="flex items-center gap-2 mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>{collection.prefix}</span>
              <span>&middot;</span>
              <span>{collection.total.toLocaleString()} icons</span>
              <span>&middot;</span>
              <span>{collection.category}</span>
            </div>
          </div>
        </div>

        {/* Meta details */}
        <div
          className="flex flex-wrap gap-3 mt-3 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <span>
            Author:{" "}
            {collection.author.url ? (
              <a
                href={collection.author.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "var(--text-secondary)" }}
              >
                {collection.author.name}
              </a>
            ) : (
              collection.author.name
            )}
          </span>
          <span>License: {collection.license.title}</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <Suspense>
          <SearchBar placeholder={`Search ${collection.total.toLocaleString()} icons...`} />
        </Suspense>
      </div>

      {/* Results info */}
      {q && (
        <p
          className="text-sm mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {total} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
        </p>
      )}

      {/* Icon grid with infinite scroll */}
      <IconGrid
        icons={icons}
        prefix={prefix}
        total={total}
        totalPages={totalPages}
        query={q}
      />

      {icons.length === 0 && (
        <div className="text-center py-20">
          <p style={{ color: "var(--text-secondary)" }}>
            No icons found
          </p>
        </div>
      )}
    </div>
  )
}
