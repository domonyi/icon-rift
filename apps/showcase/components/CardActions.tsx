"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

export function CardActions({
  prefix,
  authorName,
  authorUrl,
  licenseSpdx,
  licenseTitle,
  category,
  iconCount,
}: {
  prefix: string
  authorName: string
  authorUrl?: string
  licenseSpdx: string
  licenseTitle: string
  category: string
  iconCount: number
}) {
  const [copied, setCopied] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [openLeft, setOpenLeft] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  function stop(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  async function copyImport(e: React.MouseEvent) {
    stop(e)
    await navigator.clipboard.writeText(
      `import * as Icons from '@iconrift/react/${prefix}'`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function toggleFavorite(e: React.MouseEvent) {
    stop(e)
    setFavorited((v) => !v)
  }

  function toggleInfo(e: React.MouseEvent) {
    stop(e)
    if (!showInfo && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setOpenUp(rect.bottom + 220 > window.innerHeight)
      setOpenLeft(rect.left + 208 > window.innerWidth)
    }
    setShowInfo((v) => !v)
  }

  useEffect(() => {
    if (!showInfo) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (popoverRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setShowInfo(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showInfo])

  return (
    <div
      className="flex items-center justify-between px-2 pb-2 mt-auto"
      style={{ color: "var(--text-muted)" }}
    >
      <div className="flex items-center gap-0.5">
        <button onClick={copyImport} className="hover-icon p-1.5 rounded-md cursor-pointer" title={copied ? "Copied!" : "Copy import"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={copied ? "var(--accent)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {copied ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>
            )}
          </svg>
        </button>
        <button onClick={toggleFavorite} className="hover-icon p-1.5 rounded-md cursor-pointer" title={favorited ? "Remove from favorites" : "Add to favorites"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={favorited ? "var(--accent)" : "none"} stroke={favorited ? "var(--accent)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <div className="relative" ref={popoverRef}>
          <button ref={btnRef} onClick={toggleInfo} className="hover-icon p-1.5 rounded-md cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showInfo ? "var(--accent)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
          {showInfo && createPortal(
            <div
              ref={panelRef}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="fixed w-52 rounded-lg border p-3 text-xs shadow-lg z-50"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border)",
                ...(openLeft
                  ? { right: window.innerWidth - (btnRef.current?.getBoundingClientRect().right ?? 0) }
                  : { left: btnRef.current ? btnRef.current.getBoundingClientRect().left : 0 }),
                ...(openUp
                  ? { bottom: window.innerHeight - (btnRef.current?.getBoundingClientRect().top ?? 0) + 8 }
                  : { top: (btnRef.current?.getBoundingClientRect().bottom ?? 0) + 8 }),
              }}
            >
              <div className="space-y-2">
                <InfoCopyRow label="Prefix" value={prefix} mono copiedField={copiedField} onCopy={setCopiedField} />
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Category</span>
                  <p style={{ color: "var(--text-primary)" }}>{category}</p>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Author</span>
                  {authorUrl ? (
                    <a
                      href={authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-link flex items-center gap-1 underline"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {authorName}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  ) : (
                    <p style={{ color: "var(--text-primary)" }}>{authorName}</p>
                  )}
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>License</span>
                  <p style={{ color: "var(--text-primary)" }}>{licenseTitle}</p>
                  <LicenseHints spdx={licenseSpdx} />
                </div>
                <InfoCopyRow label="Import" value={`@iconrift/react/${prefix}`} mono copiedField={copiedField} onCopy={setCopiedField} />
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
      <span
        className="text-xs font-medium px-2.5 rounded-full"
        style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", paddingTop: 4, paddingBottom: 3 }}
      >
        {iconCount.toLocaleString("en-US")}
      </span>
    </div>
  )
}

function InfoCopyRow({
  label,
  value,
  mono,
  copiedField,
  onCopy,
}: {
  label: string
  value: string
  mono?: boolean
  copiedField: string | null
  onCopy: (field: string | null) => void
}) {
  const isCopied = copiedField === label

  async function copy() {
    await navigator.clipboard.writeText(value)
    onCopy(label)
    setTimeout(() => onCopy(null), 1500)
  }

  return (
    <div>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <div className="flex items-center justify-between gap-1">
        <p className={`truncate ${mono ? "font-mono" : ""}`} style={{ color: "var(--text-primary)" }}>{value}</p>
        <button onClick={copy} className="shrink-0 p-0.5 rounded cursor-pointer hover:opacity-80" title={isCopied ? "Copied!" : `Copy ${label.toLowerCase()}`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isCopied ? "var(--accent)" : "var(--text-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isCopied ? (
              <><polyline points="20 6 9 17 4 12" /></>
            ) : (
              <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>
            )}
          </svg>
        </button>
      </div>
    </div>
  )
}

// Licenses that require visible attribution (credit the author)
const ATTRIBUTION_REQUIRED = new Set([
  "CC-BY-4.0", "CC-BY-SA-4.0", "CC-BY-3.0", "CC-BY-SA-3.0",
])

// Licenses that restrict commercial use
const NO_COMMERCIAL = new Set([
  "CC-BY-NC-4.0", "CC-BY-NC-3.0", "CC-BY-NC-SA-4.0", "CC-BY-NC-SA-3.0",
  "CC-BY-NC-ND-4.0", "CC-BY-NC-ND-3.0",
])

function LicenseHints({ spdx }: { spdx: string }) {
  const needsAttribution = ATTRIBUTION_REQUIRED.has(spdx)
  const noCommercial = NO_COMMERCIAL.has(spdx)

  return (
    <div className="flex flex-col gap-1 mt-1.5">
      <div className="flex items-center gap-1.5" style={{ color: noCommercial ? "#fbbf24" : "#4ade80" }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {noCommercial ? (
            <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
          ) : (
            <polyline points="20 6 9 17 4 12" />
          )}
        </svg>
        <span>{noCommercial ? "Non-commercial use only" : "Commercial use allowed"}</span>
      </div>
      <div className="flex items-center gap-1.5" style={{ color: needsAttribution ? "#fbbf24" : "#4ade80" }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {needsAttribution ? (
            <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
          ) : (
            <polyline points="20 6 9 17 4 12" />
          )}
        </svg>
        <span>{needsAttribution ? "Attribution required" : "No attribution required"}</span>
      </div>
    </div>
  )
}
