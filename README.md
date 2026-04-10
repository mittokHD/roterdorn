# roterdorn.de — Headless CMS Migration

Dieses Repository enthält den gesamten Quellcode (Monorepo) für die moderne Headless-Architektur von **roterdorn.de**. Es vereint ein Strapi v5 Backend (CMS) und ein Next.js 15 Frontend, alles optimiert und orchestriert mit Docker.

## 🏗 Architektur & Tech-Stack

*   **Frontend:** Next.js 15 (App Router, Turbopack), React 19, TypeScript
*   **Styling:** Tailwind CSS v4 (Glassmorphism, Dark Theme)
*   **Backend / CMS:** Strapi v5 (Headless)
*   **Datenbank:** PostgreSQL 16
*   **Infrastruktur:** Lokale Entwicklung über `docker-compose`

## 🚀 Lokales Entwicklungs-Setup

Du benötigst auf deinem System lediglich **Docker Desktop**. NodeJS oder Datenbank-Server müssen nicht lokal installiert sein — das regelt alles Docker!

### 1. Umgebungsvariablen anlegen
Kopiere im Root-Verzeichnis die Vorlagendatei:
```bash
cp .env.example .env
```
*(Stelle sicher, dass in der `.env` sinnvolle Keys und Passwörter eingetragen sind.)*

### 2. Projekt starten
Führe im Hauptordner folgenden Befehl aus:
```bash
docker compose up --build
```
Beim ersten Start lädt Docker alle Dependencies herunter, baut die Next.js und Strapi Images und startet die Datenbank. Dieser Vorgang kann einige Minuten dauern. 

Wenn alles läuft, sind folgende Dienste erreichbar:

*   **Frontend-Website:** [http://localhost:3000](http://localhost:3000)
*   **Strapi CMS Admin-Panel:** [http://localhost:1337/admin](http://localhost:1337/admin)
*   **Strapi API Base URL:** [http://localhost:1337/api](http://localhost:1337/api)

### 3. Projekt beenden
Um die Container zu stoppen (die Daten bleiben in Docker Volumes persistent erhalten):
```bash
docker compose down
```

## 📂 Projektstruktur

```
roterdorn/
├── docker-compose.yml     # Orchestriert PostgreSQL, Strapi und Next.js
├── dorn_db.sql            # Export der alten Datenbank (Migration)
├── backend/               # Strapi v5 Projekt
│   ├── config/            # Strapi-Konfigurationen (Datenbank, Server etc.)
│   ├── src/api/           # Content-Type-Definitionen (Rezension, Genre, Autor, etc.)
│   ├── src/components/    # Dynamic Zone Schemas (BookDetails, etc.)
│   ├── public/uploads/    # Hier landen persistente Medien
│   └── Dockerfile.dev     # Docker Setup für Strapi Backend
└── frontend/              # Next.js 15 Projekt (App Router)
    ├── app/               # Seitenstruktur & API-Routes (Proxy & Webhooks)
    ├── components/        # UI-Komponenten (Rezensionen, Kommentare, Layout)
    ├── lib/               # Strapi-Client & TypeScript Interfaces
    └── Dockerfile.dev     # Docker Setup für Next.js Frontend
```

## 🔌 API & Caching
Das Frontend ist so konzipiert, dass es alle Daten statisch von Strapi lädt (`SSG` Next.js Verhalten). Um die Seite nach CMS-Änderungen on-demand neu zu generieren, gibt es einen internen Webhook, den Strapi bei Änderungen feuern sollte:
*   **Webhook-Endpoint:** `POST http://nextjs:3000/api/revalidate`
*   **Header Required:** `x-webhook-secret: <Dein aus der .env konfigurierter Secret Key>`

Kommentare der Webseiten-Nutzer werden zudem sicher aus dem Client-Browser via Next.js Proxy (`POST /api/comments`) entgegengenommen und durch den geschützten `STRAPI_WRITE_TOKEN` an das CMS weitergegeben.

## 📝 Lizenz & Copyright
© roterdorn.de
