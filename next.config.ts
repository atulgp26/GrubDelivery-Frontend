import type { NextConfig } from "next";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveApiProxyTarget(): string {
  const explicit = process.env.API_PROXY_TARGET?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (apiBase) {
    const origin = stripTrailingSlash(apiBase).replace(/\/api\/v1$/i, "");
    if (origin) return origin;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:8000";
  }

  throw new Error(
    "API_PROXY_TARGET or NEXT_PUBLIC_API_BASE_URL is required in production builds",
  );
}

const apiProxyTarget = resolveApiProxyTarget();

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
