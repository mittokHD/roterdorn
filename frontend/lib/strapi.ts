import type {
  Rezension,
  StrapiResponse,
  StrapiSingleResponse,
  RezensionType,
} from "./types";

// ─── Configuration ───────────────────────────

// On the server (Docker), we use the internal Docker hostname. On the client, we use the public URL.
const STRAPI_URL = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// ─── Base Fetch ──────────────────────────────

interface FetchOptions {
  tags?: string[];
  revalidate?: number;
}

async function fetchStrapi<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  const res = await fetch(url, {
    headers,
    next: {
      tags: options.tags || [],
      ...(options.revalidate !== undefined
        ? { revalidate: options.revalidate }
        : {}),
    },
  });

  if (!res.ok) {
    console.error(`Strapi fetch error: ${res.status} ${res.statusText} — ${url}`);
    throw new Error(`Failed to fetch from Strapi: ${res.status}`);
  }

  return res.json();
}

// ─── Rezensionen ─────────────────────────────

/** Shared populate query for Rezension — resolves cover, autor, genres, kommentare, and dynamic zone details */
const REZENSION_POPULATE =
  "populate[cover]=true" +
  "&populate[autor][populate][avatar]=true" +
  "&populate[genres]=true" +
  "&populate[kommentare]=true" +
  "&populate[details]=true";

export async function getRezensionen(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
}): Promise<StrapiResponse<Rezension>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 12;
  const sort = params?.sort || "publishedAt:desc";

  return fetchStrapi<StrapiResponse<Rezension>>(
    `/rezensionen?${REZENSION_POPULATE}&sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
    { tags: ["rezensionen"] }
  );
}

export async function getRezensionenByType(
  type: RezensionType,
  params?: { page?: number; pageSize?: number }
): Promise<StrapiResponse<Rezension>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 12;

  return fetchStrapi<StrapiResponse<Rezension>>(
    `/rezensionen?${REZENSION_POPULATE}&filters[type][$eq]=${type}&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
    { tags: ["rezensionen"] }
  );
}

export async function getRezensionBySlug(
  slug: string
): Promise<StrapiSingleResponse<Rezension[]>> {
  return fetchStrapi<StrapiSingleResponse<Rezension[]>>(
    `/rezensionen?${REZENSION_POPULATE}&filters[slug][$eq]=${slug}`,
    { tags: ["rezensionen"] }
  );
}

export async function searchRezensionen(
  query: string,
  params?: { page?: number; pageSize?: number }
): Promise<StrapiResponse<Rezension>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 12;

  return fetchStrapi<StrapiResponse<Rezension>>(
    `/rezensionen?${REZENSION_POPULATE}&filters[title][$containsi]=${encodeURIComponent(query)}&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
    { tags: ["rezensionen"] }
  );
}

// ─── Helpers ─────────────────────────────────

/**
 * Build the full URL for a Strapi media asset.
 * Strapi may return either a relative or absolute URL.
 */
export function getStrapiMediaUrl(url: string | undefined | null): string {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http")) return url;
  // In the browser, use the public STRAPI_URL (localhost:1337)
  // On the server, use the internal Docker hostname
  const base =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
      : STRAPI_URL;
  return `${base}${url}`;
}
