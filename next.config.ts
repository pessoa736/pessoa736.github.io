import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      if (process.env.NEXT_DEV_DISABLE_SOURCEMAPS === "1") {
        (config as any).devtool = false;
      }

      if (process.env.NEXT_DEV_DISABLE_CACHE === "1") {
        (config as any).cache = false;
      }

      // Reduce file watchers by ignoring heavy folders
      const watchOptions = (config as any).watchOptions || {};
      (config as any).watchOptions = {
        ...watchOptions,
        ignored: [
          "**/.git/**",
          "**/.next/**",
          "**/node_modules/**",
          "**/public/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
