import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const envPath = path.join(rootDir, ".env");

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(envPath);
  } catch {
    // Local Docker defaults below are enough for this generated data export.
  }
}

const {
  MYSQL_HOST: DB_HOST = "127.0.0.1",
  MYSQL_USER: DB_USER = "root",
  MYSQL_PASSWORD: DB_PASSWORD = "root",
  MYSQL_DATABASE: DB_NAME = "wp_legacy",
  MYSQL_PORT: DB_PORT = 3308,
} = process.env;

const POST_TYPES = ["post", "buch", "film", "musik", "spiel", "event"];

const taxonomyLabels = {
  buchkategorie: "Kategorie",
  buchautor: "Autor",
  herausgeber: "Herausgeber",
  zeichner: "Zeichner",
  buchsprecher: "Sprecher",
  buchverlag: "Verlag",
  buchgenre: "Genre",
  filmkategorie: "Kategorie",
  darsteller: "Darsteller",
  regie: "Regie",
  filmstudio: "Filmstudio",
  filmgenre: "Genre",
  serie: "Serie",
  spielkategorie: "Kategorie",
  spielautor: "Autor",
  publisher: "Verlag / Publisher",
  spielentwickler: "Entwickler",
  spielgenre: "Genre",
  releasekategorie: "Kategorie",
  musiker: "Musiker",
  label: "Label",
  musikgenre: "Genre",
};

const typeMap = {
  buch: "Buch",
  film: "Film",
  musik: "Musik",
  spiel: "Spiel",
  event: "Event",
};

const categoryTypeMap = {
  35: "Film",
  3: "Musik",
  37: "Spiel",
  5: "Event",
};

const eventCategoryIds = new Set([5, 1387, 2426, 3373]);

const rowsByPostType = {
  buch: [
    "buchkategorie",
    "buchautor",
    "herausgeber",
    "zeichner",
    "buchsprecher",
    "buchverlag",
    "buchgenre",
    "isbn",
    "seitenzahl",
    "buchformat",
    "preis",
    "erscheinungsdatum",
    "sprache",
  ],
  film: [
    "filmkategorie",
    "darsteller",
    "regie",
    "filmstudio",
    "filmgenre",
    "serie",
    "fsk",
    "filmlaufzeit",
    "erscheinungsdatum",
    "sprache",
  ],
  musik: [
    "releasekategorie",
    "musiker",
    "label",
    "musikgenre",
    "musiklaufzeit",
    "tracklist",
    "releasedatum",
    "erscheinungsdatum",
    "sprache",
  ],
  spiel: [
    "spielkategorie",
    "spielautor",
    "publisher",
    "spielentwickler",
    "spielgenre",
    "serie",
    "erscheinungsdatum",
    "sprache",
  ],
  event: ["ort", "ortlink", "zeitstart", "zeitende", "sprache"],
  post: ["erscheinungsdatum", "sprache"],
};

const metaLabels = {
  isbn: "ISBN",
  seitenzahl: "Seiten",
  buchformat: "Format",
  preis: "Preis",
  erscheinungsdatum: "Erscheinungsdatum",
  sprache: "Sprache",
  fsk: "FSK",
  filmlaufzeit: "Laufzeit",
  musiklaufzeit: "Laufzeit",
  tracklist: "Tracklist",
  releasedatum: "Releasedatum",
  ort: "Ort",
  ortlink: "Website",
  zeitstart: "Start",
  zeitende: "Ende",
};

function cleanTermName(name) {
  return String(name).replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
}

function formatDateValue(value) {
  const raw = String(value || "").trim();
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(6, 8)}.${raw.slice(4, 6)}.${raw.slice(0, 4)}`;
  }
  return raw;
}

function formatMetaValue(key, value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (key === "erscheinungsdatum" || key === "releasedatum" || key === "zeitstart" || key === "zeitende") {
    return formatDateValue(raw);
  }
  if (key === "filmlaufzeit" || key === "musiklaufzeit") {
    return `${raw} Minuten`;
  }
  if (key === "fsk") {
    return `FSK ${raw}`;
  }
  return raw;
}

function formatMetaHref(key, value) {
  const raw = String(value || "").trim();
  if (!raw) return undefined;

  if (key === "ortlink" && /^https?:\/\//i.test(raw)) {
    return raw;
  }

  return undefined;
}

function byName(a, b) {
  return a.localeCompare(b, "de", { sensitivity: "base" });
}

function mapPostType(postType, meta = {}) {
  if (typeMap[postType]) return typeMap[postType];
  return categoryTypeMap[meta._yoast_wpseo_primary_category] || "Buch";
}

function taxonomyHref(taxonomy, slug) {
  return `/${taxonomy}/${slug}`;
}

function generateSlug(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function publicSlugs(post) {
  return [
    post.post_name,
    `${post.post_name}-${post.ID}`,
    generateSlug(post.post_title),
    `${generateSlug(post.post_title)}-${post.ID}`,
  ].filter(Boolean);
}

function mapEffectivePostType(post, meta, categoryIdsByPost) {
  const categories = categoryIdsByPost.get(post.ID) || new Set();
  if ([...categories].some((categoryId) => eventCategoryIds.has(categoryId))) {
    return "Event";
  }

  if (typeMap[post.post_type]) return typeMap[post.post_type];

  return categoryTypeMap[meta._yoast_wpseo_primary_category] || "Buch";
}

function rowKeysForType(type) {
  const postType = Object.entries(typeMap).find(([, mappedType]) => mappedType === type)?.[0];
  return rowsByPostType[postType] || rowsByPostType.post;
}

async function main() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
  });

  const [posts] = await connection.execute(
    `
      SELECT p.ID, p.post_title, p.post_name, p.post_type, p.post_date, u.display_name AS editor
      FROM wp_posts p
      LEFT JOIN wp_users u ON u.ID = p.post_author
      WHERE p.post_status = 'publish'
        AND p.post_type IN (${POST_TYPES.map(() => "?").join(", ")})
      ORDER BY p.ID
    `,
    POST_TYPES,
  );

  const [metaRows] = await connection.execute(`
    SELECT post_id, meta_key, meta_value
    FROM wp_postmeta
  `);

  const [termRows] = await connection.execute(`
    SELECT tr.object_id AS post_id, tt.taxonomy, t.name, t.slug
    FROM wp_term_relationships tr
    JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    JOIN wp_terms t ON t.term_id = tt.term_id
    WHERE tt.taxonomy IN (${Object.keys(taxonomyLabels).map(() => "?").join(", ")})
    ORDER BY tr.object_id, tt.taxonomy, t.name
  `, Object.keys(taxonomyLabels));

  const [categoryRows] = await connection.execute(`
    SELECT tr.object_id AS post_id, t.term_id
    FROM wp_term_relationships tr
    JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    JOIN wp_terms t ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'category'
  `);

  await connection.end();

  const postsById = new Map(posts.map((post) => [post.ID, post]));

  const categoryIdsByPost = new Map();
  for (const row of categoryRows) {
    const ids = categoryIdsByPost.get(row.post_id) || new Set();
    ids.add(Number(row.term_id));
    categoryIdsByPost.set(row.post_id, ids);
  }

  const metaByPost = new Map();
  for (const row of metaRows) {
    const meta = metaByPost.get(row.post_id) || {};
    meta[row.meta_key] = row.meta_value;
    metaByPost.set(row.post_id, meta);
  }

  const termsByPost = new Map();
  for (const row of termRows) {
    const taxonomies = termsByPost.get(row.post_id) || {};
    const terms = taxonomies[row.taxonomy] || [];
    terms.push({
      label: cleanTermName(row.name),
      href: taxonomyHref(row.taxonomy, row.slug),
      slug: row.slug,
    });
    taxonomies[row.taxonomy] = terms;
    termsByPost.set(row.post_id, taxonomies);
  }

  const data = {};
  const slugAliases = {};
  const slugTargets = {};
  const taxonomyIndex = {};

  for (const row of termRows) {
    const post = postsById.get(row.post_id);
    if (!post) continue;

    const meta = metaByPost.get(post.ID) || {};
    const effectiveType = mapEffectivePostType(post, meta, categoryIdsByPost);
    const reviewSlug = generateSlug(post.post_title);
    const key = `${row.taxonomy}/${row.slug}`;
    const entry = taxonomyIndex[key] || {
      taxonomy: row.taxonomy,
      taxonomyLabel: taxonomyLabels[row.taxonomy],
      name: cleanTermName(row.name),
      slug: row.slug,
      href: taxonomyHref(row.taxonomy, row.slug),
      reviews: [],
    };

    if (!entry.reviews.some((review) => review.slug === reviewSlug)) {
      entry.reviews.push({
        title: post.post_title,
        slug: reviewSlug,
        type: effectiveType,
        editor: post.editor || undefined,
        publishedAt: post.post_date ? new Date(post.post_date).toISOString() : undefined,
      });
    }

    taxonomyIndex[key] = entry;
  }

  for (const entry of Object.values(taxonomyIndex)) {
    entry.reviews.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  }

  for (const post of posts) {
    const meta = metaByPost.get(post.ID) || {};
    const terms = termsByPost.get(post.ID) || {};
    const effectiveType = mapEffectivePostType(post, meta, categoryIdsByPost);
    const rowKeys = rowKeysForType(effectiveType);
    const rows = [];

    for (const key of rowKeys) {
      if (taxonomyLabels[key]) {
        const uniqueByHref = new Map((terms[key] || []).map((term) => [term.href, term]));
        const values = [...uniqueByHref.values()].sort((a, b) => byName(a.label, b.label));
        if (values.length > 0) rows.push({ label: taxonomyLabels[key], values });
        continue;
      }

      const value = formatMetaValue(key, meta[key]);
      if (value) {
        rows.push({
          label: metaLabels[key] || key,
          values: [{ label: value, href: formatMetaHref(key, meta[key]) }],
        });
      }
    }

    const details = {
      editor: post.editor || undefined,
      publishedAt: post.post_date ? new Date(post.post_date).toISOString() : undefined,
      rows,
    };

    const canonicalSlug = generateSlug(post.post_title);

    for (const slug of new Set(publicSlugs(post))) {
      data[slug] = details;
      slugTargets[slug] = {
        slug: canonicalSlug,
        type: effectiveType,
        title: post.post_title,
      };
      if (slug !== canonicalSlug) {
        slugAliases[slug] = {
          slug: canonicalSlug,
          type: effectiveType,
          title: post.post_title,
        };
      }
    }
  }

  const outputPath = path.join(rootDir, "frontend", "lib", "legacy-review-details.generated.ts");
  const content = `// Generated from the legacy WordPress review metadata by migration/generate-legacy-review-details.js.
// Do not edit individual entries by hand; regenerate after legacy metadata changes.

export interface LegacyReviewDetailRow {
  label: string;
  values: LegacyReviewDetailValue[];
}

export interface LegacyReviewDetailValue {
  label: string;
  href?: string;
  slug?: string;
}

export interface LegacyReviewDetails {
  editor?: string;
  publishedAt?: string;
  rows: LegacyReviewDetailRow[];
}

export interface LegacyTaxonomyReview {
  title: string;
  slug: string;
  type: "Buch" | "Film" | "Musik" | "Spiel" | "Event";
  editor?: string;
  publishedAt?: string;
}

export interface LegacyTaxonomyEntry {
  taxonomy: string;
  taxonomyLabel: string;
  name: string;
  slug: string;
  href: string;
  reviews: LegacyTaxonomyReview[];
}

export const LEGACY_REVIEW_DETAILS: Record<string, LegacyReviewDetails> = ${JSON.stringify(data, null, 2)};

export const LEGACY_TAXONOMY_INDEX: Record<string, LegacyTaxonomyEntry> = ${JSON.stringify(taxonomyIndex, null, 2)};
`;

  await fs.writeFile(outputPath, content, "utf8");

  const aliasesOutputPath = path.join(rootDir, "frontend", "lib", "legacy-review-aliases.generated.ts");
  const aliasesContent = `// Generated from the legacy WordPress review slugs by migration/generate-legacy-review-details.js.
// Do not edit individual entries by hand; regenerate after legacy metadata changes.

export interface LegacyReviewSlugTarget {
  slug: string;
  type: "Buch" | "Film" | "Musik" | "Spiel" | "Event";
  title: string;
}

export const LEGACY_REVIEW_SLUG_ALIASES: Record<string, LegacyReviewSlugTarget> = ${JSON.stringify(slugAliases, null, 2)};

export const LEGACY_REVIEW_SLUG_TARGETS: Record<string, LegacyReviewSlugTarget> = ${JSON.stringify(slugTargets, null, 2)};
`;

  await fs.writeFile(aliasesOutputPath, aliasesContent, "utf8");
  console.log(`Wrote ${outputPath}`);
  console.log(`Wrote ${aliasesOutputPath}`);
  console.log(`${Object.keys(data).length} slug keys generated`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
