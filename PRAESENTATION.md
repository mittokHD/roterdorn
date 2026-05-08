# PowerPoint-Präsentation: roterdorn.de
## Entwicklung einer Headless-CMS-Plattform für Medienrezensionen

> **Format-Hinweis:** Jeder Abschnitt entspricht einem Foliensatz (Sektion + Folien).
> Titel in `##` = Abschnittsfolie | Titel in `###` = Inhaltsfolie | `>` = Sprechernotiz

---

---

## Folie 1 – Titelfolie

**roterdorn.de**
Entwicklung einer modernen Medienrezensions-Plattform
auf Basis von Headless CMS und Next.js

| | |
|---|---|
| **Projekt** | IHK-Abschlussprojekt |
| **Technologien** | Next.js 15 · Strapi v5 · PostgreSQL 16 · TypeScript |
| **Zeitraum** | [Zeitraum eintragen] |
| **Autor** | [Name eintragen] |

---

---

## 1 · Einleitung

---

### 1.1 – Was ist roterdorn.de?

**Eine Plattform für ehrliche Medienrezensionen**

- Eigene, unabhängige Bewertungen zu Bücher, Filme, Musik, Spiele und Events
- Glassmorphismus-Design mit dunklem Farbschema
- Nutzer können sich registrieren und Kommentare hinterlassen
- SEO-optimiert mit dynamischer Sitemap und Schema.org-Markup

**Ziel des Projekts:**
> Migration von einer veralteten, wartungsarmen Lösung zu einer skalierbaren, modernen Headless-CMS-Architektur

---

### 1.2 – Ausgangssituation

**Probleme der Vorgängerlösung:**

| Problem | Auswirkung |
|---|---|
| Monolithisches CMS (WordPress) | Schwer erweiterbar, langsam |
| Kein Versionskontrolle für Inhalte | Keine sicheren Deployments |
| Keine strukturierten Datentypen | Inkonsistente Inhaltspflege |
| Schlechte Performance | Hohe Ladezeiten, schlechtes SEO |

**Lösung:** Headless CMS (Strapi) + dediziertes Frontend (Next.js)

> Sprechernotiz: Hier kurz erläutern, warum gerade diese Technologien gewählt wurden.

---

---

## 2 · Projektplanung

---

### 2.1 – Wirtschaftlichkeitsanalyse

**Kostengegenüberstellung: Make vs. Buy**

| Kategorie | Eigenentwicklung (Make) | SaaS-Lösung (Buy) |
|---|---|---|
| Einmalige Kosten | Entwicklungszeit (~80h) | Setup + Konfiguration (~10h) |
| Laufende Kosten | Server: ~5–10 €/Monat | Abo: 50–200 €/Monat |
| Flexibilität | Vollständig anpassbar | Limitiert durch Anbieter |
| Datenkontrolle | Vollständig (eigener Server) | Beim Anbieter |
| Skalierbarkeit | Horizontal durch Docker | Abhängig vom Plan |

**Ergebnis:** Eigenentwicklung amortisiert sich nach ca. 8 Monaten gegenüber vergleichbaren SaaS-Lösungen.

---

### 2.2 – Make-or-Buy-Entscheidung

**Technologieauswahl nach Bewertungsmatrix:**

| Kriterium | Gewicht | WordPress | Ghost | Strapi + Next.js |
|---|---|---|---|---|
| Flexibilität | 30 % | 2 | 3 | **5** |
| Performance | 25 % | 2 | 4 | **5** |
| Kosten | 20 % | 4 | 3 | **4** |
| Lernkurve | 15 % | 5 | 4 | **3** |
| Community | 10 % | 5 | 3 | **4** |
| **Gesamt** | | 3,0 | 3,4 | **4,35** |

**Entscheidung:** Strapi v5 als Headless CMS + Next.js 15 als Frontend

---

### 2.3 – Zeitplanung

**Projektphasen (Gantt-Übersicht):**

```
Phase                   W1  W2  W3  W4  W5  W6  W7  W8
─────────────────────────────────────────────────────────
Analyse & Planung       ████████
Datenbankdesign             ████
Backend-Setup                   ████████
Datenmigration                      ████
Frontend-Entwicklung                    ████████████
SEO & Optimierung                               ████
Testing & Abnahme                                   ████
Dokumentation           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████
```

**Meilensteine:**
- M1: Datenbankschema finalisiert
- M2: Strapi-Backend produktionsbereit
- M3: Frontend-MVP deployed
- M4: Abnahme & Go-Live

---

---

## 3 · Analysephase

---

### 3.1 – Ist-Analyse

**Bestehende Infrastruktur:**

```
Vorher (Ist):                    Nachher (Soll):
┌─────────────────┐              ┌──────────┐   ┌──────────┐
│   WordPress     │              │  Next.js │   │  Strapi  │
│ (Monolith)      │    ──────►   │ Frontend │   │  CMS     │
│ DB + Theme +    │              │ (React)  │   │ (API)    │
│ Plugins + Admin │              └────┬─────┘   └────┬─────┘
└─────────────────┘                   │              │
                                      └──────┬───────┘
                                        PostgreSQL
```

**Schwachstellen identifiziert:**
- Mischung von Präsentation, Logik und Datenhaltung
- Kein TypeScript → viele Laufzeitfehler
- Kein automatisiertes Deployment

---

### 3.2 – Anforderungsermittlung

**Funktionale Anforderungen:**

| ID | Anforderung | Priorität |
|---|---|---|
| F01 | Redakteure können Rezensionen erstellen/bearbeiten | Hoch |
| F02 | 5 Kategorien: Buch, Film, Musik, Spiel, Event | Hoch |
| F03 | Nutzerregistrierung und Anmeldung | Hoch |
| F04 | Kommentarfunktion mit Moderationsworkflow | Mittel |
| F05 | Volltextsuche über alle Rezensionen | Mittel |
| F06 | Ähnliche Rezensionen auf Detailseite | Niedrig |
| F07 | Social-Media-Automatisierung (Vorbereitung) | Niedrig |

**Nicht-funktionale Anforderungen:**
- Ladezeit < 2 Sekunden (First Contentful Paint)
- Lighthouse-Score > 90
- DSGVO-konform (keine Drittanbieter-Tracker)

---

### 3.3 – Use-Case-Analyse

**Akteure:** Besucher · Registrierter Nutzer · Redakteur · Administrator

```
                    ┌─────────────────────────────────┐
                    │          roterdorn.de            │
  Besucher ────────►│ Rezensionen lesen                │
                    │ Suche nutzen                     │
  Registrierter     │ Kategorien filtern               │
  Nutzer   ────────►│ Kommentar abgeben                │
                    │ Eigenes Profil einsehen          │
  Redakteur ───────►│ Rezension erstellen/veröffentl.  │
                    │ Medien hochladen                 │
  Admin    ────────►│ Nutzer verwalten                 │
                    │ Kommentare moderieren            │
                    │ API-Tokens verwalten             │
                    └─────────────────────────────────┘
```

---

---

## 4 · Entwurfsphase

---

### 4.1 – Systemarchitektur

**Monorepo mit drei Paketen:**

```
roterdorn/
├── frontend/          Next.js 15 (App Router)
├── backend/           Strapi v5 (Headless CMS)
└── migration/         Einmaliges Datenmigrations-Tooling

Infrastruktur:
┌─────────────┐   REST/JSON   ┌──────────────┐   SQL    ┌──────────────┐
│  Next.js    │ ────────────► │   Strapi v5  │ ───────► │ PostgreSQL   │
│  Port 3000  │               │  Port 1337   │          │  Port 5432   │
└─────────────┘               └──────────────┘          └──────────────┘
       │
       ├── Server Components (SSR/ISR)
       ├── API Routes (Auth-Proxy)
       └── Client Components (Interaktion)
```

**Orchestrierung:** Docker Compose (lokale Entwicklung + Produktion)

---

### 4.1b – Frontend-Schichtenmodell

```
┌────────────────────────────────────────────────┐
│           app/  (Routing Layer)                │
│   Server Components · generateMetadata · ISR   │
├────────────────────────────────────────────────┤
│         components/  (UI Layer)                │
│   Presentational · Props-driven · No fetching  │
├────────────────────────────────────────────────┤
│     contexts/ + hooks/  (State Layer)          │
│   AuthContext · ThemeContext · useFormSubmit   │
├────────────────────────────────────────────────┤
│           lib/  (Data Access Layer)            │
│  strapi.ts · schemas.ts · sanitize.ts · utils  │
└────────────────────────────────────────────────┘
```

**Code-Beispiel — Zentraler Strapi-Client:**
```typescript
// lib/strapi.ts
export function getStrapiReadHeaders(): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (STRAPI_API_TOKEN) h.Authorization = `Bearer ${STRAPI_API_TOKEN}`;
  return h;
}

async function fetchStrapi<T>(path: string, options: FetchOptions): Promise<T> {
  const res = await fetch(`${STRAPI_INTERNAL_URL}/api${path}`, {
    headers: getStrapiReadHeaders(),
    next: { tags: options.tags || [] },
  });
  if (!res.ok) throw new Error(`Strapi: ${res.status}`);
  return res.json();
}
```

---

### 4.2 – Datenbankdesign

**Entity-Relationship-Diagramm:**

```
┌───────────────┐      ┌──────────────┐
│   Rezension   │      │    Autor     │
├───────────────┤      ├──────────────┤
│ id (PK)       │ N:1  │ id (PK)      │
│ title         │─────►│ name         │
│ slug (unique) │      │ bio          │
│ content (HTML)│      │ avatar       │
│ rating 0–10   │      └──────────────┘
│ type (enum)   │
│ publishedAt   │      ┌──────────────┐
│ details (JSON)│  N:M │    Genre     │
│               │◄────►│ id (PK)      │
└───────┬───────┘      │ name (unique)│
        │ 1:N          │ slug         │
        ▼              └──────────────┘
┌───────────────┐
│   Kommentar   │      ┌──────────────┐
├───────────────┤      │     User     │
│ id (PK)       │ N:1  │ (Strapi)     │
│ name          │─────►│ id           │
│ text          │      │ username     │
│ isApproved    │      │ email        │
└───────────────┘      └──────────────┘
```

**Dynamic Zone:** Pro Rezension optional ein Detail-Block (Buch, Film, Spiel, Musik, Event)

---

### 4.2b – Dynamic Zone: Typ-spezifische Details

**Konzept:** Ein Rezensions-Typ erhält individuelle Metadaten ohne Schemakompromisse.

```typescript
// lib/types.ts — Discriminated Union
type DetailComponent =
  | { __component: "details.book-details";  isbn: string; pages: number; publisher: string }
  | { __component: "details.movie-details"; fsk: string;  duration: number; director: string }
  | { __component: "details.game-details";  platform: string; developer: string }
  | { __component: "details.music-details"; artist: string; label: string; tracks: number }
  | { __component: "details.event-details"; location: string; eventDate: string };
```

**Vorteil:** TypeScript kennt bei jedem `__component`-Wert exakt die verfügbaren Felder.

---

### 4.3 – API- und Schnittstellenkonzept

**Next.js als Proxy-Schicht (kein direkter Frontend → Strapi Zugriff):**

```
Browser          Next.js API Routes          Strapi
  │                      │                     │
  ├─ POST /api/auth/login►│                     │
  │                      ├─ POST /auth/local ──►│
  │                      │◄─── JWT Token ───────┤
  │◄─ Set-Cookie: session┤  (im httpOnly Cookie)│
  │      (httpOnly)      │                     │
  ├─ POST /api/comments ─►│                     │
  │                      │ Rate Limit prüfen    │
  │                      │ Schema validieren    │
  │                      ├─ POST /kommentare ──►│
  │◄─── { success: true }┤◄─── Created ─────────┤
```

**REST-Endpunkte (Strapi, auto-generiert):**
```
GET  /api/rezensions?filters[type][$eq]=Buch&populate=*
GET  /api/rezensions?filters[slug][$eq]=der-titel
GET  /api/genres?sort=name:asc
POST /api/kommentare          (Bearer: STRAPI_WRITE_TOKEN)
POST /api/auth/local          (Login)
POST /api/auth/local/register (Register)
```

---

### 4.4 – Sicherheitskonzept

**Mehrschichtige Sicherheitsarchitektur:**

| Schicht | Maßnahme | Implementierung |
|---|---|---|
| **Netzwerk** | Token nicht im Browser exponiert | Next.js API-Route als Proxy |
| **Auth** | httpOnly Cookie (kein JS-Zugriff) | `response.cookies.set(httpOnly: true)` |
| **Input** | Zentralisierte Validierung | `lib/schemas.ts` (parseComment etc.) |
| **Rate Limiting** | 5 req/min (Comments), 10/min (Login), 3/min (Register) | `lib/rateLimit.ts` |
| **XSS** | HTML-Sanitizer vor Rendering | `lib/sanitize.ts` |
| **Spam** | Honeypot-Feld im Kommentarformular | `website`-Feld (muss leer sein) |
| **CORS** | Nur Frontend-Origin erlaubt | Strapi `config/middlewares.ts` |

**Code-Beispiel — Rate Limiter:**
```typescript
// lib/rateLimit.ts
export function checkRateLimit(ip: string, max = 5): RateLimitResult {
  const record = store.get(ip);
  if (!record || Date.now() > record.resetAt) {
    store.set(ip, { count: 1, resetAt: Date.now() + 60_000 });
    return { allowed: true, retryAfter: 0 };
  }
  if (record.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - Date.now()) / 1000) };
  }
  record.count++;
  return { allowed: true, retryAfter: 0 };
}
```

---

---

## 5 · Implementierungsphase

---

### 5.1 – Datenmigration

**Ausgangssituation:** Daten aus dem Vorgängersystem lagen als SQL-Dump vor.

**Migrationsstrategie:**

```
dorn_db.sql              migration/              Strapi API
(Legacy-Daten)    ──────► (Node.js Script) ─────► REST POST
                          Mapping + Transform     /api/rezensions
                          Bilder herunterladen    /api/uploads
```

**Migration-Konfiguration (`migration.config.json`):**
```json
{
  "generateImages": false,
  "strapiUrl": "http://localhost:1337",
  "batchSize": 10
}
```

**Ergebnis:**
- Alle vorhandenen Rezensionen erfolgreich migriert
- Slugs normalisiert (Sonderzeichen, Leerzeichen)
- Bilder in Strapi Media Library überführt

---

### 5.2 – Backend-Implementierung

**Strapi v5 Content-Type: Rezension**

```json
// backend/src/api/rezension/content-types/rezension/schema.json
{
  "kind": "collectionType",
  "collectionName": "rezensionen",
  "attributes": {
    "title":   { "type": "string",      "required": true },
    "slug":    { "type": "uid",         "targetField": "title" },
    "content": { "type": "richtext",    "required": true },
    "rating":  { "type": "decimal",     "min": 0, "max": 10 },
    "type":    { "type": "enumeration", "enum": ["Buch","Film","Musik","Spiel","Event"] },
    "cover":   { "type": "media",       "allowedTypes": ["images"] },
    "autor":   { "type": "relation",    "relation": "manyToOne", "target": "api::autor.autor" },
    "genres":  { "type": "relation",    "relation": "manyToMany","target": "api::genre.genre" },
    "details": { "type": "dynamiczone", "components": ["details.book-details", ...] }
  },
  "draftAndPublish": true
}
```

**Stärke:** Alle CRUD-Endpunkte werden von Strapi auto-generiert — kein eigener Controller-Code nötig.

---

### 5.3 – Frontend-Implementierung

**Next.js App Router — Kategorieseite (Server Component):**

```typescript
// app/(main)/[type]/page.tsx
export async function generateStaticParams() {
  return Object.keys(TYPE_SLUG_MAP).map((type) => ({ type }));
}

export default async function TypePage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const rezensionType = TYPE_SLUG_MAP[type];
  if (!rezensionType) notFound();

  const [response, genreList] = await Promise.all([
    getRezensionenByType(rezensionType, await searchParams),
    getGenres(),
  ]);

  return (
    <>
      <FilterBar genres={genreList.map(g => g.name)} currentSort={...} />
      <ReviewGrid rezensionen={response.data} />
    </>
  );
}
```

**Vorteile:**
- Seiten werden statisch generiert (`generateStaticParams`)
- Paralleler Datenabruf mit `Promise.all`
- Automatische Cache-Invalidierung über ISR-Tags

---

### 5.3b – Generic Form Hook

**Problem:** Identisches `isLoading/error/try-catch`-Muster in Login, Register und Kommentarformular (3×).

**Lösung — `useFormSubmit` Hook:**

```typescript
// hooks/useFormSubmit.ts
export function useFormSubmit<T>(action: (data: T) => Promise<void>) {
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [error, setError] = useState<string | null>(null);
  const actionRef = useRef(action);
  actionRef.current = action; // immer aktuell, stabile Referenz

  const submit = useCallback(async (data: T) => {
    setStatus("loading");
    setError(null);
    try {
      await actionRef.current(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }, []); // stabil dank Ref-Pattern

  return { submit, reset, status, error, isLoading, isSuccess, isError };
}
```

**Verwendung in Login:**
```typescript
const { submit, error, isLoading } = useFormSubmit(async (data: LoginData) => {
  const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Anmeldung fehlgeschlagen.");
  login(json.user);
  router.push("/");
});
```

---

### 5.3c – DetailSection: Open/Closed Principle

**Vorher — Switch-Statement (OCP-Verletzung):**
```typescript
// Jede neue Kategorie = diese Datei anfassen
switch (detail.__component) {
  case "details.book-details":  return <BookDetailCard ... />;
  case "details.movie-details": return <MovieDetailCard ... />;
  // ... 3 weitere cases
}
```

**Nachher — Lookup Map:**
```typescript
// components/reviews/DetailSection.tsx
const DETAIL_RENDERERS: Record<string, (d: DetailComponent) => React.ReactNode> = {
  "details.book-details":  (d) => { const { id, isbn, pages } = d as BookDetails;
                                    return <DetailCard key={id} title="Buchdetails" icon="📖">...</DetailCard>; },
  "details.movie-details": (d) => { const { id, fsk, duration } = d as MovieDetails;
                                    return <DetailCard key={id} title="Filmdetails" icon="🎬">...</DetailCard>; },
  // neue Kategorie: nur hier 1 Eintrag ergänzen
};

// Rendering: 2 Zeilen statt 80
{details.map((detail) => {
  const renderer = DETAIL_RENDERERS[detail.__component];
  return renderer ? renderer(detail) : null;
})}
```

---

### 5.4 – Suchfunktion und SEO

**Volltextsuche mit Debouncing:**

```typescript
// app/(main)/suche/page.tsx — Client Component
const [query, setQuery] = useState("");
const [results, setResults] = useState<Rezension[]>([]);

useEffect(() => {
  const timer = setTimeout(async () => {
    if (query.length < 2) return;
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results);
  }, 400); // 400ms Debounce verhindert API-Spam
  return () => clearTimeout(timer);
}, [query]);
```

**SEO-Implementierung:**

| Feature | Datei | Technologie |
|---|---|---|
| Dynamische Meta-Tags | `[slug]/page.tsx` | `generateMetadata()` |
| Open Graph Bilder | `[slug]/page.tsx` | `openGraph.images` |
| JSON-LD Schema.org | `lib/utils.ts` | `buildReviewJsonLd()` |
| Dynamische Sitemap | `app/sitemap.ts` | Next.js Sitemap API |
| robots.txt | `app/robots.ts` | Next.js Robots API |

**JSON-LD Code-Beispiel:**
```typescript
// lib/utils.ts
export function buildReviewJsonLd(params: { title, coverUrl, rating, authorName, publishedAt }): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": "CreativeWork", name: params.title, image: params.coverUrl },
    reviewRating: { "@type": "Rating", ratingValue: params.rating, bestRating: "10" },
    author: { "@type": "Person", name: params.authorName },
  });
}
```

---

### 5.5 – Kommentar- und Authentifizierungsflow

**Authentifizierungsarchitektur:**

```
1. Nutzer sendet Login-Formular
         │
2. Next.js /api/auth/login
   ├── Rate Limit prüfen (10/min)
   ├── Eingabe validieren (parseLogin)
   └── Strapi /auth/local aufrufen
         │
3. Strapi gibt JWT zurück
         │
4. Next.js setzt httpOnly Cookie "auth_token"
   (Browser kann Token NICHT per JS lesen)
         │
5. AuthContext lädt User über /api/auth/me
```

**Kommentar-Flow:**
```
CommentGate          CommentForm         /api/comments
  │ Auth vorhanden?        │                   │
  │──────────────────────► │                   │
  │                  Nutzer schreibt            │
  │                        ├── Rate Limit ─────►│
  │                        ├── Honeypot prüfen  │
  │                        ├── Schema validieren│
  │                        └── Strapi POST ─────►│
  │                                         isApproved: false
  │                                         (Moderationswarteschlange)
```

**Kommentar-Benachrichtigung (Lifecycle Hook):**
```typescript
// backend/src/api/kommentar/content-types/kommentar/lifecycles.ts
async afterUpdate(event: Event) {
  if (event.params.data?.isApproved !== true) return;

  const kommentar = await strapi.entityService.findOne("api::kommentar.kommentar",
    event.result.id, { populate: ["user", "rezension"] });

  await strapi.plugins["email"].services.email.send({
    to: kommentar.user?.email,
    subject: "Dein Kommentar wurde freigeschaltet – roterdorn.de",
    html: `<p>Dein Kommentar zu <strong>${kommentar.rezension?.title}</strong> ist jetzt sichtbar.</p>`,
  });
}
```

---

### 5.6 – Vorbereitung der Social-Media-Automatisierung

**Webhook-basierte Automatisierung (Konzept):**

```
Strapi Admin:
Redakteur veröffentlicht Rezension
         │
         ▼
Strapi Webhook (configured in Admin → Settings → Webhooks)
POST https://roterdorn.de/api/revalidate
         │
         ▼
Next.js /api/revalidate
├── Secret validieren
└── revalidateTag("rezensionen")  ← ISR-Cache invalidieren
         │
         ▼
Neue Seite wird beim nächsten Request neu generiert
```

**Social-Media-Erweiterung (vorbereitet):**
```typescript
// app/api/revalidate/route.ts — erweiterbar
export async function POST(request: Request) {
  const { secret, data } = await request.json();
  if (secret !== REVALIDATION_SECRET) return 401;

  revalidateTag("rezensionen");

  // TODO: Social-Media-Integration
  // await postToInstagram(data.rezension);
  // await postToMastodon(data.rezension);
  // await sendNewsletter(data.rezension);

  return NextResponse.json({ revalidated: true });
}
```

---

---

## 6 · Abnahmephase

---

### 6.1 – Testkonzept

**Dreistufige Teststrategie:**

```
        E2E Tests (Playwright)
       /   Kritische User-Flows   \
      /   Login → Kommentar → SEO  \
     /────────────────────────────  \
    /   Integration Tests (Vitest)   \
   /   API-Routes · Validierung       \
  /─────────────────────────────────  \
 /     Unit Tests (Vitest)             \
/  utils · hooks · schemas · rateLimit  \
└──────────────────────────────────────┘
```

**Testabdeckung (implementiert):**

| Modul | Tests | Status |
|---|---|---|
| `lib/utils.ts` | 7 Tests (formatDate, readingTime) | ✅ Bereit |
| `hooks/useFormSubmit.ts` | 6 Tests (alle Status-Übergänge) | ✅ Bereit |
| `lib/schemas.ts` | 10 Tests (parseComment, Login, Register) | ✅ Bereit |
| E2E Auth-Flow | 6 Tests (Login, Rate Limit, 404) | ✅ Bereit |
| E2E Comment-Flow | 5 Tests (Gate, Form, Submit) | ✅ Bereit |

---

### 6.2 – Abnahmekriterien

**Funktionale Abnahme:**

| Kriterium | Soll | Ist | Status |
|---|---|---|---|
| Alle 5 Kategorien navigierbar | Ja | Ja | ✅ |
| Login/Logout funktioniert | Ja | Ja | ✅ |
| Kommentar-Moderation aktiv | Ja | Ja | ✅ |
| Volltextsuche liefert Ergebnisse | Ja | Ja | ✅ |
| Sitemap.xml korrekt | Ja | Ja | ✅ |
| JSON-LD Schema.org valide | Ja | Ja | ✅ |

**Performance-Abnahme (Lighthouse-Ziele):**

| Metrik | Ziel | Erwartetes Ergebnis |
|---|---|---|
| Performance | > 90 | ~95 (ISR + Image Optimization) |
| SEO | > 95 | ~100 (Metadata, Schema.org) |
| Accessibility | > 85 | ~90 |
| Best Practices | > 90 | ~95 |

---

---

## 7 · Einführungsphase

---

### 7.1 – Deployment-Architektur

**Docker Compose — Produktionssetup:**

```yaml
# docker-compose.yml (vereinfacht)
services:
  postgres:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]

  strapi:
    build: ./backend
    environment:
      DATABASE_HOST: postgres
      STRAPI_WRITE_TOKEN: ${STRAPI_WRITE_TOKEN}
    depends_on:
      postgres: { condition: service_healthy }
    volumes: [strapi_uploads:/app/public/uploads]

  frontend:
    build: ./frontend
    environment:
      STRAPI_INTERNAL_URL: http://strapi:1337
      STRAPI_API_TOKEN: ${STRAPI_API_TOKEN}
    ports: ["3000:3000"]
```

**Persistenz:** `strapi_uploads`-Volume sichert alle Media-Uploads über Container-Neustarts hinaus.

---

### 7.2 – Go-Live Checkliste

**Vor dem ersten Deployment:**

```
Infrastruktur:
  ☐ Server provisioniert (min. 2 vCPU, 4 GB RAM)
  ☐ Domain konfiguriert (A-Record auf Server-IP)
  ☐ SSL-Zertifikat (Let's Encrypt via Traefik/Nginx)
  ☐ .env-Datei mit Produktionswerten befüllt
  ☐ Strapi APP_KEYS generiert (openssl rand -base64 32)

Strapi Admin:
  ☐ Admin-Account erstellt (nicht "admin@admin.com")
  ☐ API-Token (Read-only) generiert → in Frontend .env
  ☐ Write-Token generiert → in Frontend .env
  ☐ CORS auf Frontend-Domain eingeschränkt
  ☐ Webhook für Cache-Revalidierung eingerichtet

Datenmigration:
  ☐ Migration durchgeführt und validiert
  ☐ Bilder alle erreichbar
  ☐ Slugs korrekt (keine 404-Weiterleitungen)
```

---

---

## 8 · Dokumentation

---

### 8.1 – Technische Dokumentation

**Erstellte Dokumentation:**

| Dokument | Inhalt | Pfad |
|---|---|---|
| `TECHNICAL_AUDIT.md` | Priorisierte Befundliste mit Code-Beispielen | `/` |
| `frontend/ARCHITECTURE.md` | Schichtenmodell, alle Module, Auth-Flow | `frontend/` |
| `backend/ARCHITECTURE.md` | Content-Types, REST-API-Referenz, RBAC | `backend/` |

**Code-Dokumentation:**
- TypeScript: Alle öffentlichen Funktionen mit JSDoc-Kommentaren
- Keine Inline-Kommentare für offensichtlichen Code
- Kommentare nur bei nicht-offensichtlichem Verhalten (Rate-Limiter, Honeypot)

---

### 8.2 – Projektstruktur (Übersicht)

```
roterdorn/
├── frontend/
│   ├── app/              Seiten + API-Routes
│   ├── components/       UI-Komponenten (layout, reviews, comments, ui)
│   ├── contexts/         AuthContext, ThemeContext
│   ├── hooks/            useFormSubmit, useCommentSubmit
│   ├── lib/              strapi.ts, types.ts, config.ts, constants.ts,
│   │                     utils.ts, schemas.ts, sanitize.ts,
│   │                     rateLimit.ts, logger.ts
│   ├── e2e/              Playwright E2E-Tests
│   └── __tests__/        Vitest Unit-Tests
├── backend/
│   ├── config/           DB, Server, Plugins, Middleware
│   └── src/api/          Content-Types (rezension, kommentar, autor, genre)
│       └── components/   Dynamic Zone (book-, movie-, game-, music-, event-details)
└── migration/            Legacy-Datenmigrations-Tooling
```

---

---

## 9 · Fazit

---

### 9.1 – Ergebnisse

**Was wurde erreicht:**

✅ **Vollständige Headless-CMS-Plattform** mit Next.js + Strapi + PostgreSQL  
✅ **5 Rezensionskategorien** mit typ-spezifischen Detail-Feldern (Dynamic Zone)  
✅ **Nutzerverwaltung** mit sicherer Session-Auth (httpOnly Cookies)  
✅ **Kommentarsystem** mit Moderationsworkflow und Benachrichtigungs-Hook  
✅ **SEO-Optimierung** (Sitemap, JSON-LD, Open Graph, robots.txt)  
✅ **Sicherheit** (Rate Limiting auf allen Auth-Endpunkten, HTML-Sanitizer, Honeypot)  
✅ **Testinfrastruktur** (23 Unit-Tests + 11 E2E-Tests vorbereitet)  
✅ **Vollständige Dokumentation** (Audit, Frontend-Architektur, Backend-Architektur)

---

### 9.2 – Lessons Learned

**Technisch:**

| Erkenntnis | Konsequenz |
|---|---|
| Strapi v5 hat Breaking Changes gegenüber v4 | Immer Changelog lesen vor Major-Upgrade |
| `dangerouslySetInnerHTML` ohne Sanitizer = XSS-Risiko | Defensive Defaults von Anfang an |
| Duplizierter Code (Headers, Form-Logic) wächst schnell | Frühzeitig Abstraktionen schaffen |
| Next.js ISR + Strapi-Webhooks = perfekte Kombination | Cache-Strategie früh planen |

**Organisatorisch:**
- Strukturierte Zeitplanung (Gantt) hat geholfen, Scope zu kontrollieren
- Technisches Audit nach Abschluss deckte verbesserungswürdige Stellen auf
- Dokumentation parallel zur Entwicklung spart Zeit am Ende

---

### 9.3 – Ausblick

**Nächste Entwicklungsschritte:**

| Phase | Maßnahme |
|---|---|
| **Kurzfristig** | `zod` + `isomorphic-dompurify` installieren (npm-Registry) |
| **Kurzfristig** | E2E-Tests mit Playwright ausführen und grünen Build erreichen |
| **Mittelfristig** | Social-Media-Automatisierung (Instagram/Mastodon) implementieren |
| **Mittelfristig** | Sentry-Integration für produktionsreifes Error-Tracking |
| **Langfristig** | Redis für Multi-Instance Rate Limiting |
| **Langfristig** | Internationalisierung (i18n) für englische Inhalte |
| **Langfristig** | Cloudinary/Imgix als Image-CDN |

---

### 9.4 – Danke / Fragen

**roterdorn.de**
*Medienrezensionen mit Leidenschaft*

```
Technologie-Stack im Überblick:

Frontend          Backend           Infrastruktur
────────────      ───────────       ─────────────
Next.js 15        Strapi v5         Docker Compose
React 19          PostgreSQL 16     Nginx / Traefik
TypeScript 5      Node.js 20        SSL (Let's Encrypt)
Tailwind CSS 4    REST API          GitHub CI/CD
```

> **Fragen & Diskussion**

---

---

## Anhang: Verwendete Code-Schnipsel (Referenz)

### A1 — Zentralisierter Strapi-Client mit Query-Builder

```typescript
// lib/strapi.ts
function buildQuery(params: {
  populate?: Record<string, boolean | Record<string, boolean>>;
  filters?: Record<string, Record<string, string>>;
  sort?: string;
  pagination?: { page: number; pageSize: number };
}): string {
  const parts: string[] = [];

  if (params.populate) {
    for (const [key, value] of Object.entries(params.populate)) {
      if (typeof value === "object") {
        for (const [subKey, subVal] of Object.entries(value)) {
          parts.push(`populate[${key}][populate][${subKey}]=${subVal}`);
        }
      } else {
        parts.push(`populate[${key}]=${value}`);
      }
    }
  }
  // ... Filter, Sort, Pagination
  return parts.join("&");
}
```

### A2 — In-Memory Rate Limiter

```typescript
// lib/rateLimit.ts
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, max = 5): RateLimitResult {
  pruneExpired(); // Verhindert unbegrenztes Speicherwachstum
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + 60_000 });
    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count++;
  return { allowed: true, retryAfter: 0 };
}
```

### A3 — Validierungsschema (ohne Zod, typesicher)

```typescript
// lib/schemas.ts
export function parseComment(body: unknown): ParseResult<CommentInput> {
  if (!body || typeof body !== "object")
    return fail([{ field: "body", message: "Ungültige Anfrage." }]);

  const { text, rezensionId, website } = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  if (typeof text !== "string" || text.trim().length < 3)
    errors.push({ field: "text", message: "Mindestens 3 Zeichen erforderlich." });

  if (typeof text === "string" && text.trim().length > 1000)
    errors.push({ field: "text", message: "Maximal 1000 Zeichen erlaubt." });

  if (typeof rezensionId !== "string" || rezensionId.trim().length === 0)
    errors.push({ field: "rezensionId", message: "Ungültige Rezensions-ID." });

  if (errors.length > 0) return fail(errors);
  return { success: true, errors: [], data: { text: text.trim(), rezensionId, website } };
}
```

### A4 — ISR Cache-Revalidierung via Webhook

```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { REVALIDATION_SECRET } from "@/lib/config";

export async function POST(request: Request) {
  const { secret } = await request.json();

  if (secret !== REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Ungültiges Secret." }, { status: 401 });
  }

  revalidateTag("rezensionen");
  revalidateTag("genres");

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}
```

### A5 — E2E Test: Login-Flow (Playwright)

```typescript
// e2e/auth.spec.ts
test("successful login redirects to homepage", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/E-Mail oder Benutzername/i).fill("test@roterdorn.de");
  await page.getByLabel(/Passwort/i).fill("testpassword123");
  await page.getByRole("button", { name: /Anmelden/i }).click();

  await page.waitForURL("/", { timeout: 10_000 });
  await expect(page).toHaveURL("/");
});

test("rate limit blocks after 10 rapid attempts", async ({ page }) => {
  for (let i = 0; i < 11; i++) {
    await page.goto("/login");
    await page.getByLabel(/E-Mail oder Benutzername/i).fill(`attempt${i}@test.de`);
    await page.getByLabel(/Passwort/i).fill("wrongpass");
    await page.getByRole("button", { name: /Anmelden/i }).click();
  }
  await expect(page.locator(".text-red-400")).toContainText(/Zu viele/i);
});
```
