import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — otherwise Turbopack walks up and finds a
  // stray lockfile in the home directory.
  turbopack: { root: path.resolve(".") },

  images: {
    // All photography is served from /public/images. To use a CDN instead,
    // add a remotePatterns entry here and point src at the remote URL.
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;
