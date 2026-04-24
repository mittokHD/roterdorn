"use client";

import { useRouter, usePathname } from "next/navigation";

const SORT_OPTIONS = [
  { value: "publishedAt:desc", label: "Neueste" },
  { value: "publishedAt:asc", label: "Älteste" },
  { value: "rating:desc", label: "Beste Bewertung" },
  { value: "rating:asc", label: "Schlechteste" },
];

interface FilterBarProps {
  genres: string[];
  currentSort: string;
  currentGenre: string;
}

export default function FilterBar({ genres, currentSort, currentGenre }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const push = (sort: string, genre: string) => {
    const params = new URLSearchParams();
    if (sort && sort !== "publishedAt:desc") params.set("sort", sort);
    if (genre) params.set("genre", genre);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const activeSort = currentSort || "publishedAt:desc";

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Sort row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide mr-1">Sortierung</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => push(opt.value, currentGenre)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
              activeSort === opt.value
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-surface-tertiary text-text-secondary border-border-subtle hover:border-border-hover hover:text-text-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Genre row */}
      {genres.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide mr-1">Genre</span>
          <button
            onClick={() => push(activeSort, "")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
              !currentGenre
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-surface-tertiary text-text-secondary border-border-subtle hover:border-border-hover hover:text-text-primary"
            }`}
          >
            Alle
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => push(activeSort, currentGenre === g ? "" : g)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                currentGenre === g
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-surface-tertiary text-text-secondary border-border-subtle hover:border-border-hover hover:text-text-primary"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
