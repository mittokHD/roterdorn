import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "strapi",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/admin/auth/login`,
        permanent: false,
      },
      {
        source: "/wp-admin",
        destination: `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/admin/auth/login`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
