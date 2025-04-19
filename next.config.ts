import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['tech0gen8step4bicstorage.blob.core.windows.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tech0gen8step4bicstorage.blob.core.windows.net',
        port: '',
        pathname: '/bic-storage/product/**',
      },
    ],
  },
};

export default nextConfig;
