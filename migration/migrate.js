import mysql from 'mysql2/promise';
import slugify from 'slugify';
import TurndownService from 'turndown';

// Konfiguration anpassen, falls nötig
const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = 'root';
const DB_NAME = 'wp_legacy'; // In Docker-Compose definierte DB

const STRAPI_URL = 'http://localhost:1337/api';
// Erstelle im Strapi Admin Panel einen Full-Access API Token und trage ihn hier ein:
const STRAPI_TOKEN = '4401ae4715496e48662ae1bad150b11d82c69e01e2a6928fa67f8d23a852386fe6ce42ecf8d520b2d543285911b8ca4f77fcbb92a99087cd9120b161f6783a8293cb35fa2e761ad3c4e45bf4370112e593cf842fa7402d43d90c99f3ed53a60c9f9bdc771515c1298d2d6839b182896ad9d7539ea17728eb250c6b04db15cb8b';

const turndownService = new TurndownService();

async function main() {
  console.log('🔄 Verbinde zur lokalen WordPress Legacy MySQL...');
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  });

  console.log('✅ Verbunden. Lese Beiträge aus...');

  // Hole alle veröffentlichten Beiträge, die keine Revisionen/Seiten sind
  const [posts] = await connection.execute(`
    SELECT ID, post_title, post_content, post_date, post_type
    FROM wp_posts 
    WHERE post_status = 'publish' 
      AND post_type IN ('post', 'buch', 'film', 'musik', 'spiel', 'event')
  `);

  console.log(`📌 ${posts.length} Beiträge gefunden. Starte Migration...\n`);

  for (const post of posts) {
    try {
      console.log(`Bearbeite: "${post.post_title}" (Typ: ${post.post_type})`);

      // Hole alle Meta-Werte (ACF) zu diesem Beitrag
      const [metaData] = await connection.execute(
        `SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ?`,
        [post.ID]
      );

      // Konvertiere das MySQL Array in ein einfach nutzbares Objekt
      const meta = {};
      for (const m of metaData) {
        meta[m.meta_key] = m.meta_value;
      }

      // WP HTML zu Markdown / Strapi Blocks (Strapi v5 nutzt oft Blocks oder Rich Text Markdown)
      const contentMarkdown = turndownService.turndown(post.post_content || '');

      // Baue das Strapi-Payload
      // Der "Type" der Rezension in Strapi erwartet "Buch", "Film", "Musik", "Spiel", "Event"
      let strapiType = "Buch"; // Fallback
      if (post.post_type === 'film' || meta._yoast_wpseo_primary_category === '35') strapiType = "Film";
      if (post.post_type === 'musik' || meta._yoast_wpseo_primary_category === '3') strapiType = "Musik";
      if (post.post_type === 'spiel' || meta._yoast_wpseo_primary_category === '37') strapiType = "Spiel";
      if (post.post_type === 'event' || meta._yoast_wpseo_primary_category === '5') strapiType = "Event";

      const payload = {
        data: {
          title: post.post_title,
          slug: slugify(post.post_title, { lower: true, strict: true }),
          content: contentMarkdown,
          rating: meta.rating ? parseFloat(meta.rating) : null,
          type: strapiType,
          publishedAt: new Date(post.post_date).toISOString(),

          // Hier bauen wir die Dynamic Zone ('details') auf Basis veralteter ACF-Felder
          details: buildDetailsZone(strapiType, meta)
        }
      };

      // Beitrag an Strapi senden
      const strapiRes = await fetch(`${STRAPI_URL}/rezensionen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_TOKEN}`
        },
        body: JSON.stringify(payload)
      });

      if (!strapiRes.ok) {
        const errInfo = await strapiRes.json();
        console.error(`❌ Fehler bei "${post.post_title}":`, errInfo.error.message);
      } else {
        console.log(`✅ Strapi-Import erfolgreich: ${post.post_title}`);
      }

    } catch (e) {
      console.error(`❌ Unerwarteter Fehler bei "${post.post_title}":`, e.message);
    }
  }

  console.log('\n🎉 Migration abgeschlossen!');
  process.exit(0);
}

// Hilfsfunktion: Wandelt WP ACF in Strapi Dynamic Zones um
function buildDetailsZone(type, meta) {
  const zone = [];

  if (type === 'Buch') {
    zone.push({
      __component: 'details.book-details',
      isbn: meta.isbn || null,
      pages: meta.seitenzahl ? parseInt(meta.seitenzahl) : null,
      publishedDate: parseWpDate(meta.erscheinungsdatum)
    });
  } else if (type === 'Film') {
    zone.push({
      __component: 'details.movie-details',
      fsk: meta.fsk || null,
      duration: meta.filmlaufzeit ? parseInt(meta.filmlaufzeit) : null
    });
  } else if (type === 'Musik') {
    zone.push({
      __component: 'details.music-details',
      releaseYear: meta.erscheinungsdatum ? parseInt(meta.erscheinungsdatum.substring(0, 4)) : null
    });
  } else if (type === 'Spiel') {
    zone.push({
      __component: 'details.game-details'
    });
  } else if (type === 'Event') {
    zone.push({
      __component: 'details.event-details',
      location: meta.ort || null,
      eventDate: parseWpDate(meta.zeitstart)
    });
  }

  return zone;
}

// Hilfsfunktion: WP ACF Datumsformat (YYYYMMDD) in ISO konvertieren
function parseWpDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return null;
  const y = dateStr.substring(0, 4);
  const m = dateStr.substring(4, 6);
  const d = dateStr.substring(6, 8);
  return `${y}-${m}-${d}`;
}

main();
