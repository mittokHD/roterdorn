import mysql from 'mysql2/promise';
import slugify from 'slugify';
import TurndownService from 'turndown';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// ─── Configuration (reads from root .env via process.env) ───
const DB_HOST = process.env.MYSQL_HOST || 'localhost';
const DB_USER = process.env.MYSQL_USER || 'root';
const DB_PASSWORD = process.env.MYSQL_PASSWORD || 'root';
const DB_NAME = process.env.MYSQL_DATABASE || 'wp_legacy';

const STRAPI_URL = process.env.STRAPI_MIGRATION_URL || `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api`;
const STRAPI_TOKEN = process.env.STRAPI_WRITE_TOKEN || '';

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
      if (post.post_type === 'buch') strapiType = "Buch";
      else if (post.post_type === 'film') strapiType = "Film";
      else if (post.post_type === 'musik') strapiType = "Musik";
      else if (post.post_type === 'spiel') strapiType = "Spiel";
      else if (post.post_type === 'event') strapiType = "Event";
      else {
        // Fallback über Yoast Category nur wenn post_type ('post') unklar ist
        if (meta._yoast_wpseo_primary_category === '35') strapiType = "Film";
        if (meta._yoast_wpseo_primary_category === '3') strapiType = "Musik";
        if (meta._yoast_wpseo_primary_category === '37') strapiType = "Spiel";
        if (meta._yoast_wpseo_primary_category === '5') strapiType = "Event";
      }

      // Hole ein kostenloses Titelbild passend zur Kategorie
      const coverId = await uploadRandomImage(post.post_title, strapiType);

      // Ratings generieren, wenn keines existiert (zwischen 4.5 und 9.5)
      const parsedRating = meta.rating ? parseFloat(meta.rating) : null;
      const fallbackRating = parseFloat((Math.random() * (9.5 - 4.5) + 4.5).toFixed(1));

      const payload = {
        data: {
          title: post.post_title,
          slug: slugify(post.post_title, { lower: true, strict: true }),
          content: contentMarkdown,
          rating: parsedRating || fallbackRating,
          type: strapiType,
          publishedAt: new Date(post.post_date).toISOString(),

          // Hier bauen wir die Dynamic Zone ('details') auf Basis veralteter ACF-Felder
          details: buildDetailsZone(strapiType, meta)
        }
      };

      // Wenn ein Bild gefunden und hochgeladen wurde, anhängen
      if (coverId) {
        payload.data.cover = coverId;
      }

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

// Hilfsfunktion: Lade ein Stock-Foto passend zur Kategorie von einer freien API herunter
// und lade es als Asset in die Strapi Media-Library hoch.
async function uploadRandomImage(title, type) {
  try {
    // Keywords passend zur Kategorie mappen
    const keywordMap = {
      "Buch": "book,reading,library",
      "Film": "movie,cinema,film",
      "Musik": "music,concert,vinyl",
      "Spiel": "gaming,videogame,console",
      "Event": "event,festival,stage"
    };
    const keyword = keywordMap[type] || "art,abstract";

    // Nutze loremflickr als freie (und API-Key freie) Alternative zu Unsplash Source
    const imageUrl = `https://loremflickr.com/1280/720/${keyword}?random=${Math.floor(Math.random() * 10000)}`;

    console.log(`   📸 Suche Stock-Foto für [${type}]...`);
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("Fehler beim Herunterladen des Bildes");

    // Bilddaten (Blob/Buffer) auslesen
    const blob = await imgRes.blob();

    // FormData für Strapi Upload zusammenbauen
    const formData = new FormData();
    const safeName = slugify(title, { lower: true, strict: true }) || 'cover';
    formData.append('files', blob, `${safeName}.jpg`);

    // Upload an Strapi's /api/upload Endpunkt
    const uploadRes = await fetch(`${STRAPI_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`
      },
      body: formData
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(err.error?.message || "Upload fehlgeschlagen");
    }

    const uploadedFiles = await uploadRes.json();
    return uploadedFiles[0]?.id || null;
  } catch (error) {
    console.error(`   ⚠️ Konnte kein Titelbild generieren/hochladen: ${error.message}`);
    return null;
  }
}

main();
