import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {},
  env: {
    FLW_PUBLIC_KEY: process.env.FLW_PUBLIC_KEY, // Pass to the client/server
    FLW_SECRET_KEY: process.env.FLW_SECRET_KEY, // Server-side only
  },
  async rewrites() {
    return [
      {
        source: "/invite/:referralCode",
        destination: "/invite/:referralCode", // Ensure rewrites aren't interfering
      },
    ];
  },
};

export default nextConfig;
