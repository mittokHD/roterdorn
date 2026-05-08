# Technisches Audit: roterdorn.de

**Datum:** 2026-05-08  
**Projekt:** roterdorn.de — Headless CMS Monorepo  
**Stack:** Next.js 15 · Strapi v5 · PostgreSQL 16 · TypeScript · Docker  
**Auditor:** Senior Software Architect Review

---

## Übersicht

roterdorn.de ist eine Headless-CMS-Plattform für Rezensionen (Bücher, Filme, Spiele, Musik, Events). Das Projekt folgt einem Monorepo-Ansatz mit klar getrennten `frontend/`, `backend/` und `migration/`-Paketen, orchestriert über Docker Compose.

---

## 1. Ordnerstruktur & Architektur

### Bewertung

Das Projekt setzt auf einen **Layered Architecture**-Ansatz im Frontend kombiniert mit dem **Feature-based Grouping** des Next.js App Routers. Das Backend folgt dem **MVC-Muster von Strapi**.

```
roterdorn/
├── frontend/           # Next.js 15 (App Router)
│   ├── app/            # Pages + API Routes (Routing Layer)
│   ├── components/     # UI Layer (Presentational)
│   ├── contexts/       # State Layer (Auth, Theme)
│   ├── hooks/          # Logic Layer (Reusable side effects)
│   └── lib/            # Data Access + Utilities
│       ├── strapi.ts   # Strapi API Client
│       ├── types.ts    # Shared TypeScript Types
│       ├── config.ts   # Environment Config
│       ├── constants.ts# Domain Constants (TYPE_META, NAV_ITEMS)
│       └── utils.ts    # Pure Utility Functions
├── backend/            # Strapi v5 (Headless CMS)
│   ├── config/         # Server, DB, Plugins
│   └── src/api/        # Content Types (rezension, kommentar, autor, genre)
└── migration/          # Datenmigrations-Tooling (Legacy)
```

### Stärken

- **Klare Schichttrennung:** `lib/strapi.ts` ist der einzige Ort für Strapi-Kommunikation; Komponenten berühren nie `fetch()` direkt.
- **Constants-First-Design:** `constants.ts` definiert `TYPE_META` als Single Source of Truth. Neue Kategorien erfordern Änderungen an nur einem Ort.
- **API-Routes als Proxy:** Next.js API-Routes kapseln alle Backend-Calls mit Auth-Logik, sodass das Frontend nie Token-Header direkt setzt.

### Probleme

**[MEDIUM] Vermischung von Server- und Client-Logik in Seitenkomponenten**

`app/(main)/[slug]/page.tsx` ist 219 Zeilen lang und vereint: Datenabruf, JSON-LD-Markup-Generierung, Open-Graph-Metadaten und JSX-Layout in einer einzigen Datei. Das ist technisch korrekt (Next.js Server Component), aber schwer isoliert zu testen.

```tsx
// app/(main)/[type]/[slug]/page.tsx  ~219 Zeilen
// Datenabruf, SEO-Metadata, JSON-LD und Layout in einer Datei
export async function generateMetadata({ params }) { /* 40 Zeilen */ }
export default async function Page({ params }) {
  const rezension = await getRezensionBySlug(...)  // Datenabruf
  return (
    <>
      <script dangerouslySetInnerHTML={jsonLd} />   // JSON-LD
      <DetailSection ... />                          // Layout
    </>
  )
}
```

**Empfehlung:** JSON-LD-Generierung in `lib/utils.ts` auslagern (`buildReviewJsonLd(rezension)`). Metadata-Logik in eine separate `metadata.ts`-Datei neben der Page auslagern.

---

## 2. Code-Qualität & Refactoring

### Priorisierte Befunde

---

### [HIGH] Dupliziertes Form-Submit-Muster

Das gleiche `isLoading/setError/try-catch/finally`-Muster kommt in mindestens 3 Stellen vor, ohne eine gemeinsame Abstraktion zu nutzen (obwohl `useCommentSubmit` für Comments existiert):

```tsx
// app/(main)/login/page.tsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  try {
    const res = await fetch('/api/auth/login', { ... });
    if (!res.ok) setError(await res.json().message);
  } catch {
    setError('Netzwerkfehler');
  } finally {
    setIsLoading(false);
  }
};

// app/(main)/registrieren/page.tsx — identisches Muster
// hooks/useCommentSubmit.ts — separates Muster (nicht wiederverwendet)
```

**Warum das ein Problem ist:** Jede Änderung am Fehlerbehandlungsverhalten muss an 3+ Stellen durchgeführt werden.

**Empfehlung — Generic `useFormSubmit` Hook:**

```ts
// hooks/useFormSubmit.ts
export function useFormSubmit<T>(
  action: (data: T) => Promise<void>
) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: T) => {
    setStatus('loading');
    setError(null);
    try {
      await action(data);
      setStatus('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
      setStatus('error');
    }
  }, [action]);

  return { submit, status, error, isLoading: status === 'loading' };
}
```

---

### [HIGH] Fehlende Eingabevalidierung — kein Schema-Validator

API-Routes validieren Eingaben manuell mit `typeof`-Checks:

```ts
// app/api/comments/route.ts
const { text, rezensionId } = await req.json();
if (!text || typeof text !== 'string') {
  return NextResponse.json({ error: 'Text fehlt' }, { status: 400 });
}
if (!rezensionId || typeof rezensionId !== 'string') {
  return NextResponse.json({ error: 'rezensionId fehlt' }, { status: 400 });
}
// kein Längen-Check, keine Sanitization
```

**Warum das ein Problem ist:** Manuelle Typ-Checks sind fehleranfällig, decken keine Längenbeschränkungen ab und führen zu inkonsistenten Fehlermeldungen.

**Empfehlung — Zod-Schema:**

```ts
// lib/schemas.ts
import { z } from 'zod';

export const commentSchema = z.object({
  text:        z.string().min(3, 'Mindestens 3 Zeichen').max(1000),
  rezensionId: z.string().min(1),
  website:     z.string().max(0).optional(), // Honeypot: muss leer sein
});

// app/api/comments/route.ts
const parsed = commentSchema.safeParse(await req.json());
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
}
```

---

### [HIGH] `dangerouslySetInnerHTML` ohne nachgewiesene Sanitization

```tsx
// app/(main)/[type]/[slug]/page.tsx
<div
  className="prose"
  dangerouslySetInnerHTML={{ __html: rezension.content }}
/>
```

**Warum das ein Problem ist:** Falls der Strapi-WYSIWYG-Editor kein Output-Sanitization betreibt, ist XSS möglich. Die Sanitization ist derzeit implizit und unbewiesen.

**Empfehlung:**

```ts
// package.json: "isomorphic-dompurify": "^2.x"

import DOMPurify from 'isomorphic-dompurify';

<div
  className="prose"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rezension.content) }}
/>
```

---

### [HIGH] Kein Rate Limiting auf Comment-API

```ts
// app/api/comments/route.ts — keine Rate-Limit-Logik
export async function POST(req: Request) {
  // direkte Verarbeitung ohne Throttling
}
```

**Warum das ein Problem ist:** Ein Angreifer kann unbegrenzt Kommentare einsenden (auch wenn sie Moderierung erfordern) und dadurch die Datenbank befüllen.

**Empfehlung:** In-Memory-Rate-Limit mit `lru-cache` oder Upstash Redis:

```ts
// lib/rateLimit.ts
import { LRUCache } from 'lru-cache';

const limiter = new LRUCache<string, number>({ max: 500, ttl: 60_000 });

export function checkRateLimit(ip: string, maxPerMinute = 5): boolean {
  const count = (limiter.get(ip) ?? 0) + 1;
  limiter.set(ip, count);
  return count <= maxPerMinute;
}
```

---

### [MEDIUM] Duplizierter Strapi-Authorization-Header

```ts
// lib/strapi.ts
const headers = STRAPI_API_TOKEN
  ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
  : {};

// app/api/comments/route.ts — identischer Code
const headers = STRAPI_API_TOKEN
  ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
  : {};

// app/api/profile/comments/route.ts — identischer Code
```

**Empfehlung:** In `lib/strapi.ts` eine Helper-Funktion exportieren:

```ts
// lib/strapi.ts
export function getStrapiHeaders(): HeadersInit {
  return STRAPI_API_TOKEN
    ? { Authorization: `Bearer ${STRAPI_API_TOKEN}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}
```

---

### [MEDIUM] `DetailSection.tsx` — Switch-Statement als Wachstumsproblem

```tsx
// components/reviews/DetailSection.tsx
switch (detail.__component) {
  case 'details.book-details':   return <BookDetailCard detail={detail} />;
  case 'details.movie-details':  return <MovieDetailCard detail={detail} />;
  case 'details.game-details':   return <GameDetailCard detail={detail} />;
  case 'details.music-details':  return <MusicDetailCard detail={detail} />;
  case 'details.event-details':  return <EventDetailCard detail={detail} />;
  default: return null;
}
```

**Warum das ein Problem ist:** Jede neue Kategorie erfordert Änderungen an dieser Datei (Open/Closed Principle verletzt).

**Empfehlung — Lookup-Map Pattern:**

```ts
// components/reviews/DetailSection.tsx
const DETAIL_COMPONENTS: Record<string, React.ComponentType<{ detail: DetailComponent }>> = {
  'details.book-details':  BookDetailCard,
  'details.movie-details': MovieDetailCard,
  'details.game-details':  GameDetailCard,
  'details.music-details': MusicDetailCard,
  'details.event-details': EventDetailCard,
};

const Component = DETAIL_COMPONENTS[detail.__component];
return Component ? <Component detail={detail} /> : null;
```

---

### [MEDIUM] Fehlende Skeleton-Loader in Kategorieseiten

```tsx
// app/(main)/[type]/page.tsx
// Zeigt sofort Inhalt oder leere Seite — kein Skeleton während Datenabruf
const rezensionen = await getRezensionenByType(type);
```

**Empfehlung:** Next.js `loading.tsx` auf Route-Ebene mit Skeleton-Komponente:

```tsx
// app/(main)/[type]/loading.tsx
export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white/5 rounded-xl h-64" />
      ))}
    </div>
  );
}
```

---

### [MEDIUM] `useCommentSubmit`-Hook nicht wiederverwendet

Ein expliziter Hook für Comment-Submission existiert (`hooks/useCommentSubmit.ts`), aber Login und Registrierung verwenden stattdessen lokalen State-Code. Die Hook-Architektur ist vorhanden aber inkonsequent angewendet.

---

### [LOW] Fehlende Tests

Es existieren keine automatisierten Tests (Unit, Integration, E2E).

| Test-Typ | Priorität | Empfehlung |
|---|---|---|
| Utils (`formatDate`, `readingTime`) | HIGH | Vitest |
| Hook (`useCommentSubmit`) | HIGH | Vitest + React Testing Library |
| API Routes (`/api/comments`) | HIGH | Vitest + msw |
| Komponenten (`ReviewCard`, `FilterBar`) | MEDIUM | React Testing Library |
| E2E (Login → Kommentar) | MEDIUM | Playwright |

---

### [LOW] Backend Strict Mode deaktiviert

```json
// backend/tsconfig.json
{ "strict": false }
```

**Warum das ein Problem ist:** Implizite `any`-Typen in Strapi-Erweiterungen werden nicht erkannt. Für Strapi-Factory-Defaults akzeptabel, aber für eigenen Code in `src/index.ts` sollte Strict aktiv sein.

---

## 3. Konsistenz

### Benennungskonventionen

| Kategorie | Convention | Konsistenz |
|---|---|---|
| React Components | PascalCase (`ReviewCard`, `Header`) | ✅ Durchgängig |
| Functions / Hooks | camelCase (`getRezensionen`, `useAuth`) | ✅ Durchgängig |
| Konstanten | SCREAMING_SNAKE_CASE (`TYPE_META`, `STRAPI_API_TOKEN`) | ✅ Durchgängig |
| CSS-Klassen | Tailwind Utilities (kebab-case) | ✅ Durchgängig |
| Dateinamen (Komponenten) | PascalCase.tsx | ✅ Durchgängig |
| Dateinamen (Utilities) | camelCase.ts | ✅ Durchgängig |
| Domain-Sprache | Deutsch (Rezension, Kommentar, Autor) | ✅ Konsistent |

### Fehlerbehandlung

| Bereich | Muster | Konsistenz |
|---|---|---|
| `lib/strapi.ts` Datenabruf | `try/catch` → `console.error` → Leer-Array | ✅ |
| API Routes | HTTP-Statuscodes + JSON-Fehler | ✅ |
| Seitenkomponenten | `notFound()` für 404, `error.tsx` für Crashes | ✅ |
| Formulare | Lokaler `error`-State → Deutsche Meldung | ⚠️ Inkonsistente Struktur (siehe HIGH-Befund) |

### Typisierung

| Bereich | Bewertung |
|---|---|
| `lib/types.ts` — Strapi-Wrapper-Typen | ✅ Vollständig |
| Discriminated Union für `DetailComponent` | ✅ Korrekt |
| Optional Chaining (`rezension?.cover?.url`) | ✅ Konsistent |
| API-Route Request Bodies | ⚠️ Manuell, kein Schema-Validator |
| Strapi Backend `strict: false` | ⚠️ Akzeptabel für Framework-Code |

---

## Prioritätenliste — Zusammenfassung

| Priorität | Befund | Datei(en) | Aufwand |
|---|---|---|---|
| **HIGH** | Kein Rate Limiting auf Comment-API | `app/api/comments/route.ts` | ~2h |
| **HIGH** | `dangerouslySetInnerHTML` ohne Sanitization | `app/(main)/[type]/[slug]/page.tsx` | ~1h |
| **HIGH** | Fehlende Schema-Validierung (Zod) | `app/api/comments/route.ts`, `app/api/auth/` | ~3h |
| **HIGH** | Dupliziertes Form-Submit-Muster | `app/(main)/login/`, `registrieren/` | ~2h |
| **MEDIUM** | Duplizierter Strapi-Auth-Header | `lib/strapi.ts`, `app/api/comments/`, `app/api/profile/` | ~30min |
| **MEDIUM** | Switch-Statement in DetailSection | `components/reviews/DetailSection.tsx` | ~1h |
| **MEDIUM** | Fehlende Skeleton-Loader | `app/(main)/[type]/` | ~1h |
| **MEDIUM** | useCommentSubmit nicht wiederverwendet | `app/(main)/login/page.tsx`, `registrieren/page.tsx` | ~1h |
| **MEDIUM** | Keine Unit-Tests | global | ~8h |
| **LOW** | Backend TypeScript strict: false | `backend/tsconfig.json` | ~30min |
| **LOW** | JSON-LD-Generierung inline in Page | `app/(main)/[type]/[slug]/page.tsx` | ~30min |
| **LOW** | Kein zentrales Error-Tracking (Sentry) | global | ~2h |

---

## Gesamtbewertung

**Code-Qualität: B+**

Das Projekt zeigt solide Architekturentscheidungen:
- Klare Schichttrennung (Data Access, State, UI, Routing)
- Vollständige TypeScript-Abdeckung mit Strict Mode im Frontend
- Constants-driven Design (neue Kategorie = 1 Datei ändern)
- Korrekte Next.js ISR-Strategie mit Tag-basierter Revalidierung
- Durchgängige deutsche Domain-Sprache ohne Code-Switching

Die wichtigsten Verbesserungspotenziale liegen in der Sicherheit (Rate Limiting, HTML-Sanitization), Validierungskonsistenz (Zod statt manuelle Checks) und Testabdeckung.
