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

const EVENT_CATEGORY_IDS = new Set([5, 1387, 2426, 3373]);

const EVENT_CATEGORY_LABELS = {
  5: "Konzert",
  1387: "Lesung",
  2426: "Veranstaltungen",
  3373: "Theater",
};

const EVENT_CATEGORY_SLUGS = {
  5: "konzert",
  1387: "lesung",
  2426: "veranstaltungen",
  3373: "theater",
};

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
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

function documentId(prefix, value) {
  return `${prefix}_${value}`.replace(/[^a-z0-9_]/gi, "").slice(0, 24);
}

async function main() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
  });

  const [rows] = await connection.execute(`
    SELECT p.ID, p.post_title, p.post_name, t.term_id
    FROM wp_posts p
    JOIN wp_term_relationships tr ON tr.object_id = p.ID
    JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    JOIN wp_terms t ON t.term_id = tt.term_id
    WHERE p.post_status = 'publish'
      AND tt.taxonomy = 'category'
      AND t.term_id IN (${[...EVENT_CATEGORY_IDS].map(() => "?").join(", ")})
    ORDER BY p.ID, t.term_id
  `, [...EVENT_CATEGORY_IDS]);

  await connection.end();

  const genreValues = Object.entries(EVENT_CATEGORY_LABELS).map(([termId, name]) => {
    const slug = EVENT_CATEGORY_SLUGS[termId];
    return `  (${sqlString(documentId("genre", slug))}, ${sqlString(name)}, ${sqlString(slug)})`;
  });

  const relationValues = [];
  for (const row of rows) {
    const genreSlug = EVENT_CATEGORY_SLUGS[row.term_id];
    if (!genreSlug) continue;

    for (const slug of new Set(publicSlugs(row))) {
      relationValues.push(`  (${sqlString(slug)}, ${sqlString(genreSlug)})`);
    }
  }

  const sql = `SET client_encoding = 'UTF8';
BEGIN;

WITH event_genres(document_id, name, slug) AS (VALUES
${genreValues.join(",\n")}
)
INSERT INTO genres (document_id, name, slug, created_at, updated_at, published_at)
SELECT event_genres.document_id, event_genres.name, event_genres.slug, NOW(), NOW(), NOW()
FROM event_genres
WHERE NOT EXISTS (
  SELECT 1
  FROM genres
  WHERE genres.slug = event_genres.slug
);

WITH event_slugs(slug, genre_slug) AS (VALUES
${relationValues.join(",\n")}
),
event_reviews AS (
  SELECT DISTINCT r.id
  FROM rezensionen r
  JOIN event_slugs es ON es.slug = r.slug
  WHERE r.type = 'Event'
)
DELETE FROM rezensionen_genres_lnk l
USING event_reviews er
WHERE l.rezension_id = er.id;

WITH event_slugs(slug, genre_slug) AS (VALUES
${relationValues.join(",\n")}
),
event_relations AS (
  SELECT DISTINCT r.id AS rezension_id, g.id AS genre_id
  FROM event_slugs es
  JOIN rezensionen r ON r.slug = es.slug
  JOIN genres g ON g.slug = es.genre_slug
  WHERE r.type = 'Event'
)
INSERT INTO rezensionen_genres_lnk (rezension_id, genre_id)
SELECT er.rezension_id, er.genre_id
FROM event_relations er
WHERE NOT EXISTS (
  SELECT 1
  FROM rezensionen_genres_lnk l
  WHERE l.rezension_id = er.rezension_id
    AND l.genre_id = er.genre_id
);

COMMIT;

SELECT r.title, r.slug, string_agg(g.name, ', ' ORDER BY g.name) AS genres
FROM rezensionen r
LEFT JOIN rezensionen_genres_lnk l ON l.rezension_id = r.id
LEFT JOIN genres g ON g.id = l.genre_id
WHERE r.type = 'Event'
GROUP BY r.id, r.title, r.slug
ORDER BY r.title, r.id;
`;

  const outIndex = process.argv.indexOf("--out");
  if (outIndex >= 0) {
    const outputPath = path.resolve(process.argv[outIndex + 1] || "event-genres.sql");
    await fs.writeFile(outputPath, sql, "utf8");
    process.stderr.write(`Preparing ${rows.length} legacy event genre assignments.\n`);
    process.stderr.write(`Wrote ${outputPath}\n`);
    return;
  }

  process.stderr.write(`Preparing ${rows.length} legacy event genre assignments.\n`);
  process.stdout.write(sql);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
