import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, "..")
const svgDir = join(rootDir, "svg")
const generatedDir = join(rootDir, "packages", "react", "generated")
const metaNamesDir = join(rootDir, "packages", "meta", "src", "names")

if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true })
if (!existsSync(metaNamesDir)) mkdirSync(metaNamesDir, { recursive: true })

function toPascalCase(name) {
  const parts = name.split(/[-_.\s]+/).filter(Boolean)

  let result = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

  // Prefix with Icon if starts with a number
  if (/^\d/.test(result)) {
    result = "Icon" + result
  }

  // Strip invalid identifier characters
  result = result.replace(/[^a-zA-Z0-9_$]/g, "")

  if (!result) result = "UnnamedIcon"

  return result
}

function escapeSvg(svg) {
  return svg.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${")
}

// --- Palette extraction (mirrors @iconrift/core extractPalette) ---

function shouldSkipColor(value) {
  const v = value.trim().toLowerCase()
  return v === "none" || v === "inherit" || v === "transparent" || v.startsWith("url(")
}

function normalizeColor(raw) {
  const c = raw.trim().toLowerCase()
  const m = c.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
  if (m) return `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`
  return c
}

function extractPalette(svg) {
  const seen = new Set()
  const palette = []
  const regex = /(?:fill|stroke)\s*=\s*"([^"]*)"/gi
  let m
  while ((m = regex.exec(svg)) !== null) {
    const raw = m[1]
    if (shouldSkipColor(raw)) continue
    const normalized = normalizeColor(raw)
    if (!seen.has(normalized)) {
      seen.add(normalized)
      palette.push(raw)
    }
  }
  // Move currentColor to index 0 if present
  const ccIdx = palette.findIndex((c) => c.toLowerCase() === "currentcolor")
  if (ccIdx > 0) {
    const [cc] = palette.splice(ccIdx, 1)
    palette.unshift(cc)
  }
  return palette
}

// Get all set directories
const sets = readdirSync(svgDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()

console.log(`Generating components for ${sets.length} icon sets...\n`)

const exportMap = {}
let totalComponents = 0

for (const prefix of sets) {
  const setDir = join(svgDir, prefix)
  const files = readdirSync(setDir)
    .filter((f) => f.endsWith(".svg"))
    .sort()

  if (files.length === 0) continue

  const usedNames = new Map()
  const catalogEntries = []
  const lines = [
    `// Auto-generated — do not edit`,
    `// Icon set: ${prefix} (${files.length} icons)`,
    `import { createIcon } from "../src/createIcon"\n`,
  ]

  for (const file of files) {
    const iconName = file.slice(0, -4)
    const svg = readFileSync(join(setDir, file), "utf8").trim()

    let componentName = toPascalCase(iconName)

    // Handle duplicates by appending a number
    if (usedNames.has(componentName)) {
      const count = usedNames.get(componentName) + 1
      usedNames.set(componentName, count)
      componentName = componentName + count
    } else {
      usedNames.set(componentName, 1)
    }

    catalogEntries.push([iconName, componentName])

    const escaped = escapeSvg(svg)
    const palette = extractPalette(svg)
    const paletteArg = palette.length > 0
      ? `, ${JSON.stringify(palette)}`
      : ""
    lines.push(
      `export const ${componentName} = /*#__PURE__*/ createIcon(\`${escaped}\`, "${componentName}"${paletteArg})`
    )
  }

  // Append icon catalog to the generated React component file
  lines.push("")
  lines.push("/** Every icon in this set: [originalName, ComponentName] */")
  lines.push(`export const catalog = ${JSON.stringify(catalogEntries)} as const`)
  lines.push("")
  lines.push("export type IconName = (typeof catalog)[number][0]")
  lines.push("export type ComponentName = (typeof catalog)[number][1]")

  writeFileSync(join(generatedDir, `${prefix}.ts`), lines.join("\n") + "\n")

  // Generate lightweight name list in @iconrift/meta
  const namesList = catalogEntries.map(([name]) => name)
  const namesContent = [
    `// Auto-generated — do not edit`,
    `// Icon set: ${prefix} (${namesList.length} icons)`,
    ``,
    `/** All icon names in the "${prefix}" set */`,
    `export const names = ${JSON.stringify(namesList)} as const`,
    ``,
    `/** Original icon name → PascalCase component name */`,
    `export const catalog = ${JSON.stringify(Object.fromEntries(catalogEntries))} as const`,
    ``,
    `export type IconName = (typeof names)[number]`,
    ``,
  ].join("\n")
  writeFileSync(join(metaNamesDir, `${prefix}.ts`), namesContent)

  exportMap[prefix] = files.length
  totalComponents += files.length

  const pct = ((Object.keys(exportMap).length / sets.length) * 100).toFixed(0)
  process.stdout.write(
    `\r  [${pct}%] ${prefix}: ${files.length} components`
      .padEnd(60)
  )
}

console.log(
  `\n\nDone! Generated ${totalComponents.toLocaleString()} components across ${Object.keys(exportMap).length} icon sets`
)
