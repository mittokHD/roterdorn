import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRezensionenByType, getGenres } from "@/lib/strapi";
import { TYPE_SLUG_MAP, TYPE_LABELS } from "@/lib/types";
import { TYPE_META } from "@/lib/constants";
import type { Rezension } from "@/lib/types";
import RezensionCard from "@/components/rezension/RezensionCard";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar from "@/components/rezension/FilterBar";

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ sort?: string; genre?: string }>;
}

export async function generateStaticParams() {
  return Object.keys(TYPE_SLUG_MAP).map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const rezensionType = TYPE_SLUG_MAP[type];
  if (!rezensionType) return {};

  return {
    title: `${TYPE_LABELS[rezensionType]} — Rezensionen`,
    description: `Alle ${TYPE_LABELS[rezensionType]}-Rezensionen auf roterdorn. Ehrliche Reviews mit Bewertungen.`,
  };
}

export default async function TypePage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { sort, genre } = await searchParams;

  const rezensionType = TYPE_SLUG_MAP[type];
  if (!rezensionType) notFound();

  const meta = TYPE_META[rezensionType];

  let rezensionen: Rezension[] = [];
  let allGenres: string[] = [];

  try {
    const [response, genreList] = await Promise.all([
      getRezensionenByType(rezensionType, { sort, genre }),
      getGenres(),
    ]);
    rezensionen = response.data || [];
    allGenres = genreList.map((g) => g.name);
  } catch {
    rezensionen = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{meta.icon}</span>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary">
            {meta.labelPlural}
          </h1>
        </div>
        <p className="text-base max-w-2xl text-text-secondary">
          Alle Rezensionen in der Kategorie{" "}
          <strong className="text-text-accent">{meta.labelPlural}</strong>.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        genres={allGenres}
        currentSort={sort || "publishedAt:desc"}
        currentGenre={genre || ""}
      />

      {/* Reviews Grid */}
      {rezensionen.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {rezensionen.map((rezension) => (
            <RezensionCard key={rezension.id} rezension={rezension} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={meta.icon}
          title={genre ? `Keine ${meta.labelPlural} im Genre „${genre}"` : `Noch keine ${meta.labelPlural}`}
          description={
            genre
              ? "Versuche ein anderes Genre oder entferne den Filter."
              : "In dieser Kategorie wurden noch keine Rezensionen veröffentlicht."
          }
        />
      )}
    </div>
  );
}
