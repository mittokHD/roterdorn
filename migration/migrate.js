import mysql from 'mysql2/promise';
import slugify from 'slugify';
import TurndownService from 'turndown';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- Pfad-Konfiguration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env aus dem Root-Verzeichnis laden
dotenv.config({ path: path.join(__dirname, '../.env') });

// Sicherer Import der migration.config.json
const configPath = path.join(__dirname, '../migration.config.json');
const migrationConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const GENERATE_IMAGES = migrationConfig.generateImages === true;

// --- Umgebungsvariablen ---
const {
  MYSQL_HOST: DB_HOST = 'localhost',
  MYSQL_USER: DB_USER = 'root',
  MYSQL_PASSWORD: DB_PASSWORD = 'root',
  MYSQL_DATABASE: DB_NAME = 'wp_legacy',
  STRAPI_MIGRATION_URL,
  NEXT_PUBLIC_STRAPI_URL,
  STRAPI_WRITE_TOKEN: STRAPI_TOKEN = '',
  PEXELS_API_KEY = '',
} = process.env;

const STRAPI_URL =
  STRAPI_MIGRATION_URL || `${NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api`;

const turndownService = new TurndownService();

async function main() {
  let connection;
  try {
    console.log('🔄 Verbinde zur WordPress Datenbank...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
    });

    console.log('✅ Verbunden. Lese Beiträge aus...');

    const [posts] = await connection.execute(`
      SELECT ID, post_title, post_content, post_date, post_type
      FROM wp_posts 
      WHERE post_status = 'publish' 
        AND post_type IN ('post', 'buch', 'film', 'musik', 'spiel', 'event')
    `);

    console.log(`📌 ${posts.length} Beiträge gefunden. Starte Migration...\n`);

    for (const post of posts) {
      try {
        console.log(`🚀 Bearbeite: "${post.post_title}" (${post.post_type})`);

        // Meta-Daten laden
        const [metaData] = await connection.execute(
          `SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ?`,
          [post.ID],
        );

        const meta = Object.fromEntries(metaData.map((m) => [m.meta_key, m.meta_value]));

        // HTML -> Markdown
        const contentMarkdown = turndownService.turndown(post.post_content || '');

        // Typ-Mapping
        let strapiType = mapPostType(post.post_type, meta);

        // Bild-Handling
        const coverId = GENERATE_IMAGES
          ? await uploadRandomImage(post.post_title, strapiType)
          : null;

        // Rating-Logik
        const parsedRating = meta.rating ? parseFloat(meta.rating) : null;
        const fallbackRating = parseFloat((Math.random() * 5 + 4.5).toFixed(1));

        const payload = {
          data: {
            title: post.post_title,
            slug: slugify(post.post_title, { lower: true, strict: true }),
            content: contentMarkdown,
            rating: parsedRating || fallbackRating,
            type: strapiType,
            publishedAt: new Date(post.post_date).toISOString(),
            details: buildDetailsZone(strapiType, meta),
            cover: coverId || undefined,
          },
        };

        const strapiRes = await fetch(`${STRAPI_URL}/rezensionen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
          body: JSON.stringify(payload),
        });

        if (!strapiRes.ok) {
          const errInfo = await strapiRes.json();
          console.error(`❌ Strapi Fehler [${post.ID}]:`, JSON.stringify(errInfo.error));
        } else {
          console.log(`✅ Erfolg: ${post.post_title}`);
        }
      } catch (err) {
        console.error(`❌ Fehler im Loop bei ID ${post.ID}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Kritischer Verbindungsfehler:', err.message);
  } finally {
    if (connection) await connection.end();
    console.log('\n🎉 Migration beendet.');
    process.exit(0);
  }
}

// --- Hilfsfunktionen ---

function mapPostType(wpType, meta) {
  const types = { buch: 'Buch', film: 'Film', musik: 'Musik', spiel: 'Spiel', event: 'Event' };
  if (types[wpType]) return types[wpType];

  const categoryMap = { 35: 'Film', 3: 'Musik', 37: 'Spiel', 5: 'Event' };
  return categoryMap[meta._yoast_wpseo_primary_category] || 'Buch';
}

function buildDetailsZone(type, meta) {
  const zone = [];
  const configs = {
    Buch: {
      __component: 'details.book-details',
      isbn: meta.isbn,
      pages: parseInt(meta.seitenzahl),
      publishedDate: parseWpDate(meta.erscheinungsdatum),
    },
    Film: {
      __component: 'details.movie-details',
      fsk: meta.fsk,
      duration: parseInt(meta.filmlaufzeit),
    },
    Musik: {
      __component: 'details.music-details',
      releaseYear: meta.erscheinungsdatum?.substring(0, 4),
    },
    Spiel: { __component: 'details.game-details' },
    Event: {
      __component: 'details.event-details',
      location: meta.ort,
      eventDate: parseWpDate(meta.zeitstart),
    },
  };

  if (configs[type]) zone.push(configs[type]);
  return zone;
}

function parseWpDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return null;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
}

async function uploadRandomImage(title, type) {
  try {
    if (!PEXELS_API_KEY) return null;

    const keywords = {
      Buch: 'book',
      Film: 'cinema',
      Musik: 'concert',
      Spiel: 'gaming',
      Event: 'festival',
    };
    const query = `${title} ${keywords[type] || ''}`;

    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: { Authorization: PEXELS_API_KEY },
      },
    );

    const data = await res.json();
    const imageUrl = data.photos?.[0]?.src?.large2x;
    if (!imageUrl) return null;

    const imgRes = await fetch(imageUrl);
    const buffer = await imgRes.arrayBuffer();

    const formData = new FormData();
    const fileName = `${slugify(title, { lower: true, strict: true })}.jpg`;
    formData.append('files', new Blob([buffer]), fileName);

    const uploadRes = await fetch(`${STRAPI_URL.replace('/api', '')}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      body: formData,
    });

    const uploadData = await uploadRes.json();
    return uploadData[0]?.id || null;
  } catch (error) {
    console.error(` ⚠️ Bild-Upload fehlgeschlagen: ${error.message}`);
    return null;
  }
}

main();
