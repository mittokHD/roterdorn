import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const envPath = path.join(rootDir, ".env");

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(envPath);
  } catch {
    // Local Docker defaults below are enough for this one-off export.
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

const typeMap = {
  buch: "Buch",
  film: "Film",
  musik: "Musik",
  spiel: "Spiel",
  event: "Event",
};

const eventCategoryIds = new Set([5, 1387, 2426, 3373]);

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const BLOCK_TAGS = "address|article|aside|blockquote|div|figure|figcaption|footer|form|h[1-6]|header|hr|main|nav|ol|p|pre|section|table|ul";

function startsWithBlockTag(value) {
  return new RegExp(`^\\s*<(?:${BLOCK_TAGS})(?:\\s|>|/)`, "i").test(value);
}

function wpAutop(value) {
  const normalized = String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalized) return "";
  if (/<p[\s>]/i.test(normalized)) return normalized;

  const separatedBlocks = normalized
    .replace(new RegExp(`(<(?:${BLOCK_TAGS})(?:\\s|>|/))`, "gi"), "\n\n$1")
    .replace(new RegExp(`(</(?:${BLOCK_TAGS})>)`, "gi"), "$1\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return separatedBlocks
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (startsWithBlockTag(block)) return block;
      return `<p>${block.replace(/\n/g, "<br />\n")}</p>`;
    })
    .join("\n\n");
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

function mapPostType(post, categoryIdsByPost) {
  const categories = categoryIdsByPost.get(post.ID) || new Set();
  if ([...categories].some((categoryId) => eventCategoryIds.has(categoryId))) {
    return "Event";
  }

  if (typeMap[post.post_type]) return typeMap[post.post_type];

  return "Buch";
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
      SELECT ID, post_title, post_name, post_type, post_content
      FROM wp_posts
      WHERE post_status = 'publish'
        AND post_type IN (${POST_TYPES.map(() => "?").join(", ")})
      ORDER BY ID
    `,
    POST_TYPES,
  );

  const [categoryRows] = await connection.execute(`
    SELECT tr.object_id AS post_id, t.term_id
    FROM wp_term_relationships tr
    JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    JOIN wp_terms t ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'category'
  `);

  await connection.end();

  const categoryIdsByPost = new Map();
  for (const row of categoryRows) {
    const ids = categoryIdsByPost.get(row.post_id) || new Set();
    ids.add(Number(row.term_id));
    categoryIdsByPost.set(row.post_id, ids);
  }

  let sql = "SET client_encoding = 'UTF8';\nBEGIN;\n\n";
  sql += "WITH content_data(slug, content, review_type) AS (VALUES\n";

  const values = [];
  for (const post of posts) {
    const html = wpAutop(post.post_content);
    const reviewType = mapPostType(post, categoryIdsByPost);
    for (const slug of new Set(publicSlugs(post))) {
      values.push(`  (${sqlString(slug)}, ${sqlString(html)}, ${sqlString(reviewType)})`);
    }
  }

  sql += values.join(",\n");
  sql += `
)
UPDATE rezensionen r
SET content = content_data.content,
    type = content_data.review_type,
    updated_at = NOW()
FROM content_data
WHERE r.slug = content_data.slug;

COMMIT;

SELECT COUNT(*) AS html_content_reviews
FROM rezensionen
WHERE content LIKE '<p>%';

SELECT COUNT(*) AS markdown_link_reviews
FROM rezensionen
WHERE content LIKE '%](http%';
`;

  const outIndex = process.argv.indexOf("--out");
  if (outIndex >= 0) {
    const outputPath = path.resolve(process.argv[outIndex + 1] || "review-content.sql");
    await fs.writeFile(outputPath, sql, "utf8");
    process.stderr.write(`Preparing ${posts.length} legacy review contents.\n`);
    process.stderr.write(`Wrote ${outputPath}\n`);
    return;
  }

  process.stderr.write(`Preparing ${posts.length} legacy review contents.\n`);
  process.stdout.write(sql);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
