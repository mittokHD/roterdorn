import type {
  Rezension,
  Genre,
  StrapiResponse,
  StrapiSingleResponse,
  RezensionType,
} from "./types";
import {
  STRAPI_INTERNAL_URL,
  STRAPI_API_TOKEN,
  getStrapiBaseUrl,
} from "./config";

// ─── Strapi Query Builder ────────────────────

/**
 * Builds a Strapi REST API query string from structured params.
 * Replaces fragile manual string concatenation with a type-safe builder.
 */
function buildQuery(params: {
  populate?: Record<string, boolean | Record<string, boolean>>;
  filters?: Record<string, Record<string, string>>;
  sort?: string;
  pagination?: { page: number; pageSize: number };
}): string {
  const parts: string[] = [];

  // Populate
  if (params.populate) {
    for (const [key, value] of Object.entries(params.populate)) {
      if (typeof value === "object") {
        for (const [subKey, subVal] of Object.entries(value)) {
          parts.push(`populate[${key}][populate][${subKey}]=${subVal}`);
        }
      } else {
        parts.push(`populate[${key}]=${value}`);
      }
    }
  }

  // Filters — supports dot-notation keys for relations, e.g. "genres.name" -> filters[genres][name]
  if (params.filters) {
    for (const [field, operators] of Object.entries(params.filters)) {
      const fieldKey = field.split(".").map((f) => `[${f}]`).join("");
      for (const [op, val] of Object.entries(operators)) {
        parts.push(`filters${fieldKey}[${op}]=${encodeURIComponent(val)}`);
      }
    }
  }

  // Sort
  if (params.sort) {
    parts.push(`sort=${params.sort}`);
  }

  // Pagination
  if (params.pagination) {
    parts.push(`pagination[page]=${params.pagination.page}`);
    parts.push(`pagination[pageSize]=${params.pagination.pageSize}`);
  }

  return parts.join("&");
}

/** Standard populate config for Rezensionen — cover, autor+avatar, genres, kommentare, details */
const REZENSION_POPULATE: Record<string, boolean | Record<string, boolean>> = {
  cover: true,
  autor: { avatar: true },
  genres: true,
  kommentare: true,
  details: true,
};

// ─── Base Fetch ──────────────────────────────

interface FetchOptions {
  tags?: string[];
  revalidate?: number;
}

async function fetchStrapi<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${STRAPI_INTERNAL_URL}/api${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_API_TOKEN}`;
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

export async function getRezensionen(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
}): Promise<StrapiResponse<Rezension>> {
  const query = buildQuery({
    populate: REZENSION_POPULATE,
    sort: params?.sort || "publishedAt:desc",
    pagination: { page: params?.page || 1, pageSize: params?.pageSize || 12 },
  });

  return fetchStrapi<StrapiResponse<Rezension>>(
    `/rezensionen?${query}`,
    { tags: ["rezensionen"] }
  );
}

export async function getRezensionenByType(
  type: RezensionType,
  params?: { page?: number; pageSize?: number; sort?: string; genre?: string }
): Promise<StrapiResponse<Rezension>> {
  const filters: Record<string, Record<string, string>> = {
    type: { $eq: type },
  };
  if (params?.genre) {
    filters["genres.name"] = { $containsi: params.genre };
  }

  const query = buildQuery({
    populate: REZENSION_POPULATE,
    filters,
    sort: params?.sort || "publishedAt:desc",
    pagination: { page: params?.page || 1, pageSize: params?.pageSize || 100 },
  });

  return fetchStrapi<StrapiResponse<Rezension>>(
    `/rezensionen?${query}`,
    { tags: ["rezensionen"] }
  );
}

export async function getSimilarRezensionen(
  type: RezensionType,
  currentSlug: string,
  limit = 4
): Promise<StrapiResponse<Rezension>> {
  const query = buildQuery({
    populate: REZENSION_POPULATE,
    filters: {
      type: { $eq: type },
      slug: { $ne: currentSlug },
    },
    sort: "rating:desc",
    pagination: { page: 1, pageSize: limit },
  });

  return fetchStrapi<StrapiResponse<Rezension>>(
    `/rezensionen?${query}`,
    { tags: ["rezensionen"] }
  );
}

export async function getGenres(): Promise<Genre[]> {
  try {
    const data = await fetchStrapi<StrapiResponse<Genre>>(
      `/genres?sort=name:asc&pagination[pageSize]=100`,
      { tags: ["genres"], revalidate: 3600 }
    );
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getRezensionBySlug(
  slug: string
): Promise<StrapiSingleResponse<Rezension[]>> {
  const query = buildQuery({
    populate: REZENSION_POPULATE,
    filters: { slug: { $eq: slug } },
  });

  return fetchStrapi<StrapiSingleResponse<Rezension[]>>(
    `/rezensionen?${query}`,
    { tags: ["rezensionen"] }
  );
}

export async function searchRezensionen(
  searchQuery: string,
  params?: { page?: number; pageSize?: number }
): Promise<StrapiResponse<Rezension>> {
  const query = buildQuery({
    populate: REZENSION_POPULATE,
    filters: { title: { $containsi: searchQuery } },
    sort: "publishedAt:desc",
    pagination: { page: params?.page || 1, pageSize: params?.pageSize || 12 },
  });

  return fetchStrapi<StrapiResponse<Rezension>>(
    `/rezensionen?${query}`,
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
  
  // Wir geben relative URLs (z.B. /uploads/...) zurück, damit sie über den 
  // Next.js Rewrite in next.config.ts direkt durch den Proxy laufen.
  // Das verhindert den strengen "resolved to private ip" Block in Next.js 14+
  return url;
}
