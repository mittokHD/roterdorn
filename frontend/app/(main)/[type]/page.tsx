import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRezensionenByType } from "@/lib/strapi";
import { TYPE_SLUG_MAP, TYPE_LABELS } from "@/lib/types";
import { TYPE_META } from "@/lib/constants";
import type { Rezension } from "@/lib/types";
import RezensionCard from "@/components/rezension/RezensionCard";
import EmptyState from "@/components/ui/EmptyState";

interface PageProps {
  params: Promise<{ type: string }>;
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

export default async function TypePage({ params }: PageProps) {
  const { type } = await params;
  const rezensionType = TYPE_SLUG_MAP[type];
  if (!rezensionType) notFound();

  const meta = TYPE_META[rezensionType];

  let rezensionen: Rezension[] = [];
  let hasData = false;

  try {
    const response = await getRezensionenByType(rezensionType);
    rezensionen = response.data || [];
    hasData = rezensionen.length > 0;
  } catch {
    rezensionen = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{meta.icon}</span>
          <h1
            className="text-3xl sm:text-4xl font-black"
            style={{ color: "var(--text-primary)" }}
          >
            {meta.labelPlural}
          </h1>
        </div>
        <p
          className="text-base max-w-2xl"
          style={{ color: "var(--text-secondary)" }}
        >
          Alle Rezensionen in der Kategorie{" "}
          <strong style={{ color: "var(--text-accent)" }}>
            {meta.labelPlural}
          </strong>
          .
        </p>
      </div>

      {/* Reviews Grid */}
      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {rezensionen.map((rezension) => (
            <RezensionCard key={rezension.id} rezension={rezension} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={meta.icon}
          title={`Noch keine ${meta.labelPlural}`}
          description="In dieser Kategorie wurden noch keine Rezensionen veröffentlicht."
        />
      )}
    </div>
  );
}
