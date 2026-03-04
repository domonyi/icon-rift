"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import type { IconCustomizations, IconLoader } from "@iconkit/core"

export interface IconContextValue {
  loader: IconLoader
  defaults: Partial<IconCustomizations>
  cache: Map<string, string>
}

export const IconContext = createContext<IconContextValue | null>(null)

export function useIconContext(): IconContextValue | null {
  return useContext(IconContext)
}

export interface IconProviderProps {
  children: ReactNode
  /** Base path for the icon API. Icons fetched from `${basePath}/${set}/${name}` */
  basePath?: string
  /** Custom loader function — overrides basePath */
  loader?: IconLoader
  /** Default customization applied to all icons */
  defaults?: Partial<IconCustomizations>
}

export function IconProvider({
  children,
  basePath = "/api/icons",
  loader,
  defaults = {},
}: IconProviderProps) {
  const cache = useMemo(() => new Map<string, string>(), [])

  const resolvedLoader: IconLoader = useMemo(() => {
    if (loader) return loader
    return async (set: string, name: string) => {
      const res = await fetch(`${basePath}/${set}/${name}`)
      if (!res.ok) throw new Error(`Failed to load icon: ${set}:${name}`)
      return res.text()
    }
  }, [basePath, loader])

  const value = useMemo<IconContextValue>(
    () => ({ loader: resolvedLoader, defaults, cache }),
    [resolvedLoader, defaults, cache]
  )

  return <IconContext.Provider value={value}>{children}</IconContext.Provider>
}
