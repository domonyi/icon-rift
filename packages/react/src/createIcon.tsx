import { customizeSvg, type IconCustomizations } from "@iconkit/core"

export interface IconComponentProps
  extends IconCustomizations,
    Omit<
      React.HTMLAttributes<HTMLSpanElement>,
      "style" | "className" | "title"
    > {}

/**
 * Creates a named icon component from a raw SVG string.
 * The returned component accepts all IconCustomizations props (size, color, etc.)
 * and renders an inline SVG.
 *
 * Works in both Server and Client Components.
 */
export function createIcon(svg: string, displayName: string) {
  function IconComponent({
    size,
    width,
    height,
    color,
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
  }: IconComponentProps) {
    const customized = customizeSvg(svg, {
      size,
      width,
      height,
      color,
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
    })

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
  return IconComponent
}
