import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — otherwise Turbopack walks up and finds a
  // stray lockfile in the home directory.
  turbopack: { root: path.resolve(".") },

  // Stop `next dev` writing AGENTS.md and CLAUDE.md into the repo root.
  agentRules: false,

  images: {
    // All photography is served from /public/images. To use a CDN instead,
    // add a remotePatterns entry here and point src at the remote URL.
    formats: ["image/avif", "image/webp"],
    // 75 is the default for everything; 90 is for photographs that fill the
    // screen (the Home hero), where 75 smears a night photo's detail.
    qualities: [75, 90],
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;
