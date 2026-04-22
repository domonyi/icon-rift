import Link from "next/link"
import { notFound } from "next/navigation"
import { getCollection, getIconsPage } from "@/lib/icons"
import { SetPageClient } from "@/components/SetPageClient"

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
    <SetPageClient
      icons={icons}
      prefix={prefix}
      total={total}
      totalPages={totalPages}
      query={q}
      header={
        <div className="px-6 pt-8 pb-4">
          <div className="mb-4">
            <Link
              href="/"
              className="hover-link inline-flex items-center gap-1.5 text-sm mb-4"
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
                  <span>{collection.total.toLocaleString("en-US")} icons</span>
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
                    className="hover-link underline"
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

          {/* Results info */}
          {q && (
            <p
              className="text-sm mt-4"
              style={{ color: "var(--text-secondary)" }}
            >
              {total} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
            </p>
          )}
        </div>
      }
    />
  )
}
