# Frontend — Architektur & Dokumentation

**Framework:** Next.js 15 (App Router)  
**Sprache:** TypeScript 5 (strict mode)  
**Styling:** Tailwind CSS 4 + CSS Custom Properties  
**Runtime:** React 19  

---

## Ordnerstruktur

```
frontend/
├── app/                        # Next.js App Router
│   ├── (main)/                 # Route-Gruppe mit gemeinsamem Layout
│   │   ├── layout.tsx          # Header + Footer Wrapper
│   │   ├── page.tsx            # Startseite (/)
│   │   ├── loading.tsx         # Globaler Ladezustand
│   │   ├── [type]/             # Dynamische Kategorie-Route (/buch, /film, …)
│   │   │   ├── page.tsx        # Kategorieübersicht
│   │   │   ├── loading.tsx
│   │   │   └── [slug]/page.tsx # Rezensions-Detailseite
│   │   │
│   │   ├── admin/              # Admin-Bereich (erfordert isAdmin)
│   │   │   ├── page.tsx        # Admin-Dashboard
│   │   │   ├── beitraege/
│   │   │   │   ├── page.tsx    # Beitragsliste
│   │   │   │   ├── neu/page.tsx
│   │   │   │   └── [documentId]/bearbeiten/page.tsx
│   │   │   └── crosspost/page.tsx  # Social-Media-Crosspost-Tool
│   │   │
│   │   ├── artikel/            # Redaktionelle Artikel (Legacy-Daten)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── neuigkeiten/        # Neuigkeiten (Legacy-Daten)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── interview/          # Interviews (Legacy-Daten)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   │
│   │   ├── # Taxonomie-Seiten (alle über LegacyTaxonomyPage gerendert)
│   │   ├── buchautor/[term]/    buchgenre/[term]/   buchkategorie/[term]/
│   │   ├── buchsprecher/[term]/ buchverlag/[term]/  darsteller/[term]/
│   │   ├── filmgenre/[term]/    filmkategorie/[term]/ filmstudio/[term]/
│   │   ├── herausgeber/[term]/  label/[term]/        musiker/[term]/
│   │   ├── musikgenre/[term]/   publisher/[term]/    regie/[term]/
│   │   ├── releasekategorie/[term]/ serie/[term]/   spielautor/[term]/
│   │   ├── spielentwickler/[term]/ spielgenre/[term]/ spielkategorie/[term]/
│   │   └── zeichner/[term]/
│   │
│   │   ├── suche/page.tsx          # Volltextsuche
│   │   ├── login/page.tsx          # Anmeldung
│   │   ├── registrieren/page.tsx
│   │   ├── profil/page.tsx         # Benutzerprofil + Kommentarhistorie
│   │   ├── datenschutz/page.tsx
│   │   ├── impressum/page.tsx
│   │   └── ueber-uns/page.tsx
│   │
│   ├── api/                        # Next.js API Routes (Proxy zu Strapi)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── logout/route.ts
│   │   ├── admin/
│   │   │   ├── rezensionen/route.ts          # POST: neue Rezension
│   │   │   └── rezensionen/[documentId]/route.ts  # PUT/DELETE
│   │   │   └── crosspost/route.ts
│   │   ├── comments/route.ts
│   │   ├── profile/comments/route.ts
│   │   ├── search/route.ts
│   │   └── revalidate/route.ts
│   │
│   ├── layout.tsx              # Root Layout (HTML, AuthProvider, ThemeProvider)
│   ├── error.tsx               # Fehler-Boundary (Client Component)
│   ├── not-found.tsx           # 404-Seite
│   ├── robots.ts               # SEO robots.txt
│   ├── sitemap.ts              # Dynamische sitemap.xml
│   └── globals.css             # Design-System CSS-Variablen + Animationen
│
├── components/                 # Wiederverwendbare UI-Komponenten
│   ├── layout/                 # Strukturkomponenten
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HeaderAuth.tsx
│   │   ├── NavLink.tsx
│   │   ├── MobileMenu.tsx
│   │   └── StaticContentPage.tsx  # Wrapper für statische Inhaltsseiten
│   ├── home/                   # Startseiten-Sektionen
│   │   ├── HeroSection.tsx
│   │   ├── CategoriesSection.tsx
│   │   ├── LatestReviewsSection.tsx
│   │   └── LatestCommentsSection.tsx
│   ├── reviews/                # Rezensions-Anzeigekomponenten
│   │   ├── ReviewCard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── DetailSection.tsx
│   │   ├── SimilarReviews.tsx
│   │   └── AffiliateLinksBox.tsx
│   ├── comments/               # Kommentarsystem
│   │   ├── CommentSection.tsx
│   │   ├── CommentForm.tsx
│   │   └── CommentGate.tsx
│   ├── admin/                  # Admin-Bereich-Komponenten
│   │   ├── AdminReviewList.tsx
│   │   ├── ReviewEditorForm.tsx
│   │   ├── CrosspostPanel.tsx
│   │   └── AdminAccessState.tsx
│   ├── editorial/              # Legacy-Redaktionsinhalt
│   │   ├── LegacyEditorialArchive.tsx
│   │   └── LegacyEditorialDetail.tsx
│   ├── music/
│   │   └── MusicTaxonomyDirectory.tsx  # Musik-Taxonomie-Listen (Label, Musiker, Genre)
│   ├── taxonomy/
│   │   └── LegacyTaxonomyPage.tsx      # Generischer Taxonomie-Seiten-Renderer
│   └── ui/                     # Primitive UI-Elemente
│       ├── Icons.tsx
│       ├── RatingBadge.tsx
│       ├── TypeBadge.tsx
│       ├── EmptyState.tsx
│       ├── ReadingProgress.tsx
│       └── ThemeToggle.tsx
│
├── contexts/                   # React Context Provider
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── hooks/                      # Custom React Hooks
│   ├── useCommentSubmit.ts     # Kapselt Kommentar-Submission-Logik
│   └── useFormSubmit.ts        # Generischer Form-Submission-Hook
│
├── lib/                        # Utilities & Datenzugriff
│   ├── types.ts                # TypeScript-Typdefinitionen
│   ├── config.ts               # Umgebungsvariablen (Single Source of Truth)
│   ├── constants.ts            # TYPE_META, NAV_ITEMS, Kategorie-Konfiguration
│   ├── strapi.ts               # Strapi API-Client (Server-seitig)
│   ├── admin-auth.ts           # Admin-Authentifizierungshelfer
│   ├── admin-reviews.ts        # Admin-Rezensions-CRUD (Server Actions / API)
│   ├── admin-review-fields.ts  # Feldkonfiguration je Rezensionstyp
│   ├── schemas.ts              # Input-Validierung für API-Routes
│   ├── sanitize.ts             # Server-seitiger HTML-Sanitizer
│   ├── review-html.ts          # HTML-Nachbearbeitung (YouTube-Embeds, WP-Captions)
│   ├── rateLimit.ts            # In-Memory-Rate-Limiter für API-Routes
│   ├── utils.ts                # Reine Utility-Funktionen
│   ├── static-page-content.ts  # Inhalte für statische Seiten (Impressum etc.)
│   ├── legacy-editorial.generated.ts    # Statische Legacy-Redaktionsdaten
│   ├── legacy-review-aliases.generated.ts
│   ├── legacy-review-details.generated.ts
│   └── music-taxonomies.generated.ts
│
├── __tests__/                  # Vitest Unit-Tests
│   ├── schemas.test.ts
│   ├── utils.test.ts
│   └── useFormSubmit.test.ts
│
└── e2e/                        # Playwright End-to-End-Tests
    ├── auth.spec.ts
    └── comments.spec.ts
```

---

## Schichtenmodell

```
┌─────────────────────────────────────────────────────────────────┐
│                    app/ (Routing Layer)                         │
│  Server Components · generateMetadata · ISR · Admin Pages      │
├─────────────────────────────────────────────────────────────────┤
│                  components/ (UI Layer)                         │
│  Presentational · Props-driven · No fetching                   │
├─────────────────────────────────────────────────────────────────┤
│            contexts/ + hooks/ (State Layer)                     │
│  AuthContext · ThemeContext · useFormSubmit · useCommentSubmit  │
├─────────────────────────────────────────────────────────────────┤
│                  lib/ (Data Access Layer)                       │
│  strapi.ts · admin-reviews.ts · admin-auth.ts                  │
│  schemas.ts · sanitize.ts · review-html.ts · rateLimit.ts      │
└─────────────────────────────────────────────────────────────────┘
```

**Regel:** Datenabruf findet ausschließlich in `lib/strapi.ts` (Server-seitig) oder `app/api/` (API-Routes) statt. Komponenten rufen nie direkt `fetch()` auf.

---

## lib/ — Utility- & Datenschicht

### `lib/types.ts`

Zentrale TypeScript-Typdefinitionen für alle Strapi-API-Antworten.

Strapi v5 gibt Entitäten **flach** zurück (kein `attributes`-Wrapper mehr):

```ts
// Strapi v5 Response-Wrapper
interface StrapiResponse<T>       { data: T[]; meta: { pagination: StrapiPagination } }
interface StrapiSingleResponse<T> { data: T; meta: Record<string, never> }

// Haupt-Content-Typen
interface Rezension {
  id:             number;
  documentId:     string;          // Strapi v5 stabile ID über Versionen hinweg
  title:          string;
  slug:           string;
  content:        string;          // HTML (Rich Text aus Strapi)
  rating:         number | null;   // 0–10
  type:           RezensionType;   // 'Buch' | 'Film' | 'Musik' | 'Spiel' | 'Event'
  cover:          StrapiMedia | null;
  autor:          Autor | null;
  genres:         Genre[];
  kommentare:     Kommentar[];
  details:        DetailComponent[];      // Dynamic Zone
  extraDetails?:  AdminExtraDetailRow[] | null;  // JSON: erweiterbare Metadaten
  affiliateLinks?: AdminAffiliateLink[] | null;  // JSON: Affiliate-Links
  publishedAt:    string | null;
}

// Admin-spezifische Typen
interface AdminExtraDetailRow {
  label: string;
  values: Array<{ label: string; href?: string; slug?: string }>;
}

interface AdminAffiliateLink {
  label: string;
  url: string;
  provider?: string;  // z. B. "Amazon"
}

// Discriminated Union für Dynamic Zone
type DetailComponent =
  | BookDetails   // __component: 'details.book-details'
  | MovieDetails  // __component: 'details.movie-details'
  | GameDetails   // __component: 'details.game-details'
  | MusicDetails  // __component: 'details.music-details'
  | EventDetails; // __component: 'details.event-details'
```

**Abgeleitete Hilfsmappings** (re-exportiert aus `constants.ts`):

```ts
export const TYPE_SLUG_MAP:    Record<string, RezensionType>   // slug → Type
export const TYPE_REVERSE_MAP: Record<RezensionType, string>   // Type → slug
export const TYPE_LABELS:      Record<RezensionType, string>   // Type → labelPlural
```

### `lib/config.ts`

Single Source of Truth für Umgebungsvariablen. Kein direktes `process.env` in Komponenten oder Pages.

```ts
export const STRAPI_INTERNAL_URL = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
export const STRAPI_PUBLIC_URL   = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
export const STRAPI_API_TOKEN    = process.env.STRAPI_API_TOKEN;         // Read-only Token
export const STRAPI_WRITE_TOKEN  = process.env.STRAPI_WRITE_TOKEN;       // Write-Token (Admin)
export const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;
export const SITE_URL            = process.env.NEXT_PUBLIC_SITE_URL || 'https://roterdorn.de';
```

| Variable | Verwendung | Scope |
|---|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | Öffentliche URL für Mediendateien | Browser + Server |
| `STRAPI_INTERNAL_URL` | Docker-interner API-Aufruf | Server only |
| `STRAPI_API_TOKEN` | Read-only Strapi REST-API Bearer Token | Server only |
| `STRAPI_WRITE_TOKEN` | Strapi Write-Token für Admin-Operationen | Server only |
| `REVALIDATION_SECRET` | Webhook-Geheimnis für Cache-Invalidierung | Server only |
| `NEXT_PUBLIC_SITE_URL` | Kanonische Site-URL für SEO | Browser + Server |
| `ADMIN_CROSSPOST_EMAILS` | Kommagetrennte E-Mails mit Admin-Zugriff | Server only |

### `lib/constants.ts`

Definiert `TYPE_META` als zentrales Konfigurations-Objekt für alle Rezensionstypen sowie die gesamte Navigation.

```ts
export interface TypeMeta {
  type:        RezensionType;
  slug:        string;        // URL-Segment (z. B. "buch")
  label:       string;        // Singular (z. B. "Buch")
  labelPlural: string;        // Plural  (z. B. "Bücher")
  icon:        string;        // Emoji
  description: string;        // Kurzbeschreibung für Kategorie-Cards
  className:   string;        // Tailwind-Klassen für Farb-Codierung
}

export const TYPE_META: Record<RezensionType, TypeMeta> = {
  Buch:  { slug: 'buch',  label: 'Buch',  labelPlural: 'Bücher',  icon: '📚', ... },
  Film:  { slug: 'film',  label: 'Film',  labelPlural: 'Filme',   icon: '🎬', ... },
  Musik: { slug: 'musik', label: 'Musik', labelPlural: 'Musik',   icon: '🎵', ... },
  Spiel: { slug: 'spiel', label: 'Spiel', labelPlural: 'Spiele',  icon: '🎮', ... },
  Event: { slug: 'event', label: 'Event', labelPlural: 'Events',  icon: '🎪', ... },
};

export const ALL_TYPES:          RezensionType[]                        // ['Buch', 'Film', ...]
export const TYPE_SUBCATEGORIES: Partial<Record<RezensionType, string[]>> // Subkategorien je Typ
export const CATEGORY_NAV_ITEMS: NavItem[]                              // Haupt-Navigationspunkte
export const EDITORIAL_NAV_ITEMS: NavItem[]                             // Neuigkeiten, Artikel, Interviews
export const NAV_ITEMS:          NavItem[]                              // Alle Nav-Items kombiniert
```

**Neue Kategorie hinzufügen:** Nur `TYPE_META` und `ALL_TYPES` erweitern — Navigation, Badges und Filter werden automatisch aktualisiert.

### `lib/strapi.ts`

Strapi API-Client mit Query-Builder-Pattern und Next.js ISR-Integration.

```ts
// Auth-Header-Helfer (exportiert, damit API-Routes sie importieren können)
export function getStrapiReadHeaders():  HeadersInit  // verwendet STRAPI_API_TOKEN
export function getStrapiWriteHeaders(): HeadersInit  // verwendet STRAPI_WRITE_TOKEN

// Standardisiertes Populate-Objekt
const REZENSION_POPULATE = {
  cover: true,
  autor: { avatar: true },
  genres: true,
  kommentare: true,
  details: true,
};

// Datenabruf-Funktionen
export async function getRezensionen(params?)                              : Promise<StrapiResponse<Rezension>>
export async function getRezensionenByType(type, params?)                  : Promise<StrapiResponse<Rezension>>
export async function getRezensionBySlug(slug)                             : Promise<StrapiSingleResponse<Rezension[]>>
export async function getSimilarRezensionen(type, currentSlug, limit?)     : Promise<StrapiResponse<Rezension>>
export async function getGenres()                                           : Promise<Genre[]>
export async function searchRezensionen(query, params?)                    : Promise<StrapiResponse<Rezension>>
export async function getLatestApprovedComments(limit?)                    : Promise<LatestKommentar[]>
export function      getStrapiMediaUrl(url?)                               : string
```

**Cache-Tags** ermöglichen On-Demand-Revalidierung:

```ts
// Jeder Datenabruf erhält Cache-Tags
next: { tags: ['rezensionen'], revalidate: 3600 }

// Webhook unter /api/revalidate invalidiert gezielt
revalidateTag('rezensionen');
```

### `lib/admin-auth.ts`

Authentifizierung für den Admin-Bereich. Liest das `auth_token`-Cookie und ruft `/api/users/me?populate=role` auf Strapi auf.

```ts
interface AdminAuthUser {
  id: number; username: string; email: string;
  role?: StrapiRole | null;
  isAdmin: boolean;   // true wenn E-Mail in ADMIN_CROSSPOST_EMAILS oder Rolle "admin"
}

export async function getCurrentUserForAdmin(): Promise<AdminAuthUser | null>
export function isAdminUser(user): boolean
```

### `lib/admin-reviews.ts`

Server-seitige Admin-CRUD-Logik für Rezensionen. Wird von API-Routes aufgerufen.

```ts
export async function getAdminRezensionen(): Promise<AdminReviewSummary[]>
export async function getAdminRezension(documentId): Promise<Rezension | null>
export async function saveAdminRezension(formData, documentId?): Promise<AdminReviewSaveResult>
export function slugify(value: string): string
export function createExcerpt(html?: string): string
```

`saveAdminRezension` führt folgende Schritte durch:
1. Eingabe validieren und slugifizieren
2. Genres per Namen suchen oder neu anlegen (`getOrCreateGenreIds`)
3. Autor per Namen suchen oder neu anlegen (`getOrCreateAutorId`)
4. Cover und Crosspost-Bild hochladen (`uploadCoverIfPresent`)
5. Details-Payload und `extraDetails`-JSON bauen
6. Affiliate-Links parsen
7. Rezension per PUT/POST an Strapi schicken
8. ISR-Cache invalidieren (`revalidateTag` + `revalidatePath`)
9. Crosspost-Daten zurückgeben

### `lib/admin-review-fields.ts`

Definiert `DETAIL_FIELDS` — die typ-spezifischen Formularfelder für den Review-Editor. Felder mit `mapsToComponent: true` werden zusätzlich in die Strapi Dynamic Zone geschrieben.

```ts
export const DETAIL_FIELDS: Record<RezensionType, AdminDetailField[]> = {
  Buch:  [kategorie, buchautor, herausgeber, zeichner, sprecher, publisher, genre, isbn, pages, publishedDate, ...],
  Film:  [kategorie, darsteller, director, drehbuch, studio, genre, serie, fsk, duration, releaseYear, ...],
  Musik: [artist, label, genre, tracklist, laufzeit, tracks, releaseYear, erscheinungsdatum, ...],
  Spiel: [kategorie, autor, publisher, developer, genre, serie, platform, releaseYear, material, ...],
  Event: [kategorie, organizer, location, adresse, eventDate, website, reihe, genre],
};
```

### `lib/schemas.ts`

Zentrale Input-Validierung für API-Routes. Gibt typisierte `ParseResult<T>`-Objekte zurück.

```ts
export function parseComment(body):   ParseResult<CommentInput>   // text, rezensionId, website (Honeypot)
export function parseLogin(body):     ParseResult<LoginInput>     // identifier, password
export function parseRegister(body):  ParseResult<RegisterInput>  // username, email, password
```

### `lib/sanitize.ts`

Server-seitiger Regex-basierter HTML-Sanitizer. Entfernt `<script>`, `<style>`, Inline-Event-Handler, `javascript:`-Protokolle und gefährliche Elemente aus CMS-Inhalten.

### `lib/review-html.ts`

Nachbearbeitungsschicht für Rezensions-HTML:
- Wandelt YouTube-URLs in datenschutzfreundliche `youtube-nocookie.com`-Embeds um
- Normalisiert WordPress-`[caption]`-Shortcodes in semantisches `<figure>`/`<figcaption>`-HTML

### `lib/rateLimit.ts`

In-Memory-Rate-Limiter für API-Routes (z. B. Kommentare). Standard: 5 Requests pro Minute pro IP. Für Multi-Instance-Deployments durch Redis ersetzen.

### `lib/utils.ts`

Reine Utility-Funktionen ohne Seiteneffekte.

```ts
export function formatDate(dateString: string): string         // "15. März 2024"
export function readingTime(content: string): number           // Minuten (200 Wörter/min)
export function buildStrapiImageUrl(path: string): string      // Vollständige Media-URL
export function getRatingLabel(rating: number): string         // "Sehr gut" etc.
export function truncate(text: string, maxLength: number): string
```

---

## app/ — Routing-Schicht

### Seitenkomponenten (Server Components)

Alle Seitenkomponenten in `app/(main)/` sind **async Server Components**. Sie rufen Daten ab und übergeben sie als Props an Client-Komponenten.

```tsx
// app/(main)/[type]/page.tsx
export async function generateStaticParams() {
  return ALL_TYPES.map(type => ({ type: TYPE_META[type].slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = TYPE_META[...];
  return { title: meta?.labelPlural };
}

export default async function Page({ params, searchParams }: Props) {
  const [rezensionen, genres] = await Promise.all([
    getRezensionenByType(type, searchParams),
    getGenres(),
  ]);
  return <FilterBar genres={genres} />, <ReviewGrid rezensionen={rezensionen.data} />;
}
```

### API Routes (Next.js Route Handlers)

API Routes dienen als **Proxy-Schicht** zwischen Browser und Strapi. Sie:
- Validieren Eingaben (`lib/schemas.ts`)
- Setzen Auth-Header (Bearer Token)
- Verwalten Session-Cookies (httpOnly)
- Verbergen die interne Strapi-URL vor dem Browser
- Wenden Rate-Limiting an (Kommentare)

```
GET  /api/auth/me                           → Strapi /users/me (via Cookie-Token)
POST /api/auth/login                        → Strapi /auth/local → setzt session Cookie
POST /api/auth/register                     → Strapi /auth/local/register
POST /api/auth/logout                       → löscht session Cookie
POST /api/comments                          → Strapi /kommentare (requires auth + rate limit)
GET  /api/profile/comments                  → Strapi /kommentare?filters[user]=...
GET  /api/search                            → Strapi /rezensionen?filters[title][$containsi]=...
POST /api/revalidate                        → revalidateTag('rezensionen') (Webhook)
GET  /api/admin/rezensionen                 → Admin-Liste (requires isAdmin)
POST /api/admin/rezensionen                 → Neue Rezension (requires isAdmin)
PUT  /api/admin/rezensionen/[documentId]    → Rezension aktualisieren (requires isAdmin)
DELETE /api/admin/rezensionen/[documentId]  → Rezension löschen (requires isAdmin)
POST /api/admin/crosspost                   → Crosspost-Daten aufbereiten (requires isAdmin)
```

### Admin-Bereich

Der Admin-Bereich unter `app/(main)/admin/` ermöglicht angemeldeten Administratoren:
- Rezensionen erstellen und bearbeiten (`ReviewEditorForm`)
- Alle Beiträge auflisten und den Status (Entwurf/Veröffentlicht) sehen
- Social-Media-Crossposts vorbereiten (`CrosspostPanel`)

Zugangsprüfung erfolgt serverseitig über `lib/admin-auth.ts` (`getCurrentUserForAdmin`). Der `isAdmin`-Flag wird anhand der E-Mail-Adresse (Umgebungsvariable `ADMIN_CROSSPOST_EMAILS`) oder der Strapi-Rolle geprüft.

### Legacy-Redaktionsinhalte

Neuigkeiten, Artikel und Interviews stammen aus einem statisch generierten Datensatz (`lib/legacy-editorial.generated.ts`). Die Komponenten `LegacyEditorialArchive` und `LegacyEditorialDetail` rendern diese Daten ohne Strapi-API-Aufruf.

### Taxonomie-Seiten

Die Taxonomie-Seiten (z. B. `/buchautor/[term]`, `/filmgenre/[term]`) werden über `LegacyTaxonomyPage` gerendert und listen Rezensionen aus den Legacy-Daten (`lib/music-taxonomies.generated.ts`, etc.) nach dem jeweiligen Term gefiltert.

---

## components/ — UI-Schicht

### Layout-Komponenten

**`Header.tsx`** — Orchestrator-Komponente  
Koordiniert Navigation, Auth-Status und mobiles Menü. Hält `mobileMenuOpen`-State.

```
Header
├── NavLink[]          (Desktop-Navigation)
├── HeaderAuth         (Desktop: Login-Button oder User-Menü)
└── MobileMenu         (Drawer, erhält onClose-Callback)
    └── NavLink[]      (Mobile-Variante via `mobile`-Prop)
```

**`StaticContentPage.tsx`** — Wrapper für statische Inhaltsseiten (Impressum, Datenschutz, Über uns).

### Review-Komponenten

**`ReviewCard.tsx`** — Wiederverwendet auf 4 Seiten (Home, Kategorie, Suche, Profil):

```tsx
interface ReviewCardProps {
  rezension: Rezension;
  showType?: boolean;  // zeigt TypeBadge (default: false auf Kategorieseiten)
}
```

**`FilterBar.tsx`** — Kontrolliert Sortierung und Genre-Filterung:
- Navigiert mit `router.push()` + URL-Params (keine lokale State-Mutation)
- Filterlogik liegt in der Server Component (URL-Params → `getRezensionenByType`)

**`DetailSection.tsx`** — Rendert typ-spezifische Metadaten aus der Dynamic Zone:

```tsx
const DETAIL_RENDERERS = {
  'details.book-details':  BookDetailCard,
  'details.movie-details': MovieDetailCard,
  // ...
};
```

**`AffiliateLinksBox.tsx`** — Zeigt Affiliate-Links aus `rezension.affiliateLinks` an.

### Admin-Komponenten

**`ReviewEditorForm.tsx`** — Vollständiges Formular für Rezensionserstellung und -bearbeitung:
- Typ-abhängige Felder aus `DETAIL_FIELDS` (via `useMemo`)
- Slug-Auto-Generierung aus Titel
- Cover- und Crosspost-Bild-Upload
- Speichern als Entwurf oder direkt veröffentlichen

**`AdminReviewList.tsx`** — Tabellarische Liste aller Beiträge mit Status-Anzeige.

**`CrosspostPanel.tsx`** — Bereitet Facebook/Instagram-Posts mit Titel, Excerpt und Bild vor.

**`AdminAccessState.tsx`** — Wiederverwendbarer Zustandsbildschirm für nicht autorisierten Zugriff.

### Kommentar-Komponenten

```
CommentSection          (Container: hält Kommentarliste)
├── CommentGate         (Auth-Check: zeigt Login-Hinweis wenn nicht eingeloggt)
└── CommentForm         (Formular: ruft useCommentSubmit)
```

**`CommentGate.tsx`** — Trennt Auth-Entscheidung von der Form-Logik.

### UI-Primitives

| Komponente | Zweck |
|---|---|
| `RatingBadge` | Zeigt Rating 0–10 mit Farb-Codierung |
| `TypeBadge` | Kategorie-Label (Buch, Film, etc.) mit Icon |
| `EmptyState` | Platzhalter für leere Datensätze |
| `Icons` | Zentralisiertes SVG-Icon-Set |
| `ReadingProgress` | Scrollfortschrittsbalken (fixiert, oben) |
| `ThemeToggle` | Hell/Dunkel-Umschalter |

---

## contexts/ — Zustandsschicht

### `AuthContext.tsx`

Verwaltet den globalen Authentifizierungsstatus.

```ts
interface AuthContextValue {
  user:    User | null;
  loading: boolean;
  login:   (credentials: LoginCredentials) => Promise<void>;
  logout:  () => Promise<void>;
  refresh: () => Promise<void>;
}
```

**Initialisierung:** `useEffect` ruft `/api/auth/me` beim Mount auf → verhindert Hydration-Mismatches.

**Session-Persistenz:** Token liegt im `httpOnly`-Cookie (nicht im JS-Zustand); `user`-Objekt wird bei jedem Tab-Fokus neu validiert.

### `ThemeContext.tsx`

Verwaltet Hell/Dunkel-Theme mit `localStorage`-Persistenz.

```ts
// Initialisierung via script-tag in layout.tsx (verhindert Flash of Unstyled Content)
// Schreibt 'dark' | 'light' auf <html data-theme="...">
```

---

## hooks/

### `useFormSubmit.ts`

Generischer Form-Submission-Hook — kapselt `loading`/`success`/`error`-State für beliebige async Aktionen.

```ts
function useFormSubmit<T>(action: (data: T) => Promise<void>): UseFormSubmitReturn<T> {
  // Intern: actionRef-Pattern verhindert Neuerzeugen des Callbacks bei jedem Render
  return {
    submit:    (data: T) => Promise<void>,
    reset:     () => void,
    status:    'idle' | 'loading' | 'success' | 'error',
    error:     string | null,
    isIdle:    boolean,
    isLoading: boolean,
    isSuccess: boolean,
    isError:   boolean,
  };
}
```

Verwendung: Login-Formular, Registrierung, Kommentar-Submission.

### `useCommentSubmit.ts`

Spezialisierter Wrapper um `useFormSubmit` für die Kommentar-Submission an `/api/comments`.

---

## Authentifizierungsflow

```
Browser              Next.js API Route         Strapi
  │                        │                      │
  ├─ POST /api/auth/login ─►│                      │
  │                        ├─ POST /auth/local ───►│
  │                        │◄── JWT Token ─────────┤
  │◄─ Set-Cookie: auth_token ┤  (httpOnly, secure) │
  │                        │                      │
  ├─ GET /api/auth/me ─────►│                      │
  │                        ├─ GET /users/me ───────►│
  │                        │  Authorization: Bearer│
  │◄─ { id, username } ────┤◄── User Object ───────┤
```

- Cookies: `httpOnly`, `secure` (Produktion), `sameSite: lax`
- Cookie-Name: `auth_token`
- Token wird **nie** an den Browser zurückgegeben
- `AuthContext` kennt nur `{ id, username }`, nie den JWT

### Admin-Authentifizierungsflow

```
Admin-Page (Server Component)
  ├─ getCurrentUserForAdmin()
  │   ├─ liest auth_token Cookie
  │   └─ GET /api/users/me?populate=role
  ├─ isAdmin-Check (E-Mail oder Rolle)
  └─ Zugriffsverweigert → AdminAccessState / Weiterleitung
```

---

## SEO-Architektur

| Feature | Implementierung |
|---|---|
| Dynamische Metadaten | `generateMetadata()` in jeder Page |
| Open Graph | `openGraph: { images: [cover] }` in Rezensions-Pages |
| JSON-LD Schema.org | `<script type="application/ld+json">` in Detailseiten |
| Sitemap | `app/sitemap.ts` — generiert alle Rezensions-URLs dynamisch |
| Robots.txt | `app/robots.ts` — blockiert `/api/`, `/admin`, `/login` |
| Canonical URL | Automatisch via Next.js Metadata API |

---

## Performance-Strategien

| Strategie | Implementierung |
|---|---|
| Statische Generierung | `generateStaticParams()` für alle Typ- und Slug-Routen |
| ISR (Incremental Static Regeneration) | Cache-Tags + `revalidate: 3600` (1h) |
| On-Demand Revalidation | Webhook `/api/revalidate` (bei Strapi-Publish) |
| Bildoptimierung | `next/image` mit `avif`/`webp`, responsive `sizes` |
| Debounced Search | 400ms Verzögerung in `suche/page.tsx` |
| Stagger-Animationen | Reines CSS (`animation-delay`), kein JS |
| Rate Limiting | In-Memory (5 Req/min/IP) in `/api/comments` |

---

## Design-System

Das Design-System basiert auf **CSS Custom Properties** in `app/globals.css`:

```css
:root {
  --color-bg:       #0a0a0f;
  --color-surface:  rgba(255 255 255 / 0.05);
  --color-border:   rgba(255 255 255 / 0.08);
  --color-text:     #e2e8f0;
  --color-accent:   #8b5cf6;        /* Violett-Akzent */
  --radius-card:    1rem;
  --blur-glass:     12px;           /* Glassmorphism */
}
```

**Glassmorphism-Muster** (wiederverwendet in Cards, Header, Modal):

```css
.glass {
  background:  var(--color-surface);
  border:      1px solid var(--color-border);
  backdrop-filter: blur(var(--blur-glass));
}
```

---

## Tests

### Unit-Tests (`__tests__/`, Vitest)

| Datei | Was wird getestet |
|---|---|
| `schemas.test.ts` | `parseComment`, `parseLogin`, `parseRegister` — alle Validierungspfade |
| `utils.test.ts` | `formatDate`, `readingTime`, `getRatingLabel`, `truncate` |
| `useFormSubmit.test.ts` | Status-Transitionen, Fehlerbehandlung, Reset |

### E2E-Tests (`e2e/`, Playwright)

| Datei | Was wird getestet |
|---|---|
| `auth.spec.ts` | Login, Logout, Registrierung |
| `comments.spec.ts` | Kommentar-Submission, Auth-Gate |
