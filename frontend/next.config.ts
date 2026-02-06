import type { NextConfig } from "next";
import path from "path";

// Resolve @ to app root (works when cwd is frontend, e.g. Vercel Root Directory = frontend)
const appRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,

  turbopack: {
    root: appRoot,
    resolveAlias: {
      "@": appRoot,
    },
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
