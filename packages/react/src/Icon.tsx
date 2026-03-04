"use client"

import { useState, useEffect, useMemo, type HTMLAttributes } from "react"
import { customizeSvg, type IconCustomizations } from "@iconkit/core"
import { useIconContext } from "./IconProvider"

export interface IconProps
  extends IconCustomizations,
    Omit<HTMLAttributes<HTMLSpanElement>, "style" | "className" | "title"> {
  /** Icon name in "set:name" format, e.g. "mdi:home" */
  name: string
  /** Pre-loaded SVG string — skips dynamic loading */
  svg?: string
  /** Fallback content shown while loading */
  fallback?: React.ReactNode
  /** HTML inline style for the wrapper */
  wrapperStyle?: React.CSSProperties
  /** Additional HTML class for the wrapper */
  wrapperClassName?: string
}

export function Icon({
  name,
  svg: svgProp,
  fallback,
  // IconCustomizations
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
  // Wrapper props
  wrapperStyle,
  wrapperClassName,
  "aria-label": ariaLabel,
  ...rest
}: IconProps) {
  const ctx = useIconContext()
  const [loadedSvg, setLoadedSvg] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const [set, iconName] = useMemo(() => {
    const idx = name.indexOf(":")
    if (idx === -1) return ["", name]
    return [name.slice(0, idx), name.slice(idx + 1)]
  }, [name])

  useEffect(() => {
    if (svgProp) return

    const cacheKey = `${set}:${iconName}`

    // Check cache
    if (ctx?.cache.has(cacheKey)) {
      setLoadedSvg(ctx.cache.get(cacheKey)!)
      return
    }

    if (!ctx?.loader) {
      setError(true)
      return
    }

    let cancelled = false
    setLoadedSvg(null)
    setError(false)

    ctx.loader(set, iconName).then(
      (result) => {
        if (!cancelled) {
          ctx.cache.set(cacheKey, result)
          setLoadedSvg(result)
        }
      },
      () => {
        if (!cancelled) setError(true)
      }
    )

    return () => {
      cancelled = true
    }
  }, [set, iconName, svgProp, ctx])

  const rawSvg = svgProp ?? loadedSvg
  if (error) return null
  if (!rawSvg) return <>{fallback ?? null}</>

  const customizations: IconCustomizations = {
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
  }

  // Merge context defaults (props take priority)
  const merged: IconCustomizations = { ...ctx?.defaults, ...customizations }
  // Remove undefined values so defaults aren't overridden
  for (const key of Object.keys(merged) as (keyof IconCustomizations)[]) {
    if (customizations[key] === undefined && ctx?.defaults?.[key] !== undefined) {
      ;(merged as Record<string, unknown>)[key] = ctx.defaults[key]
    }
  }

  const finalSvg = customizeSvg(rawSvg, merged)

  const accessible = !!(ariaLabel || title)

  return (
    <span
      className={wrapperClassName}
      style={{ display: "inline-flex", alignItems: "center", ...wrapperStyle }}
      role={accessible ? "img" : "presentation"}
      aria-label={ariaLabel ?? title}
      aria-hidden={accessible ? undefined : true}
      dangerouslySetInnerHTML={{ __html: finalSvg }}
      {...rest}
    />
  )
}
