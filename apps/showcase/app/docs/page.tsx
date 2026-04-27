import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
          <span style={{ color: "var(--accent)" }}>IconRift</span> API
        </h1>
        <p style={{ color: "var(--text-secondary)" }} className="text-sm">
          Everything you need to discover, pick, and use icons programmatically.
        </p>
      </header>

      <div className="space-y-12">
        {/* ── Install ── */}
        <Section title="Install">
          <Code>{`npm install @iconrift/react @iconrift/meta`}</Code>
          <Muted>
            <b>@iconrift/react</b> &mdash; React components + generated icon
            sets<br />
            <b>@iconrift/meta</b> &mdash; Collection metadata, icon name
            catalogs, search
          </Muted>
        </Section>

        {/* ── Icon Discovery ── */}
        <Section title="Icon Discovery">
          <P>
            327,000+ icons across 224 sets. Here is how to find the one you
            need.
          </P>

          <SubSection title="1. Browse collections">
            <Code>{`import { collections } from "@iconrift/meta"

// collections: IconSetMeta[]
// Each entry has: prefix, name, total, category, palette, samples

collections.forEach(set => {
  console.log(set.prefix, set.name, set.total)
})
// "lucide"  "Lucide"            1958
// "mdi"     "Material Design Icons"  14001
// "ph"      "Phosphor"          9198
// ...224 sets`}</Code>
          </SubSection>

          <SubSection title="2. List all icons in a set">
            <Code>{`import { names, catalog } from "@iconrift/meta/names/lucide"

// names — flat array of every icon name
names
// ["a-arrow-down", "activity", "airplay", "arrow-down", "home", ...]
// 1,958 entries

// catalog — maps original name → PascalCase component name
catalog["home"]          // "Home"
catalog["arrow-down"]    // "ArrowDown"
catalog["credit-card"]   // "CreditCard"`}</Code>
            <Muted>
              Every set has its own file.
              Replace <Mono>lucide</Mono> with any set prefix:
              {" "}<Mono>mdi</Mono>, <Mono>heroicons</Mono>,
              {" "}<Mono>tabler</Mono>, <Mono>ph</Mono>, etc.
            </Muted>
          </SubSection>

          <SubSection title="3. Search within a set">
            <Code>{`import { searchNames } from "@iconrift/meta/search"
import { names } from "@iconrift/meta/names/lucide"

searchNames(names, "arrow")
// ["arrow-big-down", "arrow-down", "arrow-left", "arrow-right", ...]

searchNames(names, "chart bar")
// ["bar-chart-2", "bar-chart", "chart-bar-big", "chart-bar-stacked", ...]

searchNames(names, "user", 5)
// ["book-user", "circle-user-round", "circle-user", "file-user", "shield-user"]`}</Code>
            <Muted>
              Multi-word queries match all tokens.
              Optional third argument limits results.
            </Muted>
          </SubSection>

          <SubSection title="4. Get the import path">
            <Code>{`import { catalog } from "@iconrift/meta/names/lucide"

const iconName = "arrow-down"
const component = catalog[iconName]  // "ArrowDown"

// Static import:
// import { ArrowDown } from "@iconrift/react/lucide"

// Dynamic import:
// <Icon name="lucide:arrow-down" />`}</Code>
          </SubSection>
        </Section>

        {/* ── Static Imports ── */}
        <Section title="Static Imports">
          <P>
            Pre-built components. Tree-shakeable, zero runtime cost.
          </P>
          <Code>{`import { Home, ArrowDown, Search } from "@iconrift/react/lucide"
import { Heart, Star } from "@iconrift/react/mdi"
import { Lightning } from "@iconrift/react/ph"

<Home size={24} />
<Heart size={20} color="red" />
<ArrowDown size={16} strokeWidth={2.5} />`}</Code>
          <Muted>
            Each icon set is a separate entry
            point: <Mono>@iconrift/react/&#123;prefix&#125;</Mono>.
            Only the icons you import end up in your bundle.
          </Muted>
        </Section>

        {/* ── Dynamic Imports ── */}
        <Section title="Dynamic Loading">
          <P>
            Load any icon at runtime by name. Requires an{" "}
            <Mono>IconProvider</Mono> wrapping your app.
          </P>
          <Code>{`import { Icon, IconProvider } from "@iconrift/react"

// With the built-in HTTP loader (fetches from your API route)
<IconProvider basePath="/api/icons">
  <Icon name="lucide:home" size={24} color="red" />
  <Icon name="mdi:heart" size={20} />
</IconProvider>

// Or with a custom loader
<IconProvider loader={async (set, name) => {
  const res = await fetch(\`/icons/\${set}/\${name}.svg\`)
  return res.text()
}}>
  <Icon name="lucide:home" size={24} />
</IconProvider>`}</Code>
          <Muted>
            The name format
            is <Mono>set:icon-name</Mono>.
            SVGs are cached in memory after the first load.
          </Muted>
        </Section>

        {/* ── Customization ── */}
        <Section title="Customization">
          <P>Every icon component accepts these props:</P>
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <Th>Prop</Th>
                  <Th>Type</Th>
                  <Th className="hidden sm:table-cell">Description</Th>
                </tr>
              </thead>
              <tbody>
                <PropRow
                  name="size"
                  type="number | string"
                  desc="Sets both width and height"
                />
                <PropRow
                  name="width / height"
                  type="number | string"
                  desc="Override individual dimensions"
                />
                <PropRow
                  name="color"
                  type="Color"
                  desc="Fill color (replaces currentColor)"
                />
                <PropRow
                  name="colors"
                  type="Color[]"
                  desc="Positional palette overrides (type-safe slots)"
                />
                <PropRow
                  name="stroke"
                  type="string"
                  desc="Stroke color"
                />
                <PropRow
                  name="strokeWidth"
                  type="number | string"
                  desc="Stroke width"
                />
                <PropRow
                  name="absoluteStrokeWidth"
                  type="boolean"
                  desc="Constant stroke regardless of size"
                />
                <PropRow
                  name="rotate"
                  type="number"
                  desc="Rotation in degrees"
                />
                <PropRow
                  name="flipH / flipV"
                  type="boolean"
                  desc="Flip horizontally or vertically"
                />
                <PropRow
                  name="opacity"
                  type="number"
                  desc="Opacity (0-1)"
                />
                <PropRow
                  name="className"
                  type="string"
                  desc="CSS class on the SVG element"
                />
                <PropRow
                  name="title"
                  type="string"
                  desc="Accessible title element"
                />
              </tbody>
            </table>
          </div>
          <Code>{`<Home size={32} color="indigo" rotate={45} />
<ArrowDown size={24} stroke="red" strokeWidth={3} />
<Star size={20} flipH opacity={0.5} className="my-icon" />`}</Code>
        </Section>

        {/* ── Multi-Color ── */}
        <Section title="Multi-Color Icons">
          <P>
            Some icon sets (emoji, flags, logos) have multiple colors.
            The <Mono>colors</Mono> prop replaces them positionally &mdash;
            TypeScript enforces the correct number of slots.
          </P>
          <Code>{`import { Fire } from "@iconrift/react/twemoji"
import { FlagPride16Filled } from "@iconrift/react/fluent"

// Replace the first 3 colors in palette order
<Fire colors={["orange", "yellow", "red"]} size={48} />

// TypeScript error if you pass too many colors:
// ERROR: This icon only has 3 customizable color slots`}</Code>
        </Section>

        {/* ── Core Utilities ── */}
        <Section title="Core Utilities">
          <P>
            Framework-agnostic SVG helpers, also re-exported
            from <Mono>@iconrift/react</Mono>.
          </P>
          <Code>{`import {
  customizeSvg,    // Apply size/color/transforms to raw SVG string
  extractPalette,  // Get unique colors from an SVG
  getSvgBody,      // Extract inner SVG content (no wrapper tag)
  getSvgAttributes,// Parse SVG tag attributes to object
  svgToDataUri,    // Convert SVG to data:image/svg+xml URI
  svgToBase64,     // Convert SVG to base64 data URI
} from "@iconrift/core"

// Example: customize a raw SVG string
const styled = customizeSvg(rawSvg, {
  size: 32,
  color: "red",
  rotate: 90,
})`}</Code>
        </Section>

        {/* ── REST API ── */}
        <Section title="REST API">
          <P>
            The showcase app serves icons over HTTP. Use these endpoints with
            the dynamic <Mono>{"<Icon>"}</Mono> component
            or fetch SVGs directly.
          </P>
          <div className="space-y-3">
            <Endpoint
              method="GET"
              path="/api/icons/{set}"
              desc="List all icon names in a set. Returns JSON array."
            />
            <Endpoint
              method="GET"
              path="/api/icons/{set}/{name}"
              desc="Get a single icon as SVG. Supports query params for customization: ?size=32&color=red&rotate=90"
            />
          </div>
          <Code>{`// Fetch an icon with customization
const res = await fetch("/api/icons/lucide/home?size=32&color=%23ef4444")
const svg = await res.text()`}</Code>
        </Section>

        {/* ── TypeScript ── */}
        <Section title="TypeScript">
          <P>
            Every generated set exports full type-level icon names.
          </P>
          <Code>{`import type { IconName, ComponentName } from "@iconrift/react/lucide"
// IconName     = "home" | "arrow-down" | "search" | ... (1,958 literals)
// ComponentName = "Home" | "ArrowDown" | "Search" | ...

import type { IconName } from "@iconrift/meta/names/mdi"
// IconName = "home" | "account" | "bell" | ... (14,001 literals)

import type { IconSetMeta, IconCustomizations, Color } from "@iconrift/core"`}</Code>
        </Section>

        {/* ── Quick Reference ── */}
        <Section title="Quick Reference">
          <div className="grid sm:grid-cols-2 gap-3">
            <RefCard
              title="Popular Icon Sets"
              items={[
                ["lucide", "1,958 icons", "Clean, minimal stroke icons"],
                ["mdi", "14,001 icons", "Material Design, comprehensive"],
                ["heroicons", "1,297 icons", "By the makers of Tailwind"],
                ["tabler", "6,270 icons", "Stroke-based, consistent"],
                ["ph", "9,198 icons", "Phosphor, multiple weights"],
                ["solar", "7,410 icons", "Modern, dual-tone"],
              ]}
            />
            <RefCard
              title="Package Exports"
              items={[
                ["@iconrift/react", "", "Icon, IconProvider, createIcon"],
                ["@iconrift/react/*", "", "Generated icon components"],
                ["@iconrift/meta", "", "collections metadata"],
                ["@iconrift/meta/names/*", "", "Per-set name catalogs"],
                ["@iconrift/meta/search", "", "searchNames utility"],
                ["@iconrift/core", "", "SVG engine + types"],
              ]}
            />
          </div>
        </Section>
      </div>
    </div>
  )
}

/* ─── Shared Components ─── */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold whitespace-nowrap">{title}</h2>
        <div
          className="flex-1 border-t"
          style={{ borderColor: "var(--border)" }}
        />
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function SubSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3
        className="text-sm font-semibold"
        style={{ color: "var(--text-secondary)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre
      className="text-[12px] leading-relaxed font-mono p-4 rounded-xl overflow-x-auto"
      style={{
        background: "var(--bg-secondary)",
        color: "var(--text-muted)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </pre>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
      {children}
    </p>
  )
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="text-[11px] px-1.5 py-0.5 rounded"
      style={{ background: "var(--bg-secondary)", color: "var(--accent)" }}
    >
      {children}
    </code>
  )
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={`text-left text-xs font-medium px-4 py-2.5 ${className}`}
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </th>
  )
}

function PropRow({
  name,
  type,
  desc,
}: {
  name: string
  type: string
  desc: string
}) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td className="px-4 py-2">
        <code
          className="text-xs"
          style={{ color: "var(--accent)" }}
        >
          {name}
        </code>
      </td>
      <td
        className="px-4 py-2 text-xs font-mono"
        style={{ color: "var(--text-muted)" }}
      >
        {type}
      </td>
      <td
        className="px-4 py-2 text-xs hidden sm:table-cell"
        style={{ color: "var(--text-secondary)" }}
      >
        {desc}
      </td>
    </tr>
  )
}

function Endpoint({
  method,
  path,
  desc,
}: {
  method: string
  path: string
  desc: string
}) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 mt-0.5"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        {method}
      </span>
      <div>
        <code className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
          {path}
        </code>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

function RefCard({
  title,
  items,
}: {
  title: string
  items: [string, string, string][]
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map(([name, count, desc]) => (
          <div key={name} className="flex items-baseline gap-2">
            <code
              className="text-[11px] shrink-0"
              style={{ color: "var(--accent)" }}
            >
              {name}
            </code>
            {count && (
              <span
                className="text-[10px] tabular-nums shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                {count}
              </span>
            )}
            <span
              className="text-[11px] truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
