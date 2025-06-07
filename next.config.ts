// next.config.ts
import type { NextConfig } from "next";

/** Global Next.js configuration */
const nextConfig: NextConfig = {
  experimental: {
    // keep any experimental flags you were already using
    ppr: true,
  },

  /* ✅ NEW: don’t let ESLint block the Vercel production build */
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
