import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "export",
  ...(isDev
    ? {}
    : {
        basePath: "/wedding-website",
        assetPrefix: "/wedding-website",
      }),
  env: {
    NEXT_PUBLIC_BASE_PATH: isDev ? "" : "/wedding-website",
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;