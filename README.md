# roterdorn.de

Monorepo für die Medienrezensions-Plattform **roterdorn.de** — Bücher, Filme, Musik, Spiele und Events.

**Stack:** Next.js 15 · Strapi v5 · PostgreSQL 16 · TypeScript · Docker

---

## Inhaltsverzeichnis

- [Architektur](#architektur)
- [Voraussetzungen](#voraussetzungen)
- [Setup](#setup)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Projektstruktur](#projektstruktur)
- [Entwicklung](#entwicklung)
- [Testing](#testing)
- [API & Caching](#api--caching)
- [Dokumentation](#dokumentation)

---

## Architektur

```
Browser
  │
  ▼
Next.js 15 (Port 3000)          — App Router, Server Components, ISR
  │  Server Components           → Datenabruf direkt von Strapi (intern)
  │  API Routes (/api/*)         → Proxy mit Auth, Rate Limiting, Validierung
  │
  ▼
Strapi v5 (Port 1337)           — Headless CMS, REST API, Admin Panel
  │
  ▼
PostgreSQL 16 (Port 5432)       — Persistente Datenhaltung
```

Das Frontend spricht **nie direkt** mit Strapi aus dem Browser. Alle schreibenden Operationen (Login, Kommentar) laufen über Next.js API-Routes, die Authentifizierung, Rate Limiting und Validierung kapseln.

---

## Voraussetzungen

Nur **Docker Desktop** ist erforderlich. Node.js und PostgreSQL müssen nicht lokal installiert sein.

---

## Setup

### 1. Repository klonen

```bash
git clone https://github.com/mittokHD/roterdorn.git
cd roterdorn
```

### 2. Umgebungsvariablen anlegen

```bash
cp .env.example .env
```

Alle Pflichtfelder in `.env` ausfüllen — siehe [Umgebungsvariablen](#umgebungsvariablen).

### 3. Projekt starten

```bash
docker compose up --build
```

Beim ersten Start werden alle Images gebaut und Abhängigkeiten installiert (ca. 3–5 Minuten).

| Dienst | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Strapi Admin | http://localhost:1337/admin |
| Strapi REST API | http://localhost:1337/api |

### 4. Strapi einrichten (einmalig)

Nach dem ersten Start im Admin Panel:

1. Admin-Account erstellen unter http://localhost:1337/admin
2. **Settings → API Tokens** → Read-only Token erstellen → in `.env` als `STRAPI_API_TOKEN` eintragen
3. **Settings → API Tokens** → Full-access Token erstellen → in `.env` als `STRAPI_WRITE_TOKEN` eintragen
4. **Settings → Webhooks** → Webhook anlegen:
   - URL: `http://frontend:3000/api/revalidate`
   - Header: `x-webhook-secret: <REVALIDATION_SECRET aus .env>`
   - Events: `entry.publish`, `entry.unpublish`

### 5. Projekt beenden

```bash
docker compose down          # Container stoppen (Daten bleiben erhalten)
docker compose down -v       # Container + Volumes löschen (Datenbank zurücksetzen)
```

---

## Umgebungsvariablen

Alle Variablen werden in einer einzigen `.env`-Datei im Root-Verzeichnis gesetzt und von Docker Compose an die jeweiligen Container weitergegeben.

### Datenbank

| Variable | Beschreibung | Beispiel |
|---|---|---|
| `DATABASE_NAME` | Name der PostgreSQL-Datenbank | `roterdorn` |
| `DATABASE_USERNAME` | Datenbanknutzer | `postgres` |
| `DATABASE_PASSWORD` | Datenbankpasswort | `sicheres_passwort` |

### Strapi (Backend)

| Variable | Beschreibung | Generieren mit |
|---|---|---|
| `APP_KEYS` | Session-Keys (kommagetrennt) | `openssl rand -base64 32` (4×) |
| `API_TOKEN_SALT` | Salt für API-Token-Generierung | `openssl rand -base64 32` |
| `ADMIN_JWT_SECRET` | JWT-Secret für Admin-Panel | `openssl rand -base64 32` |
| `JWT_SECRET` | JWT-Secret für Users-Permissions | `openssl rand -base64 32` |
| `TRANSFER_TOKEN_SALT` | Salt für Transfer-Tokens | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Verschlüsselungsschlüssel | `openssl rand -base64 32` |

### Frontend

| Variable | Beschreibung | Wert (lokal) |
|---|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | Öffentliche Strapi-URL (Browser) | `http://localhost:1337` |
| `STRAPI_INTERNAL_URL` | Docker-interne Strapi-URL (Server) | `http://roterdorn-strapi:1337` |
| `STRAPI_API_TOKEN` | Read-only API Token (aus Strapi Admin) | — |
| `STRAPI_WRITE_TOKEN` | Write API Token für Kommentare | — |
| `REVALIDATION_SECRET` | Webhook-Secret für Cache-Invalidierung | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | Öffentliche Site-URL (SEO) | `http://localhost:3000` |

---

## Projektstruktur

```
roterdorn/
├── docker-compose.yml                  Orchestrierung aller Dienste
├── .env                                Umgebungsvariablen (nicht im Git)
├── TECHNICAL_AUDIT.md                  Technisches Audit mit Priorisierungsliste
├── PRAESENTATION.md                    PowerPoint-Vorlage (IHK-Dokumentation)
│
├── backend/                            Strapi v5 (Headless CMS)
│   ├── config/
│   │   ├── database.ts                 PostgreSQL-Verbindung
│   │   ├── server.ts                   Host, Port, App-Keys
│   │   ├── admin.ts                    Admin-Panel-Konfiguration
│   │   └── middlewares.ts              CORS, Security-Header
│   ├── src/
│   │   ├── api/
│   │   │   ├── rezension/              Content-Type: Rezension (+ Dynamic Zone)
│   │   │   ├── kommentar/              Content-Type: Kommentar
│   │   │   │   └── content-types/kommentar/lifecycles.ts  E-Mail bei Freischaltung
│   │   │   ├── autor/                  Content-Type: Autor
│   │   │   └── genre/                  Content-Type: Genre
│   │   └── components/details/         Dynamic Zone Schemas (Buch, Film, Spiel, Musik, Event)
│   ├── ARCHITECTURE.md                 Backend-Dokumentation
│   └── Dockerfile.dev
│
├── frontend/                           Next.js 15 (App Router)
│   ├── app/
│   │   ├── (main)/                     Öffentliche Seiten mit gemeinsamem Layout
│   │   │   ├── page.tsx                Startseite
│   │   │   ├── [type]/page.tsx         Kategorieseite (Buch, Film, …)
│   │   │   ├── [type]/[slug]/page.tsx  Rezensions-Detailseite
│   │   │   ├── suche/page.tsx          Volltextsuche
│   │   │   ├── login/ & registrieren/  Authentifizierung
│   │   │   └── profil/page.tsx         Nutzerprofil & Kommentarhistorie
│   │   └── api/
│   │       ├── auth/                   Login, Register, Me, Logout
│   │       ├── comments/               Kommentar einreichen (Auth + Rate Limit)
│   │       ├── profile/comments/       Nutzer-Kommentare abrufen
│   │       ├── search/                 Suchproxy
│   │       └── revalidate/             ISR-Webhook-Endpunkt
│   ├── components/
│   │   ├── layout/                     Header, Footer, Navigation, MobileMenu
│   │   ├── reviews/                    ReviewCard, FilterBar, DetailSection, SimilarReviews
│   │   ├── comments/                   CommentSection, CommentForm, CommentGate
│   │   └── ui/                         RatingBadge, TypeBadge, EmptyState, Icons, …
│   ├── contexts/                       AuthContext, ThemeContext
│   ├── hooks/
│   │   ├── useFormSubmit.ts            Generischer Form-Hook (Login, Register, …)
│   │   └── useCommentSubmit.ts         Spezialisierter Kommentar-Hook
│   ├── lib/
│   │   ├── strapi.ts                   Strapi API-Client (Query Builder, ISR-Tags)
│   │   ├── types.ts                    TypeScript-Interfaces (Strapi-Wrapper, Content-Types)
│   │   ├── config.ts                   Umgebungsvariablen (Single Source of Truth)
│   │   ├── constants.ts                TYPE_META, NAV_ITEMS (Single Source of Truth)
│   │   ├── schemas.ts                  Validierungsschemas (parseComment, parseLogin, …)
│   │   ├── sanitize.ts                 HTML-Sanitizer für dangerouslySetInnerHTML
│   │   ├── rateLimit.ts                In-Memory Rate Limiter (IP-basiert)
│   │   ├── logger.ts                   Zentraler Error-Logger (Sentry-ready)
│   │   └── utils.ts                    Hilfsfunktionen (formatDate, readingTime, buildReviewJsonLd)
│   ├── e2e/                            Playwright E2E-Tests
│   │   ├── auth.spec.ts                Login, Register, Rate Limit
│   │   └── comments.spec.ts            Kommentar-Flow, SEO, Navigation
│   ├── __tests__/                      Vitest Unit-Tests
│   │   ├── utils.test.ts               formatDate, readingTime
│   │   ├── useFormSubmit.test.ts       Hook-Zustandsübergänge
│   │   └── schemas.test.ts             Validierungslogik
│   ├── ARCHITECTURE.md                 Frontend-Dokumentation
│   └── Dockerfile.dev
│
└── migration/                          Legacy-Datenmigrations-Tooling (einmalig)
```

---

## Entwicklung

### Einzelne Dienste starten

```bash
docker compose up postgres strapi    # Nur Backend-Stack
docker compose up frontend           # Nur Frontend (setzt laufenden Strapi voraus)
```

### Logs beobachten

```bash
docker compose logs -f frontend      # Frontend-Logs streamen
docker compose logs -f strapi        # Strapi-Logs streamen
```

### Datenbank-Shell

```bash
docker compose exec postgres psql -U postgres -d roterdorn
```

### Strapi Content-Types anpassen

Änderungen am Schema über das Strapi Admin Panel vornehmen. Strapi generiert die Migrationsdateien automatisch und startet im `develop`-Modus neu.

---

## Testing

> **Voraussetzung:** Pakete lokal installieren (außerhalb Docker, für die Testentwicklung).
>
> ```bash
> cd frontend
> npm install
> npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
> npm install -D @playwright/test && npx playwright install chromium
> ```

### Unit-Tests (Vitest)

Testen isoliert: Utilities, Hooks, Validierungsschemas — ohne Browser oder Server.

```bash
cd frontend

npm test              # Watch-Mode (während der Entwicklung)
npm run test:run      # Einmalig (für CI/CD)
npm run coverage      # Mit Coverage-Report
```

**Aktuelle Testabdeckung:**

| Datei | Inhalt | Tests |
|---|---|---|
| `__tests__/utils.test.ts` | `formatDate`, `readingTime` | 7 |
| `__tests__/useFormSubmit.test.ts` | Alle Status-Übergänge | 6 |
| `__tests__/schemas.test.ts` | `parseComment`, `parseLogin`, `parseRegister` | 10 |

### E2E-Tests (Playwright)

Testen echte Nutzerflüsse im Browser gegen den laufenden Dev-Server.

```bash
# Dev-Server muss laufen (in separatem Terminal oder via Docker)
cd frontend

npx playwright test             # Alle Tests headless
npx playwright test --ui        # Visueller Test-Explorer (empfohlen)
npx playwright test --headed    # Mit sichtbarem Browser (zum Debuggen)
npx playwright test e2e/auth.spec.ts   # Einzelne Datei
```

Test-Nutzer für E2E konfigurieren (in `frontend/.env.test.local`):

```bash
E2E_USER_EMAIL=test@roterdorn.de
E2E_USER_PASSWORD=deinTestPasswort
```

---

## API & Caching

### ISR — Incremental Static Regeneration

Seiten werden statisch generiert und über **Cache-Tags** invalidiert:

```
Strapi Publish-Event
  → Webhook POST /api/revalidate
  → revalidateTag("rezensionen")
  → Nächster Request baut Seite neu
```

Manuelle Invalidierung (z. B. nach Bulk-Import):

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"<REVALIDATION_SECRET>"}'
```

### Sicherheitsschichten

| Schicht | Maßnahme |
|---|---|
| Auth | httpOnly-Cookie (kein JS-Zugriff auf JWT) |
| Rate Limiting | `/api/comments` 5/min · `/api/auth/login` 10/min · `/api/auth/register` 3/min |
| Validierung | `lib/schemas.ts` — typsichere Eingabevalidierung auf allen Schreib-Routes |
| XSS | `lib/sanitize.ts` — HTML-Sanitizer vor `dangerouslySetInnerHTML` |
| Spam | Honeypot-Feld im Kommentarformular |
| CORS | Strapi erlaubt nur den konfigurierten Frontend-Origin |

---

## Dokumentation

| Datei | Inhalt |
|---|---|
| [`TECHNICAL_AUDIT.md`](./TECHNICAL_AUDIT.md) | Priorisiertes Audit (HIGH/MEDIUM/LOW) mit Code-Beispielen |
| [`frontend/ARCHITECTURE.md`](./frontend/ARCHITECTURE.md) | Schichtenmodell, alle `lib/`-Module, Auth-Flow, Design-System |
| [`backend/ARCHITECTURE.md`](./backend/ARCHITECTURE.md) | Content-Types, REST-API-Referenz, RBAC, Docker-Integration |
| [`PRAESENTATION.md`](./PRAESENTATION.md) | PowerPoint-Vorlage (33 Folien, IHK-Inhaltsverzeichnis) |

---

## Lizenz

© roterdorn.de — Alle Rechte vorbehalten.
