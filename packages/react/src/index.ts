export { Icon, type IconProps } from "./Icon"
export { IconProvider, useIconContext, type IconProviderProps, type IconContextValue } from "./IconProvider"
export { createIcon, type IconComponentProps } from "./createIcon"

// Re-export core utilities so users don't need to install @iconkit/core separately
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
} from "@iconkit/core"
