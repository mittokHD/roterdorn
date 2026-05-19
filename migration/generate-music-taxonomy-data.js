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
    // The local Docker defaults below are enough for this generated data export.
  }
}

const {
  MYSQL_HOST: DB_HOST = "127.0.0.1",
  MYSQL_USER: DB_USER = "root",
  MYSQL_PASSWORD: DB_PASSWORD = "root",
  MYSQL_DATABASE: DB_NAME = "wp_legacy",
  MYSQL_PORT: DB_PORT = 3308,
} = process.env;

const taxonomyLabels = {
  label: "Labels",
  musikgenre: "Musikgenres",
  musiker: "Musiker",
};

const outputPath = path.join(rootDir, "frontend", "lib", "music-taxonomies.generated.ts");

async function main() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
  });

  const [rows] = await connection.execute(`
    SELECT tt.taxonomy, t.name, t.slug, tt.count
    FROM wp_terms t
    JOIN wp_term_taxonomy tt ON tt.term_id = t.term_id
    WHERE tt.taxonomy IN ('label', 'musikgenre', 'musiker')
    ORDER BY tt.taxonomy, LOWER(t.name), t.name
  `);

  await connection.end();

  const grouped = {
    label: [],
    musikgenre: [],
    musiker: [],
  };

  for (const row of rows) {
    grouped[row.taxonomy].push({
      name: row.name,
      slug: row.slug,
      count: Number(row.count) || 0,
    });
  }

  const content = `// Generated from the legacy WordPress taxonomies by migration/generate-music-taxonomy-data.js.
// Do not edit individual entries by hand; regenerate after taxonomy imports change.

export type MusicTaxonomySlug = "label" | "musikgenre" | "musiker";

export interface MusicTaxonomyTerm {
  name: string;
  slug: string;
  count: number;
}

export const MUSIC_TAXONOMY_LABELS: Record<MusicTaxonomySlug, string> = ${JSON.stringify(taxonomyLabels, null, 2)};

export const MUSIC_TAXONOMIES: Record<MusicTaxonomySlug, MusicTaxonomyTerm[]> = ${JSON.stringify(grouped, null, 2)};
`;

  await fs.writeFile(outputPath, content, "utf8");
  console.log(`Wrote ${outputPath}`);
  for (const [taxonomy, terms] of Object.entries(grouped)) {
    console.log(`${taxonomy}: ${terms.length} terms`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
