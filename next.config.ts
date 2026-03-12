import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  allowedDevOrigins: [
    '192.168.1.37',
    '192.168.1.37:3000',
    'http://192.168.1.37:3000',
    'localhost:3000'
  ],
};

export default nextConfig;
