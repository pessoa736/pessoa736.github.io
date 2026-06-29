import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // Thumbnails vêm do GitHub Pages (pessoa736.github.io/<repo>/).
    // Em modo estático, `next/image` normalmente é limitado — mas como usamos
    // background-image em CSS, isso não bloqueia.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pessoa736.github.io",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
