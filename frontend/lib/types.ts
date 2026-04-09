// ─── Strapi Media ────────────────────────────
export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  name: string;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
}

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

// ─── Content Types ───────────────────────────

export type RezensionType = "Buch" | "Film" | "Musik" | "Spiel" | "Event";

export interface Rezension {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  rating: number;
  type: RezensionType;
  cover: StrapiMedia | null;
  autor: Autor | null;
  genres: Genre[];
  kommentare: Kommentar[];
  details: DetailComponent[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Autor {
  id: number;
  documentId: string;
  name: string;
  bio: string | null;
  avatar: StrapiMedia | null;
}

export interface Genre {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface Kommentar {
  id: number;
  documentId: string;
  name: string;
  text: string;
  isApproved: boolean;
  createdAt: string;
}

// ─── Dynamic Zone Components ─────────────────

export interface BookDetails {
  __component: "details.book-details";
  id: number;
  isbn: string | null;
  pages: number | null;
  publisher: string | null;
  publishedDate: string | null;
}

export interface MovieDetails {
  __component: "details.movie-details";
  id: number;
  fsk: string | null;
  duration: number | null;
  director: string | null;
  releaseYear: number | null;
}

export interface GameDetails {
  __component: "details.game-details";
  id: number;
  platform: string | null;
  developer: string | null;
  publisher: string | null;
  releaseYear: number | null;
}

export interface MusicDetails {
  __component: "details.music-details";
  id: number;
  artist: string | null;
  label: string | null;
  tracks: number | null;
  releaseYear: number | null;
}

export interface EventDetails {
  __component: "details.event-details";
  id: number;
  location: string | null;
  eventDate: string | null;
  organizer: string | null;
}

export type DetailComponent =
  | BookDetails
  | MovieDetails
  | GameDetails
  | MusicDetails
  | EventDetails;

// ─── Strapi API Response Wrappers ────────────

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: StrapiPagination;
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, never>;
}

// ─── URL Slug Mapping ────────────────────────

export const TYPE_SLUG_MAP: Record<string, RezensionType> = {
  buch: "Buch",
  film: "Film",
  musik: "Musik",
  spiel: "Spiel",
  event: "Event",
};

export const TYPE_REVERSE_MAP: Record<RezensionType, string> = {
  Buch: "buch",
  Film: "film",
  Musik: "musik",
  Spiel: "spiel",
  Event: "event",
};

export const TYPE_LABELS: Record<RezensionType, string> = {
  Buch: "Bücher",
  Film: "Filme",
  Musik: "Musik",
  Spiel: "Spiele",
  Event: "Events",
};
