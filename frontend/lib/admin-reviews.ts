import { revalidatePath, revalidateTag } from "next/cache";
import { SITE_URL, STRAPI_API_TOKEN, STRAPI_INTERNAL_URL, STRAPI_WRITE_TOKEN } from "@/lib/config";
import { TYPE_META } from "@/lib/constants";
import { DETAIL_FIELDS } from "@/lib/admin-review-fields";
import { LEGACY_REVIEW_DETAILS } from "@/lib/legacy-review-details.generated";
import type { AdminAffiliateLink, Autor, Genre, Rezension, RezensionType, StrapiMedia, StrapiResponse, StrapiSingleResponse } from "@/lib/types";

const ADMIN_REVIEW_POPULATE = [
  "populate[cover]=true",
  "populate[autor][populate][avatar]=true",
  "populate[genres]=true",
  "populate[details]=true",
].join("&");

export interface AdminReviewSummary {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  type: RezensionType;
  updatedAt: string;
  publishedAt: string | null;
  lastEditedAt: string;
  cover: StrapiMedia | null;
  autor: Autor | null;
  genres: Genre[];
}

export interface AdminReviewSaveResult {
  documentId: string;
  editUrl: string;
  publicUrl: string;
  crosspostItem: {
    title: string;
    url: string;
    excerpt: string;
    imageUrl?: string;
    typeLabel: string;
  };
}

export async function getAdminRezensionen(): Promise<AdminReviewSummary[]> {
  const draftQuery = [
    ADMIN_REVIEW_POPULATE,
    "status=draft",
    "sort=updatedAt:desc",
    "pagination[pageSize]=200",
  ].join("&");
  const publishedQuery = [
    "fields[0]=documentId",
    "fields[1]=publishedAt",
    "pagination[pageSize]=200",
  ].join("&");

  const [draftResponse, publishedResponse] = await Promise.all([
    strapiFetch<StrapiResponse<Rezension>>(`/rezensionen?${draftQuery}`, { method: "GET" }),
    strapiFetch<StrapiResponse<Pick<Rezension, "documentId" | "publishedAt">>>(
      `/rezensionen?${publishedQuery}`,
      { method: "GET" },
    ),
  ]);
  const publishedByDocumentId = new Map(
    (publishedResponse.data || []).map((item) => [item.documentId, item.publishedAt]),
  );

  return (draftResponse.data || []).map((item) => {
    const publishedAt = publishedByDocumentId.get(item.documentId) || null;

    return {
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,
      type: item.type,
      updatedAt: item.updatedAt,
      publishedAt,
      lastEditedAt: resolveLastEditedAt(item, publishedAt),
      cover: item.cover,
      autor: item.autor,
      genres: item.genres || [],
    };
  });
}

export async function getAdminRezension(documentId: string): Promise<Rezension | null> {
  const draftResponse = await strapiFetch<StrapiSingleResponse<Rezension>>(
    `/rezensionen/${encodeURIComponent(documentId)}?${ADMIN_REVIEW_POPULATE}&status=draft`,
    { method: "GET" },
  );
  const published = await getPublishedRezension(documentId);
  const draft = draftResponse.data || null;

  return draft ? { ...draft, publishedAt: published?.publishedAt || null } : null;
}

export async function saveAdminRezension(formData: FormData, documentId?: string): Promise<AdminReviewSaveResult> {
  const title = getString(formData, "title");
  const type = getString(formData, "type") as RezensionType;
  const content = getString(formData, "content");
  const slug = slugify(getString(formData, "slug") || title);
  const publish = getString(formData, "publish") === "true";

  validateReviewInput({ title, type, content, slug });

  const genreIds = await getOrCreateGenreIds(splitList(getString(formData, "genres")));
  const autorId = await getOrCreateAutorId(getString(formData, "autor"));
  const coverId = await uploadCoverIfPresent(formData.get("cover"));
  const crosspostImageId = await uploadCoverIfPresent(formData.get("crosspostImage"));
  const details = buildDetailsPayload(type, formData);
  const extraDetails = buildExtraDetailRows(type, formData);
  const affiliateLinks = parseAffiliateLinks(getString(formData, "affiliateLinks"));
  const rating = parseOptionalNumber(getString(formData, "rating"));

  const data: Record<string, unknown> = {
    title,
    slug,
    type,
    content,
    details,
    extraDetails,
    affiliateLinks,
    rating,
    genres: genreIds,
    autor: autorId || null,
  };

  if (coverId) data.cover = coverId;

  const path = documentId
    ? `/rezensionen/${encodeURIComponent(documentId)}?status=${publish ? "published" : "draft"}`
    : `/rezensionen?status=${publish ? "published" : "draft"}`;

  const response = await strapiFetch<StrapiSingleResponse<Rezension>>(path, {
    method: documentId ? "PUT" : "POST",
    body: JSON.stringify({ data }),
  });

  const savedDocumentId = response.data.documentId;
  const saved = await getAdminRezension(savedDocumentId);
  if (!saved) throw new Error("Gespeicherter Beitrag konnte nicht erneut geladen werden.");

  revalidateAfterReviewWrite(saved);

  const meta = TYPE_META[saved.type];
  const publicUrl = `${SITE_URL}/${meta.slug}/${saved.slug}`;
  const coverUrl = saved.cover?.url ? toAbsoluteUrl(saved.cover.url) : undefined;
  const crosspostImageUrl = crosspostImageId ? await getMediaUrl(crosspostImageId) : undefined;

  return {
    documentId: savedDocumentId,
    editUrl: `/admin/beitraege/${savedDocumentId}/bearbeiten`,
    publicUrl,
    crosspostItem: {
      title: saved.title,
      url: publicUrl,
      excerpt: createExcerpt(saved.content),
      imageUrl: crosspostImageUrl || coverUrl,
      typeLabel: meta.label,
    },
  };
}

async function strapiFetch<T>(path: string, init: RequestInit): Promise<T> {
  const token = init.method === "GET" ? STRAPI_API_TOKEN || STRAPI_WRITE_TOKEN : STRAPI_WRITE_TOKEN || STRAPI_API_TOKEN;
  if (!token) throw new Error("Strapi API Token fehlt.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${STRAPI_INTERNAL_URL}/api${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Strapi-Anfrage fehlgeschlagen (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
}

async function getPublishedRezension(documentId: string) {
  try {
    const response = await strapiFetch<StrapiSingleResponse<Pick<Rezension, "documentId" | "publishedAt">>>(
      `/rezensionen/${encodeURIComponent(documentId)}?fields[0]=documentId&fields[1]=publishedAt`,
      { method: "GET" },
    );
    return response.data || null;
  } catch {
    return null;
  }
}

async function getMediaUrl(id: number) {
  try {
    const response = await strapiFetch<StrapiMedia>(
      `/upload/files/${id}`,
      { method: "GET" },
    );
    return response.url ? toAbsoluteUrl(response.url) : undefined;
  } catch {
    return undefined;
  }
}

async function getOrCreateGenreIds(names: string[]) {
  if (names.length === 0) return [];

  const response = await strapiFetch<StrapiResponse<Genre>>(
    "/genres?sort=name:asc&pagination[pageSize]=500",
    { method: "GET" },
  );
  const existing = new Map((response.data || []).map((genre) => [genre.name.trim().toLowerCase(), genre]));
  const ids: number[] = [];

  for (const name of names) {
    const key = name.toLowerCase();
    const found = existing.get(key);
    if (found) {
      ids.push(found.id);
      continue;
    }

    const created = await strapiFetch<StrapiSingleResponse<Genre>>("/genres", {
      method: "POST",
      body: JSON.stringify({ data: { name, slug: slugify(name) } }),
    });
    existing.set(key, created.data);
    ids.push(created.data.id);
  }

  return ids;
}

async function getOrCreateAutorId(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const response = await strapiFetch<StrapiResponse<Autor>>(
    "/autoren?sort=name:asc&pagination[pageSize]=500",
    { method: "GET" },
  );
  const found = (response.data || []).find((autor) => autor.name.trim().toLowerCase() === trimmed.toLowerCase());
  if (found) return found.id;

  const created = await strapiFetch<StrapiSingleResponse<Autor>>("/autoren", {
    method: "POST",
    body: JSON.stringify({ data: { name: trimmed } }),
  });

  return created.data.id;
}

async function uploadCoverIfPresent(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;

  const token = STRAPI_WRITE_TOKEN || STRAPI_API_TOKEN;
  if (!token) throw new Error("Strapi Write Token fehlt.");

  const uploadForm = new FormData();
  uploadForm.append("files", value, value.name);

  const response = await fetch(`${STRAPI_INTERNAL_URL}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: uploadForm,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Cover konnte nicht hochgeladen werden.");
  }

  const first = Array.isArray(payload) ? payload[0] : null;
  return typeof first?.id === "number" ? first.id : null;
}

function buildDetailsPayload(type: RezensionType, formData: FormData) {
  const detailId = parseOptionalNumber(getString(formData, "detailId"));
  const base: Record<string, unknown> = detailId ? { id: detailId } : {};

  if (type === "Buch") {
    return [{
      ...base,
      __component: "details.book-details",
      isbn: nullableString(getString(formData, "isbn")),
      pages: parseOptionalNumber(getString(formData, "pages")),
      publisher: nullableString(getString(formData, "publisher")),
      publishedDate: nullableString(getString(formData, "publishedDate")),
    }];
  }

  if (type === "Film") {
    return [{
      ...base,
      __component: "details.movie-details",
      fsk: nullableString(getString(formData, "fsk")),
      duration: parseOptionalNumber(getString(formData, "duration")),
      director: nullableString(getString(formData, "director")),
      releaseYear: parseOptionalNumber(getString(formData, "releaseYear")),
    }];
  }

  if (type === "Musik") {
    return [{
      ...base,
      __component: "details.music-details",
      artist: nullableString(getString(formData, "artist")),
      label: nullableString(getString(formData, "label")),
      tracks: parseOptionalNumber(getString(formData, "tracks")),
      releaseYear: parseOptionalNumber(getString(formData, "releaseYear")),
    }];
  }

  if (type === "Event") {
    return [{
      ...base,
      __component: "details.event-details",
      location: nullableString(getString(formData, "location")),
      eventDate: nullableString(getString(formData, "eventDate")),
      organizer: nullableString(getString(formData, "organizer")),
    }];
  }

  return [{
    ...base,
    __component: "details.game-details",
    platform: nullableString(getString(formData, "platform")),
    developer: nullableString(getString(formData, "developer")),
    publisher: nullableString(getString(formData, "publisher")),
    releaseYear: parseOptionalNumber(getString(formData, "releaseYear")),
  }];
}

function buildExtraDetailRows(type: RezensionType, formData: FormData) {
  return DETAIL_FIELDS[type]
    .map((field) => {
      const value = getString(formData, field.name);
      if (!value) return null;

      if (field.input === "url") {
        return {
          label: field.label,
          values: [{ label: value, href: value }],
        };
      }

      const labels = field.input === "textarea"
        ? [value]
        : value.split(",").map((item) => item.trim()).filter(Boolean);

      return {
        label: field.label,
        values: labels.map((label) => ({ label })),
      };
    })
    .filter(Boolean);
}

function parseAffiliateLinks(value: string): AdminAffiliateLink[] {
  if (!value) return [];

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelPart, urlPart] = line.split("|").map((part) => part.trim());
      const url = urlPart || labelPart;
      if (!isHttpUrl(url)) return null;

      return {
        label: urlPart ? labelPart || "Affiliate-Link" : "Affiliate-Link",
        url,
        provider: url.includes("amazon.") ? "Amazon" : undefined,
      };
    })
    .filter(Boolean) as AdminAffiliateLink[];
}

function validateReviewInput(input: { title: string; type: string; content: string; slug: string }) {
  const validTypes: RezensionType[] = ["Buch", "Film", "Musik", "Spiel", "Event"];

  if (input.title.length < 2) throw new Error("Titel muss mindestens 2 Zeichen lang sein.");
  if (!validTypes.includes(input.type as RezensionType)) throw new Error("Ungültiger Beitragstyp.");
  if (input.content.length < 10) throw new Error("Inhalt muss mindestens 10 Zeichen lang sein.");
  if (!input.slug) throw new Error("Slug fehlt.");
}

function revalidateAfterReviewWrite(rezension: Rezension) {
  const meta = TYPE_META[rezension.type];

  revalidateTag("rezensionen", "max");
  revalidateTag("genres", "max");
  revalidatePath("/");
  revalidatePath(`/${meta.slug}`);
  revalidatePath(`/${meta.slug}/${rezension.slug}`);
  revalidatePath("/suche");
  revalidatePath("/admin/beitraege");
}

function resolveLastEditedAt(rezension: Rezension, publishedAt: string | null) {
  const legacyDate = LEGACY_REVIEW_DETAILS[rezension.slug]?.publishedAt;
  const importedAt = new Date(rezension.updatedAt).getTime();
  const importCleanupCutoff = new Date("2026-05-14T00:00:00.000Z").getTime();

  if (legacyDate && importedAt < importCleanupCutoff) return legacyDate;
  return rezension.updatedAt || publishedAt || legacyDate || rezension.createdAt;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, all) => all.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index);
}

function parseOptionalNumber(value: string) {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function nullableString(value: string) {
  return value || null;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createExcerpt(html?: string | null) {
  if (!html) return "";

  return html
    .replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function toAbsoluteUrl(url: string) {
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url.replace(/^\/+/, "")}`;
}
