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
│   │   │   └── [slug]/page.tsx # Rezensions-Detailseite
│   │   ├── login/page.tsx      # Anmeldung
│   │   ├── registrieren/page.tsx
│   │   ├── suche/page.tsx      # Volltextsuche
│   │   └── profil/page.tsx     # Benutzerprofil + Kommentarhistorie
│   ├── api/                    # Next.js API Routes (Proxy zu Strapi)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── logout/route.ts
│   │   ├── comments/route.ts
│   │   ├── profile/comments/route.ts
│   │   ├── search/route.ts
│   │   └── revalidate/route.ts
│   ├── layout.tsx              # Root Layout (HTML, AuthProvider, ThemeProvider)
│   ├── error.tsx               # Fehler-Boundary (Client Component)
│   ├── global-error.tsx        # Globale Fehler-Boundary (Root-Level)
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
│   │   └── MobileMenu.tsx
│   ├── home/                   # Startseiten-Sektionen
│   │   ├── HeroSection.tsx
│   │   ├── CategoriesSection.tsx
│   │   └── LatestReviewsSection.tsx
│   ├── reviews/                # Rezensions-Anzeigekomponenten
│   │   ├── ReviewCard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── DetailSection.tsx
│   │   └── SimilarReviews.tsx
│   ├── comments/               # Kommentarsystem
│   │   ├── CommentSection.tsx
│   │   ├── CommentForm.tsx
│   │   └── CommentGate.tsx
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
│   └── useCommentSubmit.ts
│
└── lib/                        # Utilities & Datenzugriff
    ├── types.ts
    ├── config.ts
    ├── constants.ts
    ├── strapi.ts
    └── utils.ts
```

---

## Schichtenmodell

```
┌─────────────────────────────────────────────────┐
│                 app/ (Routing Layer)             │
│   Server Components · generateMetadata · ISR    │
├─────────────────────────────────────────────────┤
│              components/ (UI Layer)             │
│   Presentational · Props-driven · No fetching  │
├─────────────────────────────────────────────────┤
│         contexts/ + hooks/ (State Layer)        │
│   AuthContext · ThemeContext · useCommentSubmit │
├─────────────────────────────────────────────────┤
│             lib/ (Data Access Layer)            │
│   strapi.ts · config.ts · types.ts · utils.ts  │
└─────────────────────────────────────────────────┘
```

**Regel:** Datenabruf findet ausschließlich in `lib/strapi.ts` (Server-seitig) oder `app/api/` (API-Routes) statt. Komponenten rufen nie direkt `fetch()` auf.

---

## lib/ — Utility- & Datenschicht

### `lib/types.ts`

Zentrale TypeScript-Typdefinitionen für alle Strapi-API-Antworten.

```ts
// Strapi-Wrapper-Typen
interface StrapiResponse<T>       { data: StrapiItem<T>[]; meta: StrapiMeta }
interface StrapiSingleResponse<T> { data: StrapiItem<T> | null }
interface StrapiItem<T>           { id: number; attributes: T }

// Content-Typen
interface Rezension {
  title:      string;
  slug:       string;
  content:    string;            // HTML (Rich Text aus Strapi)
  rating:     number;            // 0–10
  type:        RezensionType;    // 'buch' | 'film' | 'spiel' | 'musik' | 'event'
  cover:       StrapiMedia | null;
  autor:       StrapiSingleResponse<Autor>;
  genres:      StrapiResponse<Genre>;
  kommentare:  StrapiResponse<Kommentar>;
  details:     DetailComponent[];  // Dynamic Zone
}

// Discriminated Union für Dynamic Zone
type DetailComponent =
  | BookDetails   // __component: 'details.book-details'
  | MovieDetails  // __component: 'details.movie-details'
  | GameDetails   // __component: 'details.game-details'
  | MusicDetails  // __component: 'details.music-details'
  | EventDetails; // __component: 'details.event-details'
```

### `lib/config.ts`

Single Source of Truth für Umgebungsvariablen. Kein direktes `process.env` in Komponenten oder Pages.

```ts
export const STRAPI_URL          = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
export const STRAPI_INTERNAL_URL = process.env.STRAPI_INTERNAL_URL   ?? 'http://localhost:1337';
export const STRAPI_API_TOKEN    = process.env.STRAPI_API_TOKEN       ?? '';
export const REVALIDATE_SECRET   = process.env.REVALIDATE_SECRET      ?? '';
```

| Variable | Verwendung | Scope |
|---|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | Öffentliche URL für Mediendateien | Browser + Server |
| `STRAPI_INTERNAL_URL` | Docker-interner API-Aufruf | Server only |
| `STRAPI_API_TOKEN` | Strapi REST-API Bearer Token | Server only |
| `REVALIDATE_SECRET` | Webhook-Geheimnis für Cache-Invalidierung | Server only |

### `lib/constants.ts`

Definiert `TYPE_META` als zentrales Konfigurations-Objekt für alle Rezensionstypen.

```ts
export const TYPE_META: Record<RezensionType, TypeMeta> = {
  buch:   { label: 'Bücher',   slug: 'buch',   icon: BookIcon,   color: 'blue'   },
  film:   { label: 'Filme',    slug: 'film',   icon: FilmIcon,   color: 'purple' },
  spiel:  { label: 'Spiele',   slug: 'spiel',  icon: GameIcon,   color: 'green'  },
  musik:  { label: 'Musik',    slug: 'musik',  icon: MusicIcon,  color: 'yellow' },
  event:  { label: 'Events',   slug: 'event',  icon: EventIcon,  color: 'red'    },
};

// Automatisch abgeleitete Hilfswerte
export const ALL_TYPES      = Object.keys(TYPE_META) as RezensionType[];
export const NAV_ITEMS      = ALL_TYPES.map(t => ({ label: TYPE_META[t].label, href: `/${t}` }));
export const TYPE_SLUG_MAP  = Object.fromEntries(ALL_TYPES.map(t => [t, TYPE_META[t].slug]));
```

**Neue Kategorie hinzufügen:** Nur `TYPE_META` erweitern — Navigation, Badges und Filter werden automatisch aktualisiert.

### `lib/strapi.ts`

Strapi API-Client mit Query-Builder-Pattern und Next.js ISR-Integration.

```ts
// Standardisiertes Populate-Objekt — verhindert Query-Duplizierung
const REZENSION_POPULATE = {
  populate: {
    cover: { fields: ['url', 'alternativeText', 'width', 'height'] },
    autor: { fields: ['name'] },
    genres: { fields: ['name', 'slug'] },
    details: { populate: '*' },
  },
};

// Datenabruf-Funktionen
export async function getRezensionen(limit?: number): Promise<Rezension[]>
export async function getRezensionenByType(type: RezensionType, filters?: FilterOptions): Promise<Rezension[]>
export async function getRezensionBySlug(slug: string): Promise<Rezension | null>
export async function getSimilarRezensionen(type: RezensionType, excludeSlug: string): Promise<Rezension[]>
export async function getGenres(): Promise<Genre[]>
export async function searchRezensionen(query: string): Promise<Rezension[]>
```

**Cache-Tags** ermöglichen On-Demand-Revalidierung:

```ts
// Jeder Datenabruf erhält Cache-Tags
next: { tags: ['rezensionen'], revalidate: 3600 }

// Webhook unter /api/revalidate invalidiert gezielt
revalidateTag('rezensionen');
```

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
  return ALL_TYPES.map(type => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = TYPE_META[params.type as RezensionType];
  return { title: meta?.label, description: `Alle ${meta?.label}-Rezensionen` };
}

export default async function Page({ params, searchParams }: Props) {
  const [rezensionen, genres] = await Promise.all([
    getRezensionenByType(params.type, searchParams),
    getGenres(),
  ]);
  return <FilterBar genres={genres} />, <ReviewGrid rezensionen={rezensionen} />;
}
```

### API Routes (Next.js Route Handlers)

API Routes dienen als **Proxy-Schicht** zwischen Browser und Strapi. Sie:
- Validieren Eingaben
- Setzen Auth-Header (Bearer Token)
- Verwalten Session-Cookies (httpOnly)
- Verbergen die interne Strapi-URL vor dem Browser

```
GET  /api/auth/me          → Strapi /users/me (via Cookie-Token)
POST /api/auth/login       → Strapi /auth/local → setzt session Cookie
POST /api/auth/register    → Strapi /auth/local/register
POST /api/auth/logout      → löscht session Cookie
POST /api/comments         → Strapi /kommentars (requires auth)
GET  /api/profile/comments → Strapi /kommentars?filters[user]=... 
GET  /api/search           → Strapi /rezensions?filters[title][$containsi]=...
POST /api/revalidate       → revalidateTag('rezensionen') (Webhook)
```

---

## components/ — UI-Schicht

### Layout-Komponenten

**`Header.tsx`** — Orchestrator-Komponente (118 Zeilen)  
Koordiniert Navigation, Auth-Status und mobiles Menü. Hält `mobileMenuOpen`-State.

```
Header
├── NavLink[]          (Desktop-Navigation, eine Instanz pro Typ)
├── HeaderAuth         (Desktop: Login-Button oder User-Menü)
└── MobileMenu         (Drawer, erhält onClose-Callback)
    └── NavLink[]      (Mobile-Variante via `mobile`-Prop)
```

**`NavLink.tsx`** — Unterstützt `desktop`- und `mobile`-Varianten via Prop:

```tsx
<NavLink href="/buch" label="Bücher" mobile={false} />  // Desktop
<NavLink href="/buch" label="Bücher" mobile={true} />   // Mobile Drawer
```

### Review-Komponenten

**`ReviewCard.tsx`** — Wiederverwendet auf 4 Seiten (Home, Kategorie, Suche, Profil):

```tsx
interface ReviewCardProps {
  rezension: Rezension;
  showType?: boolean;  // zeigt TypeBadge (default: false auf Kategorieseiten)
}
```

**`FilterBar.tsx`** — Kontrolliert Sortierung und Genre-Filterung:
- Empfängt aktiven Filter als Props
- Navigiert mit `router.push()` + URL-Params (keine lokale State-Mutation)
- Filterlogik liegt damit in der Server Component (URL-Params → `getRezensionenByType`)

**`DetailSection.tsx`** — Rendert typ-spezifische Metadaten aus der Dynamic Zone:

```tsx
// Rendert den passenden Detail-Block anhand __component
const DETAIL_RENDERERS = {
  'details.book-details':  BookDetailCard,
  'details.movie-details': MovieDetailCard,
  // ...
};
```

### Kommentar-Komponenten

```
CommentSection          (Container: hält Kommentarliste)
├── CommentGate         (Auth-Check: zeigt Login-Hinweis wenn nicht eingeloggt)
└── CommentForm         (Formular: ruft useCommentSubmit)
```

**`CommentGate.tsx`** — Trennt Auth-Entscheidung von der Form-Logik:

```tsx
// Wenn nicht eingeloggt: Login-Prompt
// Wenn eingeloggt: <CommentForm rezensionId={...} />
```

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

### `useCommentSubmit.ts`

Kapselt die gesamte Kommentar-Submissions-Logik:

```ts
function useCommentSubmit(rezensionId: string) {
  // States: 'idle' | 'loading' | 'success' | 'error'
  return {
    submitComment: (text: string) => Promise<void>,
    status:       'idle' | 'loading' | 'success' | 'error',
    error:        string | null,
    resetStatus:  () => void,
    isLoading:    boolean,
    isSuccess:    boolean,
  };
}
```

---

## Authentifizierungsflow

```
Browser              Next.js API Route         Strapi
  │                        │                      │
  ├─ POST /api/auth/login ─►│                      │
  │                        ├─ POST /auth/local ───►│
  │                        │◄── JWT Token ─────────┤
  │◄─ Set-Cookie: session ─┤  (httpOnly, secure)   │
  │                        │                      │
  ├─ GET /api/auth/me ─────►│                      │
  │                        ├─ GET /users/me ───────►│
  │                        │  Authorization: Bearer│
  │◄─ { id, username } ────┤◄── User Object ───────┤
```

- Cookies: `httpOnly`, `secure` (Produktion), `sameSite: lax`
- Token wird **nie** an den Browser zurückgegeben
- `AuthContext` kennt nur `{ id, username }`, nie den JWT

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
