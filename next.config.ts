import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'mammoth'], // New top-level key (Next.js 15+)
};

export default nextConfig;