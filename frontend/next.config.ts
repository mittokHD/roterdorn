import type { NextConfig } from "next";

// Parse the Strapi URL to extract protocol, hostname, and port for image remotePatterns
const strapiUrl = new URL(process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: strapiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: strapiUrl.hostname,
        port: strapiUrl.port,
        pathname: "/uploads/**",
      },
      {
        // Internal Docker hostname for server-side image optimization
        protocol: "http",
        hostname: "strapi",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
  async redirects() {
    const adminUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/admin/auth/login`;
    return [
      {
        source: "/admin",
        destination: adminUrl,
        permanent: false,
      },
      {
        source: "/wp-admin",
        destination: adminUrl,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
