import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};
  eslint: {
    // Skip ESLint errors during the production build on Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
