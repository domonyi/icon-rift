import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@iconrift/core", "@iconrift/react"],
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  devIndicators: false,
}

export default nextConfig
