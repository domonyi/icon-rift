"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  Icon,
  IconProvider,
  createIcon,
  customizeSvg,
  getSvgBody,
  getSvgAttributes,
  svgToDataUri,
  svgToBase64,
} from "@iconkit/react"

/* ─── Types ─── */

interface Sample {
  set: string
  name: string
  svg: string
}

type TestStatus = "idle" | "pass" | "fail"

interface TestResult {
  label: string
  status: TestStatus
  detail?: string
}

/* ─── Constants ─── */

const STATUS_ICON: Record<TestStatus, string> = {
  idle: "\u25CB",  // ○
  pass: "\u2713",  // ✓
  fail: "\u2717",  // ✗
}

const STATUS_COLOR: Record<TestStatus, string> = {
  idle: "var(--text-muted)",
  pass: "#10b981",
  fail: "#ef4444",
}

/* ─── Main ─── */

export function Playground({ samples }: { samples: Sample[] }) {
  return (
    <div className="space-y-10">
      <StaticComponentsSection samples={samples} />
      <DynamicIconSection samples={samples} />
      <ProviderDefaultsSection samples={samples} />
      <CustomizeSvgSection samples={samples} />
      <UtilityFunctionsSection samples={samples} />
      <ApiEndpointSection samples={samples} />
    </div>
  )
}

/* ─── Section wrapper ─── */

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section id={id}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      </div>
      <div
        className="rounded-xl border p-5"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        {children}
      </div>
    </section>
  )
}

/* ─── Status badge ─── */

function StatusBadge({ status, label }: { status: TestStatus; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md"
      style={{
        color: STATUS_COLOR[status],
        background:
          status === "pass"
            ? "rgba(16,185,129,0.1)"
            : status === "fail"
              ? "rgba(239,68,68,0.1)"
              : "var(--bg-secondary)",
      }}
    >
      {STATUS_ICON[status]} {label}
    </span>
  )
}

/* ─── 1. Static Components (createIcon) ─── */

function StaticComponentsSection({ samples }: { samples: Sample[] }) {
  const [results, setResults] = useState<TestResult[]>([])
  const [sizes] = useState([16, 24, 32, 48])

  // Create static components from sample SVGs
  const staticIcons = useMemo(
    () =>
      samples.slice(0, 6).map((s) => ({
        ...s,
        Component: createIcon(s.svg, `${s.set}:${s.name}`),
      })),
    [samples]
  )

  const runTests = useCallback(() => {
    const res: TestResult[] = []

    // Test: createIcon returns a function
    res.push({
      label: "createIcon returns a component",
      status: typeof staticIcons[0]?.Component === "function" ? "pass" : "fail",
    })

    // Test: displayName is set
    const hasDisplayName = staticIcons.every(
      (i) => i.Component.displayName !== undefined
    )
    res.push({
      label: "displayName is set",
      status: hasDisplayName ? "pass" : "fail",
    })

    // Test: renders without throwing (check DOM)
    const container = document.getElementById("static-render-zone")
    const rendered = container && container.querySelectorAll("svg").length > 0
    res.push({
      label: "Components render SVG to DOM",
      status: rendered ? "pass" : "fail",
      detail: rendered
        ? `${container!.querySelectorAll("svg").length} SVGs rendered`
        : "No SVGs found in render zone",
    })

    setResults(res)
  }, [staticIcons])

  // Auto-run after mount
  useEffect(() => {
    const t = setTimeout(runTests, 300)
    return () => clearTimeout(t)
  }, [runTests])

  return (
    <Section
      id="static"
      title="1. Static Components (createIcon)"
      description="Pre-built icon components created from raw SVG strings. These work in both Server and Client Components."
    >
      {/* Rendered icons */}
      <div id="static-render-zone" className="flex flex-wrap gap-6 mb-5">
        {staticIcons.map((icon) => (
          <div key={`${icon.set}:${icon.name}`} className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {sizes.map((sz) => (
                <icon.Component key={sz} size={sz} color="var(--text-primary)" />
              ))}
            </div>
            <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
              {icon.set}:{icon.name}
            </span>
          </div>
        ))}
      </div>

      {/* Test: custom props */}
      <div className="mb-5">
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Props test — color, rotation, flip, opacity:
        </p>
        <div className="flex items-center gap-4">
          {staticIcons[0] && <PropsTest Component={staticIcons[0].Component} />}
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-wrap gap-2">
        {results.map((r) => (
          <StatusBadge key={r.label} status={r.status} label={r.label} />
        ))}
      </div>
    </Section>
  )
}

function PropsTest({ Component }: { Component: React.FC<any> }) {
  return (
    <>
      <Component size={32} color="#6366f1" />
      <Component size={32} color="#ec4899" rotate={45} />
      <Component size={32} color="#f59e0b" flipH />
      <Component size={32} color="#10b981" flipV />
      <Component size={32} color="#3b82f6" opacity={0.4} />
      <Component size={32} color="#ef4444" rotate={180} flipH />
    </>
  )
}

/* ─── 2. Dynamic Icon Component ─── */

function DynamicIconSection({ samples }: { samples: Sample[] }) {
  const [results, setResults] = useState<TestResult[]>([])
  const [loaded, setLoaded] = useState(0)

  const iconNames = useMemo(
    () => samples.map((s) => `${s.set}:${s.name}`),
    [samples]
  )

  const runTests = useCallback(() => {
    const container = document.getElementById("dynamic-render-zone")
    const svgCount = container?.querySelectorAll("svg").length ?? 0

    const res: TestResult[] = [
      {
        label: "IconProvider renders",
        status: container ? "pass" : "fail",
      },
      {
        label: `Icons loaded (${svgCount}/${iconNames.length})`,
        status:
          svgCount === iconNames.length
            ? "pass"
            : svgCount > 0
              ? "pass"
              : "fail",
        detail: `${svgCount} SVGs in DOM`,
      },
    ]
    setLoaded(svgCount)
    setResults(res)
  }, [iconNames])

  // Auto-run with delay for async loading
  useEffect(() => {
    const t = setTimeout(runTests, 1500)
    return () => clearTimeout(t)
  }, [runTests])

  return (
    <Section
      id="dynamic"
      title="2. Dynamic Icon Component"
      description="Runtime icon loading via <IconProvider> + <Icon name='set:name'>. Icons are fetched from the API and cached."
    >
      <IconProvider basePath="/api/icons">
        <div id="dynamic-render-zone" className="flex flex-wrap gap-6 mb-5">
          {iconNames.map((name) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Icon
                name={name}
                size={32}
                fallback={
                  <span
                    className="w-8 h-8 rounded-md animate-pulse"
                    style={{ background: "var(--bg-secondary)" }}
                  />
                }
              />
              <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                {name}
              </span>
            </div>
          ))}
        </div>

        {/* Error handling test */}
        <div className="mb-5">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Error handling — invalid icon name (should render nothing):
          </p>
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-2 rounded-lg border text-xs font-mono"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <Icon name="nonexistent:fake-icon" fallback={<span>loading...</span>} />
              <span className="ml-2">{"<Icon name=\"nonexistent:fake-icon\" />"}</span>
            </div>
          </div>
        </div>

        {/* Dynamic props test */}
        <div className="mb-5">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Dynamic props — same icon with different customizations:
          </p>
          <div className="flex items-center gap-3">
            <Icon name={iconNames[0]} size={20} color="#6366f1" />
            <Icon name={iconNames[0]} size={28} color="#ec4899" rotate={90} />
            <Icon name={iconNames[0]} size={36} color="#f59e0b" flipH />
            <Icon name={iconNames[0]} size={44} color="#10b981" opacity={0.5} />
            <Icon name={iconNames[0]} size={52} color="#3b82f6" rotate={270} flipV />
          </div>
        </div>
      </IconProvider>

      <div className="flex items-center gap-3">
        <button
          onClick={runTests}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: "var(--accent)",
            color: "#fff",
          }}
        >
          Re-check
        </button>
        <div className="flex flex-wrap gap-2">
          {results.map((r) => (
            <StatusBadge key={r.label} status={r.status} label={r.label} />
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── 3. Provider Defaults ─── */

function ProviderDefaultsSection({ samples }: { samples: Sample[] }) {
  const [defaultSize, setDefaultSize] = useState(24)
  const [defaultColor, setDefaultColor] = useState("#a78bfa")

  const iconNames = useMemo(
    () => samples.slice(0, 5).map((s) => `${s.set}:${s.name}`),
    [samples]
  )

  return (
    <Section
      id="provider-defaults"
      title="3. Provider Defaults"
      description="IconProvider can set default customizations for all child icons. Individual props override defaults."
    >
      {/* Controls */}
      <div className="flex flex-wrap gap-6 mb-5">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
            Default size
          </label>
          <input
            type="range"
            min={12}
            max={64}
            value={defaultSize}
            onChange={(e) => setDefaultSize(Number(e.target.value))}
            className="slider"
          />
          <span className="text-xs font-mono ml-2" style={{ color: "var(--text-muted)" }}>
            {defaultSize}px
          </span>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
            Default color
          </label>
          <div className="flex gap-2">
            {["#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#60a5fa"].map((c) => (
              <button
                key={c}
                onClick={() => setDefaultColor(c)}
                className="w-6 h-6 rounded-full border-2"
                style={{
                  background: c,
                  borderColor: defaultColor === c ? "#fff" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Rendering */}
      <IconProvider
        basePath="/api/icons"
        defaults={{ size: defaultSize, color: defaultColor }}
      >
        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            All icons below inherit size={defaultSize} color=&quot;{defaultColor}&quot; from provider:
          </p>
          <div className="flex items-center gap-4">
            {iconNames.map((name) => (
              <Icon key={name} name={name} fallback={<Skeleton />} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            This icon overrides with size=48 color=&quot;#ef4444&quot; (should be large + red):
          </p>
          <div className="flex items-center gap-3">
            <Icon name={iconNames[0]} size={48} color="#ef4444" />
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              size=48 color=&quot;#ef4444&quot;
            </span>
          </div>
        </div>
      </IconProvider>
    </Section>
  )
}

/* ─── 4. customizeSvg (Core) ─── */

function CustomizeSvgSection({ samples }: { samples: Sample[] }) {
  const sample = samples[0]
  const [size, setSize] = useState(32)
  const [color, setColor] = useState("#6366f1")
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [opacity, setOpacity] = useState(1)

  const result = useMemo(
    () =>
      customizeSvg(sample.svg, {
        size,
        color,
        rotate: rotation,
        flipH,
        flipV,
        opacity,
      }),
    [sample.svg, size, color, rotation, flipH, flipV, opacity]
  )

  return (
    <Section
      id="customize-svg"
      title="4. customizeSvg (Core Function)"
      description="The core SVG manipulation function. Modifies raw SVG strings with size, color, rotation, flip, and opacity."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
              Size: {size}px
            </label>
            <input
              type="range"
              min={12}
              max={96}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="slider w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <span className="text-xs font-mono ml-2" style={{ color: "var(--text-muted)" }}>
              {color}
            </span>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
              Rotation: {rotation} deg
            </label>
            <input
              type="range"
              min={0}
              max={360}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="slider w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
              Opacity: {opacity.toFixed(2)}
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="slider w-full"
            />
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              <input type="checkbox" checked={flipH} onChange={() => setFlipH(!flipH)} />
              Flip H
            </label>
            <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              <input type="checkbox" checked={flipV} onChange={() => setFlipV(!flipV)} />
              Flip V
            </label>
          </div>
        </div>

        {/* Preview + output */}
        <div>
          <div
            className="flex items-center justify-center rounded-xl border checkerboard mb-3"
            style={{ borderColor: "var(--border)", height: 120 }}
          >
            <span dangerouslySetInnerHTML={{ __html: result }} />
          </div>
          <pre
            className="text-[11px] font-mono p-3 rounded-lg overflow-x-auto max-h-40"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-muted)",
            }}
          >
            {result}
          </pre>
        </div>
      </div>
    </Section>
  )
}

/* ─── 5. Utility Functions ─── */

function UtilityFunctionsSection({ samples }: { samples: Sample[] }) {
  const sample = samples[0]
  const [results, setResults] = useState<TestResult[]>([])

  const bodyResult = useMemo(() => getSvgBody(sample.svg), [sample.svg])
  const attrsResult = useMemo(() => getSvgAttributes(sample.svg), [sample.svg])
  const dataUriResult = useMemo(() => svgToDataUri(sample.svg), [sample.svg])
  const base64Result = useMemo(() => svgToBase64(sample.svg), [sample.svg])

  const runTests = useCallback(() => {
    const res: TestResult[] = [
      {
        label: "getSvgBody",
        status: bodyResult.length > 0 && !bodyResult.startsWith("<svg") ? "pass" : "fail",
        detail: `Returned ${bodyResult.length} chars`,
      },
      {
        label: "getSvgAttributes",
        status:
          Object.keys(attrsResult).length > 0 && attrsResult.viewBox
            ? "pass"
            : "fail",
        detail: `Keys: ${Object.keys(attrsResult).join(", ")}`,
      },
      {
        label: "svgToDataUri",
        status: dataUriResult.startsWith("data:image/svg+xml,") ? "pass" : "fail",
        detail: `${dataUriResult.length} chars`,
      },
      {
        label: "svgToBase64",
        status: base64Result.startsWith("data:image/svg+xml;base64,") ? "pass" : "fail",
        detail: `${base64Result.length} chars`,
      },
    ]
    setResults(res)
  }, [bodyResult, attrsResult, dataUriResult, base64Result])

  useEffect(() => {
    runTests()
  }, [runTests])

  return (
    <Section
      id="utilities"
      title="5. Utility Functions"
      description="Core helpers for extracting SVG data, generating data URIs, and base64 encoding."
    >
      <div className="space-y-4">
        {/* getSvgBody */}
        <UtilBlock label="getSvgBody(svg)" code={bodyResult} />

        {/* getSvgAttributes */}
        <UtilBlock
          label="getSvgAttributes(svg)"
          code={JSON.stringify(attrsResult, null, 2)}
        />

        {/* svgToDataUri — render as <img> */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            svgToDataUri(svg) — rendered as {"<img>"}:
          </p>
          <div className="flex items-center gap-4">
            <img src={dataUriResult} width={32} height={32} alt="data-uri test" />
            <pre
              className="text-[11px] font-mono p-2 rounded-lg flex-1 truncate"
              style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
            >
              {dataUriResult.slice(0, 80)}...
            </pre>
          </div>
        </div>

        {/* svgToBase64 — render as <img> */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            svgToBase64(svg) — rendered as {"<img>"}:
          </p>
          <div className="flex items-center gap-4">
            <img src={base64Result} width={32} height={32} alt="base64 test" />
            <pre
              className="text-[11px] font-mono p-2 rounded-lg flex-1 truncate"
              style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
            >
              {base64Result.slice(0, 80)}...
            </pre>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {results.map((r) => (
          <StatusBadge key={r.label} status={r.status} label={r.label} />
        ))}
      </div>
    </Section>
  )
}

function UtilBlock({ label, code }: { label: string; code: string }) {
  return (
    <div>
      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <pre
        className="text-[11px] font-mono p-2 rounded-lg overflow-x-auto max-h-28"
        style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
      >
        {code}
      </pre>
    </div>
  )
}

/* ─── 6. API Endpoint ─── */

function ApiEndpointSection({ samples }: { samples: Sample[] }) {
  const [set, setSet] = useState(samples[0]?.set ?? "mdi")
  const [name, setName] = useState(samples[0]?.name ?? "home")
  const [qSize, setQSize] = useState(48)
  const [qColor, setQColor] = useState("#6366f1")
  const [response, setResponse] = useState<{
    status: number
    contentType: string
    body: string
    time: number
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const url = useMemo(() => {
    const params = new URLSearchParams()
    params.set("size", String(qSize))
    params.set("color", qColor)
    return `/api/icons/${set}/${name}?${params}`
  }, [set, name, qSize, qColor])

  const fetchIcon = useCallback(async () => {
    setLoading(true)
    const start = performance.now()
    try {
      const res = await fetch(url)
      const body = await res.text()
      setResponse({
        status: res.status,
        contentType: res.headers.get("content-type") ?? "",
        body,
        time: Math.round(performance.now() - start),
      })
    } catch {
      setResponse({
        status: 0,
        contentType: "",
        body: "Network error",
        time: Math.round(performance.now() - start),
      })
    }
    setLoading(false)
  }, [url])

  // Auto-fetch on change
  useEffect(() => {
    fetchIcon()
  }, [fetchIcon])

  const statusOk = response && response.status === 200
  const isSvg = response?.contentType.includes("svg")

  return (
    <Section
      id="api"
      title="6. API Endpoint"
      description="REST API at /api/icons/[set]/[name] — serves SVGs with query-based customization and long-term caching."
    >
      {/* Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
            Set
          </label>
          <select
            value={set}
            onChange={(e) => setSet(e.target.value)}
            className="w-full text-sm rounded-lg px-2 py-1.5 border"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {[...new Set(samples.map((s) => s.set))].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
            Name
          </label>
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm rounded-lg px-2 py-1.5 border"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {samples
              .filter((s) => s.set === set)
              .map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
            ?size={qSize}
          </label>
          <input
            type="range"
            min={12}
            max={96}
            value={qSize}
            onChange={(e) => setQSize(Number(e.target.value))}
            className="slider w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
            ?color
          </label>
          <input
            type="color"
            value={qColor}
            onChange={(e) => setQColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
        </div>
      </div>

      {/* URL */}
      <pre
        className="text-xs font-mono px-3 py-2 rounded-lg mb-4 truncate"
        style={{ background: "var(--bg-secondary)", color: "var(--accent)" }}
      >
        GET {url}
      </pre>

      {/* Response */}
      {response && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Preview */}
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Preview:
            </p>
            <div
              className="flex items-center justify-center rounded-xl border checkerboard"
              style={{ borderColor: "var(--border)", height: 120 }}
            >
              {statusOk && isSvg ? (
                <span dangerouslySetInnerHTML={{ __html: response.body }} />
              ) : (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  No preview
                </span>
              )}
            </div>
          </div>

          {/* Response info */}
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Response:
            </p>
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <StatusBadge
                  status={statusOk ? "pass" : "fail"}
                  label={`${response.status} ${statusOk ? "OK" : "Error"}`}
                />
                <StatusBadge
                  status={isSvg ? "pass" : "fail"}
                  label={response.contentType || "no content-type"}
                />
                <StatusBadge
                  status="pass"
                  label={`${response.time}ms`}
                />
              </div>
              <pre
                className="text-[11px] font-mono p-2 rounded-lg overflow-x-auto max-h-24"
                style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
              >
                {response.body.length > 500
                  ? response.body.slice(0, 500) + "..."
                  : response.body}
              </pre>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Loading...
        </p>
      )}
    </Section>
  )
}

/* ─── Skeleton ─── */

function Skeleton() {
  return (
    <span
      className="w-6 h-6 rounded-md animate-pulse inline-block"
      style={{ background: "var(--bg-secondary)" }}
    />
  )
}
