import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Compress responses
  compress: true,
  
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  // Turbopack handles code splitting and optimization automatically
  turbopack: {
    // Turbopack optimizations are handled automatically
    // No manual configuration needed for most use cases
  },
};

export default nextConfig;
