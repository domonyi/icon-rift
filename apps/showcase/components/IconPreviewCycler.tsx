"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface IconPreviewCyclerProps {
  /** Each frame is an array of pre-rendered SVG HTML strings (one per icon slot) */
  frames: string[][]
}

export function IconPreviewCycler({ frames }: IconPreviewCyclerProps) {
  const [activeFrame, setActiveFrame] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canCycle = frames.length > 1

  const stopCycling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setActiveFrame(0)
  }, [])

  const startCycling = useCallback(() => {
    if (!canCycle) return
    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current)
    // Immediately advance to the next frame
    setActiveFrame((prev) => (prev + 1) % frames.length)
    intervalRef.current = setInterval(() => {
      setActiveFrame((prev) => (prev + 1) % frames.length)
    }, 1000)
  }, [canCycle, frames.length])

  // Listen on the parent .icon-cell so hovering anywhere on the card triggers cycling
  useEffect(() => {
    const parent = containerRef.current?.closest(".icon-cell")
    if (!parent || !canCycle) return

    const enter = () => {
      const delay = setTimeout(() => startCycling(), 500)
      ;(parent as any).__hoverDelay = delay
    }
    const leave = () => {
      clearTimeout((parent as any).__hoverDelay)
      stopCycling()
    }

    parent.addEventListener("mouseenter", enter)
    parent.addEventListener("mouseleave", leave)

    return () => {
      parent.removeEventListener("mouseenter", enter)
      parent.removeEventListener("mouseleave", leave)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [canCycle, startCycling, stopCycling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="icon-preview-container relative">
      {frames.map((frame, frameIndex) => (
        <div
          key={frameIndex}
          className={`card-icons flex items-center justify-center ${
            frameIndex > 0 ? "absolute inset-0" : ""
          }`}
          style={{
            opacity: activeFrame === frameIndex ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
          aria-hidden={activeFrame !== frameIndex}
        >
          {frame.map((html, i) => (
            <span
              key={i}
              className="card-icon flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
              data-index={i}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
