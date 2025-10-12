import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only tweaks to keep memory usage in check
  webpack: (config, { dev }) => {
    if (dev) {
      // Optional: disable source maps in dev (big memory saver)
      if (process.env.NEXT_DEV_DISABLE_SOURCEMAPS === "1") {
        // Disables devtool entirely
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config as any).devtool = false;
      }

      // Optional: turn off webpack cache in dev (reduces memory, slower rebuilds)
      if (process.env.NEXT_DEV_DISABLE_CACHE === "1") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config as any).cache = false;
      }

      // Reduce file watchers by ignoring heavy folders
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const watchOptions = (config as any).watchOptions || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config as any).watchOptions = {
        ...watchOptions,
        ignored: [
          "**/.git/**",
          "**/.next/**",
          "**/node_modules/**",
          // Ignore large static folders if hot-reload on assets isn't critical
          // Comment this out if you need to edit assets and see them update live
          "**/public/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
