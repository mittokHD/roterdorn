"use client";

import { useState, useCallback } from "react";
import type { Rezension } from "@/lib/types";
import RezensionCard from "@/components/rezension/RezensionCard";

export default function SuchePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Rezension[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      setIsLoading(true);
      setHasSearched(true);

      try {
        const strapiUrl =
          process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
        const res = await fetch(
          `${strapiUrl}/api/rezensionen?filters[title][$containsi]=${encodeURIComponent(
            query
          )}&populate[cover]=true&populate[autor]=true&populate[genres]=true&sort=publishedAt:desc&pagination[pageSize]=20`
        );

        if (!res.ok) throw new Error("Suche fehlgeschlagen");

        const data = await res.json();
        setResults(data.data || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [query]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1
          className="text-3xl sm:text-4xl font-black mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          🔍 Suche
        </h1>
        <p className="text-base" style={{ color: "var(--text-secondary)" }}>
          Durchsuche alle Rezensionen nach Titel.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titel eingeben..."
            className="flex-1 rounded-xl px-5 py-3 text-sm outline-none transition-all duration-300 focus:ring-2"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              // @ts-expect-error -- CSS custom property
              "--tw-ring-color": "var(--brand-500)",
            }}
            id="search-input"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: "var(--brand-500)",
              color: "white",
              boxShadow: "var(--shadow-brand)",
            }}
            id="search-submit"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Suche...
              </span>
            ) : (
              "Suchen"
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl aspect-[3/5] animate-shimmer"
            />
          ))}
        </div>
      )}

      {!isLoading && hasSearched && results.length > 0 && (
        <>
          <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
            {results.length} Ergebnis{results.length !== 1 ? "se" : ""} für &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {results.map((rezension) => (
              <RezensionCard key={rezension.id} rezension={rezension} />
            ))}
          </div>
        </>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <div
          className="glass-card p-12 text-center"
          style={{ color: "var(--text-muted)" }}
        >
          <div className="text-5xl mb-4">🔍</div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Keine Ergebnisse
          </h3>
          <p className="text-sm max-w-md mx-auto">
            Für &quot;{query}&quot; wurden keine Rezensionen gefunden. Versuche einen
            anderen Suchbegriff.
          </p>
        </div>
      )}

      {!hasSearched && (
        <div
          className="glass-card p-12 text-center"
          style={{ color: "var(--text-muted)" }}
        >
          <div className="text-5xl mb-4">✨</div>
          <p className="text-sm max-w-md mx-auto">
            Gib einen Suchbegriff ein, um Rezensionen zu finden.
          </p>
        </div>
      )}
    </div>
  );
}
