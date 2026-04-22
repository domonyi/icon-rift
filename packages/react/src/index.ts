export { Icon, type IconProps } from "./Icon"
export { IconProvider, useIconContext, type IconProviderProps, type IconContextValue } from "./IconProvider"
export { createIcon, type IconComponentProps, type TypedIconProps, type IconComponent } from "./createIcon"

// Re-export core utilities so users don't need to install @iconrift/core separately
export {
  customizeSvg,
  extractPalette,
  getSvgBody,
  getSvgAttributes,
  svgToDataUri,
  svgToBase64,
  type IconCustomizations,
  type IconSetMeta,
  type IconEntry,
  type IconLoader,
  type ColorsTuple,
} from "@iconrift/core"
