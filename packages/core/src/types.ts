export interface IconCustomizations {
  /** Sets both width and height */
  size?: number | string;
  /** Width (overrides size) */
  width?: number | string;
  /** Height (overrides size) */
  height?: number | string;
  /** Fill color - replaces currentColor in SVG */
  color?: string;
  /** Positional color overrides — colors[n] replaces the nth unique color in the SVG palette */
  colors?: string[];
  /** Stroke color */
  stroke?: string;
  /** Stroke width */
  strokeWidth?: number | string;
  /** When true, stroke width stays constant regardless of icon size (default: false) */
  absoluteStrokeWidth?: boolean;
  /** Stroke line cap */
  strokeLinecap?: "butt" | "round" | "square";
  /** Stroke line join */
  strokeLinejoin?: "miter" | "round" | "bevel";
  /** Opacity (0-1) */
  opacity?: number;
  /** Rotation in degrees */
  rotate?: number;
  /** Flip horizontally */
  flipH?: boolean;
  /** Flip vertically */
  flipV?: boolean;
  /** CSS class to add to the SVG element */
  className?: string;
  /** Inline styles to add */
  style?: string;
  /** Accessible title element */
  title?: string;
  /** Override the viewBox */
  viewBox?: string;
}

export interface IconSetMeta {
  prefix: string;
  name: string;
  total: number;
  author: { name: string; url?: string };
  license: { title: string; spdx: string };
  category: string;
  height: number | number[];
  palette: boolean;
  samples: string[];
}

export interface IconEntry {
  name: string;
  svg: string;
}

export type IconLoader = (set: string, name: string) => Promise<string>;

import type * as CSS from "csstype";

type NamedColor = CSS.DataType.NamedColor;
type HexColor = `#${string}`;
type CSSFunction = `${string}(${string})`;

/** A CSS color value — provides autocomplete for named colors, hex, rgb(), etc.
 *  Covers: named colors, hex, rgb/rgba, hsl/hsla, hwb, lab, lch, oklab, oklch,
 *  color(), color-mix(), light-dark(), var(), and CSS global values. */
export type Color =
  | NamedColor
  | HexColor
  | CSSFunction
  | "currentColor"
  | "transparent"
  | "inherit"
  | "initial"
  | "unset"
  | "revert"
  | "revert-layer";

/** Type-level error for color positions that exceed this icon's palette size */
export type MaxColorsExceeded<N extends number = number> =
  `ERROR: This icon only has ${N} customizable color slots`;

/** Maps a palette length N to a constrained color tuple (up to 8 slots) */
export type ColorsTuple<N extends number> = N extends 0
  ? []
  : N extends 1
    ? [Color?, ...MaxColorsExceeded<1>[]]
    : N extends 2
      ? [Color?, Color?, ...MaxColorsExceeded<2>[]]
      : N extends 3
        ? [Color?, Color?, Color?, ...MaxColorsExceeded<3>[]]
        : N extends 4
          ? [Color?, Color?, Color?, Color?, ...MaxColorsExceeded<4>[]]
          : N extends 5
            ? [
                Color?,
                Color?,
                Color?,
                Color?,
                Color?,
                ...MaxColorsExceeded<5>[],
              ]
            : N extends 6
              ? [
                  Color?,
                  Color?,
                  Color?,
                  Color?,
                  Color?,
                  Color?,
                  ...MaxColorsExceeded<6>[],
                ]
              : N extends 7
                ? [
                    Color?,
                    Color?,
                    Color?,
                    Color?,
                    Color?,
                    Color?,
                    Color?,
                    ...MaxColorsExceeded<7>[],
                  ]
                : N extends 8
                  ? [
                      Color?,
                      Color?,
                      Color?,
                      Color?,
                      Color?,
                      Color?,
                      Color?,
                      Color?,
                      ...MaxColorsExceeded<8>[],
                    ]
                  : Color[];
