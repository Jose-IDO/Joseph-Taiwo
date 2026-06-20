import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const basePath = "/wedding-website-";

const nextConfig: NextConfig = {
  output: "export",
  ...(isDev
    ? {}
    : {
        basePath,
        assetPrefix: basePath,
      }),
  env: {
    NEXT_PUBLIC_BASE_PATH: isDev ? "" : basePath,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;