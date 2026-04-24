import mysql from 'mysql2/promise';
import TurndownService from 'turndown';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- Pfad-Konfiguration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env aus dem Root-Verzeichnis laden
process.loadEnvFile(path.join(__dirname, '../.env'));

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
  MYSQL_PORT: DB_PORT = 3308,
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
      port: parseInt(DB_PORT, 10),
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

        const generatedSlug = generateSlug(post.post_title);

        // Prüfen ob der Eintrag schon existiert (anhand des Slugs)
        const checkRes = await fetch(`${STRAPI_URL}/rezensionen?filters[slug][$eq]=${generatedSlug}&publicationState=preview`, {
          headers: { Authorization: `Bearer ${STRAPI_TOKEN}` }
        });
        const checkData = await checkRes.json();
        
        if (checkData?.data?.length > 0) {
          console.log(`⏭️ Überspringe: "${post.post_title}" (existiert bereits)`);
          continue;
        }

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
            slug: generatedSlug,
            content: contentMarkdown,
            rating: parsedRating || fallbackRating,
            type: strapiType,
            publishedAt: new Date(post.post_date).toISOString(),
            details: buildDetailsZone(strapiType, meta),
            cover: coverId || undefined,
          },
        };

        let strapiRes = await fetch(`${STRAPI_URL}/rezensionen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
          body: JSON.stringify(payload),
        });

        if (!strapiRes.ok) {
          let errInfo = await strapiRes.json();
          const isSlugError = errInfo?.error?.details?.errors?.some(e => 
            e.path?.includes('slug') && e.message.includes('unique')
          );

          if (isSlugError) {
            console.log(`⚠️ Slug Kollision (vermutlich Papierkorb oder Duplikat). Hänge ID an: "${generatedSlug}-${post.ID}"`);
            payload.data.slug = `${generatedSlug}-${post.ID}`;
            
            strapiRes = await fetch(`${STRAPI_URL}/rezensionen`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${STRAPI_TOKEN}`,
              },
              body: JSON.stringify(payload),
            });
            
            if (!strapiRes.ok) {
              errInfo = await strapiRes.json();
            }
          }

          if (!strapiRes.ok) {
            console.error(`❌ Strapi Fehler [${post.ID}]:`, JSON.stringify(errInfo.error || errInfo));
          } else {
            console.log(`✅ Erfolg (Suffix hinzugefügt): ${post.post_title}`);
          }
        } else {
          console.log(`✅ Erfolg: ${post.post_title}`);
        }
      } catch (err) {
        console.error(`❌ Fehler im Loop bei ID ${post.ID}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Kritischer Verbindungsfehler:', err);
  } finally {
    if (connection) await connection.end();
    console.log('\n🎉 Migration beendet.');
    process.exit(0);
  }
}

// --- Hilfsfunktionen ---

function generateSlug(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // umlaute etc entfernen
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

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
    const fileName = `${generateSlug(title)}.jpg`;
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
