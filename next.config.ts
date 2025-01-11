import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {},
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
