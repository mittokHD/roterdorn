// ─── Centralized Environment Configuration ──
// Single source of truth for all environment variables in the frontend.
// Import from "@/lib/config" instead of accessing process.env directly.

/**
 * Internal Strapi URL for server-side requests (Docker inter-container).
 * Falls back to the public URL if not set.
 */
export const STRAPI_INTERNAL_URL =
  process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * Public Strapi URL for client-side and redirect URLs.
 */
export const STRAPI_PUBLIC_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * Resolve the correct Strapi base URL depending on execution context.
 * - Server-side (SSR/API routes): Use internal Docker hostname.
 * - Client-side (browser): Use public URL.
 */
export function getStrapiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return STRAPI_PUBLIC_URL;
  }
  return STRAPI_INTERNAL_URL;
}

/**
 * Read-only API token for fetching published content from Strapi.
 */
export const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Write token for creating content (e.g. comments) via Strapi API.
 */
export const STRAPI_WRITE_TOKEN = process.env.STRAPI_WRITE_TOKEN;

/**
 * Webhook secret used to authenticate Strapi → Next.js revalidation calls.
 */
export const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

/**
 * Public site URL used for SEO (sitemap, robots.txt, Open Graph).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://roterdorn.de";
