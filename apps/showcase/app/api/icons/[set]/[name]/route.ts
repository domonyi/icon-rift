import { NextRequest, NextResponse } from "next/server"
import { getIconSvg } from "@/lib/icons"
import { customizeSvg, type IconCustomizations } from "@iconkit/core"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ set: string; name: string }> }
) {
  const { set, name } = await params

  const svg = getIconSvg(set, name)
  if (!svg) {
    return NextResponse.json({ error: "Icon not found" }, { status: 404 })
  }

  // Support query-based customization
  const url = new URL(_request.url)
  const options: IconCustomizations = {}

  const size = url.searchParams.get("size")
  if (size) options.size = Number(size)

  const color = url.searchParams.get("color")
  if (color) options.color = color

  const stroke = url.searchParams.get("stroke")
  if (stroke) options.stroke = stroke

  const customized = Object.keys(options).length > 0 ? customizeSvg(svg, options) : svg

  return new NextResponse(customized, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
