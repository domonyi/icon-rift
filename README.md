# IconRift

A TypeScript-first icon library ecosystem built on [Iconify](https://iconify.design/). Access 100+ icon collections (200,000+ icons) with full SVG customization, type-safe multi-color support, and React components.

## Packages

| Package | Description |
|---------|-------------|
| `@iconrift/core` | SVG utilities, customization engine, and TypeScript types |
| `@iconrift/react` | React components (`<Icon>`, `<IconProvider>`, `createIcon`) |
| `@iconrift/meta` | Icon collection metadata (names, authors, licenses, samples) |

## Installation

```bash
npm install @iconrift/react
```

`@iconrift/core` is re-exported from `@iconrift/react`, so you only need one install for most use cases.

## Quick Start

### Dynamic Icon Loading

Use the `<Icon>` component with an `<IconProvider>` to load icons on demand:

```tsx
import { Icon, IconProvider } from "@iconrift/react"

const loader = async (set: string, name: string) => {
  const res = await fetch(`/api/icons/${set}?name=${name}`)
  return res.text()
}

function App() {
  return (
    <IconProvider loader={loader}>
      <Icon name="mdi:home" size={24} color="currentColor" />
      <Icon name="lucide:settings" size={24} stroke="gray" />
    </IconProvider>
  )
}
```

### Static / Pre-built Icons

Use `createIcon` for zero-runtime-cost icons with full type safety:

```tsx
import { createIcon } from "@iconrift/react"

const HeartIcon = createIcon(
  '<svg viewBox="0 0 24 24">...</svg>',
  "HeartIcon",
  ["#ff0000", "#cc0000"] // palette colors
)

// TypeScript enforces the correct number of color slots
<HeartIcon size={32} colors={["red", "pink"]} />
```

### SVG Customization (Core)

Use `@iconrift/core` directly for framework-agnostic SVG manipulation:

```ts
import { customizeSvg, extractPalette } from "@iconrift/core"

const svg = '<svg viewBox="0 0 24 24">...</svg>'
const palette = extractPalette(svg)

const customized = customizeSvg(svg, {
  size: 48,
  color: "navy",
  rotate: 90,
  flipH: true,
  opacity: 0.8,
})
```

## Customization Options

All icon components accept these props:

| Prop | Type | Description |
|------|------|-------------|
| `size` | `number \| string` | Sets both width and height |
| `width` / `height` | `number \| string` | Individual dimensions (override `size`) |
| `color` | `string` | Fill color (replaces `currentColor`) |
| `colors` | `string[]` | Positional palette overrides for multi-color icons |
| `stroke` | `string` | Stroke color |
| `strokeWidth` | `number \| string` | Stroke width |
| `absoluteStrokeWidth` | `boolean` | Keep stroke constant regardless of icon size |
| `rotate` | `number` | Rotation in degrees |
| `flipH` / `flipV` | `boolean` | Horizontal / vertical flip |
| `opacity` | `number` | Opacity (0-1) |
| `className` | `string` | CSS class on the SVG element |
| `title` | `string` | Accessible title element |

## Type-Safe Multi-Color Icons

IconRift's `ColorsTuple<N>` type prevents color index errors at compile time. If an icon has 3 customizable colors, TypeScript will error if you pass 4:

```tsx
// Generated icon with a 3-color palette
const FlagIcon = createIcon(svg, "FlagIcon", ["#red", "#white", "#blue"])

<FlagIcon colors={["crimson", "ivory", "navy"]} />       // OK
<FlagIcon colors={["crimson", "ivory", "navy", "gold"]} /> // Type error
```

## Showcase App

Browse all available icons with live customization:

```bash
npm run dev
```

Opens at [http://localhost:4444](http://localhost:4444). Features search, category filtering, and an interactive color picker for multi-color icons.

## Project Structure

```
iconrift/
  apps/
    showcase/        Next.js 15 icon browser
  packages/
    core/            SVG engine and types
    react/           React components
    meta/            Collection metadata
  scripts/           Build and generation scripts
```

## Development

```bash
# Install dependencies
npm install

# Run the showcase app
npm run dev

# Build the catalog from Iconify data
npm run build:catalog
```

## License

[MIT](./LICENSE)

---

> **Note:** Individual icon sets retain their original licenses. See `@iconrift/meta` collection data for per-set license information.
