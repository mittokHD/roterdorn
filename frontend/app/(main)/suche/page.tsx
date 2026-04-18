"use client";

import { useState, useEffect } from "react";
import type { Rezension } from "@/lib/types";
import { STRAPI_PUBLIC_URL } from "@/lib/config";
import RezensionCard from "@/components/rezension/RezensionCard";
import EmptyState from "@/components/ui/EmptyState";
import { SpinnerIcon } from "@/components/ui/Icons";

export default function SuchePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Rezension[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce user input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        const res = await fetch(
          `${STRAPI_PUBLIC_URL}/api/rezensionen?filters[title][$containsi]=${encodeURIComponent(
            debouncedQuery
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
    };

    performSearch();
  }, [debouncedQuery]);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1
          className="text-3xl sm:text-4xl font-black mb-3 text-text-primary"
        >
          🔍 Suche
        </h1>
        <p className="text-base text-text-secondary">
          Durchsuche alle Rezensionen nach Titel.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearchClick} className="mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titel eingeben..."
            className="flex-1 rounded-xl px-5 py-3 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-brand-500 bg-surface-tertiary text-text-primary border border-border-default"
            id="search-input"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 bg-brand-500 text-white shadow-[0_0_24px_var(--shadow-brand)]"
            id="search-submit"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <SpinnerIcon />
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
          <p className="mb-6 text-sm text-text-muted">
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
        <EmptyState
          icon="🔍"
          title="Keine Ergebnisse"
          description={`Für "${query}" wurden keine Rezensionen gefunden. Versuche einen anderen Suchbegriff.`}
        />
      )}

      {!hasSearched && (
        <EmptyState
          icon="✨"
          title="Suche starten"
          description="Gib einen Suchbegriff ein, um Rezensionen zu finden."
        />
      )}
    </div>
  );
}
