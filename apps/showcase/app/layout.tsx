import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IconRift — 300,000+ Open Source Icons",
  description:
    "Browse 224 icon sets with 300,000+ icons. A comprehensive icon library for developers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
