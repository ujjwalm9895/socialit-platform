/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = { ignored: ["**/node_modules", "**/.git"] };
    }
    return config;
  },
};

module.exports = nextConfig;
