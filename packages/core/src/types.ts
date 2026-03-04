export interface IconCustomizations {
  /** Sets both width and height */
  size?: number | string
  /** Width (overrides size) */
  width?: number | string
  /** Height (overrides size) */
  height?: number | string
  /** Fill color - replaces currentColor in SVG */
  color?: string
  /** Positional color overrides — colors[n] replaces the nth unique color in the SVG palette */
  colors?: string[]
  /** Stroke color */
  stroke?: string
  /** Stroke width */
  strokeWidth?: number | string
  /** When true, stroke width stays constant regardless of icon size (default: false) */
  absoluteStrokeWidth?: boolean
  /** Stroke line cap */
  strokeLinecap?: "butt" | "round" | "square"
  /** Stroke line join */
  strokeLinejoin?: "miter" | "round" | "bevel"
  /** Opacity (0-1) */
  opacity?: number
  /** Rotation in degrees */
  rotate?: number
  /** Flip horizontally */
  flipH?: boolean
  /** Flip vertically */
  flipV?: boolean
  /** CSS class to add to the SVG element */
  className?: string
  /** Inline styles to add */
  style?: string
  /** Accessible title element */
  title?: string
  /** Override the viewBox */
  viewBox?: string
}

export interface IconSetMeta {
  prefix: string
  name: string
  total: number
  author: { name: string; url?: string }
  license: { title: string; spdx: string }
  category: string
  height: number | number[]
  palette: boolean
  samples: string[]
}

export interface IconEntry {
  name: string
  svg: string
}

export type IconLoader = (set: string, name: string) => Promise<string>

/** Maps a palette length N to a tuple of N optional strings (up to 8) */
export type ColorsTuple<N extends number> =
  N extends 0 ? [] :
  N extends 1 ? [string?] :
  N extends 2 ? [string?, string?] :
  N extends 3 ? [string?, string?, string?] :
  N extends 4 ? [string?, string?, string?, string?] :
  N extends 5 ? [string?, string?, string?, string?, string?] :
  N extends 6 ? [string?, string?, string?, string?, string?, string?] :
  N extends 7 ? [string?, string?, string?, string?, string?, string?, string?] :
  N extends 8 ? [string?, string?, string?, string?, string?, string?, string?, string?] :
  string[]
