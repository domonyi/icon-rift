"use client";

import { Icon, IconProvider } from "@iconkit/react";
import { FlagPride16Filled } from "@iconkit/react/fluent";
import { Icon3dCoordinateAxis } from "@iconkit/react/streamline-plump-color";
import Link from "next/link";
import { useState } from "react";

// Import pre-generated components — just like you would in a real app
import {
  Bell,
  ChevronDown,
  Github,
  Home,
  Menu,
  Palette,
  Search,
  Settings,
  Shield,
  User,
  Zap,
} from "@iconkit/react/lucide";
import {
  LanguageTypescript,
  Heart as MdiHeart,
  Star as MdiStar,
} from "@iconkit/react/mdi";
import { PackageBold } from "@iconkit/react/ph";

// Multi-color icon set

export default function SandboxPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-secondary)" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to browse
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          <span style={{ color: "var(--accent)" }}>IconKit</span> Sandbox
        </h1>
        <p style={{ color: "var(--text-secondary)" }} className="text-sm">
          Real-world usage examples — test icons exactly like you would in your
          own app.
        </p>
      </header>

      <IconProvider basePath="/api/icons">
        <div className="space-y-10">
          <NavbarExample />
          <ButtonsExample />
          <CardExample />
          <ListExample />
          <DynamicExample />
          <MultiColorStaticExample />
        </div>
      </IconProvider>
    </div>
  );
}

/* ─── Fake Navbar ─── */

function NavbarExample() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ExampleSection
      title="Navbar"
      code={`import { Home, Bell, User, Search, Menu, ChevronDown } from "@iconkit/react/lucide"

<Menu size={20} />
<Search size={14} />
<Bell size={20} />
<User size={16} />`}
    >
      <nav
        className="flex items-center justify-between px-4 py-3 rounded-xl border"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:opacity-70"
          >
            <Menu size={20} color="var(--text-primary)" />
          </button>
          <span className="font-semibold text-sm">My App</span>
        </div>

        <div
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-muted)",
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <span className="ml-1">Search...</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:opacity-70 relative">
            <Bell size={20} color="var(--text-secondary)" />
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{
                background: "#ef4444",
                border: "2px solid var(--bg-card)",
              }}
            />
          </button>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm"
            style={{ background: "var(--bg-secondary)" }}
          >
            <User size={16} color="var(--text-secondary)" />
            <span style={{ color: "var(--text-secondary)" }}>Account</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>
        </div>
      </nav>
    </ExampleSection>
  );
}

/* ─── Buttons ─── */

function ButtonsExample() {
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);

  return (
    <ExampleSection
      title="Buttons with Icons"
      code={`import { Heart, Star } from "@iconkit/react/mdi"
import { Settings, Home } from "@iconkit/react/lucide"

<Heart size={16} color={liked ? "#ef4444" : "currentColor"} />
<Star size={16} color={starred ? "#f59e0b" : "currentColor"} />
<Settings size={16} color="#fff" />
<Home size={16} />`}
    >
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setLiked(!liked)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: liked ? "rgba(239,68,68,0.1)" : "var(--bg-secondary)",
            color: liked ? "#ef4444" : "var(--text-primary)",
            border: `1px solid ${liked ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
          }}
        >
          <MdiHeart size={16} color={liked ? "#ef4444" : "currentColor"} />
          {liked ? "Liked" : "Like"}
        </button>

        <button
          onClick={() => setStarred(!starred)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: starred
              ? "rgba(245,158,11,0.1)"
              : "var(--bg-secondary)",
            color: starred ? "#f59e0b" : "var(--text-primary)",
            border: `1px solid ${starred ? "rgba(245,158,11,0.3)" : "var(--border)"}`,
          }}
        >
          <MdiStar size={16} color={starred ? "#f59e0b" : "currentColor"} />
          {starred ? "Starred" : "Star"}
        </button>

        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Settings size={16} color="#fff" />
          Settings
        </button>

        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        >
          <Home size={16} color="currentColor" />
          Home
        </button>
      </div>
    </ExampleSection>
  );
}

/* ─── Card ─── */

function CardExample() {
  return (
    <ExampleSection
      title="Feature Cards"
      code={`import { Github, Zap } from "@iconkit/react/lucide"
import { LanguageTypescript } from "@iconkit/react/mdi"
import { PackageBold } from "@iconkit/react/ph"

<Github size={20} color="#333" />
<LanguageTypescript size={20} color="#3178c6" />
<Zap size={20} color="#f59e0b" />
<PackageBold size={20} color="#10b981" />`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(
          [
            {
              Ic: Github,
              title: "GitHub",
              desc: "View source code",
              accent: "#333",
            },
            {
              Ic: LanguageTypescript,
              title: "TypeScript",
              desc: "Fully typed API",
              accent: "#3178c6",
            },
            {
              Ic: Zap,
              title: "Fast",
              desc: "Tree-shakeable & tiny",
              accent: "#f59e0b",
            },
            {
              Ic: PackageBold,
              title: "Modular",
              desc: "Import only what you need",
              accent: "#10b981",
            },
          ] as const
        ).map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 p-4 rounded-xl border transition-all hover:translate-y-[-1px]"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
              style={{ background: `${item.accent}15` }}
            >
              <item.Ic size={20} color={item.accent} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ExampleSection>
  );
}

/* ─── Settings List ─── */

function ListExample() {
  const items = [
    { Ic: User, label: "Profile", desc: "Manage your account" },
    { Ic: Bell, label: "Notifications", desc: "Configure alerts" },
    { Ic: Shield, label: "Security", desc: "Password & 2FA" },
    { Ic: Palette, label: "Appearance", desc: "Theme & colors" },
  ];

  return (
    <ExampleSection
      title="Settings List"
      code={`import { User, Bell, Shield, Palette, ChevronDown } from "@iconkit/react/lucide"

<User size={18} />
<Bell size={18} />
<Shield size={18} />
<Palette size={18} />
<ChevronDown size={16} rotate={-90} />`}
    >
      <div
        className="rounded-xl border divide-y"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            <item.Ic size={18} color="var(--text-secondary)" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {item.desc}
              </p>
            </div>
            <ChevronDown size={16} color="var(--text-muted)" rotate={-90} />
          </div>
        ))}
      </div>
    </ExampleSection>
  );
}

/* ─── Dynamic Loading ─── */

function DynamicExample() {
  const [iconName, setIconName] = useState("lucide:rocket");

  const presets = [
    "lucide:rocket",
    "mdi:heart",
    "ph:lightning-bold",
    "lucide:code-2",
    "mdi:fire",
    "lucide:sparkles",
  ];

  return (
    <ExampleSection
      title="Dynamic Icon Loading"
      code={`import { Icon, IconProvider } from "@iconkit/react"

<IconProvider basePath="/api/icons">
  <Icon name="lucide:rocket" size={48} color="var(--accent)" />
</IconProvider>`}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex items-center justify-center w-24 h-24 rounded-2xl border"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <Icon
            name={iconName}
            size={48}
            color="var(--accent)"
            fallback={
              <span
                className="w-12 h-12 rounded-lg animate-pulse"
                style={{ background: "var(--border)" }}
              />
            }
          />
        </div>

        <input
          type="text"
          value={iconName}
          onChange={(e) => setIconName(e.target.value)}
          placeholder="set:icon-name"
          className="w-full max-w-xs px-3 py-2 rounded-lg text-sm font-mono border text-center"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />

        <div className="flex flex-wrap justify-center gap-2">
          {presets.map((name) => (
            <button
              key={name}
              onClick={() => setIconName(name)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
              style={{
                background:
                  iconName === name ? "var(--accent)" : "var(--bg-secondary)",
                color: iconName === name ? "#fff" : "var(--text-muted)",
                border: `1px solid ${iconName === name ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </ExampleSection>
  );
}

/* ─── Multi-Color Static Icons ─── */

function MultiColorStaticExample() {
  return (
    <ExampleSection
      title="Multi-Color Icons (Static)"
      code={`import { Fire } from "@iconkit/react/twemoji"

<Fire size={48} />`}
    >
      <div className="flex items-center justify-center py-4">
        <FlagPride16Filled
          size={128}
          colors={[
            "#ffffff",
            "#000000",
            "#ff4800",
            "#793131",
            "#0dff00",
            "#530dcd",
            "blue",
            "gray",
          ]}
        />
        <Icon3dCoordinateAxis
          size={128}
          colors={["#ffffff", "#000000", "#ff4800"]}
        />
      </div>
    </ExampleSection>
  );
}

/* ─── Example Section wrapper ─── */

function ExampleSection({
  title,
  code,
  children,
}: {
  title: string;
  code: string;
  children: React.ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={() => setShowCode(!showCode)}
          className="text-xs px-2.5 py-1 rounded-md transition-colors"
          style={{
            background: showCode ? "var(--accent)" : "var(--bg-secondary)",
            color: showCode ? "#fff" : "var(--text-muted)",
          }}
        >
          {showCode ? "Hide Code" : "Show Code"}
        </button>
      </div>

      {showCode && (
        <pre
          className="text-[11px] font-mono p-4 rounded-xl mb-4 overflow-x-auto"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-muted)",
          }}
        >
          {code}
        </pre>
      )}

      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {children}
      </div>
    </section>
  );
}
