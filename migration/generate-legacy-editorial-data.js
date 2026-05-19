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

const editorialCategories = {
  news: {
    section: "neuigkeiten",
    label: "Neuigkeiten",
    singularLabel: "Neuigkeit",
    icon: "📰",
    description: "Meldungen aus der gekürzten Legacy-Datenbank.",
  },
  artikel: {
    section: "artikel",
    label: "Artikel",
    singularLabel: "Artikel",
    icon: "✍️",
    description: "Artikel aus der gekürzten Legacy-Datenbank.",
  },
  interview: {
    section: "interview",
    label: "Interviews",
    singularLabel: "Interview",
    icon: "🎙️",
    description: "Interviews aus der gekürzten Legacy-Datenbank.",
  },
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

function decodeEntities(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function createExcerpt(html) {
  const text = decodeEntities(html)
    .replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]/gi, " ")
    .replace(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s<]*/gi, " ")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= 220) return text;

  const shortened = text.slice(0, 220);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 140 ? lastSpace : 220).trimEnd()}...`;
}

function publicSlugs(post) {
  return [
    post.post_name,
    `${post.post_name}-${post.ID}`,
    generateSlug(post.post_title),
    `${generateSlug(post.post_title)}-${post.ID}`,
  ].filter(Boolean);
}

function mapEffectivePostType(post, meta, categoryIds) {
  if (categoryIds.some((categoryId) => eventCategoryIds.has(categoryId))) {
    return "Event";
  }

  if (typeMap[post.post_type]) return typeMap[post.post_type];

  return categoryTypeMap[meta._yoast_wpseo_primary_category] || "Buch";
}

async function main() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
  });

  const [posts] = await connection.execute(`
    SELECT p.ID, p.post_title, p.post_name, p.post_type, p.post_date, p.post_content, u.display_name AS editor
    FROM wp_posts p
    LEFT JOIN wp_users u ON u.ID = p.post_author
    WHERE p.post_status = 'publish'
      AND p.post_type IN ('post', 'buch', 'film', 'musik', 'spiel', 'event')
    ORDER BY p.post_date DESC
  `);

  const [metaRows] = await connection.execute(`
    SELECT post_id, meta_key, meta_value
    FROM wp_postmeta
  `);

  const [categoryRows] = await connection.execute(`
    SELECT tr.object_id AS post_id, t.term_id, t.slug
    FROM wp_term_relationships tr
    JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    JOIN wp_terms t ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'category'
  `);

  await connection.end();

  const metaByPost = new Map();
  for (const row of metaRows) {
    const meta = metaByPost.get(row.post_id) || {};
    meta[row.meta_key] = row.meta_value;
    metaByPost.set(row.post_id, meta);
  }

  const categoriesByPost = new Map();
  for (const row of categoryRows) {
    const categories = categoriesByPost.get(row.post_id) || [];
    categories.push({ id: Number(row.term_id), slug: row.slug });
    categoriesByPost.set(row.post_id, categories);
  }

  const sections = Object.fromEntries(
    Object.values(editorialCategories).map((category) => [
      category.section,
      {
        label: category.label,
        singularLabel: category.singularLabel,
        icon: category.icon,
        description: category.description,
        entries: [],
      },
    ]),
  );
  const entriesBySlug = {};
  const affiliateLinks = {};

  for (const post of posts) {
    const meta = metaByPost.get(post.ID) || {};
    const categories = categoriesByPost.get(post.ID) || [];
    const categoryIds = categories.map((category) => category.id);
    const effectiveType = mapEffectivePostType(post, meta, categoryIds);
    const canonicalSlug = generateSlug(post.post_title);
    const publishedAt = post.post_date ? new Date(post.post_date).toISOString() : undefined;
    const affiliateAsin = String(meta.amazon_asin || "").trim();

    if (affiliateAsin) {
      const affiliateEntry = {
        provider: "Amazon",
        label: "Bei Amazon ansehen",
        asin: affiliateAsin,
        url: `https://www.amazon.de/dp/${affiliateAsin}`,
      };

      for (const slug of new Set(publicSlugs(post))) {
        affiliateLinks[slug] = [affiliateEntry];
      }
    }

    for (const category of categories) {
      const editorialCategory = editorialCategories[category.slug];
      if (!editorialCategory) continue;

      const entry = {
        id: post.ID,
        section: editorialCategory.section,
        sectionLabel: editorialCategory.label,
        title: decodeEntities(post.post_title),
        slug: canonicalSlug,
        legacySlug: post.post_name || canonicalSlug,
        postType: post.post_type,
        reviewType: effectiveType,
        editor: post.editor || undefined,
        publishedAt,
        excerpt: createExcerpt(post.post_content || ""),
        content: post.post_content || "",
        isReviewBacked: Boolean(typeMap[post.post_type]),
      };

      sections[editorialCategory.section].entries.push(entry);
      entriesBySlug[`${editorialCategory.section}/${canonicalSlug}`] = entry;

      if (post.post_name && post.post_name !== canonicalSlug) {
        entriesBySlug[`${editorialCategory.section}/${post.post_name}`] = entry;
      }
    }
  }

  for (const section of Object.values(sections)) {
    section.entries.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  }

  const outputPath = path.join(rootDir, "frontend", "lib", "legacy-editorial.generated.ts");
  const content = `// Generated from the legacy WordPress editorial metadata by migration/generate-legacy-editorial-data.js.
// Do not edit individual entries by hand; regenerate after legacy metadata changes.

export type LegacyEditorialSectionSlug = "neuigkeiten" | "artikel" | "interview";

export interface LegacyEditorialEntry {
  id: number;
  section: LegacyEditorialSectionSlug;
  sectionLabel: string;
  title: string;
  slug: string;
  legacySlug: string;
  postType: string;
  reviewType: "Buch" | "Film" | "Musik" | "Spiel" | "Event";
  editor?: string;
  publishedAt?: string;
  excerpt: string;
  content: string;
  isReviewBacked: boolean;
}

export interface LegacyEditorialSection {
  label: string;
  singularLabel: string;
  icon: string;
  description: string;
  entries: LegacyEditorialEntry[];
}

export interface LegacyAffiliateLink {
  provider: "Amazon";
  label: string;
  asin: string;
  url: string;
}

export const LEGACY_EDITORIAL_SECTIONS: Record<LegacyEditorialSectionSlug, LegacyEditorialSection> = ${JSON.stringify(sections, null, 2)};

export const LEGACY_EDITORIAL_ENTRIES: Record<string, LegacyEditorialEntry> = ${JSON.stringify(entriesBySlug, null, 2)};

export const LEGACY_AFFILIATE_LINKS: Record<string, LegacyAffiliateLink[]> = ${JSON.stringify(affiliateLinks, null, 2)};
`;

  await fs.writeFile(outputPath, content, "utf8");
  console.log(`Wrote ${outputPath}`);
  console.log(`${Object.values(sections).reduce((sum, section) => sum + section.entries.length, 0)} editorial entries generated`);
  console.log(`${Object.keys(affiliateLinks).length} affiliate slug keys generated`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
