import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const envPath = path.join(rootDir, ".env");

if (typeof process.loadEnvFile === "function" && fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const {
  MYSQL_HOST: DB_HOST = "127.0.0.1",
  MYSQL_USER: DB_USER = "root",
  MYSQL_PASSWORD: DB_PASSWORD = "root",
  MYSQL_DATABASE: DB_NAME = "wp_legacy",
  MYSQL_PORT: DB_PORT = 3308,
} = process.env;

function generateSlug(text) {
  return text.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
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
    SELECT DISTINCT p.ID, p.post_title
    FROM wp_posts p
    JOIN wp_term_relationships tr ON tr.object_id = p.ID
    JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    WHERE p.post_status = 'publish'
      AND p.post_type IN ('post', 'buch', 'film', 'musik', 'spiel', 'event')
      AND tt.taxonomy = 'musiker'
  `);

  await connection.end();

  const slugCandidates = new Set();
  for (const post of posts) {
    const baseSlug = generateSlug(post.post_title);
    slugCandidates.add(baseSlug);
    slugCandidates.add(`${baseSlug}-${post.ID}`);
  }

  const documentId = crypto.randomBytes(12).toString("hex");
  const slugValues = [...slugCandidates].map(sqlString).join(",\n    ");

  process.stderr.write(`Found ${posts.length} legacy posts with musiker taxonomy.\n`);
  process.stderr.write(`Generated ${slugCandidates.size} Strapi slug candidates.\n`);

  process.stdout.write(`
BEGIN;

WITH created_genre AS (
  INSERT INTO genres (document_id, name, slug, created_at, updated_at, published_at)
  SELECT ${sqlString(documentId)}, 'Musiker', 'musiker', NOW(), NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM genres WHERE slug = 'musiker' OR name = 'Musiker'
  )
  RETURNING id
),
target_genre AS (
  SELECT id FROM created_genre
  UNION ALL
  SELECT id FROM genres WHERE slug = 'musiker' OR name = 'Musiker'
  ORDER BY id
  LIMIT 1
),
target_rezensionen AS (
  SELECT id
  FROM rezensionen
  WHERE type = 'Musik'
    AND slug IN (
    ${slugValues}
    )
)
INSERT INTO rezensionen_genres_lnk (rezension_id, genre_id)
SELECT target_rezensionen.id, target_genre.id
FROM target_rezensionen
CROSS JOIN target_genre
ON CONFLICT (rezension_id, genre_id) DO NOTHING;

COMMIT;

SELECT
  g.id,
  g.name,
  g.slug,
  COUNT(l.rezension_id) AS linked_rezensionen
FROM genres g
LEFT JOIN rezensionen_genres_lnk l ON l.genre_id = g.id
WHERE g.slug = 'musiker' OR g.name = 'Musiker'
GROUP BY g.id, g.name, g.slug
ORDER BY g.id;
`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
