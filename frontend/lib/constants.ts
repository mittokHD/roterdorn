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

export interface NavSubcategory {
  label: string;
  href: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  subcategories: NavSubcategory[];
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

/** Ordered list of all supported review types. */
export const ALL_TYPES: RezensionType[] = ["Buch", "Film", "Musik", "Spiel", "Event"];

/** Review categories shown in the public navigation and category grid. */
export const CATEGORY_TYPES: RezensionType[] = ["Buch", "Film", "Musik", "Spiel", "Event"];

export const TYPE_SUBCATEGORIES: Partial<Record<RezensionType, string[]>> = {
  Buch: [
    "Belletristik",
    "Comic",
    "Englische Bücher",
    "Fachliteratur",
    "Hörbuch",
    "Kinder- und Jugendbuch",
  ],
  Film: ["Spielfilm", "Serie"],
  Musik: ["Label", "Musikgenre", "Musiker"],
  Spiel: ["Brettspiel", "Kartenspiel", "PC / Konsole", "Rollenspiel", "Tabletop", "Würfelspiel"],
  Event: ["Veranstaltungen", "Konzert", "Lesung", "Theater"],
};

const subcategoryHref = (type: RezensionType, label: string) =>
  type === "Musik"
    ? `/${TYPE_META[type].slug}?liste=${encodeURIComponent(label.toLowerCase())}`
    : `/${TYPE_META[type].slug}?genre=${encodeURIComponent(label)}`;

/** Category navigation items derived from TYPE_META */
export const CATEGORY_NAV_ITEMS: NavItem[] = CATEGORY_TYPES.map((t) => ({
  href: `/${TYPE_META[t].slug}`,
  label: TYPE_META[t].labelPlural,
  icon: TYPE_META[t].icon,
  subcategories: TYPE_SUBCATEGORIES[t]?.map((label) => ({
    label,
    href: subcategoryHref(t, label),
  })) || [],
}));

/** Editorial sections from the legacy mini database. */
export const EDITORIAL_NAV_ITEMS: NavItem[] = [
  {
    href: "/neuigkeiten",
    label: "Neuigkeiten",
    icon: "📰",
    subcategories: [],
  },
  {
    href: "/artikel",
    label: "Artikel",
    icon: "✍️",
    subcategories: [],
  },
  {
    href: "/interview",
    label: "Interviews",
    icon: "🎙️",
    subcategories: [],
  },
];

/** Primary header navigation. */
export const NAV_ITEMS: NavItem[] = [
  ...CATEGORY_NAV_ITEMS,
  ...EDITORIAL_NAV_ITEMS,
  {
    href: "/ueber-uns",
    label: "Über uns",
    icon: "👥",
    subcategories: [],
  },
];
