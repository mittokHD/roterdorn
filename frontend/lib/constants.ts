// ─── Shared Constants ────────────────────────
// Centralized category/type metadata used across the app.
// Import from "@/lib/constants" to avoid duplication.

import type { RezensionType } from "./types";

/**
 * Complete metadata for each RezensionType.
 * Single source of truth for icon, label, description, slug, and color.
 */
export interface TypeMeta {
  type: RezensionType;
  slug: string;
  label: string;
  labelPlural: string;
  icon: string;
  description: string;
  color: string;
  bg: string;
}

export const TYPE_META: Record<RezensionType, TypeMeta> = {
  Buch: {
    type: "Buch",
    slug: "buch",
    label: "Buch",
    labelPlural: "Bücher",
    icon: "📚",
    description: "Romane, Sachbücher, Comics",
    color: "#818cf8",
    bg: "rgba(129, 140, 248, 0.12)",
  },
  Film: {
    type: "Film",
    slug: "film",
    label: "Film",
    labelPlural: "Filme",
    icon: "🎬",
    description: "Kino, Streaming, Dokus",
    color: "#f472b6",
    bg: "rgba(244, 114, 182, 0.12)",
  },
  Musik: {
    type: "Musik",
    slug: "musik",
    label: "Musik",
    labelPlural: "Musik",
    icon: "🎵",
    description: "Alben, Singles, Live",
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.12)",
  },
  Spiel: {
    type: "Spiel",
    slug: "spiel",
    label: "Spiel",
    labelPlural: "Spiele",
    icon: "🎮",
    description: "PC, Konsole, Tabletop",
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.12)",
  },
  Event: {
    type: "Event",
    slug: "event",
    label: "Event",
    labelPlural: "Events",
    icon: "🎪",
    description: "Konzerte, Messen, Festivals",
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.12)",
  },
};

/** Ordered list of all types for navigation, grids, etc. */
export const ALL_TYPES: RezensionType[] = ["Buch", "Film", "Musik", "Spiel", "Event"];

/** Navigation items derived from TYPE_META */
export const NAV_ITEMS = ALL_TYPES.map((t) => ({
  href: `/${TYPE_META[t].slug}`,
  label: TYPE_META[t].labelPlural,
  icon: TYPE_META[t].icon,
}));

// ─── Formatting Helpers ──────────────────────

/**
 * Format an ISO date string for German locale display.
 */
export function formatDate(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
): string {
  return new Date(isoDate).toLocaleDateString("de-DE", options);
}

/**
 * Format a short date (e.g. "3. Apr. 2026").
 */
export function formatDateShort(isoDate: string): string {
  return formatDate(isoDate, { day: "numeric", month: "short", year: "numeric" });
}
