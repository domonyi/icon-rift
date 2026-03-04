import { customizeSvg, type IconCustomizations, type ColorsTuple } from "@iconkit/core"

export interface IconComponentProps
  extends IconCustomizations,
    Omit<
      React.HTMLAttributes<HTMLSpanElement>,
      "style" | "className" | "title"
    > {}

/** Icon component props with palette-aware `colors` typing */
export interface TypedIconProps<N extends number>
  extends Omit<IconComponentProps, "colors"> {
  colors?: ColorsTuple<N>
}

export type IconComponent<N extends number = number> = {
  (props: TypedIconProps<N>): React.JSX.Element
  displayName: string
}

/**
 * Creates a named icon component from a raw SVG string.
 * The returned component accepts all IconCustomizations props (size, color, etc.)
 * and renders an inline SVG.
 *
 * When a palette is provided, the `colors` prop is typed as a fixed-length tuple
 * matching the number of customizable colors in the icon.
 *
 * Works in both Server and Client Components.
 */
export function createIcon<const P extends readonly string[]>(
  svg: string,
  displayName: string,
  palette: P,
): IconComponent<P["length"]>
export function createIcon(
  svg: string,
  displayName: string,
): IconComponent<number>
export function createIcon(
  svg: string,
  displayName: string,
  palette?: readonly string[],
): IconComponent<number> {
  function IconComponent({
    size,
    width,
    height,
    color,
    colors,
    stroke,
    strokeWidth,
    absoluteStrokeWidth,
    strokeLinecap,
    strokeLinejoin,
    opacity,
    rotate,
    flipH,
    flipV,
    className,
    style,
    title,
    viewBox,
    "aria-label": ariaLabel,
    ...rest
  }: TypedIconProps<number>) {
    const customized = customizeSvg(svg, {
      size,
      width,
      height,
      color,
      colors: colors as string[] | undefined,
      stroke,
      strokeWidth,
      absoluteStrokeWidth,
      strokeLinecap,
      strokeLinejoin,
      opacity,
      rotate,
      flipH,
      flipV,
      className,
      style,
      title,
      viewBox,
    }, palette as string[] | undefined)

    const accessible = !!(ariaLabel || title)

    return (
      <span
        style={{ display: "inline-flex", alignItems: "center" }}
        role={accessible ? "img" : "presentation"}
        aria-label={ariaLabel ?? title}
        aria-hidden={accessible ? undefined : true}
        dangerouslySetInnerHTML={{ __html: customized }}
        {...rest}
      />
    )
  }

  IconComponent.displayName = displayName
  return IconComponent as IconComponent<any>
}
