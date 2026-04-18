import Link from "next/link";
import { getRezensionen } from "@/lib/strapi";
import { ALL_TYPES, TYPE_META } from "@/lib/constants";
import type { Rezension } from "@/lib/types";
import RezensionCard from "@/components/rezension/RezensionCard";
import EmptyState from "@/components/ui/EmptyState";
import { SearchIcon } from "@/components/ui/Icons";

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
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none bg-brand-500"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              <span className="text-text-primary">Entdecke, was </span>
              <span className="bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent">
                wirklich
              </span>
              <span className="text-text-primary"> zählt.</span>
            </h1>

            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 text-text-secondary"
            >
              Ehrliche Rezensionen zu Büchern, Filmen, Musik, Spielen und Events
              — geschrieben mit Leidenschaft und einem kritischen Auge.
            </p>

            <Link
              href="/suche"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 bg-brand-500 text-white shadow-brand"
              id="hero-cta"
            >
              <SearchIcon />
              Rezensionen durchsuchen
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_TYPES.map((t) => {
            const meta = TYPE_META[t];
            return (
              <Link
                key={t}
                href={`/${meta.slug}`}
                className="glass-card p-4 text-center group"
                id={`category-${meta.slug}`}
              >
                <div className="text-3xl mb-2">{meta.icon}</div>
                <h3
                  className="text-sm font-semibold mb-1 transition-colors duration-200 group-hover:text-[var(--text-accent)] text-text-primary"
                >
                  {meta.labelPlural}
                </h3>
                <p className="text-xs text-text-muted">
                  {meta.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Latest Reviews ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2
            className="text-2xl font-bold text-text-primary"
          >
            Neueste Rezensionen
          </h2>
          {hasData && (
            <Link
              href="/suche"
              className="text-sm font-medium transition-colors duration-200 text-text-accent"
            >
              Alle ansehen →
            </Link>
          )}
        </div>

        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {rezensionen.map((rezension) => (
              <RezensionCard key={rezension.id} rezension={rezension} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🌱"
            title="Noch keine Rezensionen"
            description="Es wurden noch keine Rezensionen veröffentlicht. Sobald Inhalte im CMS angelegt werden, erscheinen sie hier."
          />
        )}
      </section>
    </div>
  );
}
