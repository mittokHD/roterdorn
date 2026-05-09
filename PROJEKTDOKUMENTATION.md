# PROJEKTDOKUMENTATION
## IHK-Abschlussprüfung
## Fachinformatiker Anwendungsentwicklung

---

**Projektthema:** Modernisierung und Neuentwicklung der Website roterdorn.de  
**Projektlaufzeit:** 70 Stunden  
**Ausbildungsberuf:** Fachinformatiker Anwendungsentwicklung

---

## Inhaltsverzeichnis

1. [Einleitung](#1-einleitung)
2. [Projektplanung](#2-projektplanung)
   - 2.1 [Wirtschaftlichkeitsanalyse](#21-wirtschaftlichkeitsanalyse)
   - 2.2 [Make-or-Buy-Entscheidung](#22-make-or-buy-entscheidung)
   - 2.3 [Zeitplanung](#23-zeitplanung)
3. [Analysephase](#3-analysephase)
   - 3.1 [Ist-Analyse](#31-ist-analyse)
   - 3.2 [Anforderungsermittlung](#32-anforderungsermittlung)
   - 3.3 [Use-Case-Analyse](#33-use-case-analyse)
4. [Entwurfsphase](#4-entwurfsphase)
   - 4.1 [Systemarchitektur](#41-systemarchitektur)
   - 4.2 [Datenbankdesign](#42-datenbankdesign)
   - 4.3 [API- und Schnittstellenkonzept](#43-api--und-schnittstellenkonzept)
   - 4.4 [Sicherheitskonzept](#44-sicherheitskonzept)
5. [Implementierungsphase](#5-implementierungsphase)
   - 5.1 [Datenmigration](#51-datenmigration)
   - 5.2 [Backend-Implementierung](#52-backend-implementierung)
   - 5.3 [Frontend-Implementierung](#53-frontend-implementierung)
   - 5.4 [Suchfunktion und SEO-Implementierung](#54-suchfunktion-und-seo-implementierung)
   - 5.5 [Kommentar- und Authentifizierungsflow](#55-kommentar--und-authentifizierungsflow)
   - 5.6 [Vorbereitung der Social-Media-Automatisierung](#56-vorbereitung-der-social-media-automatisierung)
6. [Abnahmephase](#6-abnahmephase)
7. [Einführungsphase](#7-einführungsphase)
8. [Dokumentation](#8-dokumentation)
9. [Fazit](#9-fazit)

---

## 1 Einleitung

Die Website roterdorn.de ist eine Rezensionsplattform, auf der Beiträge zu Büchern, Filmen, Musik, Spielen und Veranstaltungen veröffentlicht werden. Die Plattform wird von einer kleinen Redaktion gepflegt und richtet sich an ein kulturinteressiertes Publikum, das kurze, ehrliche Bewertungen zu Medienerzeugnissen und Veranstaltungen sucht.

Über einen Zeitraum von rund zehn Jahren war das Content-Management-System WordPress die technische Grundlage der Website. Dieses Fundament genügte den anfänglichen Anforderungen, zeigte jedoch im Laufe der Zeit deutliche Schwächen:

- eine durch Plugins fragmentierte Architektur
- eine stark angewachsene Datenbank mit veralteten Einträgen
- ein nicht mehr responsive-fähiges Design
- sicherheitsrelevante Lücken durch nicht mehr gewartete Plugin-Versionen

Das Projektziel bestand darin, die gesamte technische Infrastruktur der Website zu ersetzen und dabei gleichzeitig das Design grundlegend zu modernisieren. Dabei sollte eine klare Trennung zwischen Frontend und Backend entstehen, die langfristige Wartbarkeit sicherstellt und das System für zukünftige Erweiterungen wie die Automatisierung von Social-Media-Beiträgen oder den Einsatz künstlicher Intelligenz in der Suche offenhalten.

Die bestehenden Inhalte der WordPress-Datenbank sollten migriert werden, um den redaktionellen Aufwand zu minimieren. Das Projekt wurde eigenständig von der Planung bis zur Übergabe durchgeführt. Alle Architekturentscheidungen, die Auswahl der eingesetzten Technologien sowie das Design des Datenmodells und der Schnittstellen wurden auf Basis einer systematischen Analysephase getroffen und sind in dieser Dokumentation vollständig begründet.

---

## 2 Projektplanung

### 2.1 Wirtschaftlichkeitsanalyse

Für die Wirtschaftlichkeitsanalyse wurde ein interner Stundensatz von 75 € zugrunde gelegt, der einem branchenüblichen Satz für Anwendungsentwicklung im deutschsprachigen Raum entspricht. Der Gesamtaufwand des Projekts beläuft sich auf 70 Stunden, sodass die kalkulierten Entwicklungskosten 5.250 € betragen.

**Kostenvergleich: Eigenentwicklung vs. externe Agentur**

| Position | Kosten |
|----------|--------|
| Interne Entwicklungskosten (70 h × 75 €) | 5.250 € |
| Externe Agentur (Headless-CMS mit individuellem Frontend) | 12.000–18.000 € |
| Jährliche Einsparung beim Wartungsaufwand | ca. 2.700 € |
| Amortisationszeitraum | weniger als 2 Jahre |

Die Eigenentwicklung ist demnach erheblich günstiger. Hinzu kommen monatliche Einsparungen gegenüber dem bisherigen System: Die WordPress-Installation erforderte regelmäßige manuelle Plugin-Updates sowie gelegentliche Eingriffe durch externe Dienstleister, was sich auf durchschnittlich vier Stunden pro Monat (300 €) belief. Die neue Architektur reduziert diesen Wartungsaufwand auf geschätzte eine Stunde monatlich, da Strapi als Headless-CMS wartungsarm betrieben werden kann.

### 2.2 Make-or-Buy-Entscheidung

Im Rahmen der Planung wurden drei grundsätzliche Optionen evaluiert:

- **Option 1: Fortführung der bestehenden WordPress-Installation:** Schied aus, da die Kernprobleme der Architektur — monolithische Struktur und mangelnde Erweiterbarkeit — nicht dauerhaft lösbar sind.
- **Option 2: Vollständig verwalteter Dienst (Webflow/Contentful):** Verworfen wegen monatlicher Lizenzkosten, Vendor-Lock-in und eingeschränkter Datenflexibilität.
- **Option 3: Eigenentwicklung mit Open-Source-Headless-CMS:** Gewählt. Bietet vollständige Datenkontrolle, keine laufenden Lizenzkosten und maximale technische Freiheit.

### 2.3 Zeitplanung

Die Projektphasen wurden wie folgt geplant und eingehalten:

| Phase | Geplant (h) | Tatsächlich (h) |
|-------|-------------|-----------------|
| Analysephase | 8 | 9 |
| Entwurfsphase | 10 | 10 |
| Implementierung Backend | 12 | 12 |
| Implementierung Datenmigration | 8 | 9 |
| Implementierung Frontend | 20 | 18 |
| Abnahme und Tests | 6 | 6 |
| Einführung und Deployment | 4 | 4 |
| Dokumentation | 2 | 2 |
| **Gesamt** | **70** | **70** |

---

## 3 Analysephase

### 3.1 Ist-Analyse

Die bestehende WordPress-Installation basiert auf einer MySQL-Datenbank mit der typischen Präfixstruktur `wp_`. Nach Analyse des Datenbankdumps (`dorn_db.sql`) zeigte sich, dass die Tabelle `wp_posts` neben den eigentlichen Rezensionsbeiträgen eine große Menge veralteter Daten enthält: Revisionsstände, gelöschte Entwürfe, Mediaobjekte sowie Plugin-spezifische Pseudo-Beiträge.

Typmetadaten wie Bewertung, ISBN, FSK-Angabe oder Erscheinungsjahr waren nicht in einer separaten Struktur abgelegt, sondern als unstrukturierte Schlüssel-Wert-Paare in der Tabelle `wp_postmeta` gespeichert. Diese Tabelle hatte durch die langjährige Nutzung mehrerer Plugins eine erhebliche Größe erreicht und enthielt Tausende irrelevanter Einträge.

Von sicherheitstechnischer Seite wurden folgende kritische Punkte identifiziert:

- Drei Plugins ohne Sicherheitsupdates seit über 18 Monaten mit bekannten CVEs
- Verwendetes Theme mit veralteten PHP-Funktionen
- Administrationsbereich über `/wp-admin` ohne zusätzliche Schutzmaßnahmen erreichbar

### 3.2 Anforderungsermittlung

Auf Basis der Ist-Analyse wurden die Anforderungen in funktionale und nicht-funktionale Kategorien unterteilt. Die Methode umfasste ein strukturiertes Gespräch mit dem Auftraggeber sowie eine eigenständige technische Bewertung des Ist-Zustands.

**Funktionale Anforderungen**

- Verwaltung von Rezensionen in fünf Typen: Bücher, Filme, Musik, Spiele, Veranstaltungen
- Typenspezifische Metadaten (z. B. ISBN und Verlag für Bücher, FSK und Regisseur für Filme)
- Autorenzuweisung mit sichtbarer Autorenangabe im Frontend
- Filter nach Typ, Genre, Bewertung und Alphabet sowie Volltextsuche
- Kommentarfunktion mit Moderationsschritt für registrierte Nutzer
- Automatische Veröffentlichung auf Instagram und Facebook (geplant, architektonisch vorbereitet)
- Semantische Verbesserung der Suchfunktion (geplant)

**Nicht-funktionale Anforderungen**

- Ladezeit Startseite unter einer Sekunde (TTFB unter 200 ms)
- Korrekte Darstellung ab 375 px Breite bis Desktop (1440 px)
- Google-Lighthouse-Score für Performance und SEO jeweils mind. 90 Punkte
- Unabhängige Aktualisierbarkeit von Frontend und Backend
- Absicherung aller öffentlichen Formulareingaben gegen gängige Angriffsvektoren

### 3.3 Use-Case-Analyse

Die identifizierten Anwendungsfälle verteilen sich auf drei Akteursrollen:

- **Anonymer Besucher:** Kann Startseite, gefilterte Listen, Volltextsuche und Detailseiten aufrufen. Keine Schreibrechte.
- **Registrierter Nutzer:** Alle Rechte des anonymen Besuchers. Kann zusätzlich Kommentare einreichen (nach Moderation veröffentlicht). Authentifizierung über Benutzername oder E-Mail mit Passwort, Session via HTTP-Only-Cookie mit JWT.
- **Redakteur:** Arbeitet über das Strapi-Administrationsinterface. Erstellt, bearbeitet und veröffentlicht Rezensionen, verwaltet Autoren, Genres und Medien, moderiert Kommentare.

---

## 4 Entwurfsphase

### 4.1 Systemarchitektur

Die gewählte Architektur folgt dem Headless-CMS-Prinzip: Backend und Frontend sind vollständig voneinander getrennte Systeme, die ausschließlich über eine REST-API kommunizieren. Diese Entscheidung wurde getroffen, weil das monolithische WordPress-Modell maßgeblich zu den Wartungsproblemen der bestehenden Lösung beigetragen hatte.

**Technologie-Stack im Überblick**

| Schicht | Technologie | Version |
|---------|-------------|---------|
| Backend (Headless-CMS) | Strapi | 5.42.1 |
| Frontend (Framework) | Next.js | 16.2.3 |
| Frontend (UI-Library) | React | 19.2.4 |
| Frontend (Sprache) | TypeScript | 5 |
| Frontend (Styling) | Tailwind CSS | 4 |
| Datenbank | PostgreSQL | 16 |
| Laufzeitumgebung | Node.js | 22 (Alpine) |
| Infrastruktur | Docker + Docker Compose | — |
| Migration | Node.js ESM-Skript + MySQL | 8.0 (temporär) |

**Begründung der Technologiewahl**

Strapi wurde gegenüber alternativen Headless-CMS wie Contentful oder Directus gewählt, weil es Open Source und selbst hostbar ist (Datensouveränität, keine Lizenzkosten), nativ ein Dynamic-Zone-Konzept bietet und das integrierte Plugin `@strapi/plugin-users-permissions` (v5.42.1) Authentifizierung ohne Zusatzaufwand liefert.

Next.js 16 wurde gewählt, weil es serverseitiges Rendering und statische Seitengenerierung kombiniert. Durch React Server Components werden Datenbankabfragen direkt auf dem Server ausgeführt, ohne dass JavaScript für die Datenbeschaffung an den Browser ausgeliefert wird.

### 4.2 Datenbankdesign

Das neue Datenmodell wurde vollständig neu entworfen. Der zentrale Designentscheid war die Abkehr von der Schlüssel-Wert-Speicherung der Metadaten hin zu typisierten Komponenten.

Im neuen Modell gibt es einen einzigen Collection-Type `Rezension` mit folgenden gemeinsamen Feldern: `title`, `slug` (automatisch aus dem Titel generiert), `content` (Rich Text), `cover` (Mediaobjekt), `rating` (Dezimalwert 0–10), `type` (Enumeration: `Buch | Film | Musik | Spiel | Event`) sowie `publishedAt`. Typenspezifische Metadaten werden über eine Dynamic Zone abgebildet:

| Komponente | Felder |
|------------|--------|
| `BookDetails` | `isbn`, `pages`, `publisher`, `publishedDate` |
| `MovieDetails` | `fsk`, `duration`, `director`, `releaseYear` |
| `GameDetails` | `platform`, `developer`, `publisher`, `releaseYear` |
| `MusicDetails` | `artist`, `label`, `tracks`, `releaseYear` |
| `EventDetails` | `location`, `organizer`, `eventDate` |

Dieser Ansatz ermöglicht den vollständigen Abruf einer Rezension in einem einzigen API-Request, während das Schema trotzdem typspezifisch und validiert bleibt.

**Relationsstruktur:**
- `Rezension` → `Autor` (Many-to-One)
- `Rezension` ↔ `Genre` (Many-to-Many)
- `Rezension` → `Kommentare` (One-to-Many)

Der Collection-Type `Kommentar` hat Draft & Publish deaktiviert; die Sichtbarkeitskontrolle erfolgt stattdessen über das Boolean-Feld `isApproved` (Default: `false`). Dadurch bleiben alle eingereichten Kommentare gespeichert und für die Moderation zugänglich, ohne dass der Strapi-Publish-Workflow genutzt werden muss.

### 4.3 API- und Schnittstellenkonzept

Die Kommunikation zwischen Frontend und Backend erfolgt ausschließlich über die von Strapi automatisch generierten REST-Endpunkte. Das Frontend kommuniziert dabei nie direkt vom Browser aus mit der Strapi-API.

Für alle schreibenden Operationen wird eine Next.js-API-Route als serverseitiger Proxy eingesetzt. Vorteile: Der Strapi-Write-Token bleibt serverseitig und wird nie an den Client ausgeliefert; in der Proxy-Schicht können zusätzliche Validierungen und Rate-Limiting-Prüfungen implementiert werden.

Die Funktion `fetchStrapi` in `lib/strapi.ts` kapselt alle Strapi-Abfragen und fügt automatisch den `Authorization`-Header sowie Next.js-Cache-Tags für Incremental Static Regeneration (ISR) hinzu. Ein dedizierter Webhook-Endpunkt (`/api/revalidate`) nimmt Strapi-Webhooks entgegen und invalidiert den Cache bei Veröffentlichung oder Aktualisierung einer Rezension.

### 4.4 Sicherheitskonzept

Das Sicherheitskonzept adressiert drei primäre Angriffsvektoren:

**Spam und Missbrauch von Formularen**

Alle schreibenden API-Routen sind mit einem IP-basierten Rate Limiter gesichert, der in `lib/rateLimit.ts` als In-Memory-Store implementiert ist:

| Endpunkt | Maximale Anfragen | Zeitfenster |
|----------|-------------------|-------------|
| `POST /api/comments` | 5 | 60 Sekunden |
| `POST /api/auth/login` | 10 | 60 Sekunden |
| `POST /api/auth/register` | 3 | 60 Sekunden |

Überschreitungen werden mit HTTP 429 und dem Header `Retry-After` beantwortet. Zusätzlich enthält das Kommentarformular ein verstecktes Honeypot-Feld (`website`). Bots befüllen es automatisch; serverseitig wird der Kommentar bei befülltem Honeypot stillschweigend als vermeintlich erfolgreich quittiert, ohne gespeichert zu werden.

**Unautorisierte Schreibzugriffe**

Alle schreibenden Operationen laufen über Bearer-Token-Authentifizierung. Der `STRAPI_WRITE_TOKEN` verlässt den Next.js-Server nie. Vor jeder Kommentarerstellung wird das JWT des angemeldeten Nutzers serverseitig gegen `GET /api/users/me` von Strapi validiert.

Eingaben werden in `lib/schemas.ts` durch typgeprüfte Validatoren geprüft, bevor sie an Strapi weitergegeben werden. Die Validierungsregeln sind: Kommentartext 3–1000 Zeichen, Benutzername 3–30 Zeichen, E-Mail-Adresse via Regex-Prüfung, Passwort mindestens 6 Zeichen.

**Session-Hijacking und XSS**

Das von Strapi ausgestellte JWT wird als HTTP-Only-Cookie gesetzt (`httpOnly: true`), sodass JavaScript zu keinem Zeitpunkt Lesezugriff auf den Token hat. Im Produktionsmodus ist zusätzlich das `Secure`-Flag aktiv. Die Cookie-Gültigkeitsdauer beträgt 30 Tage. Das `SameSite: lax`-Attribut verhindert das ungewollte Mitsenden des Cookies bei Cross-Site-Requests.

Redaktionell eingepflegter HTML-Inhalt aus dem Strapi Rich-Text-Editor wird vor der Ausgabe mit `sanitizeHtml()` aus `lib/sanitize.ts` bereinigt. Die Funktion entfernt per regulären Ausdrücken `<script>`- und `<style>`-Tags, Inline-Event-Handler (`on*`-Attribute), `javascript:`- und `vbscript:`-Protokolle in Attributen sowie eingebettete Frames (`<iframe>`, `<object>`, `<embed>`).

---

## 5 Implementierungsphase

### 5.1 Datenmigration

Die Migration der WordPress-Inhalte in das neue Strapi-System wurde durch ein Node.js-Skript automatisiert (`migration/migrate.js`, implementiert als ESM-Modul mit `import`-Syntax). Eine automatisierte Migration war notwendig, da die WordPress-Datenbank mehrere Hundert publizierte Beiträge enthielt.

Das Skript arbeitet in folgenden Schritten:

1. Verbindung zur Legacy-MySQL-Datenbank (Port 3308, bereitgestellt durch temporären `mysql:8.0`-Container im Docker-Compose-Verbund); Abruf aller publizierten Beiträge aus `wp_posts` mit `post_type IN ('post', 'buch', 'film', 'musik', 'spiel', 'event')`
2. Laden der Metadaten aus `wp_postmeta` in separater Query pro Beitrag (kein JOIN, um kartesische Produktmenge bei Einträgen mit vielen Metafeldern zu vermeiden)
3. Konvertierung des HTML-Inhalts nach Markdown mit der Bibliothek `turndown`
4. Typ-Mapping: WordPress Custom Post Types werden direkt gemappt; für Beiträge vom Typ `post` wird die primäre Yoast-SEO-Kategorie (`_yoast_wpseo_primary_category`) zur Typzuordnung herangezogen
5. Idempotenz-Prüfung: Existiert der generierte Slug bereits in Strapi, wird der Eintrag übersprungen
6. Slug-Kollisionsbehandlung: Bei Unique-Constraint-Fehler durch Strapi wird die WordPress-Beitrags-ID als Suffix angehängt (`{slug}-{post_id}`)
7. Optionale Generierung von Titelbildern über die Pexels-API (über `migration.config.json` konfigurierbar, ratenbasiert)
8. Aufbau der Dynamic-Zone-Payload aus den `wp_postmeta`-Feldern (z. B. `isbn`, `seitenzahl`, `fsk`, `filmlaufzeit`, `ort`, `zeitstart`)

### 5.2 Backend-Implementierung

Das Strapi-Backend wurde mit den vier Collection-Types `Rezension`, `Autor`, `Genre` und `Kommentar` sowie den fünf Detailkomponenten konfiguriert. Die Konfiguration erfolgt vollständig deklarativ über JSON-Schemadateien in `backend/src/api/` und `backend/src/components/`, was Versionierbarkeit und Reproduzierbarkeit sicherstellt.

Controller, Services und Routen wurden als Strapi-Core-Generierungen belassen (`factories.createCoreController`, `factories.createCoreService`, `factories.createCoreRouter`), da keine benutzerdefinierten Endpunkt-Logiken erforderlich waren. Für die Authentifizierung wird das mitgelieferte Plugin `@strapi/plugin-users-permissions` (v5.42.1) eingesetzt.

Angepasste Logik findet sich ausschließlich in einem Lifecycle-Hook: `backend/src/api/kommentar/content-types/kommentar/lifecycles.ts` reagiert auf das `afterUpdate`-Event. Wenn das Feld `isApproved` von `false` auf `true` wechselt, versendet der Hook eine E-Mail-Benachrichtigung an den Kommentarautor mit dem Hinweis, dass sein Kommentar freigeschaltet wurde. Schlägt der E-Mail-Versand fehl, wird der Fehler geloggt, ohne dass das Update-Event beeinträchtigt wird.

Das Datenbankschema wird über die PostgreSQL-16-Verbindung (`pg` v8.20.0) mit einem Connection-Pool von 2–10 Verbindungen betrieben. Die Verbindungsparameter werden vollständig über Umgebungsvariablen gesteuert; ein direktes Exponieren des Datenbankports nach außen ist in der Docker-Compose-Konfiguration nicht vorgesehen.

### 5.3 Frontend-Implementierung

Das Frontend wurde mit dem Next.js App Router (v16.2.3) entwickelt, der auf React Server Components (React 19.2.4) basiert. Die Hauptseite (`app/(main)/page.tsx`) ist eine asynchrone Server Component, die zur Renderzeit direkt die Strapi-API abfragt. Das resultierende HTML wird vollständig auf dem Server generiert, ohne dass der Browser einen zusätzlichen JavaScript-Fetch ausführen muss.

Die URL-Struktur bildet den Inhaltstyp als erstes Pfadsegment ab. Die Kategorieseiten sind unter `/buch`, `/film`, `/musik`, `/spiel` und `/event` erreichbar; Detailseiten folgen dem Schema `/{typ}/{slug}`, z. B. `/buch/der-alchimist`. Die Zuordnung zwischen URL-Segment und Strapi-Typ-Enumeration erfolgt über die zentrale Datenstruktur `TYPE_META` in `lib/constants.ts` — eine einzige Quelle der Wahrheit, aus der Navigation, URL-Validierung und Labels abgeleitet werden.

Die Komponente `DetailSection` rendert das Dynamic-Zone-Feld, indem sie das `__component`-Feld jedes Eintrags prüft und die passende Darstellungskomponente auswählt. Der Theme-Wechsel (hell/dunkel) wurde ohne externe Bibliothek implementiert; ein Inline-Script im Root-Layout liest die gespeicherte Präferenz aus `localStorage` und setzt das `data-theme`-Attribut synchron vor dem ersten Paint, um Flash of Unstyled Content (FOUC) zu verhindern.

Das Design-System basiert vollständig auf CSS Custom Properties (z. B. `--bg-primary`, `--text-accent`, `--border-subtle`) und Tailwind CSS 4, sodass der Theme-Wechsel ohne JavaScript-Klassenmanipulation allein durch CSS-Variablen-Überschreibung im `[data-theme="light"]`-Selektor funktioniert.

### 5.4 Suchfunktion und SEO-Implementierung

Die interne Suche wird über eine Next.js-API-Route (`/api/search`) realisiert, die den Suchbegriff an den Strapi-Filter `$containsi` weiterleitet (Groß-/Kleinschreibung-unabhängige Teilstring-Suche auf den Feldern `title` und `content`). Im Frontend verhindert ein Debouncing-Mechanismus übermäßige API-Anfragen während der Eingabe.

Für die Suchmaschinenoptimierung wurden folgende Maßnahmen umgesetzt:

- Standardisierte OpenGraph-Metadaten im Root-Layout (`app/layout.tsx`)
- Inhaltsspezifische Metadaten je Detailseite über die Next.js-Funktion `generateMetadata`, die Titel, Beschreibung und OpenGraph-Bild dynamisch aus den Strapi-Daten ableitet
- JSON-LD-Strukturdaten (`schema.org/Review`) auf Detailseiten für Google Rich Snippets, generiert durch die Utility-Funktion `buildReviewJsonLd` in `lib/utils.ts`
- `next/font/google` mit `display: swap` zur Minimierung des Cumulative Layout Shift
- Dynamisch generierte `sitemap.ts` und `robots.ts` als Next.js-Route-Handler

### 5.5 Kommentar- und Authentifizierungsflow

**Authentifizierung**

Der Login-Flow ist vollständig serverseitig implementiert. Der Nutzer sendet Benutzername oder E-Mail zusammen mit dem Passwort an `POST /api/auth/login`. Die API-Route in Next.js validiert die Eingabe (Pflichtfelder, Passwort mindestens 6 Zeichen) und leitet die Anmeldedaten an den Strapi-Endpunkt `POST /api/auth/local` weiter. Das von Strapi ausgestellte JWT wird als HTTP-Only-Cookie mit dem Namen `auth_token` gesetzt. JavaScript hat zu keinem Zeitpunkt Zugriff auf den Token.

Die Registrierung läuft analog über `POST /api/auth/register` und validiert Benutzername (3–30 Zeichen), E-Mail-Adresse (Regex-Prüfung) sowie Passwort (mindestens 6 Zeichen) vor der Weiterleitung an `POST /api/auth/local/register`.

Der Authentifizierungsstatus wird im `AuthContext` (`contexts/AuthContext.tsx`) verwaltet. Bei Seitenaufruf wird `GET /api/auth/me` abgefragt, das das gespeicherte Cookie serverseitig gegen Strapi validiert und bei Gültigkeit die Nutzerdaten zurückgibt.

**Kommentareinreichung**

Die Einreichung eines Kommentars durchläuft in `POST /api/comments` folgende Prüfschritte sequenziell:

1. Rate-Limit-Prüfung (5 Anfragen pro Minute pro IP)
2. Vorhandensein des `auth_token`-Cookies
3. JWT-Validierung durch Strapi (`GET /api/users/me`)
4. Honeypot-Prüfung (Feld `website` muss leer sein)
5. Eingabevalidierung (Text 3–1000 Zeichen, gültige Rezensions-ID)
6. Anlage des Kommentars bei Strapi mit `isApproved: false`

Erst nach Bestehen aller Prüfungen wird der Kommentar gespeichert. Er bleibt im Frontend unsichtbar, bis ein Redakteur ihn im Strapi-Adminbereich freigibt.

### 5.6 Vorbereitung der Social-Media-Automatisierung

Die automatische Veröffentlichung neuer Beiträge auf Instagram und Facebook wurde architektonisch vorbereitet, ohne in diesem Projektabschnitt vollständig umgesetzt zu werden. Das Design sieht vor, dass Strapi über einen konfigurierbaren Webhook eine Benachrichtigung an einen externen Dienst sendet, sobald eine Rezension veröffentlicht wird.

Der Revalidierungs-Endpunkt (`/api/revalidate`) zeigt, dass die Webhook-Infrastruktur bereits vorhanden ist: Der Endpunkt nimmt POST-Requests mit einem `x-webhook-secret`-Header entgegen, validiert das Geheimnis und führt die entsprechende Cache-Invalidierung durch. Die konkrete Anbindung an die Meta Graph API erfordert eine App-Registrierung im Meta-Entwicklerportal und kann in einem Folgeschritt ohne Architekturänderungen integriert werden.

---

## 6 Abnahmephase

Die Abnahme erfolgte anhand eines zuvor definierten Testprotokolls, das die identifizierten Use Cases systematisch abdeckte. Folgende Szenarien wurden manuell getestet und protokolliert:

- Aufruf der Startseite mit korrekter Darstellung der neuesten Rezensionen
- Navigation in alle fünf Kategorieseiten (`/buch`, `/film`, `/musik`, `/spiel`, `/event`)
- Aufruf einer Detailseite mit Überprüfung aller Metadaten, Dynamic-Zone-Inhalte und JSON-LD-Ausgabe
- Volltextsuche mit und ohne Treffer
- Registrierung, Login und Logout mit Überprüfung des Cookie-Verhaltens (HTTP-Only-Flag, Löschung beim Logout)
- Einreichen eines Kommentars als angemeldeter Nutzer mit anschließender Prüfung des Moderationsstatus im Strapi-Adminbereich
- Überprüfung der Rate-Limiting-Antwort (HTTP 429 mit `Retry-After`-Header) bei wiederholten Anfragen
- Überprüfung des Honeypot-Mechanismus: befülltes `website`-Feld führt zur stillschweigenden Zurückweisung

**Google Lighthouse Audit (Startseite und Detailseite):**

| Kategorie | Score |
|-----------|-------|
| Performance | > 90 |
| SEO | 100 |
| Responsiveness (375 px / 768 px / 1440 px) | bestanden |

Alle Testfälle wurden erfolgreich abgeschlossen. Es wurden keine Blockerfehler identifiziert.

---

## 7 Einführungsphase

Die Einführung der neuen Plattform erfolgte in einer kontrollierten Sequenz, um Datenverluste und Ausfallzeiten zu minimieren. Zunächst wurde die Datenmigration in einer isolierten Staging-Umgebung vollständig durchlaufen und das Ergebnis mit der WordPress-Quelldatenbank verglichen. Alle veröffentlichten Beiträge wurden erfolgreich überführt.

Für die Produktivumgebung wird die identische Docker-Compose-Konfiguration verwendet. Anpassungen für den Produktiveinsatz:

- Datenbankpasswörter durch kryptografisch sichere Zufallsstrings ersetzt (generiert mit `openssl rand -base64 32`)
- `Secure`-Flag für Cookies im Produktionsmodus aktiv (gesteuert über `NODE_ENV=production`)
- Debug-Modus von Strapi deaktiviert
- Kurze DNS-TTL für beschleunigten Umschaltvorgang gesetzt
- Permanente Weiterleitung von `/wp-admin` auf das Strapi-Admininterface konfiguriert (in `next.config.ts` als `redirects`-Regel hinterlegt)
- Datenbankport (PostgreSQL 5432) nicht nach außen exponiert; die Datenbank ist ausschließlich über das interne Docker-Netzwerk für den Strapi-Container erreichbar

---

## 8 Dokumentation

Neben dieser Projektdokumentation wurden zwei weitere Dokumente erstellt:

- **Betriebshandbuch (`README.md`):** Beschreibt die Inbetriebnahme der Docker-Umgebung, die Konfiguration der Umgebungsvariablen anhand der Vorlage `.env.example` und die Ausführung des Migrationsskripts.
- **Redakteursdokumentation (`backend/ARCHITECTURE.md`):** Erklärt den Workflow für das Anlegen von Rezensionen, das Verwalten von Autoren und Genres sowie das Moderieren von Kommentaren im Strapi-Adminbereich. Enthält das Entity-Relationship-Diagramm und eine vollständige Referenz der REST-API-Endpunkte.

Die Codebasis ist vollständig mit TypeScript typisiert. Die Datenstrukturen sind in `lib/types.ts` zentral definiert und in allen API-Clients, Komponenten und Validatoren konsistent verwendet. Die Umgebungsvariablen haben in `lib/config.ts` eine einzige Quelle der Wahrheit, sodass versehentliche Doppeldefinitionen ausgeschlossen sind.

---

## 9 Fazit

Das Projekt hat sein Ziel erreicht: Die Website roterdorn.de verfügt nun über eine moderne, wartbare und erweiterungsfähige technische Grundlage. Die Trennung von Frontend (Next.js 16) und Backend (Strapi 5) beseitigt die monolithische Abhängigkeitsstruktur, die über Jahre hinweg Wartungs- und Sicherheitsprobleme verursacht hatte.

Rückblickend war die Entscheidung für eine vollständige Neuentwicklung richtig: Die Architekturprobleme wären mit inkrementellen Verbesserungen nicht lösbar gewesen. Als Lerneffekt zeigte sich, dass die Konfiguration des Docker-Netzwerks für die Datenbankverbindung während der Migration zusätzliche Zeit erforderte, da MySQL 8.0 standardmäßig keine Verbindungen von externen Hosts für den Root-Nutzer erlaubt. Dieses Problem wurde durch das Setzen der Umgebungsvariable `MYSQL_ROOT_HOST="%"` im Docker-Compose-Dienst `mysql-legacy` gelöst.

Ein weiterer Lerneffekt betraf die ISR-Cache-Invalidierung: Das Next.js-Cache-Tag-System erfordert eine präzise Abstimmung zwischen den Tags, die beim Datenabruf gesetzt werden, und den Tags, die der Webhook-Endpunkt invalidiert. Fehler in dieser Zuordnung führen zu veralteten Seiteninhalten, die sich nicht durch einfaches Neuladen beheben lassen.

**Offene Erweiterungspunkte**, die im Projektzeitraum konzipiert, aber noch nicht vollständig umgesetzt wurden:

- Vollständige Anbindung an die Meta Graph API für automatische Social-Media-Posts bei Veröffentlichung einer Rezension
- Erweiterung der internen Suche um semantische Ähnlichkeitssuche auf Basis von Embedding-Modellen
- Migration der serverseitigen Eingabevalidierung von den aktuellen Custom-Validatoren in `lib/schemas.ts` auf die Bibliothek Zod für deklarativere Schemadefinitionen und bessere Fehlermeldungen

Alle drei Erweiterungen können ohne Änderungen an der Kernarchitektur integriert werden, was die Zukunftsfähigkeit des gewählten Architekturansatzes bestätigt.

---

## Eigenständigkeitserklärung

Ich versichere, dass ich die vorliegende Projektdokumentation selbständig angefertigt und alle verwendeten Hilfsmittel und Quellen angegeben habe.
