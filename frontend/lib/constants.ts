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
  className: string;
}

export const TYPE_META: Record<RezensionType, TypeMeta> = {
  Buch: {
    type: "Buch",
    slug: "buch",
    label: "Buch",
    labelPlural: "Bücher",
    icon: "📚",
    description: "Romane, Sachbücher, Comics",
    className: "text-indigo-400 bg-indigo-500/10 border-indigo-400/20",
  },
  Film: {
    type: "Film",
    slug: "film",
    label: "Film",
    labelPlural: "Filme",
    icon: "🎬",
    description: "Kino, Streaming, Dokus",
    className: "text-pink-400 bg-pink-500/10 border-pink-400/20",
  },
  Musik: {
    type: "Musik",
    slug: "musik",
    label: "Musik",
    labelPlural: "Musik",
    icon: "🎵",
    description: "Alben, Singles, Live",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-400/20",
  },
  Spiel: {
    type: "Spiel",
    slug: "spiel",
    label: "Spiel",
    labelPlural: "Spiele",
    icon: "🎮",
    description: "PC, Konsole, Tabletop",
    className: "text-blue-400 bg-blue-500/10 border-blue-400/20",
  },
  Event: {
    type: "Event",
    slug: "event",
    label: "Event",
    labelPlural: "Events",
    icon: "🎪",
    description: "Konzerte, Messen, Festivals",
    className: "text-amber-400 bg-amber-500/10 border-amber-400/20",
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
