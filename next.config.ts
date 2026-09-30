import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships WASM and data files that must be loaded from node_modules at runtime.
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  // SQL migrations are applied at runtime on first connection.
  outputFileTracingIncludes: { "/**": ["./drizzle/**"] },
};

export default nextConfig;
