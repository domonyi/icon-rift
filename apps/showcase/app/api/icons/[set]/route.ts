import { NextRequest, NextResponse } from "next/server"
import { getIconsPage } from "@/lib/icons"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ set: string }> }
) {
  const { set } = await params
  const url = new URL(request.url)
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1)
  const perPage = Math.min(200, Math.max(1, Number(url.searchParams.get("perPage")) || 200))
  const q = url.searchParams.get("q") || undefined

  const result = getIconsPage(set, page, perPage, q)

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=60",
    },
  })
}
