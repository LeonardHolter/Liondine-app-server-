import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable static page generation for API routes
  experimental: {
    // Ensure API routes are always dynamic
  },
  // Don't try to statically optimize API routes
  output: 'standalone',
};

export default nextConfig;
