# Backend — Architektur & Dokumentation

**Framework:** Strapi v5.42.1 (Headless CMS)  
**Sprache:** TypeScript  
**Datenbank:** PostgreSQL 16  
**Laufzeitumgebung:** Node.js (Docker-Container)

---

## Ordnerstruktur

```
backend/
├── config/                     # Strapi-Kernkonfiguration
│   ├── database.ts             # PostgreSQL-Verbindung
│   ├── server.ts               # Host, Port, App-Keys
│   ├── admin.ts                # Admin-Panel-Konfiguration
│   ├── api.ts                  # REST-API-Standardeinstellungen
│   ├── plugins.ts              # Plugin-Konfiguration
│   └── middlewares.ts          # Middleware-Stack
│
├── src/
│   ├── index.ts                # Bootstrap- & Register-Hooks
│   │
│   ├── api/                    # Content-Type-Definitionen (MVC)
│   │   ├── rezension/
│   │   │   ├── controllers/rezension.ts
│   │   │   ├── services/rezension.ts
│   │   │   ├── routes/rezension.ts
│   │   │   └── content-types/rezension/schema.json
│   │   ├── kommentar/
│   │   │   ├── controllers/kommentar.ts
│   │   │   ├── services/kommentar.ts
│   │   │   ├── routes/kommentar.ts
│   │   │   └── content-types/kommentar/schema.json
│   │   ├── autor/
│   │   │   ├── controllers/autor.ts
│   │   │   ├── services/autor.ts
│   │   │   ├── routes/autor.ts
│   │   │   └── content-types/autor/schema.json
│   │   └── genre/
│   │       ├── controllers/genre.ts
│   │       ├── services/genre.ts
│   │       ├── routes/genre.ts
│   │       └── content-types/genre/schema.json
│   │
│   ├── components/             # Dynamic Zone Komponenten
│   │   └── details/
│   │       ├── book-details.json
│   │       ├── movie-details.json
│   │       ├── game-details.json
│   │       ├── music-details.json
│   │       └── event-details.json
│   │
│   ├── admin/                  # Admin-Panel-Anpassungen
│   └── extensions/             # Plugin-Erweiterungen
│
├── database/
│   └── migrations/             # Datenbankmigrationen
│
├── public/
│   └── uploads/                # Medien-Uploads (persistentes Volume)
│
├── Dockerfile.dev              # Development-Image
├── package.json
└── tsconfig.json
```

---

## Architekturprinzip

Das Backend folgt dem **MVC-Muster von Strapi v5**. Jeder Content-Type besteht aus vier Teilen:

```
Content-Type (z. B. Rezension)
├── schema.json      → Datenbankschema & Feldtypen
├── controller.ts    → HTTP-Request-Handler
├── service.ts       → Business-Logik (DB-Zugriff)
└── routes.ts        → URL-Routing
```

Alle vier Dateien nutzen Strapi-Factory-Funktionen und enthalten **keine eigene Logik** — sie delegieren vollständig an die Strapi-Defaults:

```ts
// Typisches Muster in allen Controllern, Services und Routen
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::rezension.rezension');
export default factories.createCoreService('api::rezension.rezension');
export default factories.createCoreRouter('api::rezension.rezension');
```

**Erweiterungen** werden vorgenommen, indem die Factory-Funktion ein Objekt mit überschriebenen Methoden erhält:

```ts
export default factories.createCoreController('api::rezension.rezension', ({ strapi }) => ({
  async find(ctx) {
    // Eigene Logik vor/nach dem Standard-Find
    const result = await super.find(ctx);
    return result;
  },
}));
```

---

## Datenbankschema

### Entity-Relationship-Übersicht

```
Rezension ──────── Autor        (manyToOne)
Rezension ──────── Genre[]      (manyToMany)
Rezension ──────── Kommentar[]  (oneToMany)
Kommentar ──────── User         (manyToOne, via users-permissions Plugin)
Rezension ──────── Details[]    (Dynamic Zone: 5 Komponenten-Typen)
```

---

### Content-Type: Rezension

Die zentrale Entität der Plattform. Repräsentiert eine Kritik zu einem Werk.

**Datei:** `src/api/rezension/content-types/rezension/schema.json`

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `title` | String | ✅ | Titel der Rezension |
| `slug` | UID (→ title) | ✅ | URL-Slug, eindeutig |
| `content` | RichText | ✅ | Volltext (HTML) |
| `cover` | Media (single) | ❌ | Titelbild |
| `rating` | Decimal (0–10) | ✅ | Bewertung |
| `type` | Enumeration | ✅ | `buch \| film \| spiel \| musik \| event` |
| `autor` | Relation → Autor | ❌ | Autor der Rezension (manyToOne) |
| `genres` | Relation → Genre[] | ❌ | Zugeordnete Genres (manyToMany) |
| `kommentare` | Relation → Kommentar[] | ❌ | Nutzerkommentare (oneToMany) |
| `details` | Dynamic Zone | ❌ | Typ-spezifische Metadaten |

**Draft & Publish:** Aktiviert — Rezensionen sind erst nach explizitem Veröffentlichen öffentlich sichtbar.

**Dynamic Zone `details`** — unterstützte Komponenten:

| Komponente | `__component` | Felder |
|---|---|---|
| Buchdetails | `details.book-details` | isbn, pages, publisher, publishedDate |
| Filmdetails | `details.movie-details` | fsk (enum), duration, director, releaseYear |
| Spieldetails | `details.game-details` | platform, developer, publisher, releaseYear |
| Musikdetails | `details.music-details` | artist, label, tracks, releaseYear |
| Eventdetails | `details.event-details` | location, eventDate, organizer |

---

### Content-Type: Kommentar

Nutzerkommentare zu einer Rezension, mit Moderationsfunktion.

**Datei:** `src/api/kommentar/content-types/kommentar/schema.json`

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `name` | String | ✅ | Anzeigename (Snapshot, da Username änderbar) |
| `text` | Text | ✅ | Kommentarinhalt |
| `isApproved` | Boolean | ✅ (default: false) | Freigabestatus |
| `rezension` | Relation → Rezension | ✅ | Zugehörige Rezension (manyToOne) |
| `user` | Relation → User | ❌ | Verknüpfter Nutzer (manyToOne) |

**Draft & Publish:** Deaktiviert — Kommentare existieren sofort, sind aber nur sichtbar wenn `isApproved: true`.

**Moderationsflow:**
```
Nutzer sendet Kommentar → isApproved: false (unsichtbar)
        ↓
Admin prüft im Strapi-Panel
        ↓
Admin setzt isApproved: true → Kommentar erscheint öffentlich
```

---

### Content-Type: Autor

Autoren-Profile für Rezensenten.

**Datei:** `src/api/autor/content-types/autor/schema.json`

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `name` | String | ✅ | Vollständiger Name |
| `bio` | RichText | ❌ | Biografie |
| `avatar` | Media (single) | ❌ | Profilbild |
| `rezensionen` | Relation → Rezension[] | — | Inverse Relation (oneToMany) |

---

### Content-Type: Genre

Taxonomie für die Kategorisierung von Rezensionen.

**Datei:** `src/api/genre/content-types/genre/schema.json`

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `name` | String | ✅ (unique) | Genre-Name (z. B. "Science Fiction") |
| `slug` | UID (→ name) | ✅ | URL-freundlicher Bezeichner |
| `rezensionen` | Relation → Rezension[] | — | Inverse Relation (manyToMany) |

---

## Dynamic Zone Komponenten

Die fünf Detail-Komponenten befinden sich in `src/components/details/` und werden in der Dynamic Zone von `Rezension.details` verwendet. Pro Rezension kann maximal eine Detail-Komponente gesetzt werden.

### `details.book-details`

```json
{
  "isbn":          { "type": "string" },
  "pages":         { "type": "integer" },
  "publisher":     { "type": "string" },
  "publishedDate": { "type": "date" }
}
```

### `details.movie-details`

```json
{
  "fsk":         { "type": "enumeration", "enum": ["0","6","12","16","18"] },
  "duration":    { "type": "integer" },
  "director":    { "type": "string" },
  "releaseYear": { "type": "integer" }
}
```

### `details.game-details`

```json
{
  "platform":    { "type": "string" },
  "developer":   { "type": "string" },
  "publisher":   { "type": "string" },
  "releaseYear": { "type": "integer" }
}
```

### `details.music-details`

```json
{
  "artist":      { "type": "string" },
  "label":       { "type": "string" },
  "tracks":      { "type": "integer" },
  "releaseYear": { "type": "integer" }
}
```

### `details.event-details`

```json
{
  "location":   { "type": "string" },
  "eventDate":  { "type": "date" },
  "organizer":  { "type": "string" }
}
```

---

## Konfiguration

### `config/database.ts`

PostgreSQL-Verbindungskonfiguration via Umgebungsvariablen:

```ts
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host:     env('DATABASE_HOST', 'localhost'),
      port:     env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'roterdorn'),
      user:     env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', ''),
      ssl:      env.bool('DATABASE_SSL', false),
    },
    pool: { min: 2, max: 10 },
  },
});
```

### `config/server.ts`

```ts
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

### Umgebungsvariablen (`.env`)

| Variable | Beschreibung | Beispiel |
|---|---|---|
| `DATABASE_HOST` | PostgreSQL-Host | `postgres` (Docker) |
| `DATABASE_PORT` | PostgreSQL-Port | `5432` |
| `DATABASE_NAME` | Datenbankname | `roterdorn` |
| `DATABASE_USERNAME` | DB-Nutzer | `postgres` |
| `DATABASE_PASSWORD` | DB-Passwort | `geheim` |
| `APP_KEYS` | Strapi Session-Keys (kommagetrennt) | `key1,key2` |
| `API_TOKEN_SALT` | Salt für API-Token-Generierung | Random-String |
| `ADMIN_JWT_SECRET` | JWT-Secret für Admin-Panel | Random-String |
| `JWT_SECRET` | JWT-Secret für Users-Permissions | Random-String |

---

## REST API — Endpoints

Strapi generiert automatisch CRUD-Endpoints für jeden Content-Type:

### Rezension

| Method | Endpoint | Beschreibung |
|---|---|---|
| `GET` | `/api/rezensions` | Liste aller veröffentlichten Rezensionen |
| `GET` | `/api/rezensions/:id` | Einzelne Rezension by ID |
| `POST` | `/api/rezensions` | Neue Rezension erstellen (Auth) |
| `PUT` | `/api/rezensions/:id` | Rezension aktualisieren (Auth) |
| `DELETE` | `/api/rezensions/:id` | Rezension löschen (Auth) |

### Query-Parameter (Strapi v5 Filter-Syntax)

```
# Filtern nach Typ
GET /api/rezensions?filters[type][$eq]=film

# Filtern nach Genre (Relation)
GET /api/rezensions?filters[genres][slug][$eq]=science-fiction

# Volltextsuche (case-insensitive)
GET /api/rezensions?filters[title][$containsi]=matrix

# Populate (Relationen laden)
GET /api/rezensions?populate[cover][fields][0]=url&populate[autor][fields][0]=name

# Sortierung
GET /api/rezensions?sort[0]=rating:desc&sort[1]=publishedAt:desc

# Paginierung
GET /api/rezensions?pagination[page]=1&pagination[pageSize]=12
```

### Authentifizierung

Öffentliche Reads sind ohne Token möglich (konfigurierbar über Strapi-Berechtigungen). Schreiboperationen erfordern einen **Bearer Token**:

```
Authorization: Bearer <STRAPI_API_TOKEN>
```

Der Token wird in Strapi unter **Settings → API Tokens** generiert und im Frontend als `STRAPI_API_TOKEN`-Umgebungsvariable gesetzt.

---

## Users & Permissions Plugin

Strapi's eingebautes Authentifizierungssystem wird für Nutzerregistrierung und -anmeldung verwendet.

| Endpoint | Methode | Beschreibung |
|---|---|---|
| `/api/auth/local/register` | POST | Neuen Nutzer registrieren |
| `/api/auth/local` | POST | Einloggen → gibt JWT zurück |
| `/api/users/me` | GET | Aktuellen Nutzer abrufen (Bearer Auth) |

**Nutzerfelder** (Standard):
- `id`, `username`, `email`, `confirmed`, `blocked`, `createdAt`

**Beziehung zu Kommentaren:** `user.id` wird beim Kommentar-Erstellen mitgespeichert. Damit können beim Löschen eines Kontos oder Ändern des Usernamens alle historischen Kommentare dennoch dem ursprünglichen Nutzer zugeordnet werden.

---

## Docker-Konfiguration

**`Dockerfile.dev`** — Development-Image:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 1337
CMD ["npm", "run", "develop"]
```

**Docker Compose Integration** (aus `docker-compose.yml`):

```yaml
strapi:
  build:
    context: ./backend
    dockerfile: Dockerfile.dev
  environment:
    DATABASE_HOST: postgres
    DATABASE_PORT: 5432
    # ... weitere Variablen
  volumes:
    - ./backend:/app          # Hot Reload im Development
    - strapi_uploads:/app/public/uploads   # Persistente Uploads
  depends_on:
    postgres:
      condition: service_healthy
```

**Persistentes Volume** `strapi_uploads` stellt sicher, dass hochgeladene Medien über Container-Neustarts hinaus erhalten bleiben.

---

## Migrations & Datenbankevolution

Datenbankmigrationen liegen in `database/migrations/`. Strapi v5 erzeugt automatisch Migrationsdateien beim Ändern von Content-Type-Schemas über das Admin-Panel.

**Manuelle Migration** via Strapi CLI:

```bash
# Migration erstellen
npm run strapi generate migration <name>

# Migrationen ausführen
npm run strapi migration:run
```

**`migration/`-Verzeichnis im Projektroot** enthält Legacy-Datenmigrationstools für den initialen Datenimport (einmalige Verwendung, dokumentiert in `migration/README.md`).

---

## Sicherheitskonfiguration

### CORS

Konfiguriert in `config/middlewares.ts` — erlaubt nur den Frontend-Origin:

```ts
{
  name: 'strapi::cors',
  config: {
    origin: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    headers: ['Content-Type', 'Authorization'],
  },
}
```

### API-Berechtigungen (RBAC)

Strapi's Role-Based Access Control unterscheidet:

| Rolle | Rechte |
|---|---|
| **Public** | GET auf `rezension`, `genre` (veröffentlicht) |
| **Authenticated** | + POST auf `kommentar` |
| **Admin** | Vollzugriff auf alle Endpunkte + Admin-Panel |

Berechtigungen werden im Admin-Panel unter **Settings → Users & Permissions → Roles** verwaltet.

### Content-Sicherheit

- **Rich Text:** Strapi's WYSIWYG-Editor (Lexical) erzeugt HTML-Output. Eine explizite serverseitige HTML-Sanitization ist **nicht** konfiguriert — das Frontend sollte DOMPurify vor dem Rendern mit `dangerouslySetInnerHTML` einsetzen.
- **Datei-Uploads:** Strapi begrenzt erlaubte MIME-Typen (Standard: Bilder). Konfigurierbar über `config/plugins.ts`.

---

## Admin Panel

Das Strapi Admin Panel ist erreichbar unter:

```
http://localhost:1337/admin    (Entwicklung)
```

**Hauptfunktionen:**
- Content Manager: Rezensionen erstellen, bearbeiten, veröffentlichen
- Kommentar-Moderation: `isApproved` auf `true` setzen
- Medienverwaltung: Upload und Verwaltung von Bilddateien
- Nutzer- und Rollenverwaltung
- API-Token-Generierung
- Webhook-Konfiguration (für Frontend-Revalidierung)

**Webhook für Cache-Revalidierung:**

Im Admin Panel unter **Settings → Webhooks** einen Webhook auf `POST http://frontend:3000/api/revalidate` mit dem konfigurierten `REVALIDATE_SECRET` einrichten. Dieser wird bei jedem Publish/Unpublish einer Rezension ausgelöst.
