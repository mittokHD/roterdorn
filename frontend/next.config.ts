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
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://strapi:1337/uploads/:path*",
      },
    ];
  },
  async redirects() {
    const adminUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/admin/auth/login`;
    return [
      {
        source: "/strapi-admin",
        destination: adminUrl,
        permanent: false,
      },
      {
        source: "/wp-admin",
        destination: adminUrl,
        permanent: false,
      },
      {
        source: "/events",
        destination: "/event",
        permanent: true,
      },
      {
        source: "/veranstaltung",
        destination: "/event?genre=Veranstaltungen",
        permanent: true,
      },
      {
        source: "/veranstaltung/:slug*",
        destination: "/event/:slug*",
        permanent: true,
      },
      {
        source: "/veranstaltungen",
        destination: "/event?genre=Veranstaltungen",
        permanent: true,
      },
      {
        source: "/veranstaltungen/:slug*",
        destination: "/event/:slug*",
        permanent: true,
      },
      {
        source: "/konzert",
        destination: "/event?genre=Konzert",
        permanent: true,
      },
      {
        source: "/konzert/:slug*",
        destination: "/event/:slug*",
        permanent: true,
      },
      {
        source: "/lesung",
        destination: "/event?genre=Lesung",
        permanent: true,
      },
      {
        source: "/lesung/:slug*",
        destination: "/event/:slug*",
        permanent: true,
      },
      {
        source: "/theater",
        destination: "/event?genre=Theater",
        permanent: true,
      },
      {
        source: "/theater/:slug*",
        destination: "/event/:slug*",
        permanent: true,
      },
      {
        source: "/news",
        destination: "/neuigkeiten",
        permanent: true,
      },
      {
        source: "/category/news",
        destination: "/neuigkeiten",
        permanent: true,
      },
      {
        source: "/category/artikel",
        destination: "/artikel",
        permanent: true,
      },
      {
        source: "/category/interview",
        destination: "/interview",
        permanent: true,
      },
      {
        source: "/impressum/datenschutz",
        destination: "/datenschutz",
        permanent: true,
      },
      {
        source: "/impressung",
        destination: "/impressum",
        permanent: true,
      },
      {
        source: "/impressung/datenschutz",
        destination: "/datenschutz",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
