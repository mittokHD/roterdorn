import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TYPE_META } from "@/lib/constants";
import {
  LEGACY_TAXONOMY_INDEX,
  type LegacyTaxonomyEntry,
} from "@/lib/legacy-review-details.generated";
import { getRezensionBySlug, getStrapiMediaUrl } from "@/lib/strapi";
import type { Rezension } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { SITE_URL } from "@/lib/config";

interface LegacyTaxonomyPageProps {
  taxonomy: string;
  term: string;
}

const taxonomyKey = (taxonomy: string, term: string) => `${taxonomy}/${term}`;

export function getLegacyTaxonomyEntry(taxonomy: string, term: string) {
  return LEGACY_TAXONOMY_INDEX[taxonomyKey(taxonomy, term)] || null;
}

export function generateLegacyTaxonomyMetadata(
  taxonomy: string,
  term: string,
): Metadata {
  const entry = getLegacyTaxonomyEntry(taxonomy, term);
  if (!entry) return {};

  return {
    title: `${entry.name} — ${entry.taxonomyLabel}`,
    description: `${entry.reviews.length} Rezensionen zu ${entry.name} auf roterdorn.`,
    alternates: {
      canonical: `${SITE_URL}${entry.href}`,
    },
  };
}

export default async function LegacyTaxonomyPage({ taxonomy, term }: LegacyTaxonomyPageProps) {
  const entry = getLegacyTaxonomyEntry(taxonomy, term);
  if (!entry) notFound();

  const enrichedReviews = await Promise.all(
    entry.reviews.map(async (review) => {
      try {
        const response = await getRezensionBySlug(review.slug);
        return {
          legacy: review,
          rezension: response.data?.[0] || null,
        };
      } catch {
        return {
          legacy: review,
          rezension: null,
        };
      }
    }),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-text-muted">
        <Link href="/" className="transition-colors hover:text-text-accent">
          Startseite
        </Link>
        <span>›</span>
        <span>{entry.taxonomyLabel}</span>
        <span>›</span>
        <span className="text-text-primary">{entry.name}</span>
      </nav>

      <header className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-accent">
          {entry.taxonomyLabel}
        </p>
        <h1 className="text-3xl font-black text-text-primary sm:text-4xl">
          {entry.name}
        </h1>
        <p className="mt-4 text-base text-text-secondary">
          {entry.reviews.length === 1
            ? "1 rezensiertes Werk"
            : `${entry.reviews.length} rezensierte Werke`}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {enrichedReviews.map(({ legacy, rezension }) => (
          <ReviewListItem
            key={`${legacy.type}-${legacy.slug}`}
            entry={entry}
            review={legacy}
            rezension={rezension}
          />
        ))}
      </div>
    </main>
  );
}

function ReviewListItem({
  entry,
  review,
  rezension,
}: {
  entry: LegacyTaxonomyEntry;
  review: LegacyTaxonomyEntry["reviews"][number];
  rezension: Rezension | null;
}) {
  const meta = TYPE_META[review.type];
  const coverUrl = rezension?.cover
    ? getStrapiMediaUrl(rezension.cover.formats?.small?.url || rezension.cover.url)
    : null;
  const excerpt = createExcerpt(rezension?.content);

  return (
    <Link
      href={`/${meta.slug}/${review.slug}`}
      className="group grid min-h-44 overflow-hidden rounded-lg border border-border-subtle bg-surface-secondary transition-colors hover:border-border-hover hover:bg-surface-tertiary sm:grid-cols-[112px_minmax(0,1fr)]"
      id={`${entry.taxonomy}-${entry.slug}-${review.slug}`}
    >
      <div className="relative aspect-[3/4] bg-surface-tertiary sm:h-full sm:min-h-44 sm:aspect-auto">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={rezension?.cover?.alternativeText || review.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 112px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl text-text-muted">
            {meta.icon}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
        </div>
        <h2 className="text-lg font-bold leading-snug text-text-primary transition-colors group-hover:text-text-accent">
          {review.title}
        </h2>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-muted">
          {review.publishedAt && <span>{formatDate(review.publishedAt)}</span>}
          {review.editor && <span>Redakteur: {review.editor}</span>}
        </div>
        {excerpt && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-text-secondary">
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}

function createExcerpt(html?: string | null) {
  if (!html) return "";

  const text = html
    .replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]/gi, " ")
    .replace(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s<]*/gi, " ")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= 180) return text;

  const shortened = text.slice(0, 180);
  const lastSpace = shortened.lastIndexOf(" ");

  return `${shortened.slice(0, lastSpace > 120 ? lastSpace : 180).trimEnd()}...`;
}
