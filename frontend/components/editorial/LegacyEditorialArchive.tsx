import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EmptyState from "@/components/ui/EmptyState";
import {
  LEGACY_EDITORIAL_SECTIONS,
  type LegacyEditorialEntry,
  type LegacyEditorialSectionSlug,
} from "@/lib/legacy-editorial.generated";
import { TYPE_META } from "@/lib/constants";
import { getRezensionBySlug, getStrapiMediaUrl } from "@/lib/strapi";
import type { Rezension } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { SITE_URL } from "@/lib/config";

interface LegacyEditorialArchiveProps {
  section: LegacyEditorialSectionSlug;
}

export function generateLegacyEditorialArchiveMetadata(
  sectionSlug: LegacyEditorialSectionSlug,
): Metadata {
  const section = LEGACY_EDITORIAL_SECTIONS[sectionSlug];
  if (!section) return {};

  return {
    title: section.label,
    description: section.description,
    alternates: {
      canonical: `${SITE_URL}/${sectionSlug}`,
    },
  };
}

export default async function LegacyEditorialArchive({ section }: LegacyEditorialArchiveProps) {
  const sectionData = LEGACY_EDITORIAL_SECTIONS[section];
  if (!sectionData) notFound();

  const enrichedEntries = await Promise.all(
    sectionData.entries.map(async (entry) => ({
      entry,
      rezension: entry.isReviewBacked ? await getLinkedReview(entry) : null,
    })),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-4xl">{sectionData.icon}</span>
          <h1 className="text-3xl font-black text-text-primary sm:text-4xl">
            {sectionData.label}
          </h1>
        </div>
        <p className="max-w-2xl text-base text-text-secondary">
          {sectionData.description}
        </p>
      </header>

      {enrichedEntries.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {enrichedEntries.map(({ entry, rezension }) => (
            <EditorialListItem key={`${entry.section}-${entry.slug}`} entry={entry} rezension={rezension} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={sectionData.icon}
          title={`Keine ${sectionData.label}`}
          description="In der gekürzten Datenbank sind für diese Rubrik keine Einträge enthalten."
        />
      )}
    </main>
  );
}

async function getLinkedReview(entry: LegacyEditorialEntry) {
  try {
    const response = await getRezensionBySlug(entry.slug);
    return response.data?.[0] || null;
  } catch {
    return null;
  }
}

function EditorialListItem({
  entry,
  rezension,
}: {
  entry: LegacyEditorialEntry;
  rezension: Rezension | null;
}) {
  const typeMeta = TYPE_META[entry.reviewType];
  const href = entry.isReviewBacked
    ? `/${typeMeta.slug}/${entry.slug}`
    : `/${entry.section}/${entry.slug}`;
  const coverUrl = rezension?.cover
    ? getStrapiMediaUrl(rezension.cover.formats?.small?.url || rezension.cover.url)
    : null;

  return (
    <Link
      href={href}
      className="group grid min-h-44 overflow-hidden rounded-lg border border-border-subtle bg-surface-secondary transition-colors hover:border-border-hover hover:bg-surface-tertiary sm:grid-cols-[112px_minmax(0,1fr)]"
      id={`${entry.section}-${entry.slug}`}
    >
      <div className="relative aspect-[3/4] bg-surface-tertiary sm:h-full sm:min-h-44 sm:aspect-auto">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={rezension?.cover?.alternativeText || entry.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 112px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl text-text-muted">
            {typeMeta.icon}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          <span>{entry.sectionLabel}</span>
          {entry.isReviewBacked && (
            <>
              <span>·</span>
              <span>{typeMeta.label}</span>
            </>
          )}
        </div>
        <h2 className="text-lg font-bold leading-snug text-text-primary transition-colors group-hover:text-text-accent">
          {entry.title}
        </h2>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-muted">
          {entry.publishedAt && <span>{formatDate(entry.publishedAt)}</span>}
          {entry.editor && <span>Redakteur: {entry.editor}</span>}
        </div>
        {entry.excerpt && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-text-secondary">
            {entry.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
