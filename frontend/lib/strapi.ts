import type {
  Rezension,
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

  // Filters
  if (params.filters) {
    for (const [field, operators] of Object.entries(params.filters)) {
      for (const [op, val] of Object.entries(operators)) {
        parts.push(`filters[${field}][${op}]=${encodeURIComponent(val)}`);
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
  params?: { page?: number; pageSize?: number }
): Promise<StrapiResponse<Rezension>> {
  const query = buildQuery({
    populate: REZENSION_POPULATE,
    filters: { type: { $eq: type } },
    sort: "publishedAt:desc",
    pagination: { page: params?.page || 1, pageSize: params?.pageSize || 12 },
  });

  return fetchStrapi<StrapiResponse<Rezension>>(
    `/rezensionen?${query}`,
    { tags: ["rezensionen"] }
  );
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
  return `${getStrapiBaseUrl()}${url}`;
}
