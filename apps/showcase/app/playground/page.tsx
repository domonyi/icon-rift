import Link from "next/link"
import { getIconSvg } from "@/lib/icons"
import { Playground } from "./Playground"

// Grab a handful of sample SVGs at build/request time so the playground
// has real data to work with without needing client-side fetches.
function loadSamples() {
  const picks = [
    { set: "mdi", name: "home" },
    { set: "mdi", name: "account" },
    { set: "mdi", name: "bell" },
    { set: "mdi", name: "cog" },
    { set: "mdi", name: "heart" },
    { set: "mdi", name: "star" },
    { set: "lucide", name: "activity" },
    { set: "lucide", name: "airplay" },
    { set: "lucide", name: "alarm-clock" },
    { set: "lucide", name: "accessibility" },
    // Multi-color samples
    { set: "twemoji", name: "1st-place-medal" },
    { set: "twemoji", name: "artist-palette" },
    { set: "twemoji", name: "fire" },
    { set: "flat-color-icons", name: "like" },
    { set: "flat-color-icons", name: "globe" },
  ]
  return picks
    .map((p) => ({ ...p, svg: getIconSvg(p.set, p.name) }))
    .filter((p): p is typeof p & { svg: string } => !!p.svg)
}

export default function PlaygroundPage() {
  const samples = loadSamples()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
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
        Back to browse
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          <span style={{ color: "var(--accent)" }}>IconRift</span> Playground
        </h1>
        <p style={{ color: "var(--text-secondary)" }} className="text-sm">
          Interactive test bench — verify every part of the library is working.
        </p>
      </header>

      <Playground samples={samples} />
    </div>
  )
}
