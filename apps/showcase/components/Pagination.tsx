"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
}: {
  page: number
  totalPages: number
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function buildHref(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (p > 1) {
      params.set("page", String(p))
    } else {
      params.delete("page")
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  // Show a window of pages around current
  const range: number[] = []
  const window = 2
  for (
    let i = Math.max(1, page - window);
    i <= Math.min(totalPages, page + window);
    i++
  ) {
    range.push(i)
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          className="px-3 py-2 text-sm rounded-lg border transition-colors"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          Prev
        </Link>
      )}

      {range[0] > 1 && (
        <>
          <Link
            href={buildHref(1)}
            className="px-3 py-2 text-sm rounded-lg border transition-colors"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            1
          </Link>
          {range[0] > 2 && (
            <span
              className="px-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              ...
            </span>
          )}
        </>
      )}

      {range.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className="px-3 py-2 text-sm rounded-lg border transition-colors"
          style={{
            background: p === page ? "var(--accent)" : "var(--bg-card)",
            borderColor: p === page ? "var(--accent)" : "var(--border)",
            color: p === page ? "#fff" : "var(--text-secondary)",
          }}
        >
          {p}
        </Link>
      ))}

      {range[range.length - 1] < totalPages && (
        <>
          {range[range.length - 1] < totalPages - 1 && (
            <span
              className="px-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              ...
            </span>
          )}
          <Link
            href={buildHref(totalPages)}
            className="px-3 py-2 text-sm rounded-lg border transition-colors"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages && (
        <Link
          href={buildHref(page + 1)}
          className="px-3 py-2 text-sm rounded-lg border transition-colors"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          Next
        </Link>
      )}
    </nav>
  )
}
