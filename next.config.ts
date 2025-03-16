/* eslint-disable @typescript-eslint/no-unused-vars */
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
        destination: "/invite/:referralCode",
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.module.noParse = config.module.noParse || [];
    config.module.noParse.push(/core-js[\\/]modules[\\/]es\.regexp\.exec\.js/);
    return config;
  },
};

export default nextConfig;
// ```

// After saving, try building your application again.// filepath: c:\Users\user\Desktop\deemax_v\next.config.ts
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   experimental: {},
//   env: {
//     FLW_PUBLIC_KEY: process.env.FLW_PUBLIC_KEY, // Pass to the client/server
//     FLW_SECRET_KEY: process.env.FLW_SECRET_KEY, // Server-side only
//   },
//   async rewrites() {
//     return [
//       {
//         source: "/invite/:referralCode",
//         destination: "/invite/:referralCode",
//       },
//     ];
//   },
//   webpack: (config, { isServer }) => {
//     config.module.noParse = config.module.noParse || [];
//     config.module.noParse.push(/core-js[\\/]modules[\\/]es\.regexp\.exec\.js/);
//     return config;
//   },
// };

// export default nextConfig;
// ```

// After saving, try building your application again.
