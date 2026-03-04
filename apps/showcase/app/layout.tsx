import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "IconKit — 327,000+ Open Source Icons",
  description:
    "Browse 224 icon sets with 327,000+ icons. A comprehensive icon library for developers.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
