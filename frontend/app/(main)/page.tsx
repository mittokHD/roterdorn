import Link from "next/link";
import { getRezensionen } from "@/lib/strapi";
import { TYPE_REVERSE_MAP, TYPE_LABELS } from "@/lib/types";
import type { RezensionType, Rezension } from "@/lib/types";
import RezensionCard from "@/components/rezension/RezensionCard";

const CATEGORIES: { type: RezensionType; icon: string; description: string }[] = [
  { type: "Buch", icon: "📚", description: "Romane, Sachbücher, Comics" },
  { type: "Film", icon: "🎬", description: "Kino, Streaming, Dokus" },
  { type: "Musik", icon: "🎵", description: "Alben, Singles, Live" },
  { type: "Spiel", icon: "🎮", description: "PC, Konsole, Tabletop" },
  { type: "Event", icon: "🎪", description: "Konzerte, Messen, Festivals" },
];

export default async function HomePage() {
  let rezensionen: Rezension[] = [];
  let hasData = false;

  try {
    const response = await getRezensionen({ pageSize: 8 });
    rezensionen = response.data || [];
    hasData = rezensionen.length > 0;
  } catch {
    rezensionen = [];
  }

  return (
    <div className="relative">
      {/* ─── Hero Section ─────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "var(--brand-500)" }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              <span style={{ color: "var(--text-primary)" }}>Entdecke, was </span>
              <span
                style={{
                  background: "linear-gradient(135deg, var(--brand-400), var(--brand-600))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                wirklich
              </span>
              <span style={{ color: "var(--text-primary)" }}> zählt.</span>
            </h1>

            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
              style={{ color: "var(--text-secondary)" }}
            >
              Ehrliche Rezensionen zu Büchern, Filmen, Musik, Spielen und Events
              — geschrieben mit Leidenschaft und einem kritischen Auge.
            </p>

            <Link
              href="/suche"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: "var(--brand-500)",
                color: "white",
                boxShadow: "var(--shadow-brand)",
              }}
              id="hero-cta"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Rezensionen durchsuchen
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/${TYPE_REVERSE_MAP[cat.type]}`}
              className="glass-card p-4 text-center group"
              id={`category-${TYPE_REVERSE_MAP[cat.type]}`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <h3
                className="text-sm font-semibold mb-1 transition-colors duration-200 group-hover:text-[var(--text-accent)]"
                style={{ color: "var(--text-primary)" }}
              >
                {TYPE_LABELS[cat.type]}
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Latest Reviews ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Neueste Rezensionen
          </h2>
          {hasData && (
            <Link
              href="/suche"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "var(--text-accent)" }}
            >
              Alle ansehen →
            </Link>
          )}
        </div>

        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {rezensionen!.map((rezension) => (
              <RezensionCard key={rezension.id} rezension={rezension} />
            ))}
          </div>
        ) : (
          <div
            className="glass-card p-12 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="text-5xl mb-4">🌱</div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Noch keine Rezensionen
            </h3>
            <p className="text-sm max-w-md mx-auto">
              Es wurden noch keine Rezensionen veröffentlicht. Sobald Inhalte im CMS
              angelegt werden, erscheinen sie hier.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
