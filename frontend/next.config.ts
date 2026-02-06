import type { NextConfig } from "next";
import path from "path";
import { existsSync } from "fs";

// When Vercel runs from repo root (no Root Directory), cwd is repo root and app lives in frontend/
const inMonorepo = existsSync(path.join(process.cwd(), "frontend", "lib"));
const appRoot = inMonorepo ? path.join(process.cwd(), "frontend") : process.cwd();

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,

  // Must match turbopack.root (Next.js requirement when using turbopack.root)
  outputFileTracingRoot: appRoot,

  turbopack: {
    root: appRoot,
    resolveAlias: {
      // Use "." so @ resolves relative to turbopack.root (works on Vercel)
      "@": ".",
    },
  },
  // Ensure webpack (fallback) also resolves @ when used
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": appRoot,
    };
    return config;
  },

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Compress responses
  compress: true,
};

export default nextConfig;
