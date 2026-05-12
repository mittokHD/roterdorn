import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.loadEnvFile(path.join(__dirname, '../.env'));

const {
  MYSQL_HOST: DB_HOST = 'localhost',
  MYSQL_USER: DB_USER = 'root',
  MYSQL_PASSWORD: DB_PASSWORD = 'root',
  MYSQL_DATABASE: DB_NAME = 'wp_legacy',
  MYSQL_PORT: DB_PORT = 3308,
  STRAPI_MIGRATION_URL,
  NEXT_PUBLIC_STRAPI_URL,
  STRAPI_WRITE_TOKEN: STRAPI_TOKEN = '',
} = process.env;

const STRAPI_URL =
  STRAPI_MIGRATION_URL || `${NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api`;

const execFileAsync = promisify(execFile);

function generateSlug(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function fileNameFromUrl(url, fallbackTitle) {
  const parsed = new URL(url);
  const rawName = decodeURIComponent(parsed.pathname.split('/').pop() || '');
  const ext = rawName.includes('.') ? rawName.slice(rawName.lastIndexOf('.')) : '.jpg';
  return `${generateSlug(fallbackTitle)}${ext.toLowerCase()}`;
}

function mimeFromFileName(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

async function downloadImage(imageUrl, fileName) {
  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error(`image ${imageRes.status} ${imageRes.statusText}`);
    }

    return {
      buffer: await imageRes.arrayBuffer(),
      mime: imageRes.headers.get('content-type') || mimeFromFileName(fileName),
    };
  } catch {
    const curlCommand = process.platform === 'win32' ? 'curl.exe' : 'curl';
    const { stdout } = await execFileAsync(
      curlCommand,
      ['-L', '--fail', '--silent', '--show-error', imageUrl],
      { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 },
    );

    return {
      buffer: stdout.buffer.slice(stdout.byteOffset, stdout.byteOffset + stdout.byteLength),
      mime: mimeFromFileName(fileName),
    };
  }
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
  }

  return res.json();
}

async function findRezensionBySlug(slug) {
  const query = new URLSearchParams({
    'filters[slug][$eq]': slug,
    publicationState: 'preview',
    'populate[cover]': 'true',
  });
  const data = await fetchJson(`${STRAPI_URL}/rezensionen?${query}`);
  return data.data?.[0] || null;
}

async function uploadCover(rezension, imageUrl, title) {
  const fileName = fileNameFromUrl(imageUrl, title);
  const { buffer, mime } = await downloadImage(imageUrl, fileName);
  const formData = new FormData();

  formData.append('files', new Blob([buffer], { type: mime }), fileName);
  formData.append('ref', 'api::rezension.rezension');
  formData.append('refId', String(rezension.id));
  formData.append('field', 'cover');

  const uploadRes = await fetch(`${STRAPI_URL.replace('/api', '')}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    body: formData,
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    throw new Error(`upload ${uploadRes.status} ${uploadRes.statusText}: ${body.slice(0, 300)}`);
  }

  return uploadRes.json();
}

async function main() {
  if (!STRAPI_TOKEN) {
    throw new Error('STRAPI_WRITE_TOKEN is required.');
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number.parseInt(DB_PORT, 10),
  });

  try {
    const [posts] = await connection.execute(`
      SELECT p.ID, p.post_title, a.guid AS attachment_url
      FROM wp_posts p
      JOIN wp_postmeta pm ON pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
      JOIN wp_posts a ON a.ID = pm.meta_value
      WHERE p.post_status = 'publish'
        AND p.post_type IN ('post', 'buch', 'film', 'musik', 'spiel', 'event')
        AND a.post_mime_type LIKE 'image/%'
      ORDER BY p.post_date DESC
    `);

    let imported = 0;
    let skipped = 0;
    let missing = 0;
    let failed = 0;

    for (const post of posts) {
      const baseSlug = generateSlug(post.post_title);
      const candidates = [baseSlug, `${baseSlug}-${post.ID}`];
      const rezension = await findRezensionBySlug(candidates[0]) || await findRezensionBySlug(candidates[1]);

      if (!rezension) {
        missing += 1;
        console.log(`missing: ${post.post_title}`);
        continue;
      }

      if (rezension.cover) {
        skipped += 1;
        continue;
      }

      try {
        await uploadCover(rezension, post.attachment_url, post.post_title);
        imported += 1;
        console.log(`imported: ${post.post_title}`);
      } catch (error) {
        failed += 1;
        console.error(`failed: ${post.post_title} - ${error.message}`);
      }
    }

    console.log(JSON.stringify({ imported, skipped, missing, failed, total: posts.length }, null, 2));
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
