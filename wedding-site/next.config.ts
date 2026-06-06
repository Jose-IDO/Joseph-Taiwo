import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/wedding-website-",
  assetPrefix: "/wedding-website-",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;