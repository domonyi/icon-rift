import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TopNav } from "@/components/TopNav";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} min-h-screen antialiased`}>
        <TopNav />
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}
