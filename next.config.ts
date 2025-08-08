import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal configuration for development
  compress: false,
  poweredByHeader: false,
  
  // Simplified image config
  images: {
    dangerouslyAllowSVG: true,
  },

  // No experimental features for now
  experimental: {},

  // No complex webpack config
  eslint: {
    // Allow builds to succeed even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;